import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookUser, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/entities/session";
import type { Buyer } from "@/entities/buyer";
import {
  BuyerFormModal,
  createBuyer,
  deleteBuyer,
  filterBuyers,
  listBuyers,
  sortBuyersByRecentUse,
  updateBuyer,
} from "@/features/buyer-management";
import type { BuyerInput } from "@/features/buyer-management";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { Button, ConfirmDialog, Layout, Skeleton, editorInputClassName } from "@/shared/ui";

/** 거래처 관리(#49) — 역할 무관 연락처 카드의 목록·생성·수정·삭제. 로그인 전용(ADR-0002). */
export function BuyersPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [fetching, setFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Buyer | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Buyer | null>(null);

  useEffect(() => {
    if (!user) {
      setBuyers([]);
      setFetching(false);
      return;
    }
    setFetching(true);
    listBuyers(user.id)
      .then(setBuyers)
      .catch(() => toast.error(t("buyers.loadFailed")))
      .finally(() => setFetching(false));
  }, [user, t]);

  if (!loading && !user) return <Navigate to="/login" replace />;

  const isLoading = loading || fetching;
  const filtered = filterBuyers(buyers, query);

  function openCreate() {
    setEditing(null);
    setEditorOpen(true);
  }

  function openEdit(buyer: Buyer) {
    setEditing(buyer);
    setEditorOpen(true);
  }

  async function handleSubmit(values: BuyerInput) {
    if (!user) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateBuyer(editing.id, values);
        setBuyers((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      } else {
        const created = await createBuyer(user.id, values);
        setBuyers((prev) => sortBuyersByRecentUse([created, ...prev]));
      }
      setEditorOpen(false);
      toast.success(t("buyers.saved"));
    } catch {
      toast.error(t("buyers.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(buyer: Buyer) {
    try {
      await deleteBuyer(buyer.id);
      setBuyers((prev) => prev.filter((b) => b.id !== buyer.id));
      toast.success(t("buyers.deleted"));
    } catch {
      toast.error(t("buyers.deleteFailed"));
    }
  }

  return (
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="buyers" />}>
      <div className="max-w-6xl mx-auto px-4 py-6 md:p-8 space-y-6 pb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" aria-hidden />
            <input
              type="search"
              className={`${editorInputClassName} pl-9`}
              placeholder={t("buyers.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button className="gap-1.5 shrink-0" onClick={openCreate}>
            <Plus className="size-4 shrink-0" aria-hidden />
            {t("buyers.add")}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : buyers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
            <BookUser className="size-10 text-muted-foreground/50" aria-hidden />
            <p className="text-sm font-medium text-foreground">{t("buyers.emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("buyers.emptyDescription")}</p>
            <Button className="mt-2 gap-1.5" onClick={openCreate}>
              <Plus className="size-4 shrink-0" aria-hidden />
              {t("buyers.add")}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">{t("form.companyName")}</th>
                  <th className="px-4 py-3">{t("form.contactPerson")}</th>
                  <th className="px-4 py-3">{t("form.tel")}</th>
                  <th className="px-4 py-3">{t("form.address")}</th>
                  <th className="px-4 py-3 text-right">{t("buyers.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      {t("buyers.noResults")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((buyer) => (
                    <tr key={buyer.id} className="border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{buyer.companyName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{buyer.contactPerson}</td>
                      <td className="px-4 py-3 text-muted-foreground">{buyer.tel}</td>
                      <td className="max-w-[280px] truncate px-4 py-3 text-muted-foreground">{buyer.address}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-8 p-0"
                            aria-label={t("buyers.edit")}
                            title={t("buyers.edit")}
                            onClick={() => openEdit(buyer)}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-8 p-0 text-muted-foreground hover:text-destructive"
                            aria-label={t("buyers.delete")}
                            title={t("buyers.delete")}
                            onClick={() => setConfirmDelete(buyer)}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BuyerFormModal
        open={editorOpen}
        initial={editing}
        buyers={buyers}
        saving={saving}
        onSubmit={(values) => void handleSubmit(values)}
        onClose={() => setEditorOpen(false)}
      />

      <ConfirmDialog
        open={confirmDelete !== null}
        title={t("buyers.confirmDeleteTitle")}
        description={t("buyers.confirmDeleteDescription", { name: confirmDelete?.companyName ?? "" })}
        descriptionNote={t("buyers.confirmDeleteNote")}
        confirmLabel={t("buyers.delete")}
        cancelLabel={t("buyers.cancel")}
        destructive
        onConfirm={() => {
          if (!confirmDelete) return;
          setConfirmDelete(null);
          void handleDelete(confirmDelete);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </Layout>
  );
}
