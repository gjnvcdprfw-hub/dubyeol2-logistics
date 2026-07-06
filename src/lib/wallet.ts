import type { Order, WalletTransaction } from "@prisma/client";
import { ValidationError } from "./auth";
import { prisma } from "./db";
import { computeQuote, type QuoteInput } from "./quote";
import { orderWithLinesInclude } from "./order-lines";
import { getCompleteSkuQuoteTotals, type ProductLineWithQuotedSkus } from "./sku-quote";

export type WalletSummary = {
  balanceKrw: number;
  totalCreditKrw: number;
  totalDebitKrw: number;
  transactions: WalletTransaction[];
};

type OrderLike = Pick<
  Order,
  | "quantity"
  | "serviceType"
  | "inspectionRequested"
  | "quoteUnitPriceFen"
  | "quoteCnShippingFen"
  | "quoteWeightGrams"
  | "quoteVolumeCm3"
  | "quoteExchangeRateX100"
  | "quoteShippingMethod"
  | "quotedAt"
> & {
  productLines?: ProductLineWithQuotedSkus[];
};

export type ShipmentRequestResult = {
  order: Order;
  transaction: WalletTransaction;
  balanceKrw: number;
};

export function getWalletTransactionLabel(type: string) {
  switch (type) {
    case "TOPUP_CREDIT":
      return "예치금 충전 승인";
    case "TEST_CREDIT":
      return "로컬 QA 예치금";
    case "SHIPMENT_DEBIT":
      return "출고 요청 차감";
    default:
      return "지갑 거래";
  }
}

export function getQuotedOrderQuoteInput(order: OrderLike): QuoteInput {
  if (!order.quotedAt || !order.quoteShippingMethod) {
    throw new ValidationError("견적 완료된 주문만 출고 요청할 수 있습니다");
  }

  const skuTotals = getCompleteSkuQuoteTotals(order.productLines);

  return {
    quantity: order.quantity,
    serviceType: order.serviceType as "PURCHASE" | "SHIPPING",
    inspectionRequested: order.inspectionRequested,
    unitPriceFen: order.quoteUnitPriceFen ?? 0,
    productTotalFen: skuTotals?.productFen,
    cnShippingFen: skuTotals?.cnShippingFen ?? order.quoteCnShippingFen ?? 0,
    weightGrams: order.quoteWeightGrams ?? 0,
    volumeCm3: order.quoteVolumeCm3 ?? 0,
    exchangeRateX100: order.quoteExchangeRateX100 ?? 0,
    shippingMethod: order.quoteShippingMethod as "SEA" | "AIR",
  };
}

export function getQuotedOrderQuote(order: OrderLike) {
  return computeQuote(getQuotedOrderQuoteInput(order));
}

export function getQuotedOrderTotalKrw(order: OrderLike) {
  return getQuotedOrderQuote(order).totalKrw;
}

export async function getWalletSummary(sellerId: string): Promise<WalletSummary> {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");

  const [user, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sellerId },
      select: { walletBalanceKrw: true },
    }),
    prisma.walletTransaction.findMany({
      where: { sellerId },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const balanceKrw = user?.walletBalanceKrw ?? 0;
  const totalCreditKrw = transactions
    .filter((tx) => tx.amountKrw > 0)
    .reduce((sum, tx) => sum + tx.amountKrw, 0);
  const totalDebitKrw = transactions
    .filter((tx) => tx.amountKrw < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amountKrw), 0);

  return { balanceKrw, totalCreditKrw, totalDebitKrw, transactions };
}

export async function recordWalletCredit(sellerId: string, amountKrw: number, memo: string) {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");
  if (!Number.isInteger(amountKrw) || amountKrw <= 0) {
    throw new ValidationError("예치금 금액이 올바르지 않습니다");
  }

  return prisma.$transaction(async (tx) => {
    const seller = await tx.user.update({
      where: { id: sellerId },
      data: {
        walletBalanceKrw: {
          increment: amountKrw,
        },
      },
      select: {
        walletBalanceKrw: true,
      },
    });

    return tx.walletTransaction.create({
      data: {
        sellerId,
        type: "TEST_CREDIT",
        amountKrw,
        balanceAfterKrw: seller.walletBalanceKrw,
        memo,
      },
    });
  });
}

export async function requestShipmentWithWallet(
  sellerId: string,
  orderId: string,
): Promise<ShipmentRequestResult> {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");
  if (!orderId) throw new ValidationError("주문을 선택해 주세요");

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({ where: { id: orderId, sellerId }, include: orderWithLinesInclude });
    if (!order) throw new ValidationError("주문을 찾을 수 없습니다");
    if (order.status === "SHIPMENT_REQUESTED") {
      throw new ValidationError("이미 출고 요청된 주문입니다");
    }
    if (order.status !== "RECEIVED") {
      throw new ValidationError("입고·견적 완료된 주문만 출고 요청할 수 있습니다");
    }

    const amountKrw = getQuotedOrderTotalKrw(order);
    const seller = await tx.user.findUnique({
      where: { id: sellerId },
      select: { walletBalanceKrw: true },
    });
    const currentBalanceKrw = seller?.walletBalanceKrw ?? 0;
    if (currentBalanceKrw < amountKrw) throw new ValidationError("예치금 잔액이 부족합니다");

    const updateResult = await tx.order.updateMany({
      where: { id: order.id, sellerId, status: "RECEIVED" },
      data: {
        status: "SHIPMENT_REQUESTED",
        shipmentRequestedAt: new Date(),
        shipmentRequestedAmountKrw: amountKrw,
      },
    });
    if (updateResult.count !== 1) {
      throw new ValidationError("이미 출고 요청된 주문입니다");
    }

    const balanceUpdate = await tx.user.updateMany({
      where: {
        id: sellerId,
        walletBalanceKrw: {
          gte: amountKrw,
        },
      },
      data: {
        walletBalanceKrw: {
          decrement: amountKrw,
        },
      },
    });
    if (balanceUpdate.count !== 1) {
      throw new ValidationError("예치금 잔액이 부족합니다");
    }
    const updatedSeller = await tx.user.findUniqueOrThrow({
      where: { id: sellerId },
      select: {
        walletBalanceKrw: true,
      },
    });
    const updatedOrder = await tx.order.findFirstOrThrow({ where: { id: order.id, sellerId } });
    const transaction = await tx.walletTransaction.create({
      data: {
        sellerId,
        orderId: order.id,
        type: "SHIPMENT_DEBIT",
        amountKrw: -amountKrw,
        balanceAfterKrw: updatedSeller.walletBalanceKrw,
        memo: `출고 요청 차감: ${order.productName}`,
      },
    });

    return { order: updatedOrder, transaction, balanceKrw: updatedSeller.walletBalanceKrw };
  });
}
