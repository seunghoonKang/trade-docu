import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DocumentInfoSection } from "./DocumentInfoSection";
import { SellerSection } from "./SellerSection";
import { BuyerSection } from "./BuyerSection";
import { TradeTermsSection } from "./TradeTermsSection";
import { ItemsTableSection } from "./ItemsTableSection";
import { AdditionalChargesSection } from "./AdditionalChargesSection";
import { BankInfoSection } from "./BankInfoSection";
import type { useInvoiceForm } from "../lib/useInvoiceForm";

type InvoiceFormProps = ReturnType<typeof useInvoiceForm>;

export function InvoiceForm({
  form, updateField, updateBuyer, updateBankInfo,
  updateItem, addItem, removeItem,
  updateCharge, addCharge, removeCharge,
}: InvoiceFormProps) {
  const { t } = useTranslation();
  return (
    <div className="relative space-y-6 p-6 pb-24">
      <h1 className="text-2xl font-semibold tracking-tight text-primary">{t("editor.title")}</h1>

      <DocumentInfoSection invoiceNo={form.invoiceNo} refNo={form.refNo} orderNo={form.orderNo} date={form.date} validity={form.validity} onUpdate={(key, value) => updateField(key as any, value)} />
      <SellerSection companyName={form.sellerCompanyName} address={form.sellerAddress} tel={form.sellerTel} fax={form.sellerFax} representative={form.sellerRepresentative} onUpdate={(key, value) => updateField(key as any, value)} />
      <BuyerSection companyName={form.buyerSnapshot.companyName} address={form.buyerSnapshot.address} tel={form.buyerSnapshot.tel} contactPerson={form.buyerSnapshot.contactPerson} onUpdate={(key, value) => updateBuyer(key as any, value)} />
      <TradeTermsSection commodity={form.commodity} currency={form.currency} paymentTerms={form.paymentTerms} incoterms={form.incoterms} delivery={form.delivery} packing={form.packing} remarks={form.remarks} onUpdate={(key, value) => updateField(key as any, value)} />
      <ItemsTableSection items={form.items} currency={form.currency} totalAmount={form.totalAmount} onUpdateItem={updateItem} onAddItem={addItem} onRemoveItem={removeItem} />
      <AdditionalChargesSection charges={form.additionalCharges} onUpdateCharge={updateCharge} onAddCharge={addCharge} onRemoveCharge={removeCharge} />
      <BankInfoSection bankInfo={form.bankInfo} onUpdate={updateBankInfo} />

      <div className="sticky bottom-0 z-30 flex justify-center pb-4 pt-2 lg:justify-end">
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-xs font-semibold tracking-wide text-primary-foreground shadow-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
        >
          <Plus className="size-5" aria-hidden />
          {t("form.addItemCta")}
        </button>
      </div>
    </div>
  );
}
