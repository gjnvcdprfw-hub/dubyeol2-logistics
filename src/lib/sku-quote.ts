import { ValidationError } from "./auth";
import { RATES } from "./rates";

export type SkuSettlementInput = {
  inspectionRequested: boolean;
  exchangeRateX100: number;
  skus: Array<{
    label: string;
    quantity: number;
    unitPriceFen: number;
    cnShippingFen: number;
  }>;
};

export function computeSkuSettlement(input: SkuSettlementInput) {
  if (!Number.isInteger(input.exchangeRateX100) || input.exchangeRateX100 <= 0) {
    throw new ValidationError("환율은 0보다 커야 합니다");
  }

  const toKrw = (fen: number) => Math.round((fen * input.exchangeRateX100) / 10000);
  const lines = input.skus.map((sku) => {
    if (!Number.isInteger(sku.quantity) || sku.quantity < 1) {
      throw new ValidationError("SKU 수량이 올바르지 않습니다");
    }
    if (
      !Number.isFinite(sku.unitPriceFen) ||
      !Number.isFinite(sku.cnShippingFen) ||
      sku.unitPriceFen < 0 ||
      sku.cnShippingFen < 0
    ) {
      throw new ValidationError("SKU 금액이 올바르지 않습니다");
    }

    const productFen = sku.unitPriceFen * sku.quantity;
    const inspectionFen = input.inspectionRequested ? RATES.inspectionFeeFenPerUnit * sku.quantity : 0;
    const totalFen = productFen + sku.cnShippingFen + inspectionFen;

    return {
      ...sku,
      productFen,
      inspectionFen,
      totalFen,
      totalKrw: toKrw(totalFen),
    };
  });

  const totalFen = lines.reduce((sum, line) => sum + line.totalFen, 0);

  return {
    lines,
    totalFen,
    totalKrw: toKrw(totalFen),
  };
}
