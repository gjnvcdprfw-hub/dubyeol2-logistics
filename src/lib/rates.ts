// 요율 단일 정의 — 두리무역 공개 요율 초기값 (benchmark-duly.md §3).
// 대표님 컷팅(조정)은 이 파일만 수정하면 된다. 다른 파일에 요율 숫자 하드코딩 금지.
export const RATES = {
  commissionRate: 0.05,          // 구매대행 수수료: 상품가의 5%
  commissionVatRate: 0.1,        // 수수료 VAT: 수수료의 10%
  inspectionFeeFenPerUnit: 100,  // 유료 검수: ¥1/개 (=100펀)
  volumeDivisor: 6000,           // 부피중량 계수: cm³ ÷ 6000 = kg
  sea: { firstKgFen: 2500, additionalPerKgFen: 500 },   // 해운: 첫 1kg ¥25 + kg당 ¥5 (kg 올림)
  air: { docFeeFen: 3250, per100gFen: 180 },            // 항공: 서류비 ¥32.5 + 100g당 ¥1.8 (100g 올림)
} as const;
