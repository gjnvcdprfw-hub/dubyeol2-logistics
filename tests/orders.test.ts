import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "../src/lib/db";
import { registerSeller } from "../src/lib/auth";
import { createOrder, listOrdersBySeller } from "../src/lib/orders";

let sellerA: { id: string }, sellerB: { id: string };

beforeEach(async () => {
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  sellerA = await registerSeller({ email: "a@a.com", password: "password1", contactName: "A" });
  sellerB = await registerSeller({ email: "b@b.com", password: "password1", contactName: "B" });
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
