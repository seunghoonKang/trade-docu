import type { BankInfo } from "@/shared/lib/bankInfo";

export interface InvoiceItem {
  description: string;
  hsCode: string;
  qty: number;
  unit: string;
  unitPrice: number;
  amount: number;
  remarks: string;
}

/** 비용 유형. 비우면 단가 포함(CIF inclusive), 채우면 내역 표기(CONTEXT.md). */
export type ChargeType = "freight" | "insurance" | "fee" | "tax" | "other";

export interface AdditionalCharge {
  type?: ChargeType; // 미지정 = other (기존 데이터 호환)
  description: string;
  amount: number;
}

export function createEmptyCharge(): AdditionalCharge {
  return { type: "other", description: "", amount: 0 };
}

export interface BuyerSnapshot {
  companyName: string;
  address: string;
  tel: string;
  contactPerson: string;
}

export function createEmptyParty(): BuyerSnapshot {
  return { companyName: "", address: "", tel: "", contactPerson: "" };
}

/** 신용장 상세(결제수단 L/C일 때). */
export interface LcInfoForm {
  no: string;
  issuingBank: string;
  date: string;
}

export interface Invoice {
  id: string;
  userId: string;
  invoiceNo: string;
  refNo: string;
  orderNo: string;
  date: string;
  validity: string;
  sellerCompanyName: string;
  sellerAddress: string;
  sellerTel: string;
  sellerFax: string;
  sellerRepresentative: string;
  sellerSignatureUrl: string;
  buyerSnapshot: BuyerSnapshot;
  commodity: string;
  currency: string;
  paymentTerms: string;
  incoterms: string;
  delivery: string;
  packing: string;
  remarks: string;
  items: InvoiceItem[];
  additionalCharges: AdditionalCharge[];
  totalAmount: number;
  bankInfo: BankInfo;
  createdAt: string;
  // 당사자: 수하인/착하통지처는 비면(null) 구매자와 동일.
  consignee?: BuyerSnapshot | null;
  notify?: BuyerSnapshot | null;
  // 결제: 방식 + L/C 상세.
  paymentMethod?: string; // T/T | L/C | ADVANCE | OTHER
  lcInfo?: LcInfoForm;
  // 원산지 — CI 필수(검증 차단), 그 외 양식은 채우면 표기(#27).
  originCountry?: string;
}

export function createEmptyInvoice(): Omit<Invoice, "id" | "userId" | "createdAt"> {
  return {
    invoiceNo: "",
    refNo: "",
    orderNo: "",
    date: new Date().toISOString().split("T")[0],
    validity: "",
    sellerCompanyName: "",
    sellerAddress: "",
    sellerTel: "",
    sellerFax: "",
    sellerRepresentative: "",
    sellerSignatureUrl: "",
    buyerSnapshot: {
      companyName: "",
      address: "",
      tel: "",
      contactPerson: "",
    },
    commodity: "",
    currency: "USD",
    paymentTerms: "",
    incoterms: "FOB",
    delivery: "",
    packing: "",
    remarks: "",
    items: [createEmptyItem()],
    additionalCharges: [],
    totalAmount: 0,
    consignee: null,
    notify: null,
    paymentMethod: "",
    lcInfo: { no: "", issuingBank: "", date: "" },
    originCountry: "",
    bankInfo: {
      bankName: "",
      bankSwift: "",
      accountNo: "",
      accountee: "",
      bankAddress: "",
      bankTel: "",
      bankFax: "",
    },
  };
}

export function createEmptyItem(): InvoiceItem {
  return {
    description: "",
    hsCode: "",
    qty: 0,
    unit: "PCS",
    unitPrice: 0,
    amount: 0,
    remarks: "",
  };
}
