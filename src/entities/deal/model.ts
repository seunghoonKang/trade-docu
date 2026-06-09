import type { BankInfo } from "@/shared/lib/bankInfo";

/**
 * 거래 건(Deal) — 하나의 거래(계약/주문) 전체. 거래처·거래조건·품목 마스터(주문 수량)를
 * 보유하며 여러 선적을 묶는 컨테이너. PI는 거래 건 레벨에서 발행된다(CONTEXT.md, ADR-0001).
 */

/** 당사자 스냅샷. buyer 기본, consignee/notify는 비면 buyer와 동일(ADR/CONTEXT). */
export interface PartySnapshot {
  companyName: string;
  address: string;
  tel: string;
  contactPerson: string;
}

/** 품목 마스터 라인. orderedQty = 총 계약(주문) 수량. id는 선적 배분(allocations)이 참조한다. */
export interface DealItem {
  id: string;
  description: string;
  hsCode: string;
  unit: string;
  unitPrice: number;
  orderedQty: number;
  remarks: string;
}

/** 비용 라인. 비우면 단가 포함(CIF inclusive), 채우면 내역 표기. */
export interface ChargeLine {
  type: string; // freight | insurance | fee | tax | other
  label: string;
  amount: number;
}

/** L/C 상세(payment_method === 'L/C'일 때). */
export interface LcInfo {
  no?: string;
  issuingBank?: string;
  date?: string;
}

export interface Deal {
  id: string;
  userId: string;
  poNo: string;
  poDate: string;
  sellerCompanyName: string;
  sellerAddress: string;
  sellerTel: string;
  sellerFax: string;
  sellerRepresentative: string;
  sellerSignatureUrl: string;
  buyerSnapshot: PartySnapshot;
  consigneeSnapshot: PartySnapshot | null;
  notifySnapshot: PartySnapshot | null;
  currency: string;
  incoterms: string;
  incotermsPlace: string;
  paymentTerms: string;
  paymentMethod: string;
  lcInfo: LcInfo;
  commodity: string;
  originCountry: string;
  validity: string;
  bankInfo: BankInfo;
  charges: ChargeLine[];
  items: DealItem[];
  remarks: string;
  status: "open" | "closed";
  createdAt: string;
}

/** 서버에 거래 건을 처음 생성할 때 보내는 페이로드(id/userId/createdAt 제외). */
export type DealInput = Omit<Deal, "id" | "userId" | "createdAt">;

export function createEmptyDeal(): DealInput {
  return {
    poNo: "",
    poDate: "",
    sellerCompanyName: "",
    sellerAddress: "",
    sellerTel: "",
    sellerFax: "",
    sellerRepresentative: "",
    sellerSignatureUrl: "",
    buyerSnapshot: { companyName: "", address: "", tel: "", contactPerson: "" },
    consigneeSnapshot: null,
    notifySnapshot: null,
    currency: "USD",
    incoterms: "FOB",
    incotermsPlace: "",
    paymentTerms: "",
    paymentMethod: "",
    lcInfo: {},
    commodity: "",
    originCountry: "",
    validity: "",
    bankInfo: {
      bankName: "",
      bankSwift: "",
      accountNo: "",
      accountee: "",
      bankAddress: "",
      bankTel: "",
      bankFax: "",
    },
    charges: [],
    items: [],
    remarks: "",
    status: "open",
  };
}
