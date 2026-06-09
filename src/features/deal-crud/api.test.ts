import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDealWithPi, saveDeal } from "./api";
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

describe("saveDeal", () => {
  it("거래 건과 PI 문서를 생성하고 dealId를 반환한다", async () => {
    setQueue([
      { data: { id: "deal-1" }, error: null }, // deals insert → single
      { data: null, error: null }, // documents insert
    ]);

    const dealId = await saveDeal("user-1", { ...createEmptyInvoice(), invoiceNo: "PI-1" });

    expect(dealId).toBe("deal-1");
    expect(from).toHaveBeenCalledWith("deals");
    expect(from).toHaveBeenCalledWith("documents");
    // 두 insert 모두 호출(거래 건 + PI 문서)
    expect(builder.insert).toHaveBeenCalledTimes(2);
  });

  it("문서 생성 실패 시 고아 거래 건을 삭제하고 예외를 던진다", async () => {
    setQueue([
      { data: { id: "deal-1" }, error: null }, // deals insert → single
      { data: null, error: { message: "doc fail" } }, // documents insert 실패
      { data: null, error: null }, // 보정 delete
    ]);

    await expect(saveDeal("user-1", { ...createEmptyInvoice() })).rejects.toEqual({ message: "doc fail" });
    expect(builder.delete).toHaveBeenCalled();
  });
});

describe("getDealWithPi", () => {
  it("거래 건이 없으면 null을 반환한다", async () => {
    setQueue([{ data: null, error: null }]);
    await expect(getDealWithPi("missing")).resolves.toBeNull();
  });

  it("거래 건과 PI 문서를 모델로 매핑한다", async () => {
    setQueue([
      {
        data: {
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
        },
        error: null,
      },
      {
        data: {
          id: "doc-1",
          user_id: "user-1",
          deal_id: "deal-1",
          shipment_id: null,
          doc_type: "PI",
          doc_no: "PI-2026-001",
          doc_date: "2026-06-09",
          status: "issued",
          field_options: {},
          snapshot: { invoiceNo: "PI-2026-001" },
          created_at: "2026-06-09T00:00:00.000Z",
        },
        error: null,
      },
    ]);

    const result = await getDealWithPi("deal-1");

    expect(result?.deal).toMatchObject({ id: "deal-1", poNo: "PO-42", consigneeSnapshot: null });
    expect(result?.pi).toMatchObject({ docType: "PI", docNo: "PI-2026-001", shipmentId: null });
  });
});
