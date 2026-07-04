import { RATES } from "./rates";
import { ValidationError } from "./auth";

export type QuoteInput = {
  quantity: number;
  serviceType: "PURCHASE" | "SHIPPING";
  inspectionRequested: boolean;
  unitPriceFen: number;      // 배송대행 건 0 허용
  cnShippingFen: number;
  weightGrams: number;
  volumeCm3: number;
  exchangeRateX100: number;
  shippingMethod: "SEA" | "AIR";
};

export type QuoteItem = { key: string; label: string; amountFen: number };

export function computeQuote(input: QuoteInput) {
  if (input.weightGrams <= 0) throw new ValidationError("무게는 0보다 커야 합니다");
  if (input.exchangeRateX100 <= 0) throw new ValidationError("환율은 0보다 커야 합니다");
  if (input.volumeCm3 < 0 || input.cnShippingFen < 0 || input.unitPriceFen < 0)
    throw new ValidationError("입력값이 올바르지 않습니다");

  const items: QuoteItem[] = [];

  if (input.serviceType === "PURCHASE") {
    const productFen = input.unitPriceFen * input.quantity;
    const commissionFen = Math.round(productFen * RATES.commissionRate);
    const vatFen = Math.round(commissionFen * RATES.commissionVatRate);
    items.push({ key: "product", label: "상품가", amountFen: productFen });
    items.push({ key: "cnShipping", label: "중국 내 배송비", amountFen: input.cnShippingFen });
    items.push({ key: "commission", label: "구매대행 수수료 (5%)", amountFen: commissionFen });
    items.push({ key: "commissionVat", label: "수수료 부가세 (10%)", amountFen: vatFen });
  } else {
    items.push({ key: "cnShipping", label: "중국 내 배송비", amountFen: input.cnShippingFen });
  }

  if (input.inspectionRequested) {
    items.push({ key: "inspection", label: "유료 검수비 (¥1/개)", amountFen: RATES.inspectionFeeFenPerUnit * input.quantity });
  }

  // 청구중량: 실중량 vs 부피중량(cm³/6000) 중 큰 값
  const actualKg = input.weightGrams / 1000;
  const volumetricKg = input.volumeCm3 / RATES.volumeDivisor;
  const chargeableRaw = Math.max(actualKg, volumetricKg);

  let intlFen: number;
  let chargeableWeightKg: number;
  if (input.shippingMethod === "SEA") {
    chargeableWeightKg = Math.max(1, Math.ceil(chargeableRaw));      // kg 단위 올림, 최소 1kg
    intlFen = RATES.sea.firstKgFen + (chargeableWeightKg - 1) * RATES.sea.additionalPerKgFen;
  } else {
    const units100g = Math.max(1, Math.ceil((chargeableRaw * 1000) / 100)); // 100g 단위 올림
    chargeableWeightKg = units100g / 10;
    intlFen = RATES.air.docFeeFen + units100g * RATES.air.per100gFen;
  }
  items.push({ key: "intlShipping", label: `예상 국제운임 (${input.shippingMethod === "SEA" ? "해운" : "항공"})`, amountFen: intlFen });

  const totalFen = items.reduce((s, i) => s + i.amountFen, 0);
  const toKrw = (fen: number) => Math.round((fen * input.exchangeRateX100) / 10000);
  return {
    items, totalFen, chargeableWeightKg,
    totalKrw: toKrw(totalFen),
    itemsKrw: items.map(i => ({ ...i, amountKrw: toKrw(i.amountFen) })),
  };
}
