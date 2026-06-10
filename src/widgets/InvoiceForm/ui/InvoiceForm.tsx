import { DocumentInfoSection } from "./DocumentInfoSection";
import { SellerSection } from "./SellerSection";
import { BuyerSection } from "./BuyerSection";
import { PartiesPaymentSection } from "./PartiesPaymentSection";
import { TradeTermsSection } from "./TradeTermsSection";
import { ItemsTableSection } from "./ItemsTableSection";
import { AdditionalChargesSection } from "./AdditionalChargesSection";
import { BankInfoSection } from "./BankInfoSection";
import type { useInvoiceForm } from "../lib/useInvoiceForm";

type InvoiceFormProps = ReturnType<typeof useInvoiceForm>;
type FormValues = InvoiceFormProps["form"];
/** 값이 string인 폼 필드 키 — 섹션들의 (key: string, value: string) 콜백을 안전하게 좁힌다. */
type StringFieldKey = { [K in keyof FormValues]-?: FormValues[K] extends string ? K : never }[keyof FormValues];

export function InvoiceForm({
  form, updateField, updateBuyer, updateBankInfo,
  toggleParty, updateParty, updateLcInfo,
  updateItem, addItem, removeItem,
  updateCharge, addCharge, removeCharge,
}: InvoiceFormProps) {
  const updateTextField = (key: string, value: string) => updateField(key as StringFieldKey, value);
  return (
    <div className="space-y-6 p-6" data-guide="invoice-form">
      <DocumentInfoSection invoiceNo={form.invoiceNo} refNo={form.refNo} orderNo={form.orderNo} date={form.date} validity={form.validity} onUpdate={updateTextField} />
      <SellerSection companyName={form.sellerCompanyName} address={form.sellerAddress} tel={form.sellerTel} fax={form.sellerFax} representative={form.sellerRepresentative} onUpdate={updateTextField} />
      <BuyerSection companyName={form.buyerSnapshot.companyName} address={form.buyerSnapshot.address} tel={form.buyerSnapshot.tel} contactPerson={form.buyerSnapshot.contactPerson} onUpdate={(key, value) => updateBuyer(key as keyof FormValues["buyerSnapshot"], value)} />
      <PartiesPaymentSection
        consignee={form.consignee ?? null}
        notify={form.notify ?? null}
        paymentMethod={form.paymentMethod ?? ""}
        lcInfo={form.lcInfo ?? { no: "", issuingBank: "", date: "" }}
        onToggleParty={toggleParty}
        onUpdateParty={updateParty}
        onUpdatePaymentMethod={(value) => updateField("paymentMethod", value)}
        onUpdateLcInfo={updateLcInfo}
      />
      <TradeTermsSection commodity={form.commodity} currency={form.currency} paymentTerms={form.paymentTerms} incoterms={form.incoterms} delivery={form.delivery} packing={form.packing} remarks={form.remarks} originCountry={form.originCountry ?? ""} onUpdate={updateTextField} />
      <ItemsTableSection items={form.items} currency={form.currency} totalAmount={form.totalAmount} onUpdateItem={updateItem} onAddItem={addItem} onRemoveItem={removeItem} />
      <AdditionalChargesSection charges={form.additionalCharges} currency={form.currency} onUpdateCharge={updateCharge} onAddCharge={addCharge} onRemoveCharge={removeCharge} />
      <BankInfoSection bankInfo={form.bankInfo} onUpdate={updateBankInfo} />
    </div>
  );
}
