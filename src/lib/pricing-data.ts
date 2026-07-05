// 요금 안내 페이지 전용 부가 요율 데이터 — 벤치마크 문서 §3의 공개 요율을 초기값으로 사용(승인된 정책).
// 초기 요율이며 변경될 수 있음. 대표님 컷팅(조정)은 이 파일만 수정하면 된다.
// 운임(해운·항공)·구매대행 수수료·기본 검수 단가는 @/lib/rates.ts의 RATES가 단일 정본 — 여기에 중복 정의 금지.

export const PRICING = {
  // 부가서비스 단가 (개당, ¥) — 벤치마크 문서 §3.5
  additionalServices: {
    origin: [
      { name: "원산지 스티커", yuanPerUnit: 0.3 },
      { name: "원산지 라벨(봉제)", yuanPerUnit: 0.6 },
      { name: "원산지 도장", yuanPerUnit: 0.6 },
      { name: "원산지 행택", yuanPerUnit: 0.5 },
    ],
    salesLabel: [
      { name: "바코드 부착", yuanPerUnit: 0.5 },
      { name: "KC 표기", yuanPerUnit: 0.5 },
      { name: "식품검역 표기", yuanPerUnit: 0.5 },
      { name: "14세 표기", yuanPerUnit: 0.5 },
      { name: "커스텀 행택", yuanPerUnit: 0.5 },
      { name: "세탁 라벨", yuanPerUnit: 0.6 },
    ],
    packaging: [
      { name: "OPP 포장(소)", yuanPerUnit: 0.3 },
      { name: "OPP 포장(대)", yuanPerUnit: 0.5 },
      { name: "에어캡 포장", yuanPerUnit: 2 },
      { name: "묶음 포장", yuanPerUnit: 1 },
      { name: "묶음 옵션", yuanPerUnit: 0.3 },
      { name: "태그 제거", yuanPerUnit: 0.2 },
      { name: "포장 제거", yuanPerUnit: 0.3 },
    ],
  },

  // 유료 검수 부가 옵션 (¥) — 벤치마크 문서 §3.4
  // 기본 검수 단가(개당)는 RATES.inspectionFeeFenPerUnit 참조.
  inspection: {
    extraPhotoYuanPerPhoto: 1, // 추가 사진 ¥1/장
    videoYuanPerMinute: 5, // 동영상 ¥5/분
  },

  // 창고 보관료 (₩) — 벤치마크 문서 §3.3
  storage: {
    freeDays: 30,
    tiers: [
      { range: "31~60일", wonPerDayPerBox: 500 },
      { range: "61일 이상", wonPerDayPerBox: 1000 },
    ],
    disposalNotice: "90일 이상 보관 시 사전 안내 후 폐기될 수 있습니다.",
  },

  // 재포장 부자재 (₩) — 벤치마크 문서 §3.6
  repackaging: {
    boxes: [
      { name: "박스 미니 (포장비 포함)", won: 1157 },
      { name: "박스 소 (포장비 포함)", won: 2314 },
      { name: "박스 중 (포장비 포함)", won: 3471 },
      { name: "박스 대 (포장비 포함)", won: 4627 },
    ],
    materials: [
      { name: "PE 봉투", won: 224 },
      { name: "에어캡", won: 463, unit: "m당" },
      { name: "OPP 중", won: 116 },
      { name: "OPP 대", won: 186 },
      { name: "OPP 소", won: 67 },
      { name: "테이프 보수", won: 1189 },
      { name: "맞춤 라벨", won: 119 },
      { name: "충전물", won: 476 },
      { name: "신축 필름", won: 2378 },
    ],
    labels: [
      { name: "라벨 부착", won: 68 },
      { name: "라벨 봉합", won: 135 },
    ],
    etc: [
      { name: "팔레트", won: 40135 },
      { name: "박스 소분", won: 476 },
      { name: "포대 소분", won: 238 },
    ],
    autoPackNote:
      "자동 포장을 선택하시면 창고가 최적 포장재를 선택하고, 패킹 완료 후 비용이 확정됩니다.",
  },

  // 국내 택배 추가비 (₩) — 벤치마크 문서 §3.2
  domesticSurcharge: [
    { condition: "2~5kg 또는 80~100cm", won: 600 },
    { condition: "5.1~10kg 또는 101~120cm", won: 1200 },
    { condition: "10.1~15kg 또는 121~140cm", won: 1800 },
    { condition: "15.1~20kg 또는 141~160cm", won: 2400 },
  ],

  disclaimer:
    "표시된 요율은 서비스 준비 중 초기 요율이며 변경될 수 있습니다. 모든 금액은 참고용이며 최종 금액이 아닙니다. ¥ 단가는 결제일 당일 환율이 적용됩니다.",
} as const;
