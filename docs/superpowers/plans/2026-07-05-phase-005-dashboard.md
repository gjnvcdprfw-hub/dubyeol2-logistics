# Phase 5: 대시보드 12메뉴 전면 개편 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Phase 4와 같은 방식 — 공용·홈은 코드/명세, 그룹 화면은 섹션 명세+`.harness/dubyeol2/benchmark-duly.md` §1(사이드바)·§2(화면별 구조) 참조. 문구는 우리 것.

**Goal:** 셀러 대시보드가 두리무역 구조(4그룹 12메뉴, 예치금 배너, 현황 카드 5종)가 된다. 기존 실동작(주문·입고 증거·견적·창고주소) 회귀 0.

**하드라인:** ①Feature 1 회귀 0 — 기존 경로(/dashboard, /dashboard/orders, /dashboard/orders/[id], /dashboard/orders/new, /dashboard/warehouse-address) 전부 유지, 삭제·이동 금지 ②거짓 기능 0("준비 중" 명시) ③두리 카피·실데이터 0 ④현황 집계는 반드시 sellerId 스코프 ⑤고객 노출 숫자는 정본 파생 ⑥그림자 리터럴 정리: `globals.css` `@theme`에 `--shadow-card: 0 7px 30px rgba(90,114,123,0.11)` 추가 후 **신규 파일은 `shadow-card` 유틸 사용**(기존 파일 일괄 치환은 하지 않음 — 회귀 리스크)

## File Structure

```
src/app/globals.css                     # --shadow-card 토큰 추가 (BT15)
src/components/dashboard/sidebar.tsx    # 4그룹 12메뉴 (BT15)
src/components/dashboard/status-tile.tsx # 상태 칩 타일 {label, count, tone} (BT15)
src/components/dashboard/prep-notice.tsx # 대시보드용 "준비 중" 카드 {feature, description?} (BT15)
src/app/dashboard/layout.tsx            # 사이드바 교체 (BT15 — 기존 가드 로직 유지)
src/app/dashboard/page.tsx              # 마이페이지 홈 전면 개편 (BT15)
src/app/dashboard/cart/page.tsx  my-products/page.tsx  smart-order/page.tsx   # (BT16)
src/app/dashboard/inbound/page.tsx  shipment/page.tsx  returns/page.tsx  inspection/page.tsx  # (BT17)
src/app/dashboard/profile/page.tsx  wallet/page.tsx    # (BT18)
```

### BT15 (선행): 셸 + 마이페이지 홈

1. globals.css `@theme`에 `--shadow-card` 추가 (기존 값과 동일: `0 7px 30px rgba(90,114,123,0.11)`)
2. `sidebar.tsx` — benchmark §1 그룹·메뉴·경로:
   - 🏠 마이페이지: /dashboard
   - 🛒 구매대행: 장바구니 /dashboard/cart · 내 상품 리스트 /dashboard/my-products · 구매대행 관리 **/dashboard/orders (기존 경로 재사용)** · 스마트오더 /dashboard/smart-order
   - 📦 배송대행: 입고 관리 /dashboard/inbound · 출고 관리 /dashboard/shipment · 반품 관리 /dashboard/returns · 창고 주소 /dashboard/warehouse-address (기존)
   - 📊 서비스: 출장검품 /dashboard/inspection
   - 👤 내정보: 내 프로필 /dashboard/profile · 예치금 관리 /dashboard/wallet
   - 그룹 라벨 12px/700 uppercase text-muted, 폭 221px, 하단 로그아웃 폼(기존 그대로) + "주문 접수" CTA 버튼(/dashboard/orders/new, accent) 상단 배치
3. `status-tile.tsx` — 두리무역 상태 타일: `{label, count, tone: "warning"|"success"|"info"|"muted"}` → 틴트 배경(rounded-[22.5px])+라벨(12.8px muted)+숫자(tone 색). `prep-notice.tsx` — "🚧 준비 중" 카드
4. `layout.tsx` 교체 — **기존 세션 가드·redirect 로직 그대로**, 사이드바만 컴포넌트로
5. `page.tsx` 홈 개편 (benchmark §2.1 순서):
   - 예치금 레드 배너: bg-brand 그라데이션(`bg-gradient-to-br from-brand to-[#8b0000]`), "사용 가능 잔액 ₩0", 흰 필 버튼 [충전하기]·[내역보기] → /dashboard/wallet 링크(준비 중 페이지)
   - 현황 카드 5종: 구매대행(주문 집계 — REQUESTED=접수됨·RECEIVED=입고완료·quotedAt=견적완료 3타일, **sellerId 스코프 쿼리**) / 입고 관리(입고대기=REQUESTED·입고완료=RECEIVED) / 출고(포장중·발송대기·발송완료 — 전부 0, 준비 중 배지) / 반품(처리대기·완료 — 0, 준비 중) / 스마트오더 카드(등록 0, 준비 중)
   - 각 카드: 제목+n건 뱃지+[전체보기](해당 메뉴 링크), shadow-card·rounded-[27px]
6. 검증: `npx vitest run` 36/36 + build + **기존 4화면 경로 회귀 curl 200** → 커밋 "feat: 대시보드 셸(12메뉴)·마이페이지 홈 개편"

### BT16 (병렬): 구매대행 그룹 3화면 (cart·my-products·smart-order)
benchmark §2.12(장바구니 빈 상태), §2.3(내 상품: 액션 버튼 3개+카운터+빈 상태), §2.4(스마트오더: 카운터 4+탭 2+업로드 버튼) 구조 벤치 — 전부 disabled/준비 중+PrepNotice. 검증 build → 커밋

### BT17 (병렬): 배송대행·서비스 그룹 4화면 (inbound·shipment·returns·inspection)
- inbound: **실데이터** — 셀러의 RECEIVED 주문 목록(입고 사진 수·외포장·검수 여부 요약, 상세 링크 /dashboard/orders/[id]) + 상태 탭 UI(입고대기/입고완료 — benchmark §2.5 벤치, 나머지 탭 "준비 중"), sellerId 스코프
- shipment(§2.6 상태 탭 5), returns(§2.7 탭 6+반품 안내 3줄), inspection(§2.9 조회 리스트) — 구조+빈 상태+준비 중. 검증 build → 커밋

### BT18 (병렬): 내정보 그룹 2화면 (profile·wallet)
- profile: benchmark §2.10 — 탭 4종 UI(기본 프로필만 활성: 이메일·담당자명·회사명·연락처 **실데이터 getSessionUser**, 수정은 준비 중; 나머지 탭 준비 중)
- wallet: §2.11 — 잔액 카드 ₩0+통계 3(0)+탭 2+준비 중. 검증 build → 커밋

### 마무리 (TL): vitest+build+design lint+12메뉴 curl 전수+Playwright(홈 카드 집계·기존 흐름 회귀)+두리 grep

## Self-Review
- 기존 경로 불변(orders 계열·warehouse-address) ✓ 신규 9경로 ✓ 집계 sellerId 스코프 명시 ✓ 준비 중 명시 ✓ 그림자 토큰(신규만) ✓
