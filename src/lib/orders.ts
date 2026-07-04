import { prisma } from "./db";
import { ValidationError } from "./auth";

export type NewOrder = {
  productUrl: string; productName: string; optionText?: string;
  quantity: number; serviceType: "PURCHASE" | "SHIPPING";
  inspectionRequested: boolean; memo?: string;
};

export async function createOrder(sellerId: string, input: NewOrder) {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");
  if (!/^https?:\/\/.+/.test(input.productUrl)) throw new ValidationError("상품 링크 형식이 올바르지 않습니다");
  if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new ValidationError("수량은 1 이상이어야 합니다");
  if (input.serviceType !== "PURCHASE" && input.serviceType !== "SHIPPING") throw new ValidationError("서비스 유형이 올바르지 않습니다");
  return prisma.order.create({
    data: {
      sellerId,
      productUrl: input.productUrl,
      productName: input.productName,
      optionText: input.optionText,
      quantity: input.quantity,
      serviceType: input.serviceType,
      inspectionRequested: Boolean(input.inspectionRequested),
      memo: input.memo,
    },
  });
}

export async function listOrdersBySeller(sellerId: string) {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");
  return prisma.order.findMany({ where: { sellerId }, orderBy: { createdAt: "desc" } });
}
