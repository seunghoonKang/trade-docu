-- =============================================================================
-- S2 · 기존 invoices → 거래 건1 + 선적1(전량 배분) + PI 문서1 백필 (#30)
-- 근거: ~/ci_docs/07-multidoc/migration-sketch.sql §5–7 · ADR 0001/0002
-- 전제: 0001_deal_shipment_document.sql 적용 완료(deals/shipments/documents 존재).
-- 원칙: 비파괴 — invoices는 drop 하지 않고 rename(invoices_legacy)으로 보존.
--       멱등 — invoices가 이미 rename되었으면 백필/검증/rename 모두 skip. 1회 적용.
-- 적용: Supabase 대시보드 SQL 에디터(또는 supabase db) 에서 실행 후 NOTICE/검증 쿼리 확인.
-- =============================================================================

-- ── 1) 백필 (invoices가 아직 존재할 때만 실행) ──────────────────────────────
do $$
declare
  inv          record;
  v_deal       uuid;
  v_items      jsonb;   -- 거래 건 품목 마스터 (orderedQty)
  v_snap_items jsonb;   -- PI 문서 snapshot용 폼 품목 (qty/amount, camelCase)
  v_charges    jsonb;
  v_alloc      jsonb;
begin
  if not exists (
    select 1 from information_schema.tables
     where table_schema = 'public' and table_name = 'invoices'
  ) then
    raise notice 'invoices 테이블 없음(이미 마이그레이션됨) — 백필 skip';
    return;
  end if;

  for inv in select * from invoices loop
    -- 품목 마스터: 안정 id 부여 + orderedQty = 기존 qty
    select coalesce(jsonb_agg(jsonb_build_object(
             'id',         gen_random_uuid(),
             'description', it->>'description',
             'hsCode',     coalesce(it->>'hsCode', ''),
             'unit',       coalesce(it->>'unit', 'PCS'),
             'unitPrice',  coalesce((it->>'unitPrice')::numeric, 0),
             'orderedQty', coalesce((it->>'qty')::numeric, 0),
             'remarks',    coalesce(it->>'remarks', '')
           )), '[]'::jsonb)
      into v_items
      from jsonb_array_elements(inv.items) it;

    -- 기존 additional_charges → 비용 라인(type=other)
    select coalesce(jsonb_agg(jsonb_build_object(
             'type', 'other', 'label', c->>'description', 'amount', (c->>'amount')::numeric
           )), '[]'::jsonb)
      into v_charges
      from jsonb_array_elements(inv.additional_charges) c;

    insert into deals (
      user_id, po_no, po_date,
      seller_company_name, seller_address, seller_tel, seller_fax,
      seller_representative, seller_signature_url,
      buyer_snapshot, currency, incoterms, payment_terms, commodity,
      validity, bank_info, charges, items, remarks, created_at
    ) values (
      inv.user_id, inv.order_no, inv.date,
      inv.seller_company_name, inv.seller_address, inv.seller_tel, inv.seller_fax,
      inv.seller_representative, coalesce(inv.seller_signature_url, ''),
      inv.buyer_snapshot, inv.currency, inv.incoterms, inv.payment_terms, inv.commodity,
      inv.validity, inv.bank_info, v_charges, v_items, inv.remarks, inv.created_at
    ) returning id into v_deal;
    -- consignee/notify/incoterms_place/payment_method/lc_info/origin_country = 기본값

    -- 선적 1: 전량 배분(잔여 0). 기존 delivery/packing 텍스트는 요약 필드에 보존.
    select coalesce(jsonb_agg(jsonb_build_object(
             'itemId', it->>'id', 'qty', (it->>'orderedQty')::numeric
           )), '[]'::jsonb)
      into v_alloc
      from jsonb_array_elements(v_items) it;

    insert into shipments (
      user_id, deal_id, seq, ship_date,
      final_destination, carton_size, allocations, charges, created_at
    ) values (
      inv.user_id, v_deal, 1, inv.date,
      coalesce(inv.delivery, ''), coalesce(inv.packing, ''), v_alloc, '[]'::jsonb, inv.created_at
    );

    -- PI 문서 snapshot: 앱 폼(InvoiceDraft, camelCase) 모양으로 박제.
    -- → S1 saveDeal 저장분과 동일 포맷이라 dealToForm이 무손실로 복원(S8 거래 History 대비).
    select coalesce(jsonb_agg(jsonb_build_object(
             'description', it->>'description',
             'hsCode',    coalesce(it->>'hsCode', ''),
             'qty',       coalesce((it->>'qty')::numeric, 0),
             'unit',      coalesce(it->>'unit', 'PCS'),
             'unitPrice', coalesce((it->>'unitPrice')::numeric, 0),
             'amount',    coalesce((it->>'amount')::numeric,
                            coalesce((it->>'qty')::numeric, 0) * coalesce((it->>'unitPrice')::numeric, 0)),
             'remarks',   coalesce(it->>'remarks', '')
           )), '[]'::jsonb)
      into v_snap_items
      from jsonb_array_elements(inv.items) it;

    insert into documents (
      user_id, deal_id, shipment_id, doc_type, doc_no, doc_date, status, snapshot, created_at
    ) values (
      inv.user_id, v_deal, null, 'PI', inv.invoice_no, inv.date, 'issued',
      jsonb_build_object(
        'invoiceNo',            inv.invoice_no,
        'refNo',                inv.ref_no,
        'orderNo',              inv.order_no,
        'date',                 coalesce(inv.date::text, ''),
        'validity',             coalesce(inv.validity::text, ''),
        'sellerCompanyName',    inv.seller_company_name,
        'sellerAddress',        inv.seller_address,
        'sellerTel',            inv.seller_tel,
        'sellerFax',            inv.seller_fax,
        'sellerRepresentative', inv.seller_representative,
        'sellerSignatureUrl',   coalesce(inv.seller_signature_url, ''),
        'buyerSnapshot',        inv.buyer_snapshot,
        'commodity',            inv.commodity,
        'currency',             inv.currency,
        'paymentTerms',         inv.payment_terms,
        'incoterms',            inv.incoterms,
        'delivery',             inv.delivery,
        'packing',              inv.packing,
        'remarks',              inv.remarks,
        'items',                v_snap_items,
        'additionalCharges',    inv.additional_charges,
        'totalAmount',          inv.total_amount,
        'bankInfo',             inv.bank_info
      ),
      inv.created_at
    );
  end loop;
end $$;

-- ── 2) 검증 (건수 일치 강제 — 불일치 시 예외로 중단) ─────────────────────────
do $$
declare
  n_src   int;
  n_deals int;
  n_ship  int;
  n_pi    int;
begin
  if not exists (
    select 1 from information_schema.tables
     where table_schema = 'public' and table_name = 'invoices'
  ) then
    raise notice '검증 skip(이미 rename됨)';
    return;
  end if;

  select count(*) into n_src   from invoices;
  select count(*) into n_deals from deals;
  select count(*) into n_ship  from shipments;
  select count(*) into n_pi    from documents where doc_type = 'PI';

  -- 앱(S1)도 deals를 생성할 수 있으므로 '>=' 로 검증(백필분 누락만 차단).
  if n_deals < n_src or n_ship < n_src or n_pi < n_src then
    raise exception '백필 검증 실패: invoices=% deals=% shipments=% pi=%',
      n_src, n_deals, n_ship, n_pi;
  end if;
  raise notice '백필 검증 OK: invoices=% deals=% shipments=% pi=%',
    n_src, n_deals, n_ship, n_pi;
end $$;

-- ── 3) 보존 rename (drop 금지) ───────────────────────────────────────────────
do $$
begin
  if exists (
       select 1 from information_schema.tables
        where table_schema = 'public' and table_name = 'invoices'
     )
     and not exists (
       select 1 from information_schema.tables
        where table_schema = 'public' and table_name = 'invoices_legacy'
     )
  then
    alter table invoices rename to invoices_legacy;
    raise notice 'invoices → invoices_legacy 보존 rename 완료';
  else
    raise notice 'rename skip(invoices 없음 또는 invoices_legacy 이미 존재)';
  end if;
end $$;

-- ── 4) 수동 확인용 검증 쿼리 (적용 후 눈으로 확인) ───────────────────────────
-- 건수:
--   select (select count(*) from invoices_legacy) as legacy,
--          (select count(*) from deals)           as deals,
--          (select count(*) from shipments)       as shipments,
--          (select count(*) from documents where doc_type='PI') as pi_docs;
-- 잔여 0(전량 배분) 확인:
--   select d.id,
--     (select sum((i->>'orderedQty')::numeric) from jsonb_array_elements(d.items) i) as ordered,
--     (select coalesce(sum((a->>'qty')::numeric),0)
--        from shipments s, jsonb_array_elements(s.allocations) a where s.deal_id = d.id) as allocated
--   from deals d;
-- 총액 보존 확인(문서 snapshot ↔ legacy):
--   select dd.doc_no, dd.snapshot->>'totalAmount' as doc_total, il.total_amount as legacy_total
--     from documents dd join invoices_legacy il on il.invoice_no = dd.doc_no;
