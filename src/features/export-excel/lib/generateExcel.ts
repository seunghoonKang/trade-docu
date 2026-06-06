import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { Invoice } from "@/entities/invoice/model";
import { INVOICE_DOCUMENT_LABELS as L } from "@/entities/invoice/documentLabels";

type FormData = Omit<Invoice, "id" | "userId" | "createdAt">;

export async function generateExcel(data: FormData) {
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
  titleCell.value = L.proformaInvoice;
  titleCell.font = { size: 14, bold: true };
  titleCell.alignment = { horizontal: "center" };
  row += 2;

  // Buyer + Date
  ws.getCell(`B${row}`).value = `${L.to} ${data.buyerSnapshot.companyName}`;
  ws.getCell(`B${row}`).font = { bold: true };
  ws.getCell(`G${row}`).value = `${L.date}: ${data.date}`;
  row++;
  ws.getCell(`B${row}`).value = data.buyerSnapshot.address;
  ws.getCell(`G${row}`).value = `${L.refNo}: ${data.refNo}`;
  row++;
  ws.getCell(`B${row}`).value = data.buyerSnapshot.tel;
  ws.getCell(`G${row}`).value = `${L.orderNo}: ${data.orderNo}`;
  row += 2;

  ws.getCell(`B${row}`).value = `${L.invoiceNo}: ${data.invoiceNo}`;
  row += 2;

  // Terms
  const terms = [
    { label: L.delivery, value: data.delivery },
    { label: L.paymentTerms, value: data.paymentTerms },
    { label: L.packing, value: data.packing },
    { label: L.validity, value: data.validity },
    { label: L.incoterms, value: data.incoterms },
    { label: L.remarks, value: data.remarks },
  ].filter((term) => term.value);

  for (const term of terms) {
    ws.getCell(`B${row}`).value = `*${term.label}`;
    ws.getCell(`B${row}`).font = { color: { argb: "FF666666" } };
    ws.getCell(`C${row}`).value = `: ${term.value}`;
    row++;
  }
  row++;

  if (data.commodity) {
    ws.getCell(`B${row}`).value = `${L.commodity}: ${data.commodity}`;
    row++;
  }
  row++;

  // Items header
  const headers = [
    { col: "B", label: L.description },
    { col: "C", label: L.hsCode },
    { col: "D", label: L.qty },
    { col: "E", label: L.unit },
    { col: "F", label: L.unitPrice },
    { col: "G", label: L.amount },
    { col: "H", label: L.remarks },
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
  ws.getCell(`F${row}`).value = L.total;
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
    ws.getCell(`B${row}`).value = L.bankInfo;
    ws.getCell(`B${row}`).font = { bold: true };
    row++;
    const bankFields = [
      { label: L.bankName, value: data.bankInfo.bankName },
      { label: L.bankSwift, value: data.bankInfo.bankSwift },
      { label: L.accountNo, value: data.bankInfo.accountNo },
      { label: L.accountee, value: data.bankInfo.accountee },
      { label: L.bankAddress, value: data.bankInfo.bankAddress },
      { label: L.bankTel, value: data.bankInfo.bankTel },
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
