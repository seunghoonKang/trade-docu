import { useEffect, useEffectEvent, useRef, useState } from "react";
import { createEmptyInvoice } from "@/entities/invoice";
import { peekPendingInvoiceLoad } from "@/entities/invoice";
import { clearDraft, isEmptyDraft, loadDraft, saveDraft, type InvoiceDraft } from "@/entities/invoice";

interface UseInvoiceDraftSessionOptions {
  ownerId: string | null;
  authLoading: boolean;
  form: InvoiceDraft;
  loadForm: (data: InvoiceDraft) => void;
  skipDraftResetRef?: React.RefObject<boolean>;
}

export function useInvoiceDraftSession({
  ownerId,
  authLoading,
  form,
  loadForm,
  skipDraftResetRef,
}: UseInvoiceDraftSessionOptions) {
  const [pendingDraft, setPendingDraft] = useState<InvoiceDraft | null>(null);
  const syncedOwnerRef = useRef<string | null | undefined>(undefined);

  const syncDraftSession = useEffectEvent(() => {
    if (peekPendingInvoiceLoad()) return;

    const draft = loadDraft(ownerId);
    setPendingDraft(draft && !isEmptyDraft(draft) ? draft : null);

    if (skipDraftResetRef?.current) {
      skipDraftResetRef.current = false;
      syncedOwnerRef.current = ownerId;
      return;
    }

    if (syncedOwnerRef.current === ownerId) return;

    syncedOwnerRef.current = ownerId;
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
