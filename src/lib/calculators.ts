// 공개 계산기 순수 함수 — 요율은 전부 RATES 파생 (하드코딩 금지).
// 국제운임 규칙의 단일 정의: quote.ts(견적)도 여기의 calcShipping을 import한다.
import { RATES } from "./rates";

/** CBM: 가로×세로×높이(cm) × 수량 ÷ 1,000,000 */
export function calcCbm(widthCm: number, depthCm: number, heightCm: number, quantity: number): number {
  return (widthCm * depthCm * heightCm * quantity) / 1e6;
}

/** 부피중량(kg): 가로×세로×높이(cm) ÷ RATES.volumeDivisor */
export function calcVolumetricKg(widthCm: number, depthCm: number, heightCm: number): number {
  return (widthCm * depthCm * heightCm) / RATES.volumeDivisor;
}

export type ShippingMethod = "SEA" | "AIR";

/** 국제운임: 청구중량(g) → { 운임(펀), 청구중량(kg) }. 해운 kg 올림, 항공 100g 올림. */
export function calcShipping(method: ShippingMethod, chargeableGrams: number): { fen: number; chargeableWeightKg: number } {
  if (method === "SEA") {
    const kg = Math.max(1, Math.ceil(chargeableGrams / 1000));
    return { fen: RATES.sea.firstKgFen + (kg - 1) * RATES.sea.additionalPerKgFen, chargeableWeightKg: kg };
  }
  const units100g = Math.max(1, Math.ceil(chargeableGrams / 100));
  return { fen: RATES.air.docFeeFen + units100g * RATES.air.per100gFen, chargeableWeightKg: units100g / 10 };
}

/** 국제운임(펀)만 필요한 경우의 축약형 */
export function calcShippingFen(method: ShippingMethod, chargeableGrams: number): number {
  return calcShipping(method, chargeableGrams).fen;
}
