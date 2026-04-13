import type { BankInfo } from "../bank-info/model";

export interface InvoiceItem {
  description: string;
  hsCode: string;
  qty: number;
  unit: string;
  unitPrice: number;
  amount: number;
  remarks: string;
}

export interface AdditionalCharge {
  description: string;
  amount: number;
}

export interface BuyerSnapshot {
  companyName: string;
  address: string;
  tel: string;
  contactPerson: string;
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
