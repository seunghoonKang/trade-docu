-- =============================================================================
-- S1 · 거래 건 → 선적 → 문서 스파인 (멀티문서 모델)
-- 근거: CONTEXT.md · docs/adr/0001-trade-document-model · 0002-persistence-access-boundary
-- 범위: 스키마 + RLS만. 기존 invoices → 거래 건 백필은 S2(#30)에서 별도 마이그레이션으로 수행.
-- 원칙: 기존 invoices 테이블은 보존(삭제 금지). 1회만 실행(if not exists 가드).
-- =============================================================================

-- ── 1) deals (거래 건) ───────────────────────────────────────────────────────
create table if not exists deals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  po_no         text not null default '',            -- 주문(PO) 번호 = 거래 건의 속성
  po_date       date,
  -- 판매자 스냅샷
  seller_company_name    text not null default '',
  seller_address         text not null default '',
  seller_tel             text not null default '',
  seller_fax             text not null default '',
  seller_representative  text not null default '',
  seller_signature_url   text not null default '',
  -- 당사자: 수하인/착하통지처는 비면 구매자와 동일
  buyer_snapshot     jsonb not null default '{}',     -- {companyName,address,tel,contactPerson}
  consignee_snapshot jsonb not null default '{}',     -- 비면 buyer와 동일
  notify_snapshot    jsonb not null default '{}',     -- 비면 buyer와 동일
  -- 거래조건
  currency        text not null default 'USD',
  incoterms       text not null default 'FOB',
  incoterms_place text not null default '',           -- "FOB Busan"의 지명
  payment_terms   text not null default '',
  payment_method  text not null default '',           -- T/T | L/C | ADVANCE | 기타
  lc_info         jsonb not null default '{}',        -- L/C일 때 {no, issuingBank, date}
  commodity       text not null default '',
  origin_country  text not null default '',           -- 원산지(거래 건 1개; 품목별 보류)
  validity        date,                               -- PI 유효기간
  bank_info       jsonb not null default '{}',
  charges         jsonb not null default '[]',        -- PI용 비용 라인 [{type,label,amount}]
  -- 품목 마스터 + 주문 수량
  items           jsonb not null default '[]',        -- [{id, description, hsCode, unit, unitPrice, orderedQty, remarks}]
  remarks         text not null default '',
  status          text not null default 'open',       -- open | closed
  created_at      timestamptz not null default now()
);
create index if not exists deals_user_idx on deals(user_id);

-- ── 2) shipments (선적) ──────────────────────────────────────────────────────
-- S1에서는 선적 UI를 쓰지 않지만, documents.shipment_id FK 대상이자 S2 백필·S3/S4가
-- 의존하는 스파인이므로 함께 생성한다.
create table if not exists shipments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,  -- RLS 단순화 위해 비정규화
  deal_id       uuid not null references deals on delete cascade,
  seq           int  not null default 1,              -- 선적 차수 (1,2,3…)
  ship_date     date,
  -- 운송
  transport_mode text not null default '',            -- sea | air | courier
  carrier        text not null default '',
  vessel_flight  text not null default '',
  container_no   text not null default '',
  seal_no        text not null default '',
  port_loading   text not null default '',
  port_discharge text not null default '',
  final_destination text not null default '',
  bl_no          text not null default '',
  bl_date        date,
  -- 포장/중량 (선적 요약/총계 — 품목별 상세는 allocations에)
  net_weight     text not null default '',
  gross_weight   text not null default '',
  total_cbm      text not null default '',
  package_count  text not null default '',
  carton_size    text not null default '',
  marks          text not null default '',
  -- 배분 수량 + 품목별 포장 (per-line, 전부 선택)
  --   [{itemId, qty, cartonQty, netWeight, grossWeight, cbm, cartonNo, remarks}]
  allocations    jsonb not null default '[]',
  charges        jsonb not null default '[]',         -- CI용 비용 라인 [{type,label,amount}]
  created_at     timestamptz not null default now(),
  unique (deal_id, seq)
);
create index if not exists shipments_deal_idx on shipments(deal_id);

-- ── 3) documents (문서) ──────────────────────────────────────────────────────
create table if not exists documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  deal_id       uuid not null references deals on delete cascade,
  shipment_id   uuid references shipments on delete cascade,  -- NULL = 거래 건 레벨(PI)
  doc_type      text not null check (doc_type in ('PI','CI','PL')),  -- CoO 제외(ADR-0001)
  doc_no        text not null default '',
  doc_date      date,
  status        text not null default 'draft',        -- draft | issued
  field_options jsonb not null default '{}',          -- 양식 표시항목 오버라이드 (예: {"showPrice": false})
  snapshot      jsonb not null default '{}',          -- 발행 시점 렌더 데이터 박제(불변)
  created_at    timestamptz not null default now(),
  -- 레벨 규칙: PI = 거래 건 레벨(shipment_id NULL), CI/PL = 선적 레벨(NOT NULL)
  constraint doc_level check (
    (doc_type = 'PI'  and shipment_id is null) or
    (doc_type in ('CI','PL') and shipment_id is not null)
  )
);
create index if not exists documents_deal_idx on documents(deal_id);
create index if not exists documents_shipment_idx on documents(shipment_id);

-- ── 4) RLS (기존 컨벤션과 동일: 본인 데이터만) ──────────────────────────────
alter table deals     enable row level security;
alter table shipments enable row level security;
alter table documents enable row level security;
create policy "Users can manage own deals"     on deals     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own shipments" on shipments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own documents" on documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 참고: 양식(Template)은 v1에서 내장(코드) — 별도 테이블 없음.
--       문서별 표시항목은 documents.field_options 로 조정.
--       비용(charges): 비우면 단가 포함(CIF inclusive), 채우면 내역 표기. FOB면 보통 비움.
