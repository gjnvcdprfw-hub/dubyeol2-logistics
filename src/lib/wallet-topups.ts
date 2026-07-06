import { ValidationError } from "./auth";
import { prisma } from "./db";

type TopUpInput = {
  amountKrw: number;
  depositorName: string;
  memo?: string | null;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateTopUpInput(input: TopUpInput) {
  const amountKrw = Number(input.amountKrw);
  if (!Number.isInteger(amountKrw) || amountKrw <= 0) {
    throw new ValidationError("충전 금액이 올바르지 않습니다");
  }

  const depositorName = cleanText(input.depositorName);
  if (!depositorName) {
    throw new ValidationError("입금자명을 입력해 주세요");
  }

  const memo = cleanText(input.memo ?? "");

  return { amountKrw, depositorName, memo: memo || null };
}

export async function createWalletTopUpRequest(sellerId: string, input: TopUpInput) {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");

  return prisma.walletTopUpRequest.create({
    data: {
      sellerId,
      ...validateTopUpInput(input),
    },
  });
}

export async function listSellerWalletTopUps(sellerId: string) {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");

  return prisma.walletTopUpRequest.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAdminWalletTopUps() {
  return prisma.walletTopUpRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      seller: {
        select: {
          email: true,
          contactName: true,
          companyName: true,
        },
      },
    },
  });
}

export async function approveWalletTopUpRequest(adminId: string, requestId: string, memo?: string | null) {
  if (!adminId) throw new ValidationError("운영자 로그인이 필요합니다");
  if (!requestId) throw new ValidationError("충전 요청을 선택해 주세요");

  const adminMemo = cleanText(memo ?? "");

  return prisma.$transaction(async (tx) => {
    const request = await tx.walletTopUpRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new ValidationError("충전 요청을 찾을 수 없습니다");
    if (request.status !== "PENDING") throw new ValidationError("이미 처리된 충전 요청입니다");

    const update = await tx.walletTopUpRequest.updateMany({
      where: { id: request.id, status: "PENDING" },
      data: {
        status: "APPROVED",
        processedById: adminId,
        processedAt: new Date(),
        adminMemo: adminMemo || "입금 확인",
      },
    });
    if (update.count !== 1) throw new ValidationError("이미 처리된 충전 요청입니다");

    const transactions = await tx.walletTransaction.findMany({ where: { sellerId: request.sellerId } });
    const balanceKrw = transactions.reduce((sum, item) => sum + item.amountKrw, 0);
    const transaction = await tx.walletTransaction.create({
      data: {
        sellerId: request.sellerId,
        type: "TOPUP_CREDIT",
        amountKrw: request.amountKrw,
        balanceAfterKrw: balanceKrw + request.amountKrw,
        memo: adminMemo || `예치금 충전 승인: ${request.depositorName}`,
      },
    });

    return tx.walletTopUpRequest.update({
      where: { id: request.id },
      data: { walletTransactionId: transaction.id },
    });
  });
}

export async function rejectWalletTopUpRequest(adminId: string, requestId: string, reason: string) {
  if (!adminId) throw new ValidationError("운영자 로그인이 필요합니다");
  if (!requestId) throw new ValidationError("충전 요청을 선택해 주세요");

  const adminMemo = cleanText(reason);
  if (!adminMemo) throw new ValidationError("거절 사유를 입력해 주세요");

  const update = await prisma.walletTopUpRequest.updateMany({
    where: { id: requestId, status: "PENDING" },
    data: {
      status: "REJECTED",
      processedById: adminId,
      processedAt: new Date(),
      adminMemo,
    },
  });
  if (update.count !== 1) throw new ValidationError("이미 처리된 충전 요청입니다");

  return prisma.walletTopUpRequest.findUniqueOrThrow({ where: { id: requestId } });
}
