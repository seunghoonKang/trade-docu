import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { Invoice } from "@/entities/invoice/model";
import { clearDraft } from "@/features/draft-autosave";
import { consumePendingInvoiceLoad } from "./pendingLoad";

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

  useLayoutEffect(() => {
    if (authLoading) return;

    const fromState = (location.state as RestoreLocationState | null)?.restoreInvoice;
    const fromStorage = consumePendingInvoiceLoad();
    const pending = fromState ?? fromStorage;

    if (!pending) return;

    loadForm(pending);
    clearDraft();
    skipSellerPrefillRef.current = true;
    skipDraftResetRef.current = true;
    toast.success(t("history.loaded"));

    if (fromState) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [authLoading, loadForm, location.pathname, location.state, navigate, t]);

  return { skipSellerPrefillRef, skipDraftResetRef };
}

export function toInvoiceFormData(invoice: Invoice): InvoiceFormData {
  const { id: _id, userId: _userId, createdAt: _createdAt, ...formData } = invoice;
  return formData;
}
