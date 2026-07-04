---
version: alpha
name: MulryuDesignSystem
# 기준: 두리무역(duly.co.kr) 외관 그대로 벤치마킹 (대표님 지시 2026-07-04, 실측 computed style 추출값)
colors:
  background: "#fafbfb"
  surface: "#ffffff"
  surfaceAlt: "#f9fafb"
  surfaceTintWarm: "#fff7ed"
  textHeading: "#101828"
  textPrimary: "#11142d"
  textSecondary: "#4a5565"
  textMuted: "#777e89"
  textNav: "#666666"
  accent: "#f54a00"
  brand: "#cc0000"
  info: "#0084d1"
  infoTint: "#dff2fe"
  success: "#009966"
  successTint: "#ebf8f2"
  warningTint: "#fff2e4"
  danger: "#cc0000"
  border: "rgba(199, 199, 219, 0.30)"
  borderSubtle: "rgba(0, 0, 0, 0.06)"
typography:
  body:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  heroTitle:
    fontFamily: DM Sans
    fontSize: 96px
    fontWeight: 600
    lineHeight: 96px
  cardSectionTitle:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: 600
  sidebarGroupLabel:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: 700
  chipLabel:
    fontFamily: DM Sans
    fontSize: 12.8px
    fontWeight: 400
  buttonPrimary:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: 600
  buttonDashboard:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: 600
  navMenu:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: 500
rounded:
  cardDashboard: 27px
  cardPublic: 16px
  buttonCta: 12px
  buttonPill: 18px
  statusTile: 22.5px
spacing:
  sidebarWidth: 221px
components:
  button-cta:
    backgroundColor: "{colors.accent}"
    color: "#ffffff"
    borderRadius: "{rounded.buttonCta}"
  button-dashboard-primary:
    backgroundColor: "#ffffff"
    color: "{colors.brand}"
    borderRadius: "{rounded.buttonPill}"
    boxShadow: "rgba(0, 0, 0, 0.15) 0px 4px 14px 0px"
  sidebar-item-active:
    backgroundColor: "{colors.brand}"
    color: "#ffffff"
  card-dashboard:
    backgroundColor: "{colors.surface}"
    borderRadius: "{rounded.cardDashboard}"
    boxShadow: "rgba(90, 114, 123, 0.11) 0px 7px 30px 0px"
  wallet-banner:
    backgroundColor: "{colors.brand}"
    color: "#ffffff"
    borderRadius: "18px"
---

# design-system.md

상태: 두리무역 벤치마크 실측 기준 (alpha)

UI가 필요한 프로젝트 또는 UI phase는 이 문서 없이 개발 시작하지 않는다.

이 문서는 DESIGN.md 규격을 따른다 — 맨 위 YAML은 기계가 읽는 **정확한 값**(빌더는 이 값을 벗어나지 못한다), 아래 본문은 그 값이 존재하는 **이유**다. 값이 확정되면 YAML에 올리고, UI phase의 Machine Check에서 `npx -y @google/design.md lint .harness/dubyeol2/design-system.md`로 검증한다(errors 0 필수).

대표님은 이 문서의 표가 아니라 실제 화면을 보고 판단한다. 이 문서는 Codex와 Claude Code가 같은 UI 기준으로 움직이기 위한 정본이다.

## 1. 디자인 기준 상태

- 현재 상태: alpha — 두리무역(duly.co.kr) 실측 추출값으로 정본화
- 기준 출처: 대표님 지시 "홈페이지 외관은 두리무역 그대로 벤치마킹, 추후 내가 추가 편집" (2026-07-04) + 대표님 크롬 로그인 세션에서 computed style 직접 추출
- 마지막 갱신일: 2026-07-04
- 갱신한 사람: PM(Claude Code), 디자인 전달 역할

## 2. 화면 톤

- 제품이 고객에게 주어야 하는 느낌: 돈과 물건을 맡겨도 되는 신뢰(요율·비용 투명 공개), 실시간으로 내 물건이 보이는 안심, 사업자 도구다운 정돈됨
- 피해야 할 느낌: 깜깜이(비용·상태 숨김), 장난감 같은 가벼움, 중국 직구 쇼핑몰풍 어수선함
- 고객이 반복해서 쓰는 화면인지 여부: 대시보드는 매일 반복 사용(현황 확인), 공개 페이지는 유입·설득용

## 3. 색

두리무역은 **공개(마케팅) 영역과 로그인 대시보드의 주색이 다르다**. 이 이원 구조 자체가 벤치마크 대상이다.

| 용도 | 값 | 사용 기준 |
|---|---|---|
| 페이지 배경 | `#fafbfb` | 공개·대시보드 공통 본문 배경 |
| 카드/표면 | `#ffffff` (보조 `#f9fafb`, 웜틴트 `#fff7ed`) | 카드·섹션. 웜틴트는 강조 섹션 배경 |
| 제목 글자 | `#101828` | 히어로·헤딩 |
| 기본 글자 | `#11142d` | 본문 |
| 보조 글자 | `#4a5565` / `#777e89` | 설명문 / 대시보드 칩 라벨·뮤트 |
| 주요 행동(공개) | `#f54a00` 오렌지 | 마케팅 CTA, 히어로 강조어("새로운 기준") |
| 주요 행동(대시보드)·브랜드 | `#cc0000` 레드 | 로고, 사이드바 활성, 예치금 배너, 전체보기 링크 |
| 정보/배송 | `#0084d1` (틴트 `#dff2fe`) | 배송·정보성 상태 타일 |
| 성공/완료 | `#009966` (틴트 `#ebf8f2`) | 완료 상태 타일 |
| 대기/경고 틴트 | `#fff2e4` | 대기 상태 타일 배경 |
| 위험/오류 | `#cc0000` | 에러·거절 |
| 경계선 | `rgba(199,199,219,0.30)` / `rgba(0,0,0,0.06)` | 일반 / 헤더 하단 등 미세 구분 |

## 4. 글자

폰트는 **DM Sans**(폴백 Helvetica, Arial). 한글은 DM Sans에 글리프가 없어 시스템 산세리프로 폴백된다 — 두리무역도 동일 스택이므로 그대로 벤치마킹하되, 한글 전용 폰트 지정은 대표님 추후 편집 대상으로 남긴다.

| 위치 | 크기 | 굵기 | 줄간격 | 기준 |
|---|---|---|---|---|
| 히어로 제목 | 96px (데스크톱) | 600 | 96px | 랜딩 첫 화면. 두 줄 중 강조어만 `#f54a00` |
| 페이지/카드 제목 | 14px | 600 | - | 대시보드 현황 카드 제목 |
| 본문 | 16px | 400 | 24px | 기본 |
| 보조 설명 | 14px | 400 | 24px | 네비·푸터·설명 |
| 사이드바 그룹 라벨 | 12px | 700 (uppercase) | - | 이모지 + 그룹명 |
| 상태 칩 라벨 | 12.8px | 400 | - | 상태 타일 하단 라벨 |
| 버튼 | 15px(대시보드) / 18px(CTA) | 600 | - | |

## 5. 간격, 반경, 그림자

- 사이드바 폭: 221px 고정
- 카드 반경: 대시보드 27px, 공개 페이지 16px
- 버튼 반경: CTA 12px, 대시보드 필 버튼 18px
- 상태 타일 반경: 22.5px
- 카드 그림자: `rgba(90,114,123,0.11) 0px 7px 30px` (부드러운 확산형, 테두리 거의 없음)
- 버튼 그림자(대시보드 주버튼): `rgba(0,0,0,0.15) 0px 4px 14px`
- 기본 페이지 여백·섹션 간격: 실측 미추출 — **확인 필요** (빌드 시 화면 대조로 맞춤)

## 6. 공통 컴포넌트

### 6.1 버튼

- 주요 버튼(공개 CTA): 배경 `#f54a00`, 흰 글자, radius 12px, 18px/600
- 주요 버튼(대시보드): **흰 배경 + 브랜드 레드 글자** + 그림자, radius 18px 필 — 레드 배너 위에 얹는 반전형
- 보조 버튼: 반투명 흰 배경(`rgba(255,255,255,0.15)`) 또는 흰 테두리 필 (배너 위), 일반 화면은 텍스트 링크형(`#cc0000`)
- 위험 버튼: `#cc0000` — **확인 필요**(두리무역 실측 사례 미수집)
- 비활성/로딩: **확인 필요**

### 6.2 입력창

- 기본: 흰 배경, 연한 경계선, 플레이스홀더 뮤트 — 검색창은 필 형태 + 우측 버튼 그룹(번역/이미지/검색)
- 포커스·오류 상태: **확인 필요**

### 6.3 표

- 두리무역 관리 화면은 표보다 **상태 탭 + 카드 리스트** 패턴. 빈 값은 "해당 상태의 상품이 없습니다" 문구 중앙 배치
- 요금표는 공개 문서에서 2열 정의형 표 사용

### 6.4 카드

- 사용: 대시보드 현황 요약(제목 + n건 뱃지 + 전체보기 + 상태 타일 그리드), 서비스 소개 섹션
- 내부 구조: 좌측 아이콘 칩 + 제목 + 카운트 뱃지(틴트 배경) + 우측 "전체보기"(레드 틴트 필)
- 상태 타일: 파스텔 틴트 배경 + 아이콘 + 라벨(뮤트) + 숫자(상태색)

### 6.5 모달

- 공지 팝업: 중앙 카드, 오렌지 그라데이션 배너 + [24시간 보지 않기][닫기] — 닫기는 주색 버튼
- 위험 행동 확인 기준: **확인 필요**

### 6.6 토스트/알림

- react-toastify 기본 팔레트 사용 흔적(성공 `#07bc0c`, 정보 `#3498db`, 경고 `#f1c40f`, 오류 `hsl(6,78%,57%)`) — 우리 구현 시 3절 상태색으로 통일 권장, 대표님 편집 대상

## 7. 상태 화면

- 로딩: "로그인 확인 중..." 텍스트 + 프로그레스 바 (전역 로딩)
- 빈 화면: 아이콘 + 안내 문구 + 다음 행동 버튼 ("장바구니가 비어있습니다 → 쇼핑 계속하기")
- 오류·권한 없음: **확인 필요**
- 완료: 상태 타일 green 틴트

## 8. 반응형 기준

- 데스크톱 기준: 1920 실측. 대시보드 = 좌측 사이드바 221px + 본문 카드 그리드(2열)
- 모바일: 두리무역 가이드에 PC/모바일 스크린샷 병행 제공 — 실측 미수집, **확인 필요**
- 히어로 96px 제목은 모바일 축소 필요(두리무역 반응형 값 미측정)

## 9. 금지 UI 패턴

- 기본 무료(입고사진+외포장 안내)와 유료 검수(수량·외관·하자)의 경계를 흐리는 표시 — 검수 미신청 건이 "수량 확인됨"처럼 보이면 안 됨 (feature.md 3번)
- 견적 항목 숨김·합산만 표시 — 항목별 금액 공개가 고객 약속
- 내 주문과 남의 주문이 섞여 보일 수 있는 리스트 패턴

## 10. 대표 화면 예시

| 화면 | 기준 설명 | 참고 위치 |
|---|---|---|
| 랜딩 히어로 | 96px 두 줄 제목(둘째 줄 오렌지) + 검색창 + 신뢰 뱃지 3개 | duly.co.kr `/` |
| 대시보드 홈 | 레드 예치금 배너 + 현황 카드 4개 + 상태 타일 | duly.co.kr `/dashboard` |
| 관리 화면 | 상태 탭 필터 + 빈 상태 문구 | `/dashboard/purchase-management` |
| 전체 구조·메뉴 | 사이트맵·기능 인벤토리 | `benchmark-duly.md` |

## 11. 기존 UI에서 디자인 시스템을 만드는 경우

기존 UI가 있는데 design-system.md가 없으면 아래 흐름을 따른다.

1. 대표님이 Claude Design으로 실제 화면/모달을 다듬는다.
2. Claude Code가 그 결과를 이 문서로 정리한다.
3. Codex는 이 문서를 기준으로 구현, 반영, 검증한다.

Claude Design은 기능이나 업무로직을 새로 만들지 않는다.

## 12. 변경 이력

| 날짜 | 변경 내용 | 이유 | 승인/근거 |
|---|---|---|---|
| 2026-07-04 | 템플릿 → 두리무역 실측 토큰으로 alpha 정본화 (색상 hex·타이포·반경·그림자·컴포넌트) | 대표님 "홈페이지 외관 두리무역 그대로 벤치마킹" 지시 이행 | 대표님 발화 2026-07-04 + 크롬 실측 추출 |
