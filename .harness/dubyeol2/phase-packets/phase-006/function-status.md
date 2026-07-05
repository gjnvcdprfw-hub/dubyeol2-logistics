# Phase 6 Function Status

상태: 기능 동작 캡쳐 완료 (2026-07-05)

기준: `http://localhost:3000`, 로컬 개발 DB, 캡쳐용 셀러/관리자 계정과 샘플 주문 1건.

## 1. 실제 동작 확인됨

| 기능 | 고객이 겪는 일 | 확인 증거 |
|---|---|---|
| 회원가입 | 신규 셀러가 가입 후 대시보드로 진입 | `screenshots/function-flows/06-seller-register-dashboard.png` |
| 주문 접수 | 상품 링크, 상품명, 옵션, 수량, 유료 검수 신청을 넣고 주문 생성 | `07-seller-order-form-filled.png`, `08-seller-order-list-created.png` |
| 주문 상세 | 셀러가 접수 상태 주문 상세를 확인 | `09-seller-order-detail-requested.png` |
| 창고 주소 복사 | 셀러가 창고 주소를 원클릭 복사하고 버튼 상태가 바뀜 | `10-warehouse-copy-button.png` |
| 운영자 주문 목록 | 운영자가 접수 주문을 보고 입고 기록으로 이동 | `11-admin-order-list-requested.png` |
| 운영자 입고 기록 | 입고 사진, 외포장 이상, 유료 검수 수량/하자/메모를 기록 | `12-admin-inbound-form.png`, `13-admin-order-list-received.png` |
| 운영자 견적 입력 | 상품가, 중국 내 배송비, 실측 무게, 부피, 환율, 배송 방식을 입력 | `14-admin-quote-form.png`, `15-admin-order-list-quoted.png` |
| 셀러 견적 확인 | 입고·검수·견적 저장 후 셀러 주문 상세에 반영 | `16-seller-order-detail-quoted.png` |
| CBM 계산기 | 치수와 박스 수 입력 시 CBM 결과 표시 | `03-calculator-cbm-result.png` |
| 부피중량 계산기 | 치수와 실중량 입력 시 청구중량 기준 비교 | `04-calculator-volume-weight-result.png` |
| 배송비 계산기 | 무게·치수·환율 입력 시 해운/항공 예상 운임 비교 | `05-calculator-shipping-cost-result.png` |

## 2. 준비 중으로 막힘

| 기능 | 현재 고객이 보는 상태 | 확인 증거 |
|---|---|---|
| 1688 검색 | 검색, 번역, 이미지 검색 버튼이 비활성화. 외부 1688 API 호출 없음 | `01-public-search-disabled.png` |
| 실시간 배송조회 | 운송장 입력, 붙여넣기, 배송조회가 비활성화. 외부 배송조회 API 호출 없음 | `02-public-tracking-disabled.png` |
| 스마트오더 업로드 | 준비 중 화면/대시보드 자리표시. 실제 파일 업로드·매칭 없음 | `dashboard-pages/07-dashboard-smart-order.png` |
| 예치금 충전/결제 | 준비 중 표시. 실계좌, 실입금, 결제 없음 | `dashboard-pages/13-dashboard-wallet.png` |
| HS코드/FTA/수입비용/환율/세관 요건/통관 조회 | 공개 계산기 진입 화면은 있으나 실제 외부 조회 없음 | `public-pages/16~21-*.png` |

## 3. 후속 Phase 후보

- 두리무역 로그인 후 대시보드 기능 전체 1:1 확장.
- 예치금 충전·입금확인·결제 흐름.
- 스마트오더 Excel 업로드·매칭.
- 1688 검색·이미지 검색·상품 피드.
- 실시간 배송조회·세관/통관 조회.
- 우리 회사용 문구, 실주소, 전화번호, 계좌, 사업자정보, 약관 본문 확정.

## 4. 기능 캡쳐 위치

- 갤러리: `screenshots/function-flows/README.md`
- 압축파일: `screenshots/function-flows/function-flows-screenshots.zip`
