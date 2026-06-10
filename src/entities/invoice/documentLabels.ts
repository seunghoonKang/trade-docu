import type { AdditionalCharge, ChargeType } from "./model";

/** Fixed English charge-type labels for document output. */
export const CHARGE_TYPE_LABELS: Record<ChargeType, string> = {
  freight: "Freight",
  insurance: "Insurance",
  fee: "Fee",
  tax: "Tax",
  other: "Other",
};

/** 문서 출력용 비용 라인 표기: 사용자 입력 설명 우선, 없으면 유형 라벨. */
export function chargeDisplayLabel(charge: AdditionalCharge): string {
  return charge.description || CHARGE_TYPE_LABELS[charge.type ?? "other"];
}

/** Fixed English labels for invoice document output (preview, PDF, Excel, print). */
export const INVOICE_DOCUMENT_LABELS = {
  proformaInvoice: "PROFORMA INVOICE",
  commercialInvoice: "COMMERCIAL INVOICE",
  packingList: "PACKING LIST",
  ctn: "CTN",
  netWeight: "NET WEIGHT",
  grossWeight: "GROSS WEIGHT",
  cbm: "CBM",
  shippingMarks: "SHIPPING MARKS",
  to: "To:",
  from: "From:",
  attn: "Attn.",
  tel: "Tel",
  fax: "Fax",
  representative: "Representative",
  faithfully: "Faithfully Yours,",
  date: "DATE",
  refNo: "REF NO",
  orderNo: "PO NO",
  invoiceNo: "INVOICE NO",
  termsOfTrade: "TERMS OF TRADE",
  shipVia: "SHIP VIA",
  delivery: "Delivery",
  paymentTerms: "Payment Terms",
  paymentMethod: "Payment Method",
  consignee: "Consignee",
  notifyParty: "Notify Party",
  packing: "Packing",
  validity: "Validity",
  incoterms: "Incoterms",
  remarks: "Remarks",
  commodity: "Commodity",
  descriptionOfGoods: "DESCRIPTION OF GOODS",
  description: "Description",
  hsCode: "HS CODE",
  qty: "QTY",
  unit: "UNIT",
  unitPrice: "PRICE",
  amount: "AMOUNT",
  grandTotal: "GRAND TOTAL",
  total: "Total",
  authorizedSignature: "Authorized Signature",
  bankInfo: "Bank Information",
  bankName: "Bank Name",
  bankSwift: "SWIFT Code",
  accountNo: "Account No.",
  accountee: "Accountee",
  bankAddress: "Bank Address",
  bankTel: "Bank Tel",
  bankFax: "Bank Fax",
} as const;
