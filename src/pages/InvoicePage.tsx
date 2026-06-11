import { useEffect, useEffectEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/shared/ui";
import { InvoiceForm } from "@/widgets/InvoiceForm";
import { InvoicePreviewPanel } from "@/widgets/InvoicePreview";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { useInvoiceForm } from "@/widgets/InvoiceForm";
import { useAuth } from "@/entities/session";
import { useRestoreInvoiceFromHistory } from "@/features/invoice-crud";
import { DraftRestoreBanner, useInvoiceDraftSession } from "@/features/draft-autosave";
import { ProfileNudgeBanner, dismissProfileNudge, isProfileNudgeDismissed } from "@/features/seller-management";
import { getSeller } from "@/entities/seller";
import type { BankInfo } from "@/shared/lib/bankInfo";
import type { Seller } from "@/entities/seller";
import type { DocType } from "@/entities/document";

export function InvoicePage() {
  const invoiceForm = useInvoiceForm();
  // 단건 작성 양식(#31): /new?doc=CI|PL 이면 그 양식으로 미리보기·내보내기(기본 PI).
  const [searchParams] = useSearchParams();
  const docParam = searchParams.get("doc");
  const docType: DocType = docParam === "CI" || docParam === "PL" ? docParam : "PI";
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
      invoiceForm.updateField("sellerSignatureUrl", seller.signatureUrl);
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
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar formData={invoiceForm.form} page="documents" docType={docType} />}>
      <div className="flex h-[calc(100vh-4rem)] flex-col">
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
        <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
          <div className="editor-container w-full overflow-y-auto border-b border-border bg-secondary xl:w-1/2 xl:border-b-0 xl:border-r">
            <InvoiceForm {...invoiceForm} />
          </div>
          <div
            id="invoice-preview"
            data-guide="preview"
            className="hidden min-w-0 xl:flex xl:w-1/2 bg-accent"
          >
            <InvoicePreviewPanel data={invoiceForm.form} variant={docType} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
