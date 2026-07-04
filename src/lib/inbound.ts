import { randomBytes } from "crypto";
import { prisma } from "./db";
import { ValidationError } from "./auth";

export type InboundInput = {
  photoPaths: string[];
  outerIssue: boolean;
  outerNote?: string;
  inspection?: { countActual: number; appearanceOk: boolean; defectCount: number; note?: string };
};

export async function recordInbound(orderId: string, input: InboundInput) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ValidationError("주문을 찾을 수 없습니다");
  if (order.status !== "REQUESTED") throw new ValidationError("이미 입고 처리된 주문입니다");
  if (input.photoPaths.length < 1 || input.photoPaths.length > 2)
    throw new ValidationError("입고 사진은 1~2장이어야 합니다");
  if (input.inspection && !order.inspectionRequested)
    throw new ValidationError("검수를 신청하지 않은 주문에는 검수 결과를 기록할 수 없습니다");
  if (order.inspectionRequested && !input.inspection)
    throw new ValidationError("유료 검수 신청 건은 검수 결과를 함께 기록해야 합니다");
  const insp = input.inspection;
  let updated;
  try {
    updated = await prisma.order.update({
      where: { id: orderId, status: "REQUESTED" },
      data: {
        status: "RECEIVED",
        receivedAt: new Date(),
        outerIssue: input.outerIssue,
        outerNote: input.outerNote,
        inspCountActual: insp?.countActual,
        inspAppearanceOk: insp?.appearanceOk,
        inspDefectCount: insp?.defectCount,
        inspNote: insp?.note,
        photos: { create: input.photoPaths.map((path) => ({ path })) },
      },
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
