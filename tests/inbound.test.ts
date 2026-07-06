import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { prisma } from "../src/lib/db";
import { registerSeller } from "../src/lib/auth";
import { createOrder } from "../src/lib/orders";
import { recordInbound, ensureInboundCode } from "../src/lib/inbound";

let seller: { id: string };
let orderInsp: { id: string }, orderPlain: { id: string };

beforeEach(async () => {
  vi.restoreAllMocks();
  await prisma.walletTransaction.deleteMany();
  await prisma.inboundPhoto.deleteMany();
  await prisma.orderSkuLine.deleteMany();
  await prisma.orderProductLine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  seller = await registerSeller({ email: "s@s.com", password: "password1", contactName: "S" });
  orderInsp = await createOrder(seller.id, { productUrl: "https://a.com", productName: "검수품", quantity: 100, serviceType: "PURCHASE", inspectionRequested: true });
  orderPlain = await createOrder(seller.id, { productUrl: "https://b.com", productName: "일반품", quantity: 50, serviceType: "SHIPPING", inspectionRequested: false });
});

afterEach(() => {
  vi.doUnmock("@/lib/session");
  vi.doUnmock("@/lib/uploads");
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("recordInbound", () => {
  it("사진 경로·외포장 기록으로 입고완료 상태가 된다", async () => {
    const o = await recordInbound(orderPlain.id, {
      photoPaths: ["/uploads/a.jpg", "/uploads/b.jpg"], outerIssue: false,
    });
    expect(o.status).toBe("RECEIVED");
    expect(o.receivedAt).toBeTruthy();
    const photos = await prisma.inboundPhoto.findMany({ where: { orderId: orderPlain.id } });
    expect(photos).toHaveLength(2);
  });
  it("검수 신청 건은 검수 결과를 함께 기록한다", async () => {
    await prisma.orderSkuLine.deleteMany({ where: { productLine: { orderId: orderInsp.id } } });

    const o = await recordInbound(orderInsp.id, {
      photoPaths: ["/uploads/a.jpg"], outerIssue: false,
      inspection: { countActual: 97, appearanceOk: true, defectCount: 0, note: "3개 부족" },
    });
    expect(o.inspCountActual).toBe(97);
  });
  it("SKU별 입고·부족·하자 수량을 기록한다", async () => {
    const order = await createOrder(seller.id, {
      serviceType: "PURCHASE",
      inspectionRequested: true,
      items: [{
        productUrl: "https://a.com",
        productName: "상품 A",
        skus: [
          { optionText: "빨강", quantity: 50 },
          { optionText: "파랑", quantity: 50 },
        ],
      }],
    });
    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { productLines: { include: { skuLines: true }, orderBy: { sortOrder: "asc" } } },
    });
    const red = saved.productLines[0].skuLines[0];
    const blue = saved.productLines[0].skuLines[1];

    await recordInbound(order.id, {
      photoPaths: ["/uploads/a.jpg"],
      outerIssue: false,
      skuResults: [
        { skuLineId: red.id, inboundQuantity: 50, defectCount: 0, inspectionPassed: true, inspectionNote: "정상" },
        { skuLineId: blue.id, inboundQuantity: 45, defectCount: 0, inspectionPassed: true, inspectionNote: "5개 부족" },
      ],
    });

    const rows = await prisma.orderSkuLine.findMany({
      where: { productLine: { orderId: order.id } },
      orderBy: { sortOrder: "asc" },
    });
    expect(rows[0].inboundQuantity).toBe(50);
    expect(rows[0].missingQuantity).toBe(0);
    expect(rows[1].inboundQuantity).toBe(45);
    expect(rows[1].missingQuantity).toBe(5);
  });
  it("유료 검수 SKU 주문은 SKU 검수 결과 없이 집계 검수만 넣으면 거부한다", async () => {
    const order = await createOrder(seller.id, {
      serviceType: "PURCHASE",
      inspectionRequested: true,
      items: [{
        productUrl: "https://sku-only.com",
        productName: "SKU 검수품",
        skus: [
          { optionText: "빨강", quantity: 4 },
          { optionText: "파랑", quantity: 6 },
        ],
      }],
    });

    await expect(recordInbound(order.id, {
      photoPaths: ["/uploads/a.jpg"],
      outerIssue: false,
      inspection: { countActual: 10, appearanceOk: true, defectCount: 0, note: "집계만 입력" },
    })).rejects.toThrow("모든 SKU의 검수 결과를 함께 기록");
  });
  it("SKU 라인이 없는 유료 검수 legacy 주문은 집계 검수를 계속 허용한다", async () => {
    await prisma.orderSkuLine.deleteMany({ where: { productLine: { orderId: orderInsp.id } } });

    const o = await recordInbound(orderInsp.id, {
      photoPaths: ["/uploads/a.jpg"],
      outerIssue: false,
      inspection: { countActual: 97, appearanceOk: true, defectCount: 0, note: "3개 부족" },
    });

    expect(o.inspCountActual).toBe(97);
    expect(o.inspDefectCount).toBe(0);
  });
  it("검수 신청 건에 검수 결과 없이 입고 기록하면 거부한다", async () => {
    await expect(recordInbound(orderInsp.id, {
      photoPaths: ["/uploads/a.jpg"], outerIssue: false,
    })).rejects.toThrow("검수 결과를 함께 기록");
  });
  it("검수 미신청 건에 검수 결과를 넣으면 거부한다", async () => {
    await expect(recordInbound(orderPlain.id, {
      photoPaths: ["/uploads/a.jpg"], outerIssue: false,
      inspection: { countActual: 50, appearanceOk: true, defectCount: 0 },
    })).rejects.toThrow("검수를 신청하지 않은");
  });
  it("검수 미신청 SKU 주문에 SKU 검수 결과를 넣으면 거부한다", async () => {
    const order = await createOrder(seller.id, {
      serviceType: "SHIPPING",
      inspectionRequested: false,
      items: [{
        productUrl: "https://c.com",
        productName: "SKU 일반품",
        skus: [
          { optionText: "빨강", quantity: 3 },
          { optionText: "파랑", quantity: 2 },
        ],
      }],
    });
    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { productLines: { include: { skuLines: true }, orderBy: { sortOrder: "asc" } } },
    });
    const [red, blue] = saved.productLines[0].skuLines;

    await expect(recordInbound(order.id, {
      photoPaths: ["/uploads/a.jpg"],
      outerIssue: false,
      skuResults: [
        { skuLineId: red.id, inboundQuantity: 3, defectCount: 0, inspectionPassed: true, inspectionNote: "정상" },
        { skuLineId: blue.id, inboundQuantity: 2, defectCount: 0, inspectionPassed: true, inspectionNote: "정상" },
      ],
    })).rejects.toThrow("검수를 신청하지 않은");
  });
  it("유료 검수 SKU 주문에 중복 SKU ID를 넣으면 거부한다", async () => {
    const order = await createOrder(seller.id, {
      serviceType: "PURCHASE",
      inspectionRequested: true,
      items: [{
        productUrl: "https://d.com",
        productName: "SKU 검수품",
        skus: [
          { optionText: "빨강", quantity: 5 },
          { optionText: "파랑", quantity: 7 },
        ],
      }],
    });
    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { productLines: { include: { skuLines: true }, orderBy: { sortOrder: "asc" } } },
    });
    const [red, blue] = saved.productLines[0].skuLines;

    await expect(recordInbound(order.id, {
      photoPaths: ["/uploads/a.jpg"],
      outerIssue: false,
      skuResults: [
        { skuLineId: red.id, inboundQuantity: 5, defectCount: 0, inspectionPassed: true, inspectionNote: "정상" },
        { skuLineId: red.id, inboundQuantity: 5, defectCount: 0, inspectionPassed: true, inspectionNote: "중복" },
      ],
    })).rejects.toThrow("모든 SKU의 검수 결과를 함께 기록");

    await expect(
      prisma.orderSkuLine.findMany({ where: { productLine: { orderId: order.id } }, orderBy: { sortOrder: "asc" } }),
    ).resolves.toMatchObject([
      { id: red.id, inboundQuantity: null, missingQuantity: null, defectCount: null, inspectionPassed: null, inspectionNote: null },
      { id: blue.id, inboundQuantity: null, missingQuantity: null, defectCount: null, inspectionPassed: null, inspectionNote: null },
    ]);
  });
  it("사진이 0장 또는 3장 이상이면 거부한다", async () => {
    await expect(recordInbound(orderPlain.id, { photoPaths: [], outerIssue: false }))
      .rejects.toThrow("사진");
    await expect(recordInbound(orderPlain.id, { photoPaths: ["/uploads/1.jpg","/uploads/2.jpg","/uploads/3.jpg"], outerIssue: false }))
      .rejects.toThrow("사진");
  });
  it("이미 입고완료된 주문은 재기록을 거부한다", async () => {
    await recordInbound(orderPlain.id, { photoPaths: ["/uploads/a.jpg"], outerIssue: false });
    await expect(recordInbound(orderPlain.id, { photoPaths: ["/uploads/c.jpg"], outerIssue: false }))
      .rejects.toThrow("이미 입고");
  });
  it("없는 주문이면 거부한다", async () => {
    await expect(recordInbound("nope", { photoPaths: ["/uploads/a.jpg"], outerIssue: false }))
      .rejects.toThrow("주문을 찾을 수 없습니다");
  });
});

describe("ensureInboundCode", () => {
  it("입고ID가 없으면 8자 코드를 생성해 저장하고, 있으면 그대로 반환한다", async () => {
    const c1 = await ensureInboundCode(seller.id);
    expect(c1).toMatch(/^[A-Z0-9]{8}$/);
    const c2 = await ensureInboundCode(seller.id);
    expect(c2).toBe(c1);
  });
});

describe("admin inbound route", () => {
  async function importAdminInboundRoute() {
    vi.resetModules();
    vi.doMock("@/lib/session", () => ({
      getSessionUser: vi.fn(async () => ({ id: "admin-1", role: "ADMIN" })),
    }));
    vi.doMock("@/lib/uploads", () => ({
      saveInboundPhoto: vi.fn(async () => "/uploads/a.jpg"),
    }));
    return import("../src/app/api/admin/inbound/route");
  }

  it("SKU 입고 수량 필드가 누락되면 400으로 거부한다", async () => {
    const order = await createOrder(seller.id, {
      serviceType: "PURCHASE",
      inspectionRequested: true,
      items: [{
        productUrl: "https://route-test.com",
        productName: "라우트 검수품",
        skus: [{ optionText: "빨강", quantity: 3 }],
      }],
    });
    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { productLines: { include: { skuLines: true } } },
    });
    const sku = saved.productLines[0].skuLines[0];
    const form = new FormData();
    form.set("orderId", order.id);
    form.append("photos", new File(["a"], "a.jpg", { type: "image/jpeg" }));
    form.set("sku[0][id]", sku.id);
    form.set("sku[0][defectCount]", "0");
    form.set("sku[0][inspectionPassed]", "on");

    const { POST } = await importAdminInboundRoute();
    const response = await POST(
      new Request("http://localhost/api/admin/inbound", {
        method: "POST",
        body: form,
      }),
    );
    const body = await response.text();

    expect(response.status).toBe(400);
    expect(body).toContain("SKU 입고 수량이 올바르지 않습니다");
  });

  it("잘못된 SKU 입력이면 입고 사진을 저장하기 전에 400으로 거부한다", async () => {
    const order = await createOrder(seller.id, {
      serviceType: "PURCHASE",
      inspectionRequested: true,
      items: [{
        productUrl: "https://route-test-invalid-sku.com",
        productName: "라우트 SKU 검수품",
        skus: [{ optionText: "빨강", quantity: 3 }],
      }],
    });
    const form = new FormData();
    form.set("orderId", order.id);
    form.append("photos", new File(["a"], "a.jpg", { type: "image/jpeg" }));
    form.set("sku[0][id]", "not-this-order-sku");
    form.set("sku[0][inboundQuantity]", "1");
    form.set("sku[0][defectCount]", "0");
    form.set("sku[0][inspectionPassed]", "on");

    const { POST } = await importAdminInboundRoute();
    const uploads = await import("@/lib/uploads");
    const response = await POST(
      new Request("http://localhost/api/admin/inbound", {
        method: "POST",
        body: form,
      }),
    );
    const body = await response.text();

    expect(response.status).toBe(400);
    expect(body).toContain("SKU 정보를 찾을 수 없습니다");
    expect(uploads.saveInboundPhoto).not.toHaveBeenCalled();
  });
});

describe("seller inbound UI", () => {
  it("입고 목록은 SKU 라인이 있으면 수량과 SKU 수를 함께 보여준다", async () => {
    vi.resetModules();
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: unknown }) =>
        createElement("a", { href, ...props }, children),
    }));
    vi.doMock("@/lib/session", () => ({
      getSession: vi.fn(async () => ({ userId: "seller-1" })),
    }));
    vi.doMock("@/lib/db", () => ({
      prisma: {
        order: {
          findMany: vi.fn(async () => [
            {
              id: "order-1",
              productName: "상품 A 외 1개 상품",
              quantity: 95,
              createdAt: new Date("2026-07-06T00:00:00.000Z"),
              photos: [{ id: "photo-1" }],
              inspectionRequested: true,
              outerIssue: false,
              status: "REQUESTED",
              productLines: [
                { skuLines: [{ id: "sku-1" }, { id: "sku-2" }, { id: "sku-3" }] },
              ],
            },
          ]),
        },
      },
    }));

    const { default: InboundPage } = await import("../src/app/dashboard/inbound/page");
    const html = renderToStaticMarkup(await InboundPage({ searchParams: Promise.resolve({ tab: "waiting" }) }));

    expect(html).toContain("95개 / 3 SKU");
  });

  it("입고 목록은 SKU 라인이 없는 legacy 주문이면 기존 수량 표기를 유지한다", async () => {
    vi.resetModules();
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: unknown }) =>
        createElement("a", { href, ...props }, children),
    }));
    vi.doMock("@/lib/session", () => ({
      getSession: vi.fn(async () => ({ userId: "seller-1" })),
    }));
    vi.doMock("@/lib/db", () => ({
      prisma: {
        order: {
          findMany: vi.fn(async () => [
            {
              id: "order-legacy-1",
              productName: "레거시 상품",
              quantity: 50,
              createdAt: new Date("2026-07-06T00:00:00.000Z"),
              photos: [{ id: "photo-1" }],
              inspectionRequested: false,
              outerIssue: null,
              status: "REQUESTED",
              productLines: [],
            },
          ]),
        },
      },
    }));

    const { default: InboundPage } = await import("../src/app/dashboard/inbound/page");
    const html = renderToStaticMarkup(await InboundPage({ searchParams: Promise.resolve({ tab: "waiting" }) }));

    expect(html).toContain("× 50");
  });
});
