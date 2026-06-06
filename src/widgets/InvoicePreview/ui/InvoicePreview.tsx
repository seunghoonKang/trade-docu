import type { Invoice } from "@/entities/invoice/model";
import { INVOICE_DOCUMENT_LABELS as L } from "@/entities/invoice/documentLabels";

type PreviewData = Omit<Invoice, "id" | "userId" | "createdAt">;

export function InvoicePreview({ data }: { data: PreviewData }) {
  return (
    <div
      id="invoice-preview-content"
      className="bg-card border border-border rounded p-8 text-sm leading-relaxed print:border-none print:p-0"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-muted-foreground">{L.to}</p>
          <p className="text-base font-semibold">{data.buyerSnapshot.companyName || "—"}</p>
          <p className="text-muted-foreground">{data.buyerSnapshot.address}</p>
          <p className="text-muted-foreground">{data.buyerSnapshot.tel}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">{L.date}</p>
          <p>{data.date || "—"}</p>
          <p className="text-muted-foreground mt-2">{L.refNo}</p>
          <p>{data.refNo || "—"}</p>
          <p className="text-muted-foreground mt-2">{L.orderNo}</p>
          <p>{data.orderNo || "—"}</p>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-center text-lg font-bold tracking-wide mb-6 border-b pb-3">
        {L.proformaInvoice}
      </h1>

      {/* Invoice No */}
      <p className="text-muted-foreground mb-4">{L.invoiceNo}: {data.invoiceNo || "—"}</p>

      {/* Terms */}
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 mb-6">
        {data.delivery && <><span className="text-muted-foreground">*{L.delivery}</span><span>: {data.delivery}</span></>}
        {data.paymentTerms && <><span className="text-muted-foreground">*{L.paymentTerms}</span><span>: {data.paymentTerms}</span></>}
        {data.packing && <><span className="text-muted-foreground">*{L.packing}</span><span>: {data.packing}</span></>}
        {data.validity && <><span className="text-muted-foreground">*{L.validity}</span><span>: {data.validity}</span></>}
        {data.incoterms && <><span className="text-muted-foreground">*{L.incoterms}</span><span>: {data.incoterms}</span></>}
        {data.remarks && <><span className="text-muted-foreground">*{L.remarks}</span><span>: {data.remarks}</span></>}
      </div>

      {/* Commodity */}
      {data.commodity && <p className="text-muted-foreground mb-3">{L.commodity}: {data.commodity}</p>}

      {/* Items Table */}
      <table className="w-full table-fixed border-collapse mb-4">
        <colgroup>
          <col className="w-[32%]" />
          <col className="w-[12%]" />
          <col className="w-[8%]" />
          <col className="w-[8%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[16%]" />
        </colgroup>
        <thead>
          <tr className="border-b-2 border-foreground font-semibold text-muted-foreground">
            <th className="text-left py-2 pr-2">{L.description}</th>
            <th className="text-left py-2 pr-2">{L.hsCode}</th>
            <th className="text-center py-2 px-1">{L.qty}</th>
            <th className="text-center py-2 px-1">{L.unit}</th>
            <th className="text-right py-2 pl-2">{L.unitPrice}</th>
            <th className="text-right py-2 pr-4 whitespace-nowrap">{L.amount}</th>
            <th className="text-left py-2 pl-4">{L.remarks}</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i} className="border-b border-border">
              <td className="py-1.5 pr-2 break-words">{item.description}</td>
              <td className="py-1.5 pr-2">{item.hsCode}</td>
              <td className="py-1.5 text-center px-1">{item.qty || ""}</td>
              <td className="py-1.5 text-center px-1">{item.unit}</td>
              <td className="py-1.5 text-right pl-2 whitespace-nowrap">{item.unitPrice ? item.unitPrice.toFixed(2) : ""}</td>
              <td className="py-1.5 text-right pr-4 whitespace-nowrap">{item.amount ? item.amount.toFixed(2) : ""}</td>
              <td className="py-1.5 pl-4 break-words">{item.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Additional Charges */}
      {data.additionalCharges.length > 0 && (
        <div className="mb-2">
          {data.additionalCharges.map((charge, i) => (
            <div key={i} className="flex justify-between py-0.5">
              <span className="text-muted-foreground">{charge.description}</span>
              <span>{charge.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      <div className="border-t-2 border-foreground pt-2 text-right text-base font-bold">
        {L.total}: {data.currency} {data.totalAmount.toFixed(2)}
      </div>

      {/* Closing */}
      <p className="mt-8 text-muted-foreground">{L.faithfully}</p>

      {/* Seller Info */}
      {data.sellerCompanyName && (
        <div className="mt-4 text-muted-foreground">
          <p className="text-base font-semibold text-foreground">{data.sellerCompanyName}</p>
          <p>{data.sellerAddress}</p>
          {data.sellerTel && <p>Tel: {data.sellerTel}</p>}
          {data.sellerFax && <p>Fax: {data.sellerFax}</p>}
        </div>
      )}

      {/* Bank Info */}
      {data.bankInfo.bankName && (
        <div className="mt-6 border-t border-border pt-4">
          <p className="font-semibold text-foreground mb-1">{L.bankInfo}</p>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-muted-foreground">
            <span>{L.bankName}</span><span>{data.bankInfo.bankName}</span>
            <span>{L.bankSwift}</span><span>{data.bankInfo.bankSwift}</span>
            <span>{L.accountNo}</span><span>{data.bankInfo.accountNo}</span>
            <span>{L.accountee}</span><span>{data.bankInfo.accountee}</span>
            {data.bankInfo.bankAddress && <><span>{L.bankAddress}</span><span>{data.bankInfo.bankAddress}</span></>}
            {data.bankInfo.bankTel && <><span>{L.bankTel}</span><span>{data.bankInfo.bankTel}</span></>}
          </div>
        </div>
      )}
    </div>
  );
}
