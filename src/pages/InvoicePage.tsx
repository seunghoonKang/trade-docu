import { useEffect, useEffectEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/shared/ui";
import { InvoiceForm } from "@/widgets/InvoiceForm";
import { InvoicePreview } from "@/widgets/InvoicePreview";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { useInvoiceForm } from "@/widgets/InvoiceForm";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRestoreInvoiceFromHistory } from "@/features/invoice-crud";
import { DraftRestoreBanner, useInvoiceDraftSession } from "@/features/draft-autosave";
import { getSeller, ProfileNudgeBanner, dismissProfileNudge, isProfileNudgeDismissed } from "@/features/seller-management";
import type { BankInfo } from "@/entities/bank-info/model";
import type { Seller } from "@/entities/seller/model";

export function InvoicePage() {
  const invoiceForm = useInvoiceForm();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [needsProfile, setNeedsProfile] = useState(false);
  const [profileNudgeDismissed, setProfileNudgeDismissed] = useState(false);
  const ownerId = user?.id ?? null;

  const { skipSellerPrefillRef, skipDraftResetRef } = useRestoreInvoiceFromHistory({
    authLoading: loading,
    loadForm: invoiceForm.loadForm,
  });

  const { pendingDraft, restorePendingDraft, discardPendingDraft } = useInvoiceDraftSession({
    ownerId,
    authLoading: loading,
    form: invoiceForm.form,
    loadForm: invoiceForm.loadForm,
    skipDraftResetRef,
  });

  const onSellerLoaded = useEffectEvent((seller: (Seller & BankInfo) | null) => {
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

  useEffect(() => {
    if (!user) {
      setNeedsProfile(false);
      setProfileNudgeDismissed(false);
      return;
    }
    setProfileNudgeDismissed(isProfileNudgeDismissed(user.id));
    getSeller(user.id).then((seller) => {
      if (skipSellerPrefillRef.current) {
        skipSellerPrefillRef.current = false;
        return;
      }
      onSellerLoaded(seller);
    });
  }, [user]);

  return (
    <Layout toolbar={<ExportToolbar formData={invoiceForm.form} page="documents" />}>
      {needsProfile && !profileNudgeDismissed && (
        <ProfileNudgeBanner
          onComplete={() => navigate("/profile")}
          onDismiss={() => {
            if (user) dismissProfileNudge(user.id);
            setProfileNudgeDismissed(true);
          }}
        />
      )}
      {pendingDraft && (
        <DraftRestoreBanner onRestore={restorePendingDraft} onDiscard={discardPendingDraft} />
      )}
      <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
        <div className="editor-container w-full overflow-y-auto border-b border-border bg-[#cbdbf5] lg:w-1/2 lg:border-b-0 lg:border-r">
          <InvoiceForm {...invoiceForm} />
        </div>
        <div id="invoice-preview" className="hidden w-1/2 overflow-y-auto bg-accent lg:flex lg:justify-center lg:p-8">
          <InvoicePreview data={invoiceForm.form} />
        </div>
      </div>
    </Layout>
  );
}
