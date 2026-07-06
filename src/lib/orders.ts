import { prisma } from "./db";
import { ValidationError } from "./auth";
import {
  getSkuCount,
  getTotalQuantity,
  normalizeOrderLines,
  orderWithLinesAndPackagesInclude,
  orderWithLinesInclude,
  type NewOrderProductLine,
} from "./order-lines";

export type NewOrder = {
  productUrl?: string; productName?: string; optionText?: string;
  quantity?: number; items?: NewOrderProductLine[];
  serviceType: "PURCHASE" | "SHIPPING";
  inspectionRequested: boolean; memo?: string;
};

export async function createOrder(sellerId: string, input: NewOrder) {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");
  if (input.serviceType !== "PURCHASE" && input.serviceType !== "SHIPPING") throw new ValidationError("서비스 유형이 올바르지 않습니다");
  const lines = normalizeOrderLines(input);
  const first = lines[0];
  const firstSku = first.skuLines[0];
  const totalQuantity = getTotalQuantity(lines);
  const skuCount = getSkuCount(lines);

  return prisma.order.create({
    data: {
      sellerId,
      productUrl: first.productUrl,
      productName: lines.length === 1 ? first.productName : `${first.productName} 외 ${lines.length - 1}개 상품`,
      optionText: lines.length === 1 && first.skuLines.length === 1 ? firstSku.optionText : `${totalQuantity}개 / ${skuCount} SKU`,
      quantity: totalQuantity,
      serviceType: input.serviceType,
      inspectionRequested: Boolean(input.inspectionRequested),
      memo: input.memo,
      productLines: {
        create: lines.map((line) => ({
          productUrl: line.productUrl,
          productName: line.productName,
          sortOrder: line.sortOrder,
          skuLines: { create: line.skuLines },
        })),
      },
    },
    include: orderWithLinesInclude,
  });
}

export async function listOrdersBySeller(sellerId: string) {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");
  return prisma.order.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    include: orderWithLinesAndPackagesInclude,
  });
}
