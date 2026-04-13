# Proforma Invoice Web App — Design Spec

## Overview

Proforma Invoice(PI)를 웹에서 작성하고 PDF/엑셀/인쇄로 내보낼 수 있는 SPA.
무역업 종사자가 엑셀 서식 문제 없이 깔끔한 PI를 쉽게 만들 수 있게 한다.

비로그인 사용자도 즉시 사용 가능하며, 로그인 시 회사 정보/거래처/품목/이력을 저장하고 재사용할 수 있다.

## Tech Stack

- **Frontend:** React + TypeScript + Vite (최신 버전)
- **Styling:** Tailwind CSS
- **Architecture:** FSD (Feature-Sliced Design)
- **Backend/Auth:** Supabase (Auth + PostgreSQL)
- **PDF:** @react-pdf/renderer
- **Excel:** exceljs
- **i18n:** react-i18next (ko, en, zh, ja)
- **Test:** Vitest + Testing Library + Playwright
- **Deploy:** Vercel

## Architecture (FSD)

```
src/
├── app/          # 앱 초기화, 라우팅, 프로바이더
├── pages/        # LoginPage, InvoicePage
├── widgets/      # InvoiceForm, InvoicePreview, ExportToolbar
├── features/     # auth, invoice-crud, export-pdf, export-excel, print, i18n-switch
├── entities/     # invoice, seller, buyer, product, bank-info
├── shared/       # ui (Button, Input, Select...), lib (supabase client, i18n config), types
```

### Routing

- `/` — 인보이스 작성 페이지 (비로그인도 접근 가능)
- `/login` — 로그인 페이지

### Core Flow

1. 비로그인 사용자: 모든 필드가 빈 인풋 → 작성 → 내보내기
2. 로그인 사용자: Seller 정보 자동 채움 + 저장된 거래처/품목 불러오기 + 작성 이력 저장

## Data Model (Supabase)

### sellers

| Column | Type | Note |
|--------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| company_name | text | |
| address | text | |
| tel | text | |
| fax | text | |
| representative | text | |
| bank_name | text | |
| bank_swift | text | |
| bank_address | text | |
| bank_tel | text | |
| bank_fax | text | |
| account_no | text | |
| accountee | text | |

### buyers

| Column | Type | Note |
|--------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| company_name | text | |
| address | text | |
| tel | text | |
| contact_person | text | |

### products

| Column | Type | Note |
|--------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| description | text | |
| hs_code | text | |
| unit | text | |
| unit_price | numeric | |
| remarks | text | |

### invoices

| Column | Type | Note |
|--------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| invoice_no | text | |
| ref_no | text | |
| order_no | text | |
| date | date | |
| validity | date | |
| seller_id | uuid | FK → sellers |
| buyer_snapshot | jsonb | 작성 시점의 바이어 정보 스냅샷 |
| commodity | text | 대표 품목명 |
| currency | text | USD, KRW, JPY 등 |
| payment_terms | text | |
| incoterms | text | FOB, CIF 등 |
| delivery | text | |
| packing | text | |
| remarks | text | |
| items | jsonb | [{description, hs_code, qty, unit, unit_price, amount, remarks}] |
| additional_charges | jsonb | [{description, amount}] |
| total_amount | numeric | |
| created_at | timestamptz | |

### Design Decisions

- **buyer_snapshot (JSON):** 거래처 정보가 나중에 바뀌어도 과거 인보이스는 작성 시점 그대로 유지
- **items (JSON 배열):** 별도 테이블 대신 JSON — 인보이스 단위로 한 번에 읽기/쓰기
- **additional_charges:** EMS Charge 같은 추가 비용 행을 유연하게 지원
- **품목 개수 제한 없음:** PDF 출력 시 자동 페이지 나눔으로 처리

## Invoice Page UI

### Layout

- **데스크톱:** 좌우 분할 — 왼쪽 입력 폼 (스크롤), 오른쪽 실시간 미리보기
- **모바일:** 폼만 표시, 미리보기는 별도 탭 또는 모달

### Form Sections (순서)

1. **문서 정보** — Invoice No, Ref No, Order No, Date, Validity
2. **Seller 정보** — 회사명, 주소, 연락처, 대표자 (로그인 시 자동 채움)
3. **Buyer 정보** — 회사명, 주소, 연락처, 담당자 (로그인 시 드롭다운 선택)
4. **거래 조건** — Currency, Payment Terms, Incoterms, Delivery, Packing, Remarks, Commodity
5. **품목 테이블** — 행 추가/삭제 버튼, 수량 x 단가 자동 계산
6. **추가 비용** — 자유롭게 행 추가 (EMS Charge 등)
7. **은행 정보** — 은행명, SWIFT, 계좌번호, 예금주, 주소 (로그인 시 자동 채움)

### Top Toolbar

- 내보내기: PDF 다운로드 / 인쇄 / 엑셀 다운로드
- 언어 전환 (ko/en/zh/ja)
- 로그인/로그아웃

### Design Tone

미니멀/클린 — 흰 배경, 최소한의 선, 넓은 여백, 산세리프 서체. 정보 전달에 집중하는 비즈니스 톤.

## Export

### PDF (@react-pdf/renderer)

- React 컴포넌트 기반 PDF 문서 구조
- 미리보기와 별도의 PDF 전용 컴포넌트 (스타일 독립)
- 품목 많으면 자동 페이지 나눔
- 선택된 언어로 라벨 출력
- 파일명: `PI_{InvoiceNo}_{Date}.pdf`

### Excel (exceljs)

- PI 양식에 가까운 포맷
- 셀 병합, 테두리, 굵기 등 서식 자동 적용
- 파일명: `PI_{InvoiceNo}_{Date}.xlsx`

### Print

- `window.print()` + `@media print` CSS
- 미리보기 영역만 인쇄

## Auth & Data Management

### Authentication (Supabase Auth)

- 이메일/비밀번호 로그인
- 회원가입 (누구나 가입 가능)
- 비로그인 사용자도 인보이스 작성/내보내기 가능 (저장만 안 됨)

### Logged-in User Features

- Seller 정보 1회 등록 후 자동 채움
- 거래처(Buyer) 목록 CRUD — 폼에서 드롭다운 선택
- 품목(Product) 목록 CRUD — 자주 쓰는 품목 빠르게 불러오기
- 인보이스 이력 저장/조회 — 과거 PI 불러와서 수정 후 재사용

### Guest User

- 모든 필드가 빈 인풋
- 작성 → 내보내기만 가능
- 새로고침 시 데이터 사라짐

## i18n

### Implementation: react-i18next

- 지원 언어: ko, en, zh, ja
- 번역 범위: UI 라벨 + PI 문서 라벨
- UI 언어 전환 시 미리보기 문서 라벨도 함께 전환
- 브라우저 언어 자동 감지 → 기본값
- 상단 툴바에서 수동 전환
- 로그인 사용자는 선호 언어 저장

### Translation Files (FSD)

```
src/shared/i18n/
├── config.ts
└── locales/
    ├── ko.json
    ├── en.json
    ├── zh.json
    └── ja.json
```

## Test Strategy

### Unit Tests (Vitest)

- 금액 계산 로직 (수량 x 단가, 합계, 추가 비용 포함 총계)
- 인보이스 번호 생성 로직
- 데이터 유효성 검증 (필수 필드 체크)

### Component Tests (Testing Library)

- 폼 입력/삭제 동작
- 품목 행 추가/삭제
- 로그인/비로그인 상태에 따른 UI 분기
- 언어 전환 시 라벨 변경

### E2E Tests (Playwright)

- 비로그인: 폼 작성 → PDF 다운로드 전체 흐름
- 로그인: 거래처 선택 → 품목 불러오기 → 내보내기
- 다국어 전환 확인

### Priority

1. 금액 계산 — 돈이 걸린 로직, 반드시 테스트
2. 폼 상호작용 — 핵심 UX
3. 내보내기 흐름 — E2E로 커버
