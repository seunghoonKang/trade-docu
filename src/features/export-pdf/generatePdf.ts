import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { saveAs } from "file-saver";
import { PdfDocument } from "./PdfDocument";
import type { Invoice } from "../../entities/invoice/model";
import type { TFunction } from "i18next";

type FormData = Omit<Invoice, "id" | "userId" | "createdAt">;

export async function generatePdf(data: FormData, t: TFunction) {
  const labels = {
    to: t("invoice.to"), proformaInvoice: t("invoice.proformaInvoice"),
    faithfully: t("invoice.faithfully"), date: t("form.date"),
    refNo: t("form.refNo"), orderNo: t("form.orderNo"),
    invoiceNo: t("form.invoiceNo"), delivery: t("form.delivery"),
    paymentTerms: t("form.paymentTerms"), packing: t("form.packing"),
    validity: t("form.validity"), incoterms: t("form.incoterms"),
    remarks: t("form.remarks"), commodity: t("form.commodity"),
    description: t("form.description"), hsCode: t("form.hsCode"),
    qty: t("form.qty"), unit: t("form.unit"), unitPrice: t("form.unitPrice"),
    amount: t("form.amount"), total: t("form.total"),
    bankInfo: t("form.bankInfo"), bankName: t("form.bankName"),
    bankSwift: t("form.bankSwift"), accountNo: t("form.accountNo"),
    accountee: t("form.accountee"), bankAddress: t("form.bankAddress"),
  };
  const doc = createElement(PdfDocument, { data, labels }) as any;
  const blob = await pdf(doc).toBlob();
  const filename = `PI_${data.invoiceNo || "draft"}_${data.date || "undated"}.pdf`;
  saveAs(blob, filename);
}
