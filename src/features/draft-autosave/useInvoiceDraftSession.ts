import { useEffect, useEffectEvent, useState } from "react";
import { createEmptyInvoice } from "@/entities/invoice/model";
import { clearDraft, isEmptyDraft, loadDraft, saveDraft, type InvoiceDraft } from "./lib";

interface UseInvoiceDraftSessionOptions {
  ownerId: string | null;
  authLoading: boolean;
  form: InvoiceDraft;
  loadForm: (data: InvoiceDraft) => void;
}

export function useInvoiceDraftSession({
  ownerId,
  authLoading,
  form,
  loadForm,
}: UseInvoiceDraftSessionOptions) {
  const [pendingDraft, setPendingDraft] = useState<InvoiceDraft | null>(null);

  const syncDraftSession = useEffectEvent(() => {
    const draft = loadDraft(ownerId);
    setPendingDraft(draft && !isEmptyDraft(draft) ? draft : null);
    loadForm(createEmptyInvoice());
  });

  const autosaveDraft = useEffectEvent(() => {
    if (pendingDraft) return;
    if (!isEmptyDraft(form)) saveDraft(form, ownerId);
  });

  useEffect(() => {
    if (authLoading) return;
    syncDraftSession();
  }, [ownerId, authLoading]);

  useEffect(() => {
    const id = setTimeout(autosaveDraft, 500);
    return () => clearTimeout(id);
  }, [form, pendingDraft]);

  function restorePendingDraft() {
    if (!pendingDraft) return;
    loadForm(pendingDraft);
    setPendingDraft(null);
  }

  function discardPendingDraft() {
    loadForm(createEmptyInvoice());
    clearDraft();
    setPendingDraft(null);
  }

  return {
    pendingDraft,
    restorePendingDraft,
    discardPendingDraft,
  };
}
