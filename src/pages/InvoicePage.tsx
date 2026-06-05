import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/shared/ui";
import { InvoiceForm } from "@/widgets/InvoiceForm";
import { InvoicePreview } from "@/widgets/InvoicePreview";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { InvoiceHistory } from "@/widgets/InvoiceHistory";
import { useInvoiceForm } from "@/widgets/InvoiceForm";
import { useAuth } from "@/app/providers/AuthProvider";
import { getSeller, ProfileNudgeBanner } from "@/features/seller-management";
import { createEmptyInvoice } from "@/entities/invoice/model";
import {
  loadDraft,
  saveDraft,
  clearDraft,
  isEmptyDraft,
  DraftRestoreBanner,
  type InvoiceDraft,
} from "@/features/draft-autosave";

export function InvoicePage() {
  const invoiceForm = useInvoiceForm();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<InvoiceDraft | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      setNeedsProfile(false);
      return;
    }
    getSeller(user.id).then((seller) => {
      if (seller) {
        invoiceForm.updateField("sellerCompanyName", seller.companyName);
        invoiceForm.updateField("sellerAddress", seller.address);
        invoiceForm.updateField("sellerTel", seller.tel);
        invoiceForm.updateField("sellerFax", seller.fax);
        invoiceForm.updateField("sellerRepresentative", seller.representative);
        invoiceForm.updateBankInfo("bankName", seller.bankName);
        invoiceForm.updateBankInfo("bankSwift", seller.bankSwift);
        invoiceForm.updateBankInfo("accountNo", seller.accountNo);
        invoiceForm.updateBankInfo("accountee", seller.accountee);
        invoiceForm.updateBankInfo("bankAddress", seller.bankAddress);
        invoiceForm.updateBankInfo("bankTel", seller.bankTel);
        invoiceForm.updateBankInfo("bankFax", seller.bankFax);
        setNeedsProfile(false);
      } else {
        setNeedsProfile(true);
      }
    });
  }, [user]);

  // Offer to restore a previous draft once, without auto-overwriting the form.
  useEffect(() => {
    const draft = loadDraft();
    if (draft && !isEmptyDraft(draft)) setPendingDraft(draft);
  }, []);

  // Auto-save the working draft (debounced). Paused while a restore banner is
  // pending so an ignored prompt can't clobber the saved draft.
  useEffect(() => {
    if (pendingDraft) return;
    const id = setTimeout(() => {
      if (!isEmptyDraft(invoiceForm.form)) saveDraft(invoiceForm.form);
    }, 500);
    return () => clearTimeout(id);
  }, [invoiceForm.form, pendingDraft]);

  return (
    <Layout toolbar={<ExportToolbar formData={invoiceForm.form} onShowHistory={() => setShowHistory(true)} />}>
      {needsProfile && <ProfileNudgeBanner onComplete={() => navigate("/profile")} />}
      {pendingDraft && (
        <DraftRestoreBanner
          onRestore={() => {
            invoiceForm.loadForm(pendingDraft);
            setPendingDraft(null);
          }}
          onDiscard={() => {
            invoiceForm.loadForm(createEmptyInvoice());
            clearDraft();
            setPendingDraft(null);
          }}
        />
      )}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-57px)]">
        <div className="w-full lg:w-1/2 overflow-y-auto bg-white border-r border-gray-200">
          <InvoiceForm {...invoiceForm} />
        </div>
        <div id="invoice-preview" className="hidden lg:block w-1/2 overflow-y-auto bg-gray-50 p-6">
          <InvoicePreview data={invoiceForm.form} />
        </div>
      </div>
      {showHistory && (
        <InvoiceHistory
          onLoad={(data) => invoiceForm.loadForm(data)}
          onClose={() => setShowHistory(false)}
        />
      )}
    </Layout>
  );
}
