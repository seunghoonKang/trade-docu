import { useTranslation } from "react-i18next";
import { DocumentInfoSection } from "./DocumentInfoSection";
import { SellerSection } from "./SellerSection";
import { BuyerSection } from "./BuyerSection";
import { TradeTermsSection } from "./TradeTermsSection";
import { ItemsTableSection } from "./ItemsTableSection";
import { AdditionalChargesSection } from "./AdditionalChargesSection";
import { BankInfoSection } from "./BankInfoSection";
import type { useInvoiceForm } from "./useInvoiceForm";

type InvoiceFormProps = ReturnType<typeof useInvoiceForm>;

export function InvoiceForm({
  form, updateField, updateBuyer, updateBankInfo,
  updateItem, addItem, removeItem,
  updateCharge, addCharge, removeCharge,
}: InvoiceFormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 p-6 overflow-y-auto">
      <DocumentInfoSection invoiceNo={form.invoiceNo} refNo={form.refNo} orderNo={form.orderNo} date={form.date} validity={form.validity} onUpdate={(key, value) => updateField(key as any, value)} />
      <SellerSection companyName={form.sellerCompanyName} address={form.sellerAddress} tel={form.sellerTel} fax={form.sellerFax} representative={form.sellerRepresentative} onUpdate={(key, value) => updateField(key as any, value)} />
      <BuyerSection companyName={form.buyerSnapshot.companyName} address={form.buyerSnapshot.address} tel={form.buyerSnapshot.tel} contactPerson={form.buyerSnapshot.contactPerson} onUpdate={(key, value) => updateBuyer(key as any, value)} />
      <TradeTermsSection commodity={form.commodity} currency={form.currency} paymentTerms={form.paymentTerms} incoterms={form.incoterms} delivery={form.delivery} packing={form.packing} remarks={form.remarks} onUpdate={(key, value) => updateField(key as any, value)} />
      <ItemsTableSection items={form.items} currency={form.currency} onUpdateItem={updateItem} onAddItem={addItem} onRemoveItem={removeItem} />
      <AdditionalChargesSection charges={form.additionalCharges} currency={form.currency} onUpdateCharge={updateCharge} onAddCharge={addCharge} onRemoveCharge={removeCharge} />
      <BankInfoSection bankInfo={form.bankInfo} onUpdate={updateBankInfo} />
      <div className="text-right text-lg font-bold text-gray-900 border-t-2 border-gray-900 pt-3">
        {t("form.total")}: {form.currency} {form.totalAmount.toFixed(2)}
      </div>
    </div>
  );
}
