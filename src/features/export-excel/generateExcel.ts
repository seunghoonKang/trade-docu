import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { Invoice } from "../../entities/invoice/model";
import type { TFunction } from "i18next";

type FormData = Omit<Invoice, "id" | "userId" | "createdAt">;

export async function generateExcel(data: FormData, t: TFunction) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Proforma Invoice");

  ws.columns = [
    { width: 5 }, { width: 20 }, { width: 15 }, { width: 10 },
    { width: 10 }, { width: 12 }, { width: 12 }, { width: 18 },
  ];

  const thin = { style: "thin" as const, color: { argb: "FF999999" } };
  const thick = { style: "medium" as const, color: { argb: "FF333333" } };

  let row = 1;

  // Title
  ws.mergeCells(`B${row}:H${row}`);
  const titleCell = ws.getCell(`B${row}`);
  titleCell.value = t("invoice.proformaInvoice");
  titleCell.font = { size: 14, bold: true };
  titleCell.alignment = { horizontal: "center" };
  row += 2;

  // Buyer + Date
  ws.getCell(`B${row}`).value = `${t("invoice.to")} ${data.buyerSnapshot.companyName}`;
  ws.getCell(`B${row}`).font = { bold: true };
  ws.getCell(`G${row}`).value = `${t("form.date")}: ${data.date}`;
  row++;
  ws.getCell(`B${row}`).value = data.buyerSnapshot.address;
  ws.getCell(`G${row}`).value = `${t("form.refNo")}: ${data.refNo}`;
  row++;
  ws.getCell(`B${row}`).value = data.buyerSnapshot.tel;
  ws.getCell(`G${row}`).value = `${t("form.orderNo")}: ${data.orderNo}`;
  row += 2;

  ws.getCell(`B${row}`).value = `${t("form.invoiceNo")}: ${data.invoiceNo}`;
  row += 2;

  // Terms
  const terms = [
    { label: t("form.delivery"), value: data.delivery },
    { label: t("form.paymentTerms"), value: data.paymentTerms },
    { label: t("form.packing"), value: data.packing },
    { label: t("form.validity"), value: data.validity },
    { label: t("form.incoterms"), value: data.incoterms },
    { label: t("form.remarks"), value: data.remarks },
  ].filter((term) => term.value);

  for (const term of terms) {
    ws.getCell(`B${row}`).value = `*${term.label}`;
    ws.getCell(`B${row}`).font = { color: { argb: "FF666666" } };
    ws.getCell(`C${row}`).value = `: ${term.value}`;
    row++;
  }
  row++;

  if (data.commodity) {
    ws.getCell(`B${row}`).value = `${t("form.commodity")}: ${data.commodity}`;
    row++;
  }
  row++;

  // Items header
  const headers = [
    { col: "B", label: t("form.description") },
    { col: "C", label: t("form.hsCode") },
    { col: "D", label: t("form.qty") },
    { col: "E", label: t("form.unit") },
    { col: "F", label: t("form.unitPrice") },
    { col: "G", label: t("form.amount") },
    { col: "H", label: t("form.remarks") },
  ];
  for (const h of headers) {
    const cell = ws.getCell(`${h.col}${row}`);
    cell.value = h.label;
    cell.font = { bold: true, size: 9 };
    cell.border = { bottom: thick };
  }
  row++;

  // Items
  for (const item of data.items) {
    ws.getCell(`B${row}`).value = item.description;
    ws.getCell(`C${row}`).value = item.hsCode;
    ws.getCell(`D${row}`).value = item.qty || undefined;
    ws.getCell(`D${row}`).alignment = { horizontal: "center" };
    ws.getCell(`E${row}`).value = item.unit;
    ws.getCell(`E${row}`).alignment = { horizontal: "center" };
    ws.getCell(`F${row}`).value = item.unitPrice || undefined;
    ws.getCell(`F${row}`).numFmt = "#,##0.00";
    ws.getCell(`F${row}`).alignment = { horizontal: "right" };
    ws.getCell(`G${row}`).value = item.amount || undefined;
    ws.getCell(`G${row}`).numFmt = "#,##0.00";
    ws.getCell(`G${row}`).alignment = { horizontal: "right" };
    ws.getCell(`H${row}`).value = item.remarks;
    for (const col of ["B", "C", "D", "E", "F", "G", "H"]) {
      ws.getCell(`${col}${row}`).border = { bottom: thin };
    }
    row++;
  }

  // Additional charges
  for (const charge of data.additionalCharges) {
    ws.getCell(`B${row}`).value = charge.description;
    ws.getCell(`G${row}`).value = charge.amount;
    ws.getCell(`G${row}`).numFmt = "#,##0.00";
    ws.getCell(`G${row}`).alignment = { horizontal: "right" };
    row++;
  }

  // Total
  ws.getCell(`F${row}`).value = t("form.total");
  ws.getCell(`F${row}`).font = { bold: true };
  ws.getCell(`G${row}`).value = data.totalAmount;
  ws.getCell(`G${row}`).numFmt = "#,##0.00";
  ws.getCell(`G${row}`).font = { bold: true };
  ws.getCell(`G${row}`).alignment = { horizontal: "right" };
  ws.getCell(`F${row}`).border = { top: thick };
  ws.getCell(`G${row}`).border = { top: thick };
  row += 2;

  // Bank info
  if (data.bankInfo.bankName) {
    ws.getCell(`B${row}`).value = t("form.bankInfo");
    ws.getCell(`B${row}`).font = { bold: true };
    row++;
    const bankFields = [
      { label: t("form.bankName"), value: data.bankInfo.bankName },
      { label: t("form.bankSwift"), value: data.bankInfo.bankSwift },
      { label: t("form.accountNo"), value: data.bankInfo.accountNo },
      { label: t("form.accountee"), value: data.bankInfo.accountee },
      { label: t("form.bankAddress"), value: data.bankInfo.bankAddress },
      { label: t("form.bankTel"), value: data.bankInfo.bankTel },
    ].filter((f) => f.value);
    for (const field of bankFields) {
      ws.getCell(`B${row}`).value = field.label;
      ws.getCell(`B${row}`).font = { color: { argb: "FF666666" } };
      ws.getCell(`C${row}`).value = field.value;
      row++;
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  const filename = `PI_${data.invoiceNo || "draft"}_${data.date || "undated"}.xlsx`;
  saveAs(new Blob([buf]), filename);
}
