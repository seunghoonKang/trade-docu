import type { Invoice } from "@/entities/invoice";
import { INVOICE_DOCUMENT_LABELS as L } from "@/entities/invoice";
import { buildBuyerDetailLines, buildSellerDetailLines } from "@/entities/invoice";
import type { PackingLine } from "@/entities/shipment";
import { visiblePackingColumns } from "@/entities/shipment";

type PreviewData = Omit<Invoice, "id" | "userId" | "createdAt">;

/**
 * 포장명세서(PL) 양식 — 같은 거래 데이터를 포장 중심으로 렌더(가격 숨김 기본).
 * packingLines는 items와 같은 순서의 per-line 포장 값(전부 선택) — 채운 컬럼만 출력한다.
 * showPrice 토글 시 단가/금액 컬럼과 합계를 함께 출력한다(#25).
 * PDF 캡처 대상이므로 루트 id는 invoice-preview-content를 유지한다(InvoicePreview와 동일).
 */
export function PackingListPreview({
  data,
  packingLines = [],
  showPrice = false,
}: {
  data: PreviewData;
  packingLines?: PackingLine[];
  showPrice?: boolean;
}) {
  const cols = visiblePackingColumns(packingLines);
  const colCount =
    4 +
    [cols.cartonQty, cols.netWeight, cols.grossWeight, cols.cbm, cols.cartonNo].filter(Boolean)
      .length +
    (showPrice ? 2 : 0);
  const goodsTotal = data.items.reduce((sum, item) => sum + item.amount, 0);
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
      className="paper-settle flex w-[794px] shrink-0 min-h-[1123px] flex-col bg-white p-10 font-serif text-[12px] leading-[1.4] text-[#1a1a1a] paper-shadow sm:p-[60px] sm:text-[13px] print:border-none print:p-0 print:shadow-none"
    >
      <div className="mb-10 flex items-start justify-between gap-6">
        <PartyBlock label={L.to} companyName={data.buyerSnapshot.companyName} lines={buyerLines} />
        <div className="w-1/3 shrink-0 space-y-1 text-right">
          <MetaRow label={L.date} value={data.date || "—"} />
          <MetaRow label={L.refNo} value={data.refNo || "—"} />
          <MetaRow label={L.orderNo} value={data.orderNo || "—"} />
        </div>
      </div>

      <div className="mb-10 border-t-4 border-double border-black pt-4 text-center">
        <h3 className="text-2xl font-black uppercase tracking-[0.3em] sm:text-[28px] sm:tracking-[0.5em]">
          {L.packingList}
        </h3>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 font-sans sm:grid-cols-2 sm:gap-10">
        <div className="space-y-1">
          <SummaryRow label={L.invoiceNo} value={data.invoiceNo || "—"} />
          <SummaryRow label={L.commodity} value={data.commodity || "—"} />
        </div>
        <div className="sm:text-right">
          <div className="text-[10px] font-bold text-gray-400">{L.shipVia}</div>
          <div className="font-medium">{data.delivery || "—"}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="mb-10 w-full min-w-[500px] border-collapse">
          <thead>
            <tr className="border-y-2 border-black text-center text-[10px] font-bold">
              <th className="w-[30%] py-2 text-left">{L.descriptionOfGoods}</th>
              <th className="py-2">{L.hsCode}</th>
              <th className="py-2">{L.qty}</th>
              <th className="py-2">{L.unit}</th>
              {cols.cartonQty && <th className="py-2">{L.ctn}</th>}
              {cols.netWeight && <th className="py-2">{L.netWeight}</th>}
              {cols.grossWeight && <th className="py-2">{L.grossWeight}</th>}
              {cols.cbm && <th className="py-2">{L.cbm}</th>}
              {cols.cartonNo && <th className="py-2">{L.cartonNo}</th>}
              {showPrice && <th className="py-2">{L.unitPrice}</th>}
              {showPrice && <th className="py-2 text-right">{L.amount}</th>}
            </tr>
          </thead>
          <tbody className="text-center">
            {data.items.map((item, i) => {
              const pack = packingLines[i] ?? {};
              return (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-4 text-left">
                    <div className="font-bold">{item.description || "—"}</div>
                    {item.remarks && <div className="text-[10px] text-gray-500">{item.remarks}</div>}
                  </td>
                  <td className="py-4">{item.hsCode || "—"}</td>
                  <td className="py-4">{item.qty ? item.qty.toFixed(2) : "—"}</td>
                  <td className="py-4">{item.unit || "—"}</td>
                  {cols.cartonQty && <td className="py-4">{pack.cartonQty || "—"}</td>}
                  {cols.netWeight && <td className="py-4">{pack.netWeight || "—"}</td>}
                  {cols.grossWeight && <td className="py-4">{pack.grossWeight || "—"}</td>}
                  {cols.cbm && <td className="py-4">{pack.cbm || "—"}</td>}
                  {cols.cartonNo && <td className="py-4">{pack.cartonNo || "—"}</td>}
                  {showPrice && <td className="py-4">{item.unitPrice ? item.unitPrice.toFixed(2) : "—"}</td>}
                  {showPrice && (
                    <td className="py-4 text-right">{item.amount ? item.amount.toFixed(2) : "—"}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
          {showPrice && (
            <tfoot>
              <tr>
                <td className="py-4 text-right text-sm font-black" colSpan={colCount - 1}>
                  {L.grandTotal}: {data.currency}
                </td>
                <td className="py-4 text-right text-sm font-black">{goodsTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="mb-8 font-sans text-[11px] text-gray-600">
        <div className="font-bold uppercase">{L.shippingMarks}</div>
        <div className="mt-1 whitespace-pre-line">{data.packing || "—"}</div>
      </div>

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
          <img src={signatureUrl} alt="" className="max-h-20 max-w-[220px] object-contain" crossOrigin="anonymous" />
        </div>
      )}
      {signatureLabel && (
        <div className={`text-center font-sans text-[10px] text-gray-500 ${signatureUrl ? "mt-3" : "mt-6"}`}>
          {signatureLabel}
        </div>
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-200">
      <span className="text-gray-500">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-gray-100 pb-1">
      <span className="w-32 text-[10px] font-bold text-gray-400">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
