import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/db";
import { registerSeller } from "../src/lib/auth";
import { createOrder, listOrdersBySeller } from "../src/lib/orders";
import { recordInbound } from "../src/lib/inbound";
import { requestShipmentWithWallet, recordWalletCredit } from "../src/lib/wallet";
import {
  getShipmentPackageStatusLabel,
  listAdminShipmentOrders,
  getAdminShipmentOrder,
  listSellerShipmentPackages,
  saveShipmentPackage,
} from "../src/lib/shipment-packages";

let sellerA: { id: string };
let sellerB: { id: string };

async function importAdminPackageRoute(role: "ADMIN" | "SELLER") {
  vi.resetModules();
  vi.doMock("@/lib/session", () => ({
    getSessionUser: vi.fn(async () => ({ id: `${role.toLowerCase()}-1`, role })),
  }));
  return import("../src/app/api/admin/shipments/packages/route");
}

async function renderSellerShipmentPageFor(sellerId: string) {
  vi.resetModules();
  vi.doMock("next/link", () => ({
    default: ({ href, children, ...props }: { href: string; children: unknown }) =>
      createElement("a", { href, ...props }, children),
  }));
  vi.doMock("next/navigation", () => ({
    redirect: vi.fn((path: string) => {
      throw new Error(`redirect:${path}`);
    }),
  }));
  vi.doMock("@/lib/session", () => ({
    getSession: vi.fn(async () => ({ userId: sellerId })),
  }));

  const { default: ShipmentPage } = await import("../src/app/dashboard/shipment/page");
  return renderToStaticMarkup(await ShipmentPage());
}

async function renderSellerOrderDetailPageFor(sellerId: string, orderId: string) {
  vi.resetModules();
  vi.doMock("next/navigation", () => ({
    redirect: vi.fn((path: string) => {
      throw new Error(`redirect:${path}`);
    }),
    notFound: vi.fn(() => {
      throw new Error("notFound");
    }),
  }));
  vi.doMock("@/lib/session", () => ({
    getSession: vi.fn(async () => ({ userId: sellerId })),
  }));

  const { default: OrderDetailPage } = await import("../src/app/dashboard/orders/[id]/page");
  return renderToStaticMarkup(await OrderDetailPage({
    params: Promise.resolve({ id: orderId }),
    searchParams: Promise.resolve({}),
  }));
}

async function createQuotedOrderWithoutShipmentRequest(sellerId: string) {
  const order = await createOrder(sellerId, {
    serviceType: "PURCHASE",
    inspectionRequested: true,
    items: [
      {
        productUrl: "https://detail.1688.com/offer/quoted-only.html",
        productName: "견적 전용 상품",
        skus: [{ optionText: "기본", quantity: 3 }],
      },
    ],
  });

  const [sku] = order.productLines[0].skuLines;
  await recordInbound(order.id, {
    photoPaths: ["/uploads/quoted-only.jpg"],
    outerIssue: false,
    skuResults: [
      {
        skuLineId: sku.id,
        inboundQuantity: 3,
        defectCount: 0,
        inspectionPassed: true,
      },
    ],
  });

  return prisma.order.update({
    where: { id: order.id },
    data: {
      quoteUnitPriceFen: 1800,
      quoteCnShippingFen: 2500,
      quoteWeightGrams: 9000,
      quoteVolumeCm3: 50000,
      quoteExchangeRateX100: 19000,
      quoteShippingMethod: "SEA",
      quotedAt: new Date("2026-07-06T00:00:00.000Z"),
    },
    include: { productLines: { include: { skuLines: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } } },
  });
}

async function createShipmentRequestedSkuOrder(sellerId: string) {
  const order = await createOrder(sellerId, {
    serviceType: "PURCHASE",
    inspectionRequested: true,
    items: [
      {
        productUrl: "https://detail.1688.com/offer/shipment-package.html",
        productName: "포장 대상 상품",
        skus: [
          { optionText: "빨강", quantity: 3 },
          { optionText: "파랑", quantity: 2 },
        ],
      },
    ],
  });

  const [red, blue] = order.productLines[0].skuLines;
  await recordInbound(order.id, {
    photoPaths: ["/uploads/package-a.jpg"],
    outerIssue: false,
    skuResults: [
      {
        skuLineId: red.id,
        inboundQuantity: 3,
        defectCount: 1,
        inspectionPassed: true,
      },
      {
        skuLineId: blue.id,
        inboundQuantity: 2,
        defectCount: 0,
        inspectionPassed: true,
      },
    ],
  });
  await prisma.order.update({
    where: { id: order.id },
    data: {
      quoteUnitPriceFen: 2200,
      quoteCnShippingFen: 3200,
      quoteWeightGrams: 12000,
      quoteVolumeCm3: 80000,
      quoteExchangeRateX100: 19000,
      quoteShippingMethod: "SEA",
      quotedAt: new Date("2026-07-06T00:00:00.000Z"),
    },
  });
  await recordWalletCredit(sellerId, 300000, "출고 요청 예치금");
  await requestShipmentWithWallet(sellerId, order.id);

  return { order, red, blue };
}

async function firstSku(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { productLines: { include: { skuLines: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } } },
  });

  return order.productLines[0].skuLines[0];
}

beforeEach(async () => {
  vi.restoreAllMocks();
  await prisma.shipmentPackageItem.deleteMany();
  await prisma.shipmentPackage.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.inboundPhoto.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  sellerA = await registerSeller({ email: "shipment-a@test.local", password: "password1", contactName: "A" });
  sellerB = await registerSeller({ email: "shipment-b@test.local", password: "password1", contactName: "B" });
});

afterEach(() => {
  vi.doUnmock("@/lib/session");
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("shipment packages domain", () => {
  it("운영자가 출고요청 주문에 박스별 SKU 구성을 저장한다", async () => {
    const { order, red, blue } = await createShipmentRequestedSkuOrder(sellerA.id);

    const box = await saveShipmentPackage(order.id, {
      marker: "BOX-1",
      status: "PACKED",
      weightKg: 12.5,
      volumeCbm: 0.08,
      memo: "1차 포장",
      items: [
        { skuLineId: red.id, quantity: 2 },
        { skuLineId: blue.id, quantity: 1 },
      ],
    });

    expect(box.marker).toBe("BOX-1");
    expect(box.weightGrams).toBe(12500);
    expect(box.volumeCm3).toBe(80000);
    expect(box.items).toHaveLength(2);
  });

  it("같은 포장단위 마커를 다시 저장하면 이전 SKU 구성이 교체된다", async () => {
    const { order, red, blue } = await createShipmentRequestedSkuOrder(sellerA.id);

    await saveShipmentPackage(order.id, {
      marker: "BOX-1",
      status: "PACKED",
      weightKg: 12.5,
      volumeCbm: 0.08,
      memo: "1차 포장",
      items: [
        { skuLineId: red.id, quantity: 2 },
        { skuLineId: blue.id, quantity: 1 },
      ],
    });

    const replaced = await saveShipmentPackage(order.id, {
      marker: "BOX-1",
      status: "READY",
      weightKg: 9.75,
      volumeCbm: 0.04,
      memo: "재포장 완료",
      items: [{ skuLineId: blue.id, quantity: 2 }],
    });

    const sellerPackages = await listSellerShipmentPackages(sellerA.id, order.id);

    expect(replaced.marker).toBe("BOX-1");
    expect(replaced.status).toBe("READY");
    expect(replaced.weightGrams).toBe(9750);
    expect(replaced.volumeCm3).toBe(40000);
    expect(replaced.memo).toBe("재포장 완료");
    expect(replaced.items).toHaveLength(1);
    expect(replaced.items[0]).toMatchObject({ skuLineId: blue.id, quantity: 2 });
    expect(sellerPackages).toHaveLength(1);
    expect(sellerPackages[0].items).toHaveLength(1);
    expect(sellerPackages[0].items[0]).toMatchObject({ skuLineId: blue.id, quantity: 2 });
    expect(sellerPackages[0].items.some((item) => item.skuLineId === red.id)).toBe(false);
  });

  it("SKU 출고 가능 수량보다 많이 박스에 배정하면 거부한다", async () => {
    const { order, blue } = await createShipmentRequestedSkuOrder(sellerA.id);

    await expect(saveShipmentPackage(order.id, {
      marker: "BOX-1",
      status: "PACKED",
      weightKg: 10,
      volumeCbm: 0.1,
      items: [{ skuLineId: blue.id, quantity: 99 }],
    })).rejects.toThrow("출고 가능 수량");
  });

  it("출고요청 상태가 아닌 주문에는 포장단위를 저장하지 않는다", async () => {
    const order = await createQuotedOrderWithoutShipmentRequest(sellerA.id);
    const sku = await firstSku(order.id);

    await expect(saveShipmentPackage(order.id, {
      marker: "BOX-1",
      status: "PACKED",
      weightKg: 10,
      volumeCbm: 0.1,
      items: [{ skuLineId: sku.id, quantity: 1 }],
    })).rejects.toThrow("출고 요청");
  });

  it("셀러는 자기 주문의 포장단위만 본다", async () => {
    const { order, red } = await createShipmentRequestedSkuOrder(sellerA.id);
    await saveShipmentPackage(order.id, {
      marker: "BOX-1",
      status: "PACKED",
      weightKg: 12.5,
      volumeCbm: 0.08,
      items: [{ skuLineId: red.id, quantity: 1 }],
    });

    const own = await listSellerShipmentPackages(sellerA.id, order.id);
    await expect(listSellerShipmentPackages(sellerB.id, order.id)).rejects.toThrow("주문을 찾을 수 없습니다");
    expect(own).toHaveLength(1);
    expect(own[0].items[0].skuLineId).toBe(red.id);
  });

  it("셀러 주문 조회는 기본으로 포장단위를 포함하지 않고 출고 화면에서만 opt-in 한다", async () => {
    const { order, red } = await createShipmentRequestedSkuOrder(sellerA.id);
    await saveShipmentPackage(order.id, {
      marker: "BOX-1",
      status: "PACKED",
      weightKg: 12.5,
      volumeCbm: 0.08,
      items: [{ skuLineId: red.id, quantity: 1 }],
    });

    const defaultList = await listOrdersBySeller(sellerA.id);
    const packageList = await listOrdersBySeller(sellerA.id, { includeShipmentPackages: true });

    expect(defaultList).toHaveLength(1);
    expect("shipmentPackages" in defaultList[0]).toBe(false);
    expect(packageList[0].shipmentPackages).toHaveLength(1);
    expect(packageList[0].shipmentPackages[0].items[0].skuLine.optionText).toBe("빨강");
  });

  it("운영자는 출고요청 주문 목록과 주문별 포장단위를 함께 본다", async () => {
    const { order, red } = await createShipmentRequestedSkuOrder(sellerA.id);
    await saveShipmentPackage(order.id, {
      marker: "BOX-1",
      status: "READY",
      weightKg: 9,
      volumeCbm: 0.05,
      items: [{ skuLineId: red.id, quantity: 1 }],
    });

    const orders = await listAdminShipmentOrders();
    const detail = await getAdminShipmentOrder(order.id);

    expect(orders.some((item) => item.id === order.id)).toBe(true);
    expect(detail?.shipmentPackages).toHaveLength(1);
    expect(detail?.shipmentPackages[0].marker).toBe("BOX-1");
  });

  it("포장 상태 라벨을 돌려준다", () => {
    expect(getShipmentPackageStatusLabel("PACKING")).toBe("포장중");
    expect(getShipmentPackageStatusLabel("PACKED")).toBe("포장완료");
    expect(getShipmentPackageStatusLabel("READY")).toBe("출고대기");
    expect(getShipmentPackageStatusLabel("UNKNOWN")).toBe("UNKNOWN");
  });

  it("셀러 출고관리 화면은 포장단위 개수와 SKU 요약을 표시한다", async () => {
    const { order, red, blue } = await createShipmentRequestedSkuOrder(sellerA.id);
    await saveShipmentPackage(order.id, {
      marker: "BOX-1",
      status: "PACKED",
      weightKg: 12.5,
      volumeCbm: 0.08,
      items: [
        { skuLineId: red.id, quantity: 1 },
        { skuLineId: blue.id, quantity: 2 },
      ],
    });

    const html = await renderSellerShipmentPageFor(sellerA.id);

    expect(html).toContain("포장단위 1개");
    expect(html).toContain("BOX-1");
    expect(html).toContain("포장완료");
    expect(html).toContain("12.5kg");
    expect(html).toContain("0.08CBM");
    expect(html).toContain("SKU 2종 / 총 3개");
  });

  it("셀러 출고관리 화면은 포장단위가 없으면 빈 상태를 표시한다", async () => {
    await createShipmentRequestedSkuOrder(sellerA.id);

    const html = await renderSellerShipmentPageFor(sellerA.id);

    expect(html).toContain("포장단위 0개");
    expect(html).toContain("포장단위가 아직 배정되지 않았습니다");
  });

  it("셀러 주문 상세 화면은 포장단위와 패킹리스트 기초 정보를 표시한다", async () => {
    const { order, red, blue } = await createShipmentRequestedSkuOrder(sellerA.id);
    await saveShipmentPackage(order.id, {
      marker: "BOX-1",
      status: "READY",
      weightKg: 9.75,
      volumeCbm: 0.04,
      memo: "2차 검수 완료",
      items: [
        { skuLineId: red.id, quantity: 1 },
        { skuLineId: blue.id, quantity: 2 },
      ],
    });

    const html = await renderSellerOrderDetailPageFor(sellerA.id, order.id);

    expect(html).toContain("포장단위 / 패킹리스트 기초");
    expect(html).toContain("BOX-1");
    expect(html).toContain("출고대기");
    expect(html).toContain("9.75kg");
    expect(html).toContain("0.04CBM");
    expect(html).toContain("2차 검수 완료");
    expect(html).toContain("빨강");
    expect(html).toContain("파랑");
    expect(html).toMatch(/빨강[\s\S]*?1개/);
    expect(html).toMatch(/파랑[\s\S]*?2개/);
    expect(html).toContain("정식 패킹리스트 PDF와 실제 배송조회는 아직 연결하지 않았습니다.");
  });

  it("셀러 주문 상세 화면은 출고요청 상태가 아니면 포장단위 섹션을 숨긴다", async () => {
    const order = await createQuotedOrderWithoutShipmentRequest(sellerA.id);
    const html = await renderSellerOrderDetailPageFor(sellerA.id, order.id);

    expect(html).not.toContain("포장단위 / 패킹리스트 기초");
    expect(html).not.toContain("포장단위가 아직 배정되지 않았습니다");
    expect(html).not.toContain("정식 패킹리스트 PDF와 실제 배송조회는 아직 연결하지 않았습니다.");
  });
});

describe("admin shipment package route", () => {
  it("운영자 JSON route는 박스 포장단위를 저장한다", async () => {
    const { order, red } = await createShipmentRequestedSkuOrder(sellerA.id);
    const { POST } = await importAdminPackageRoute("ADMIN");

    const response = await POST(new Request("http://localhost/api/admin/shipments/packages", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        marker: "BOX-1",
        status: "PACKED",
        weightKg: 12.5,
        volumeCbm: 0.08,
        items: [{ skuLineId: red.id, quantity: 1 }],
      }),
    }));

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.result.marker).toBe("BOX-1");
  });

  it("운영자가 아니면 박스 저장 route가 거부된다", async () => {
    const { order, red } = await createShipmentRequestedSkuOrder(sellerA.id);
    const { POST } = await importAdminPackageRoute("SELLER");

    const response = await POST(new Request("http://localhost/api/admin/shipments/packages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        marker: "BOX-1",
        weightKg: 1,
        volumeCbm: 0.01,
        items: [{ skuLineId: red.id, quantity: 1 }],
      }),
    }));

    expect(response.status).toBe(403);
  });

  it("운영자 form route는 SKU 필드를 파싱해 포장단위를 저장하고 상세로 돌려보낸다", async () => {
    const { order, red, blue } = await createShipmentRequestedSkuOrder(sellerA.id);
    const { POST } = await importAdminPackageRoute("ADMIN");
    const form = new FormData();
    form.set("orderId", order.id);
    form.set("marker", "BOX-2");
    form.set("status", "READY");
    form.set("weightKg", "9.75");
    form.set("volumeCbm", "0.04");
    form.set("memo", "form submit");
    form.set("sku[0][id]", red.id);
    form.set("sku[0][quantity]", "1");
    form.set("sku[1][id]", blue.id);
    form.set("sku[1][quantity]", "2");

    const response = await POST(new Request("http://localhost/api/admin/shipments/packages", {
      method: "POST",
      body: form,
    }));

    const detail = await getAdminShipmentOrder(order.id);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`http://localhost/admin/shipments/${order.id}?packed=1`);
    expect(detail?.shipmentPackages).toHaveLength(1);
    expect(detail?.shipmentPackages[0]).toMatchObject({
      marker: "BOX-2",
      status: "READY",
      memo: "form submit",
    });
    expect(detail?.shipmentPackages[0].items).toHaveLength(2);
    expect(detail?.shipmentPackages[0].items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ skuLineId: red.id, quantity: 1 }),
        expect.objectContaining({ skuLineId: blue.id, quantity: 2 }),
      ]),
    );
  });

  it("운영자 form route는 Accept가 JSON이어도 상세로 돌려보내고 포장단위를 저장한다", async () => {
    const { order, red } = await createShipmentRequestedSkuOrder(sellerA.id);
    const { POST } = await importAdminPackageRoute("ADMIN");
    const form = new FormData();
    form.set("orderId", order.id);
    form.set("marker", "BOX-3");
    form.set("status", "PACKED");
    form.set("weightKg", "12.5");
    form.set("volumeCbm", "0.08");
    form.set("sku[0][id]", red.id);
    form.set("sku[0][quantity]", "1");

    const response = await POST(new Request("http://localhost/api/admin/shipments/packages", {
      method: "POST",
      headers: { accept: "application/json" },
      body: form,
    }));

    const detail = await getAdminShipmentOrder(order.id);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`http://localhost/admin/shipments/${order.id}?packed=1`);
    expect(detail?.shipmentPackages).toHaveLength(1);
    expect(detail?.shipmentPackages[0]).toMatchObject({
      marker: "BOX-3",
      status: "PACKED",
    });
  });

  it("운영자가 아니면 form 박스 저장 route도 403으로 거부된다", async () => {
    const { order, red } = await createShipmentRequestedSkuOrder(sellerA.id);
    const { POST } = await importAdminPackageRoute("SELLER");
    const form = new FormData();
    form.set("orderId", order.id);
    form.set("marker", "BOX-1");
    form.set("status", "PACKED");
    form.set("weightKg", "1");
    form.set("volumeCbm", "0.01");
    form.set("sku[0][id]", red.id);
    form.set("sku[0][quantity]", "1");

    const response = await POST(new Request("http://localhost/api/admin/shipments/packages", {
      method: "POST",
      body: form,
    }));

    expect(response.status).toBe(403);
    expect(response.headers.get("location")).toBeNull();
  });
});
