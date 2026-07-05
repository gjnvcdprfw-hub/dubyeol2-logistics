import { randomBytes } from "crypto";
import { prisma } from "./db";
import { ValidationError } from "./auth";
import { orderWithLinesInclude } from "./order-lines";

export type SkuInboundResult = {
  skuLineId: string;
  inboundQuantity: number;
  defectCount: number;
  inspectionPassed: boolean;
  inspectionNote?: string;
};

export type InboundInput = {
  photoPaths: string[];
  outerIssue: boolean;
  outerNote?: string;
  inspection?: { countActual: number; appearanceOk: boolean; defectCount: number; note?: string };
  skuResults?: SkuInboundResult[];
};

export async function recordInbound(orderId: string, input: InboundInput) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: orderWithLinesInclude });
  if (!order) throw new ValidationError("주문을 찾을 수 없습니다");
  if (order.status !== "REQUESTED") throw new ValidationError("이미 입고 처리된 주문입니다");
  if (input.photoPaths.length < 1 || input.photoPaths.length > 2)
    throw new ValidationError("입고 사진은 1~2장이어야 합니다");
  const skuLines = order.productLines.flatMap((line) => line.skuLines);
  const hasSkuResults = Boolean(input.skuResults?.length);
  const useAggregateInspection = order.inspectionRequested && !hasSkuResults;
  if (input.inspection && !order.inspectionRequested)
    throw new ValidationError("검수를 신청하지 않은 주문에는 검수 결과를 기록할 수 없습니다");
  if (hasSkuResults && !order.inspectionRequested)
    throw new ValidationError("검수를 신청하지 않은 주문에는 검수 결과를 기록할 수 없습니다");
  if (useAggregateInspection && !input.inspection)
    throw new ValidationError("유료 검수 신청 건은 검수 결과를 함께 기록해야 합니다");
  if (hasSkuResults) {
    const skuById = new Map(skuLines.map((sku) => [sku.id, sku]));
    const submittedSkuIds = input.skuResults!.map((result) => result.skuLineId);
    const submittedSkuIdSet = new Set(submittedSkuIds);
    if (submittedSkuIdSet.size !== submittedSkuIds.length) {
      throw new ValidationError("유료 검수 신청 건은 모든 SKU의 검수 결과를 함께 기록해야 합니다");
    }
    for (const result of input.skuResults ?? []) {
      const sku = skuById.get(result.skuLineId);
      if (!sku) throw new ValidationError("SKU 정보를 찾을 수 없습니다");
      if (
        !Number.isInteger(result.inboundQuantity) ||
        result.inboundQuantity < 0 ||
        result.inboundQuantity > sku.quantity
      ) {
        throw new ValidationError("SKU 입고 수량이 올바르지 않습니다");
      }
      if (
        !Number.isInteger(result.defectCount) ||
        result.defectCount < 0 ||
        result.defectCount > result.inboundQuantity
      ) {
        throw new ValidationError("SKU 하자 수량이 올바르지 않습니다");
      }
    }
    if (
      order.inspectionRequested &&
      (input.skuResults!.length !== skuLines.length || skuLines.some((sku) => !submittedSkuIdSet.has(sku.id)))
    ) {
      throw new ValidationError("유료 검수 신청 건은 모든 SKU의 검수 결과를 함께 기록해야 합니다");
    }
  }
  const insp = input.inspection;
  let updated;
  try {
    updated = await prisma.$transaction(async (tx) => {
      const savedOrder = await tx.order.update({
        where: { id: orderId, status: "REQUESTED" },
        data: {
          status: "RECEIVED",
          receivedAt: new Date(),
          outerIssue: input.outerIssue,
          outerNote: input.outerNote,
          inspCountActual: useAggregateInspection ? insp?.countActual : undefined,
          inspAppearanceOk: useAggregateInspection ? insp?.appearanceOk : undefined,
          inspDefectCount: useAggregateInspection ? insp?.defectCount : undefined,
          inspNote: useAggregateInspection ? insp?.note : undefined,
          photos: { create: input.photoPaths.map((path) => ({ path })) },
        },
      });

      for (const result of input.skuResults ?? []) {
        const sku = skuLines.find((item) => item.id === result.skuLineId)!;
        await tx.orderSkuLine.update({
          where: { id: result.skuLineId },
          data: {
            inboundQuantity: result.inboundQuantity,
            missingQuantity: sku.quantity - result.inboundQuantity,
            defectCount: result.defectCount,
            inspectionPassed: result.inspectionPassed,
            inspectionNote: result.inspectionNote,
          },
        });
      }

      return savedOrder;
    });
  } catch (e) {
    if ((e as { code?: string }).code === "P2025")
      throw new ValidationError("이미 입고 처리된 주문입니다");
    throw e;
  }
  return updated;
}

export async function ensureInboundCode(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ValidationError("로그인이 필요합니다");
  if (user.inboundCode) return user.inboundCode;
  const code = randomBytes(6).toString("base64url").replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase().padEnd(8, "0");
  await prisma.user.update({ where: { id: userId }, data: { inboundCode: code } });
  return code;
}
