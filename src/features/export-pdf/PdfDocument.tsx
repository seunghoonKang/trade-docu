import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "NotoSansKR",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-400-normal.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-700-normal.ttf",
      fontWeight: "bold",
    },
  ],
});
import type { Invoice } from "../../entities/invoice/model";

type PdfData = Omit<Invoice, "id" | "userId" | "createdAt">;

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: "NotoSansKR", lineHeight: 1.4 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  title: { textAlign: "center", fontSize: 14, fontWeight: "bold", letterSpacing: 1, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#333", paddingBottom: 8 },
  label: { fontSize: 7, color: "#888" },
  bold: { fontWeight: "bold" },
  row: { flexDirection: "row" },
  termRow: { flexDirection: "row", marginBottom: 2 },
  termLabel: { fontSize: 8, color: "#666", width: 80 },
  termValue: { fontSize: 8 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#333", paddingBottom: 4, marginBottom: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#eee", paddingVertical: 3 },
  colDesc: { width: "25%" }, colHs: { width: "12%" },
  colQty: { width: "8%", textAlign: "center" }, colUnit: { width: "8%", textAlign: "center" },
  colPrice: { width: "12%", textAlign: "right" }, colAmt: { width: "12%", textAlign: "right" },
  colRem: { width: "23%" },
  thText: { fontSize: 8, fontWeight: "bold", color: "#555" },
  totalRow: { borderTopWidth: 2, borderTopColor: "#333", paddingTop: 6, marginTop: 4, flexDirection: "row", justifyContent: "flex-end" },
  totalText: { fontSize: 11, fontWeight: "bold" },
  section: { marginTop: 16 },
  bankGrid: { flexDirection: "row", marginBottom: 1 },
  bankLabel: { width: 80, fontSize: 8, color: "#666" },
  bankValue: { fontSize: 8 },
});

interface Props {
  data: PdfData;
  labels: Record<string, string>;
}

export function PdfDocument({ data, labels }: Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.label}>{labels.to}</Text>
            <Text style={s.bold}>{data.buyerSnapshot.companyName}</Text>
            <Text>{data.buyerSnapshot.address}</Text>
            <Text>{data.buyerSnapshot.tel}</Text>
          </View>
          <View style={{ alignItems: "flex-end" as const }}>
            <Text style={s.label}>{labels.date}</Text>
            <Text>{data.date}</Text>
            <Text style={[s.label, { marginTop: 4 }]}>{labels.refNo}</Text>
            <Text>{data.refNo}</Text>
            <Text style={[s.label, { marginTop: 4 }]}>{labels.orderNo}</Text>
            <Text>{data.orderNo}</Text>
          </View>
        </View>

        <Text style={s.title}>{labels.proformaInvoice}</Text>
        <Text style={{ fontSize: 8, color: "#888", marginBottom: 12 }}>{labels.invoiceNo}: {data.invoiceNo}</Text>

        <View style={{ marginBottom: 12 }}>
          {data.delivery ? <View style={s.termRow}><Text style={s.termLabel}>*{labels.delivery}</Text><Text style={s.termValue}>: {data.delivery}</Text></View> : null}
          {data.paymentTerms ? <View style={s.termRow}><Text style={s.termLabel}>*{labels.paymentTerms}</Text><Text style={s.termValue}>: {data.paymentTerms}</Text></View> : null}
          {data.packing ? <View style={s.termRow}><Text style={s.termLabel}>*{labels.packing}</Text><Text style={s.termValue}>: {data.packing}</Text></View> : null}
          {data.validity ? <View style={s.termRow}><Text style={s.termLabel}>*{labels.validity}</Text><Text style={s.termValue}>: {data.validity}</Text></View> : null}
          {data.incoterms ? <View style={s.termRow}><Text style={s.termLabel}>*{labels.incoterms}</Text><Text style={s.termValue}>: {data.incoterms}</Text></View> : null}
          {data.remarks ? <View style={s.termRow}><Text style={s.termLabel}>*{labels.remarks}</Text><Text style={s.termValue}>: {data.remarks}</Text></View> : null}
        </View>

        {data.commodity ? <Text style={{ fontSize: 8, color: "#666", marginBottom: 8 }}>{labels.commodity}: {data.commodity}</Text> : null}

        <View style={s.tableHeader}>
          <Text style={[s.thText, s.colDesc]}>{labels.description}</Text>
          <Text style={[s.thText, s.colHs]}>{labels.hsCode}</Text>
          <Text style={[s.thText, s.colQty]}>{labels.qty}</Text>
          <Text style={[s.thText, s.colUnit]}>{labels.unit}</Text>
          <Text style={[s.thText, s.colPrice]}>{labels.unitPrice}</Text>
          <Text style={[s.thText, s.colAmt]}>{labels.amount}</Text>
          <Text style={[s.thText, s.colRem]}>{labels.remarks}</Text>
        </View>
        {data.items.map((item, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={s.colDesc}>{item.description}</Text>
            <Text style={s.colHs}>{item.hsCode}</Text>
            <Text style={s.colQty}>{item.qty || ""}</Text>
            <Text style={s.colUnit}>{item.unit}</Text>
            <Text style={s.colPrice}>{item.unitPrice ? item.unitPrice.toFixed(2) : ""}</Text>
            <Text style={s.colAmt}>{item.amount ? item.amount.toFixed(2) : ""}</Text>
            <Text style={s.colRem}>{item.remarks}</Text>
          </View>
        ))}

        {data.additionalCharges.map((charge, i) => (
          <View key={i} style={[s.row, { justifyContent: "space-between" as const, paddingVertical: 2 }]}>
            <Text style={{ fontSize: 8, color: "#666" }}>{charge.description}</Text>
            <Text style={{ fontSize: 8 }}>{charge.amount.toFixed(2)}</Text>
          </View>
        ))}

        <View style={s.totalRow}>
          <Text style={s.totalText}>{labels.total}: {data.currency} {data.totalAmount.toFixed(2)}</Text>
        </View>

        <Text style={{ marginTop: 24, fontSize: 8, color: "#888" }}>{labels.faithfully}</Text>

        {data.sellerCompanyName ? (
          <View style={s.section}>
            <Text style={s.bold}>{data.sellerCompanyName}</Text>
            <Text>{data.sellerAddress}</Text>
            {data.sellerTel ? <Text>Tel: {data.sellerTel}</Text> : null}
          </View>
        ) : null}

        {data.bankInfo.bankName ? (
          <View style={[s.section, { borderTopWidth: 0.5, borderTopColor: "#ddd", paddingTop: 8 }]}>
            <Text style={[s.bold, { marginBottom: 4 }]}>{labels.bankInfo}</Text>
            <View style={s.bankGrid}><Text style={s.bankLabel}>{labels.bankName}</Text><Text style={s.bankValue}>{data.bankInfo.bankName}</Text></View>
            <View style={s.bankGrid}><Text style={s.bankLabel}>{labels.bankSwift}</Text><Text style={s.bankValue}>{data.bankInfo.bankSwift}</Text></View>
            <View style={s.bankGrid}><Text style={s.bankLabel}>{labels.accountNo}</Text><Text style={s.bankValue}>{data.bankInfo.accountNo}</Text></View>
            <View style={s.bankGrid}><Text style={s.bankLabel}>{labels.accountee}</Text><Text style={s.bankValue}>{data.bankInfo.accountee}</Text></View>
            {data.bankInfo.bankAddress ? <View style={s.bankGrid}><Text style={s.bankLabel}>{labels.bankAddress}</Text><Text style={s.bankValue}>{data.bankInfo.bankAddress}</Text></View> : null}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
