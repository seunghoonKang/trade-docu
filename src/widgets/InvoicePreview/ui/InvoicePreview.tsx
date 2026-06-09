import type { Invoice } from "@/entities/invoice";
import { INVOICE_DOCUMENT_LABELS as L } from "@/entities/invoice";
import { buildBuyerDetailLines, buildSellerDetailLines } from "@/entities/invoice";
import { cn } from "@/shared/lib/utils";

type PreviewData = Omit<Invoice, "id" | "userId" | "createdAt">;

function formatTermsOfTrade(data: PreviewData) {
  const parts = [data.incoterms, data.commodity].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "—";
}

export function InvoicePreview({ data }: { data: PreviewData }) {
  const hasExtraTerms = data.paymentTerms || data.packing || data.validity || data.remarks;
  const hasBankInfo = Boolean(data.bankInfo.bankName);
  const hasCharges = data.additionalCharges.length > 0;
  const buyerLines = buildBuyerDetailLines(data.buyerSnapshot);
  const sellerLines = buildSellerDetailLines({
    companyName: data.sellerCompanyName,
    address: data.sellerAddress,
    tel: data.sellerTel,
    fax: data.sellerFax,
    representative: data.sellerRepresentative,
  });

  return (
    <div
      id="invoice-preview-content"
      className="flex w-[794px] shrink-0 min-h-[1123px] flex-col bg-white p-10 font-serif text-[12px] leading-[1.4] text-[#1a1a1a] paper-shadow sm:p-[60px] sm:text-[13px] print:border-none print:p-0 print:shadow-none"
    >
      <div className="mb-10 flex items-start justify-between gap-6">
        <PartyBlock label={L.to} companyName={data.buyerSnapshot.companyName} lines={buyerLines} />
        <div className="w-1/3 shrink-0 space-y-1 text-right">
          <PreviewMetaRow label={L.date} value={data.date || "—"} />
          <PreviewMetaRow label={L.refNo} value={data.refNo || "—"} />
          <PreviewMetaRow label={L.orderNo} value={data.orderNo || "—"} />
        </div>
      </div>

      <div className="mb-10 border-t-4 border-double border-black pt-4 text-center">
        <h3 className="text-2xl font-black uppercase tracking-[0.3em] sm:text-[28px] sm:tracking-[0.5em]">
          {L.proformaInvoice}
        </h3>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 font-sans sm:grid-cols-2 sm:gap-10">
        <div className="space-y-1">
          <PreviewSummaryRow label={L.invoiceNo} value={data.invoiceNo || "—"} />
          <PreviewSummaryRow label={L.termsOfTrade} value={formatTermsOfTrade(data)} />
        </div>
        <div className="sm:text-right">
          <div className="text-[10px] font-bold text-gray-400">{L.shipVia}</div>
          <div className="font-medium">{data.delivery || "—"}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="mb-10 w-full min-w-[500px] border-collapse">
          <thead>
            <tr className="border-y-2 border-black text-center text-[11px] font-bold">
              <th className="w-[40%] py-2 text-left">{L.descriptionOfGoods}</th>
              <th className="py-2">{L.hsCode}</th>
              <th className="py-2">{L.qty}</th>
              <th className="py-2">{L.unit}</th>
              <th className="py-2">{L.unitPrice}</th>
              <th className="py-2 text-right">{L.amount}</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {data.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-4 text-left">
                  <div className="font-bold">{item.description || "—"}</div>
                  {item.remarks && <div className="text-[10px] text-gray-500">{item.remarks}</div>}
                </td>
                <td className="py-4">{item.hsCode || "—"}</td>
                <td className="py-4">{item.qty ? item.qty.toFixed(2) : "—"}</td>
                <td className="py-4">{item.unit || "—"}</td>
                <td className="py-4">{item.unitPrice ? item.unitPrice.toFixed(2) : "—"}</td>
                <td className="py-4 text-right">{item.amount ? item.amount.toFixed(2) : "—"}</td>
              </tr>
            ))}
          </tbody>
          {hasCharges && (
            <tbody>
              {data.additionalCharges.map((charge, i) => (
                <tr key={`charge-${i}`} className="border-b border-gray-200">
                  <td className="py-2 text-left text-gray-600" colSpan={5}>{charge.description}</td>
                  <td className="py-2 text-right">{charge.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          )}
          <tfoot>
            <tr>
              <td className="py-4 text-right text-sm font-black" colSpan={5}>{L.grandTotal}: {data.currency}</td>
              <td className="py-4 text-right text-sm font-black">{data.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {hasExtraTerms && (
        <div className="mb-8 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-sans text-[11px] text-gray-600">
          {data.paymentTerms && <><span className="font-bold uppercase">{L.paymentTerms}</span><span>{data.paymentTerms}</span></>}
          {data.packing && <><span className="font-bold uppercase">{L.packing}</span><span>{data.packing}</span></>}
          {data.validity && <><span className="font-bold uppercase">{L.validity}</span><span>{data.validity}</span></>}
          {data.remarks && <><span className="font-bold uppercase">{L.remarks}</span><span>{data.remarks}</span></>}
        </div>
      )}

      <div className="mt-auto flex flex-col items-stretch justify-between gap-8 sm:flex-row sm:items-end">
        <div className="text-center text-[11px] italic text-gray-400 sm:w-1/3 sm:text-left">
          {L.faithfully}
        </div>
        <div className="w-full border-t border-black pt-2 sm:w-1/2">
          <PartyBlock
            label={L.from}
            companyName={data.sellerCompanyName}
            lines={sellerLines}
            bordered={false}
            signatureUrl={data.sellerSignatureUrl}
            signatureLabel={L.authorizedSignature}
          />
        </div>
      </div>

      {hasBankInfo && (
        <div className="mt-8 border-t border-gray-200 pt-4 font-sans text-[11px]">
          <p className="mb-2 font-bold uppercase">{L.bankInfo}</p>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-gray-600">
            <span>{L.bankName}</span><span>{data.bankInfo.bankName}</span>
            <span>{L.bankSwift}</span><span>{data.bankInfo.bankSwift}</span>
            <span>{L.accountNo}</span><span>{data.bankInfo.accountNo}</span>
            <span>{L.accountee}</span><span>{data.bankInfo.accountee}</span>
            {data.bankInfo.bankAddress && <><span>{L.bankAddress}</span><span>{data.bankInfo.bankAddress}</span></>}
            {data.bankInfo.bankTel && <><span>{L.bankTel}</span><span>{data.bankInfo.bankTel}</span></>}
            {data.bankInfo.bankFax && <><span>{L.bankFax}</span><span>{data.bankInfo.bankFax}</span></>}
          </div>
        </div>
      )}
    </div>
  );
}

function PartyBlock({
  label,
  companyName,
  lines,
  bordered = true,
  signatureUrl,
  signatureLabel,
}: {
  label: string;
  companyName: string;
  lines: string[];
  bordered?: boolean;
  signatureUrl?: string;
  signatureLabel?: string;
}) {
  return (
    <div className="w-full sm:w-auto sm:min-w-[280px]">
      <div className="mb-1 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</div>
      <div className={bordered ? "min-h-10 space-y-0.5 border-b-2 border-black pb-2" : "space-y-0.5"}>
        <div className="text-sm font-bold">{companyName || "—"}</div>
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre-line font-sans text-[11px] leading-snug text-gray-700">
            {line}
          </div>
        ))}
      </div>
      {signatureUrl && (
        <div className="mt-4 flex justify-center">
          <img
            src={signatureUrl}
            alt=""
            className="max-h-20 max-w-[220px] object-contain"
            crossOrigin="anonymous"
          />
        </div>
      )}
      {signatureLabel && (
        <div className={cn("text-center font-sans text-[10px] text-gray-500", signatureUrl ? "mt-3" : "mt-6")}>
          {signatureLabel}
        </div>
      )}
    </div>
  );
}

function PreviewMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-200">
      <span className="text-gray-500">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function PreviewSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-gray-100 pb-1">
      <span className="w-32 text-[10px] font-bold text-gray-400">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
