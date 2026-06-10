import { beforeEach, describe, expect, it, vi } from "vitest";
import { createShipment, deleteShipment, getDealBundle, issueDocument, saveDeal } from "./api";
import { createEmptyInvoice } from "@/entities/invoice";

// 체이너블 Supabase 쿼리 빌더 목. 종단(single/maybeSingle/await)에서 queue를 순서대로 소비한다.
// vi.mock 팩토리는 호이스팅되므로 목 상태도 vi.hoisted로 함께 끌어올린다.
const { from, builder, setQueue } = vi.hoisted(() => {
  let queue: Array<{ data: unknown; error: unknown }> = [];
  const shift = () => queue.shift() ?? { data: null, error: null };
  const b: Record<string, unknown> = {};
  for (const m of ["insert", "select", "eq", "order", "limit", "delete"]) {
    b[m] = vi.fn(() => b);
  }
  b.single = vi.fn(() => Promise.resolve(shift()));
  b.maybeSingle = vi.fn(() => Promise.resolve(shift()));
  b.then = (resolve: (v: unknown) => unknown) => resolve(shift());
  return {
    from: vi.fn(() => b),
    builder: b,
    setQueue: (q: Array<{ data: unknown; error: unknown }>) => {
      queue = q;
    },
  };
});

vi.mock("@/shared/lib/supabase", () => ({ supabase: { from } }));

beforeEach(() => {
  setQueue([]);
  from.mockClear();
  (builder.insert as ReturnType<typeof vi.fn>).mockClear();
  (builder.delete as ReturnType<typeof vi.fn>).mockClear();
});

function dealRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "deal-1",
    user_id: "user-1",
    po_no: "PO-42",
    po_date: null,
    seller_company_name: "Seller Co.",
    seller_address: "",
    seller_tel: "",
    seller_fax: "",
    seller_representative: "",
    seller_signature_url: "",
    buyer_snapshot: { companyName: "Buyer Co." },
    consignee_snapshot: {},
    notify_snapshot: {},
    currency: "USD",
    incoterms: "FOB",
    incoterms_place: "",
    payment_terms: "",
    payment_method: "",
    lc_info: {},
    commodity: "",
    origin_country: "",
    validity: null,
    bank_info: {},
    charges: [],
    items: [],
    remarks: "",
    status: "open",
    created_at: "2026-06-09T00:00:00.000Z",
    ...overrides,
  };
}

describe("saveDeal", () => {
  it("거래 건 + 기본 선적 + PI 문서를 생성하고 dealId를 반환한다", async () => {
    setQueue([
      { data: { id: "deal-1" }, error: null }, // deals insert → single
      { data: null, error: null }, // shipments insert (기본 선적)
      { data: null, error: null }, // documents insert (PI)
    ]);

    const dealId = await saveDeal("user-1", { ...createEmptyInvoice(), invoiceNo: "PI-1" });

    expect(dealId).toBe("deal-1");
    expect(from).toHaveBeenCalledWith("deals");
    expect(from).toHaveBeenCalledWith("shipments");
    expect(from).toHaveBeenCalledWith("documents");
    expect(builder.insert).toHaveBeenCalledTimes(3); // deal + 기본 선적 + PI
  });

  it("문서 생성 실패 시 고아 거래 건을 삭제하고 예외를 던진다", async () => {
    setQueue([
      { data: { id: "deal-1" }, error: null }, // deals insert → single
      { data: null, error: null }, // shipments insert
      { data: null, error: { message: "doc fail" } }, // documents insert 실패
      { data: null, error: null }, // 보정 delete
    ]);

    await expect(saveDeal("user-1", { ...createEmptyInvoice() })).rejects.toEqual({ message: "doc fail" });
    expect(builder.delete).toHaveBeenCalled();
  });
});

describe("getDealBundle", () => {
  it("거래 건이 없으면 null을 반환한다", async () => {
    setQueue([{ data: null, error: null }]);
    await expect(getDealBundle("missing")).resolves.toBeNull();
  });

  it("거래 건 + 선적 + 문서를 모델로 매핑한다", async () => {
    setQueue([
      { data: dealRow(), error: null }, // deal maybeSingle
      {
        data: [
          {
            id: "ship-1", user_id: "user-1", deal_id: "deal-1", seq: 1, ship_date: null,
            transport_mode: "", carrier: "", vessel_flight: "", container_no: "", seal_no: "",
            port_loading: "", port_discharge: "", final_destination: "", bl_no: "", bl_date: null,
            net_weight: "", gross_weight: "", total_cbm: "", package_count: "", carton_size: "",
            marks: "", allocations: [{ itemId: "i1", qty: 100 }], charges: [],
            created_at: "2026-06-09T00:00:00.000Z",
          },
        ],
        error: null,
      }, // shipments
      {
        data: [
          {
            id: "doc-1", user_id: "user-1", deal_id: "deal-1", shipment_id: null, doc_type: "PI",
            doc_no: "PI-2026-001", doc_date: "2026-06-09", status: "issued", field_options: {},
            snapshot: { invoiceNo: "PI-2026-001" }, created_at: "2026-06-09T00:00:00.000Z",
          },
        ],
        error: null,
      }, // documents
    ]);

    const bundle = await getDealBundle("deal-1");

    expect(bundle?.deal).toMatchObject({ id: "deal-1", poNo: "PO-42", consigneeSnapshot: null });
    expect(bundle?.shipments).toHaveLength(1);
    expect(bundle?.shipments[0]).toMatchObject({ id: "ship-1", seq: 1, allocations: [{ itemId: "i1", qty: 100 }] });
    expect(bundle?.documents[0]).toMatchObject({ docType: "PI", shipmentId: null });
  });
});

describe("issueDocument", () => {
  it("CI 문서를 선적 레벨로 발행하고 doc_id를 반환한다", async () => {
    setQueue([{ data: { id: "doc-9" }, error: null }]);

    const id = await issueDocument("user-1", {
      dealId: "deal-1",
      shipmentId: "ship-1",
      docType: "CI",
      docNo: "CI-2026-001",
      docDate: "2026-06-09",
      snapshot: { invoiceNo: "CI-2026-001" },
    });

    expect(id).toBe("doc-9");
    expect(from).toHaveBeenCalledWith("documents");
  });
});

describe("선적 CRUD", () => {
  it("createShipment는 차수 seq와 배분으로 선적을 만들고 id를 반환한다", async () => {
    setQueue([{ data: { id: "ship-2" }, error: null }]);
    const id = await createShipment("user-1", "deal-1", 2, [{ itemId: "i1", qty: 300 }]);
    expect(id).toBe("ship-2");
    expect(from).toHaveBeenCalledWith("shipments");
  });

  it("deleteShipment는 예외 없이 선적을 삭제한다", async () => {
    setQueue([{ data: null, error: null }]);
    await expect(deleteShipment("ship-2")).resolves.toBeUndefined();
    expect(from).toHaveBeenCalledWith("shipments");
  });
});
