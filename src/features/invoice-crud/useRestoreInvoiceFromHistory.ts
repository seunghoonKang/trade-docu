import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { Invoice } from "@/entities/invoice/model";
import { clearDraft } from "@/features/draft-autosave";
import { clearPendingInvoiceLoad, consumePendingInvoiceLoad } from "./pendingLoad";

type InvoiceFormData = Omit<Invoice, "id" | "userId" | "createdAt">;

interface RestoreLocationState {
  restoreInvoice?: InvoiceFormData;
}

interface Options {
  authLoading: boolean;
  loadForm: (data: InvoiceFormData) => void;
}

export function useRestoreInvoiceFromHistory({ authLoading, loadForm }: Options) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const skipSellerPrefillRef = useRef(false);
  const skipDraftResetRef = useRef(false);
  const restoredFromStateRef = useRef(false);

  useLayoutEffect(() => {
    if (authLoading) return;

    const fromState = (location.state as RestoreLocationState | null)?.restoreInvoice;

    if (fromState) {
      if (restoredFromStateRef.current) {
        navigate(location.pathname, { replace: true, state: null });
        return;
      }
      restoredFromStateRef.current = true;
      clearPendingInvoiceLoad();
      loadForm(fromState);
      clearDraft();
      skipSellerPrefillRef.current = true;
      skipDraftResetRef.current = true;
      toast.success(t("history.loaded"));
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    restoredFromStateRef.current = false;

    const fromStorage = consumePendingInvoiceLoad();
    if (!fromStorage) return;

    loadForm(fromStorage);
    clearDraft();
    skipSellerPrefillRef.current = true;
    skipDraftResetRef.current = true;
    toast.success(t("history.loaded"));
  }, [authLoading, loadForm, location.pathname, location.state, navigate, t]);

  return { skipSellerPrefillRef, skipDraftResetRef };
}

export function toInvoiceFormData(invoice: Invoice): InvoiceFormData {
  const { id: _id, userId: _userId, createdAt: _createdAt, ...formData } = invoice;
  return formData;
}
