import { beforeEach, describe, expect, it, vi } from "vitest";
import { getInvoice } from "./api";

const maybeSingle = vi.fn();

vi.mock("@/shared/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle,
        })),
      })),
    })),
  },
}));

function sampleInvoiceRow() {
  return {
    id: "inv-1",
    user_id: "user-1",
    invoice_no: "PI-2026-001",
    ref_no: "REF-9",
    order_no: "ORD-1",
    date: "2026-06-01",
    validity: null,
    seller_company_name: "Seller Co.",
    seller_address: "Seoul",
    seller_tel: "02-000-0000",
    seller_fax: "",
    seller_representative: "Kim",
    seller_signature_url: null,
    buyer_snapshot: {
      companyName: "Buyer Co.",
      address: "Busan",
      tel: "051-000-0000",
      contactPerson: "Lee",
    },
    commodity: "Widgets",
    currency: "USD",
    payment_terms: "T/T",
    incoterms: "FOB",
    delivery: "Busan Port",
    packing: "Carton",
    remarks: "",
    items: [],
    additional_charges: [],
    total_amount: 1500,
    bank_info: {
      bankName: "KB",
      bankSwift: "CZNBKRSE",
      accountNo: "123",
      accountee: "Seller Co.",
      bankAddress: "",
      bankTel: "",
      bankFax: "",
    },
    created_at: "2026-06-07T10:00:00.000Z",
  };
}

describe("인보이스 단건 조회", () => {
  beforeEach(() => {
    maybeSingle.mockReset();
  });

  it("문서가 없으면 null을 반환한다", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    await expect(getInvoice("missing")).resolves.toBeNull();
  });

  it("Supabase 행을 Invoice 모델로 매핑한다", async () => {
    maybeSingle.mockResolvedValue({ data: sampleInvoiceRow(), error: null });

    const invoice = await getInvoice("inv-1");

    expect(invoice).toMatchObject({
      id: "inv-1",
      userId: "user-1",
      invoiceNo: "PI-2026-001",
      refNo: "REF-9",
      date: "2026-06-01",
      validity: "",
      sellerSignatureUrl: "",
      buyerSnapshot: { companyName: "Buyer Co." },
      totalAmount: 1500,
      createdAt: "2026-06-07T10:00:00.000Z",
    });
  });

  it("Supabase 오류가 있으면 예외를 던진다", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: { message: "db error" } });
    await expect(getInvoice("inv-1")).rejects.toEqual({ message: "db error" });
  });
});
