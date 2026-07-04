import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "../src/lib/db";
import { registerSeller } from "../src/lib/auth";
import { createOrder } from "../src/lib/orders";
import { recordInbound, ensureInboundCode } from "../src/lib/inbound";

let seller: { id: string };
let orderInsp: { id: string }, orderPlain: { id: string };

beforeEach(async () => {
  await prisma.inboundPhoto.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  seller = await registerSeller({ email: "s@s.com", password: "password1", contactName: "S" });
  orderInsp = await createOrder(seller.id, { productUrl: "https://a.com", productName: "검수품", quantity: 100, serviceType: "PURCHASE", inspectionRequested: true });
  orderPlain = await createOrder(seller.id, { productUrl: "https://b.com", productName: "일반품", quantity: 50, serviceType: "SHIPPING", inspectionRequested: false });
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
    const o = await recordInbound(orderInsp.id, {
      photoPaths: ["/uploads/a.jpg"], outerIssue: false,
      inspection: { countActual: 97, appearanceOk: true, defectCount: 0, note: "3개 부족" },
    });
    expect(o.inspCountActual).toBe(97);
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
