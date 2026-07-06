import { readFileSync } from "node:fs";
import { describe, it, expect, beforeEach } from "vitest";
import { afterEach, vi } from "vitest";
import { prisma } from "../src/lib/db";
import { registerSeller } from "../src/lib/auth";
import { createOrder, listOrdersBySeller } from "../src/lib/orders";

let sellerA: { id: string }, sellerB: { id: string };

beforeEach(async () => {
  await prisma.walletTransaction.deleteMany();
  await prisma.inboundPhoto.deleteMany();
  await prisma.orderSkuLine.deleteMany();
  await prisma.orderProductLine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  sellerA = await registerSeller({ email: "a@a.com", password: "password1", contactName: "A" });
  sellerB = await registerSeller({ email: "b@b.com", password: "password1", contactName: "B" });
});

afterEach(() => {
  vi.doUnmock("next/navigation");
  vi.doUnmock("next/link");
  vi.doUnmock("@/lib/session");
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("createOrder", () => {
  it("링크·상품명·수량·구분·검수 선택으로 접수되고 상태는 REQUESTED", async () => {
    const o = await createOrder(sellerA.id, {
      productUrl: "https://detail.1688.com/offer/123.html",
      productName: "미니가전", optionText: "화이트", quantity: 100,
      serviceType: "PURCHASE", inspectionRequested: true,
    });
    expect(o.status).toBe("REQUESTED");
    expect(o.inspectionRequested).toBe(true);
  });
  it("수량 1 미만은 거부", async () => {
    await expect(createOrder(sellerA.id, {
      productUrl: "https://x.com", productName: "x", quantity: 0, serviceType: "PURCHASE", inspectionRequested: false,
    })).rejects.toThrow("수량");
  });
  it("URL 형식이 아니면 거부", async () => {
    await expect(createOrder(sellerA.id, {
      productUrl: "not-a-url", productName: "x", quantity: 1, serviceType: "SHIPPING", inspectionRequested: false,
    })).rejects.toThrow("상품 링크");
  });
});

describe("createOrder — 입력 화이트리스트", () => {
  it("body로 status를 주입해도 무시되고 REQUESTED로 저장된다", async () => {
    const o = await createOrder(sellerA.id, {
      productUrl: "https://a.com", productName: "x", quantity: 1,
      serviceType: "PURCHASE", inspectionRequested: false,
      status: "DELIVERED", id: "hacked", createdAt: new Date(0),
    } as never);
    expect(o.status).toBe("REQUESTED");
    expect(o.id).not.toBe("hacked");
  });
  it("serviceType이 PURCHASE/SHIPPING 외면 거부", async () => {
    await expect(createOrder(sellerA.id, {
      productUrl: "https://a.com", productName: "x", quantity: 1,
      serviceType: "XYZ" as never, inspectionRequested: false,
    })).rejects.toThrow("서비스 유형");
  });
});

describe("createOrder — SKU 라인 구조", () => {
  it("주문 묶음 1건에 상품 라인과 SKU 라인을 저장한다", async () => {
    const order = await createOrder(sellerA.id, {
      serviceType: "PURCHASE",
      inspectionRequested: true,
      memo: "묶음 주문",
      items: [
        {
          productUrl: "https://detail.1688.com/offer/100.html",
          productName: "상품 A",
          skus: [
            { optionText: "빨강", quantity: 50 },
            { optionText: "파랑", quantity: 50 },
          ],
        },
        {
          productUrl: "https://detail.1688.com/offer/200.html",
          productName: "상품 B",
          skus: [{ optionText: "L", quantity: 30 }],
        },
      ],
    });

    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { productLines: { include: { skuLines: true }, orderBy: { sortOrder: "asc" } } },
    });

    expect(saved.quantity).toBe(130);
    expect(saved.productLines).toHaveLength(2);
    expect(saved.productLines[0].skuLines.map((sku) => sku.optionText)).toEqual(["빨강", "파랑"]);
    expect(saved.productLines[1].skuLines[0].quantity).toBe(30);
  });

  it("기존 단건 주문 입력은 SKU 1개짜리 주문으로 호환 저장한다", async () => {
    const order = await createOrder(sellerA.id, {
      productUrl: "https://detail.1688.com/offer/123.html",
      productName: "미니가전",
      optionText: "화이트",
      quantity: 100,
      serviceType: "PURCHASE",
      inspectionRequested: true,
    });

    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { productLines: { include: { skuLines: true } } },
    });

    expect(saved.productLines).toHaveLength(1);
    expect(saved.productLines[0].skuLines).toHaveLength(1);
    expect(saved.productLines[0].skuLines[0].optionText).toBe("화이트");
    expect(saved.productLines[0].skuLines[0].quantity).toBe(100);
  });

  it("items가 빈 배열이면 레거시 fallback 대신 거부한다", async () => {
    await expect(
      createOrder(sellerA.id, {
        serviceType: "PURCHASE",
        inspectionRequested: true,
        items: [],
      }),
    ).rejects.toThrow("상품을 1개 이상 입력해 주세요");
  });

  it("SKU 옵션명이 공백뿐이면 기본값으로 저장한다", async () => {
    const order = await createOrder(sellerA.id, {
      serviceType: "PURCHASE",
      inspectionRequested: true,
      items: [
        {
          productUrl: "https://detail.1688.com/offer/300.html",
          productName: "상품 C",
          skus: [{ optionText: "   ", quantity: 5 }],
        },
      ],
    });

    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { productLines: { include: { skuLines: true } } },
    });

    expect(saved.productLines[0].skuLines[0].optionText).toBe("기본");
  });
});

describe("listOrdersBySeller — sellerId 가드", () => {
  it("sellerId가 없으면 전체 반환 대신 오류를 던진다", async () => {
    await createOrder(sellerA.id, { productUrl: "https://a.com", productName: "A상품", quantity: 1, serviceType: "PURCHASE", inspectionRequested: false });
    await expect(listOrdersBySeller(undefined as unknown as string)).rejects.toThrow("로그인");
    await expect(listOrdersBySeller("")).rejects.toThrow("로그인");
  });
});

describe("listOrdersBySeller — 데이터 격리(절대 실패 금지)", () => {
  it("셀러 A는 자기 주문만 본다", async () => {
    await createOrder(sellerA.id, { productUrl: "https://a.com", productName: "A상품", quantity: 1, serviceType: "PURCHASE", inspectionRequested: false });
    await createOrder(sellerB.id, { productUrl: "https://b.com", productName: "B상품", quantity: 2, serviceType: "SHIPPING", inspectionRequested: false });
    const listA = await listOrdersBySeller(sellerA.id);
    expect(listA).toHaveLength(1);
    expect(listA[0].productName).toBe("A상품");
  });
});

describe("seller order UI", () => {
  it("주문 접수 폼은 items 상태와 상품/SKU 추가 컨트롤을 가진다", () => {
    const source = readFileSync("src/app/dashboard/orders/new/page.tsx", "utf8");

    expect(source).toContain("items:");
    expect(source).toContain("SKU 추가");
    expect(source).toContain("상품 추가");
    expect(source).toContain("Number(sku.quantity)");
  });

  it("주문 목록은 SKU 라인이 있으면 SKU 요약을, 없으면 기존 수량 표기를 유지한다", () => {
    const source = readFileSync("src/app/dashboard/orders/page.tsx", "utf8");

    expect(source).toContain("productLines.reduce");
    expect(source).toContain("SKU");
    expect(source).toContain("× ${order.quantity}");
  });
});
