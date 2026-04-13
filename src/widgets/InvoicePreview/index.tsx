import { useTranslation } from "react-i18next";
import type { Invoice } from "../../entities/invoice/model";

type PreviewData = Omit<Invoice, "id" | "userId" | "createdAt">;

export function InvoicePreview({ data }: { data: PreviewData }) {
  const { t } = useTranslation();

  return (
    <div className="bg-white border border-gray-200 rounded p-8 text-sm leading-relaxed print:border-none print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs text-gray-500">{t("invoice.to")}</p>
          <p className="font-semibold">{data.buyerSnapshot.companyName || "—"}</p>
          <p className="text-gray-600">{data.buyerSnapshot.address}</p>
          <p className="text-gray-600">{data.buyerSnapshot.tel}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{t("form.date")}</p>
          <p>{data.date || "—"}</p>
          <p className="text-xs text-gray-500 mt-2">{t("form.refNo")}</p>
          <p>{data.refNo || "—"}</p>
          <p className="text-xs text-gray-500 mt-2">{t("form.orderNo")}</p>
          <p>{data.orderNo || "—"}</p>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-center text-lg font-bold tracking-wide mb-6 border-b pb-3">
        {t("invoice.proformaInvoice")}
      </h1>

      {/* Invoice No */}
      <p className="text-xs text-gray-500 mb-4">{t("form.invoiceNo")}: {data.invoiceNo || "—"}</p>

      {/* Terms */}
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 mb-6 text-xs">
        {data.delivery && <><span className="text-gray-500">*{t("form.delivery")}</span><span>: {data.delivery}</span></>}
        {data.paymentTerms && <><span className="text-gray-500">*{t("form.paymentTerms")}</span><span>: {data.paymentTerms}</span></>}
        {data.packing && <><span className="text-gray-500">*{t("form.packing")}</span><span>: {data.packing}</span></>}
        {data.validity && <><span className="text-gray-500">*{t("form.validity")}</span><span>: {data.validity}</span></>}
        {data.incoterms && <><span className="text-gray-500">*{t("form.incoterms")}</span><span>: {data.incoterms}</span></>}
        {data.remarks && <><span className="text-gray-500">*{t("form.remarks")}</span><span>: {data.remarks}</span></>}
      </div>

      {/* Commodity */}
      {data.commodity && <p className="text-xs text-gray-600 mb-3">{t("form.commodity")}: {data.commodity}</p>}

      {/* Items Table */}
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="text-left py-2 text-xs font-semibold text-gray-600">{t("form.description")}</th>
            <th className="text-left py-2 text-xs font-semibold text-gray-600">{t("form.hsCode")}</th>
            <th className="text-center py-2 text-xs font-semibold text-gray-600">{t("form.qty")}</th>
            <th className="text-center py-2 text-xs font-semibold text-gray-600">{t("form.unit")}</th>
            <th className="text-right py-2 text-xs font-semibold text-gray-600">{t("form.unitPrice")}</th>
            <th className="text-right py-2 text-xs font-semibold text-gray-600">{t("form.amount")}</th>
            <th className="text-left py-2 text-xs font-semibold text-gray-600">{t("form.remarks")}</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-1.5">{item.description}</td>
              <td className="py-1.5">{item.hsCode}</td>
              <td className="py-1.5 text-center">{item.qty || ""}</td>
              <td className="py-1.5 text-center">{item.unit}</td>
              <td className="py-1.5 text-right">{item.unitPrice ? item.unitPrice.toFixed(2) : ""}</td>
              <td className="py-1.5 text-right">{item.amount ? item.amount.toFixed(2) : ""}</td>
              <td className="py-1.5">{item.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Additional Charges */}
      {data.additionalCharges.length > 0 && (
        <div className="mb-2">
          {data.additionalCharges.map((charge, i) => (
            <div key={i} className="flex justify-between text-xs py-0.5">
              <span className="text-gray-600">{charge.description}</span>
              <span>{charge.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      <div className="border-t-2 border-gray-900 pt-2 text-right font-bold">
        {t("form.total")}: {data.currency} {data.totalAmount.toFixed(2)}
      </div>

      {/* Closing */}
      <p className="mt-8 text-xs text-gray-500">{t("invoice.faithfully")}</p>

      {/* Seller Info */}
      {data.sellerCompanyName && (
        <div className="mt-4 text-xs text-gray-600">
          <p className="font-semibold text-gray-800">{data.sellerCompanyName}</p>
          <p>{data.sellerAddress}</p>
          {data.sellerTel && <p>Tel: {data.sellerTel}</p>}
          {data.sellerFax && <p>Fax: {data.sellerFax}</p>}
        </div>
      )}

      {/* Bank Info */}
      {data.bankInfo.bankName && (
        <div className="mt-6 border-t border-gray-100 pt-4 text-xs">
          <p className="font-semibold text-gray-700 mb-1">{t("form.bankInfo")}</p>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-gray-600">
            <span>{t("form.bankName")}</span><span>{data.bankInfo.bankName}</span>
            <span>{t("form.bankSwift")}</span><span>{data.bankInfo.bankSwift}</span>
            <span>{t("form.accountNo")}</span><span>{data.bankInfo.accountNo}</span>
            <span>{t("form.accountee")}</span><span>{data.bankInfo.accountee}</span>
            {data.bankInfo.bankAddress && <><span>{t("form.bankAddress")}</span><span>{data.bankInfo.bankAddress}</span></>}
            {data.bankInfo.bankTel && <><span>{t("form.bankTel")}</span><span>{data.bankInfo.bankTel}</span></>}
          </div>
        </div>
      )}
    </div>
  );
}
