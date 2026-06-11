import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button, Skeleton, editorInputClassName } from "@/shared/ui";
import { useAuth } from "@/entities/session";
import type { Buyer } from "@/entities/buyer";
import { createBuyer, listBuyers, touchBuyerLastUsed } from "../api";
import { filterBuyers } from "../lib";
import { BuyerFormModal } from "./BuyerFormModal";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (buyer: Buyer) => void;
}

/** 거래처 불러오기 — 배송지 선택 패턴: 목록(검색) → 선택, 없으면 추가하기 → 즉시 선택(#49). */
export function BuyerPickerModal({ open, onClose, onSelect }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setQuery("");
    setLoading(true);
    listBuyers(user.id)
      .then(setBuyers)
      .catch(() => toast.error(t("buyers.loadFailed")))
      .finally(() => setLoading(false));
  }, [open, user, t]);

  if (!open || !user) return null;

  const filtered = filterBuyers(buyers, query);

  function handleSelect(buyer: Buyer) {
    // 최근 사용순 정렬 기준 — 실패해도 선택 흐름은 막지 않는다.
    void touchBuyerLastUsed(buyer.id).catch(() => {});
    onSelect(buyer);
    onClose();
  }

  async function handleCreate(values: Parameters<typeof createBuyer>[1]) {
    if (!user) return;
    setSaving(true);
    try {
      const created = await createBuyer(user.id, values);
      setAdding(false);
      handleSelect(created);
    } catch {
      toast.error(t("buyers.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="buyer-picker-title"
          className="bg-card rounded-lg border border-border w-full max-w-lg p-6 shadow-lg flex flex-col max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-2">
            <h2 id="buyer-picker-title" className="text-lg font-semibold text-primary">
              {t("buyers.pickerTitle")}
            </h2>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAdding(true)}>
              <Plus className="size-4 shrink-0" aria-hidden />
              {t("buyers.add")}
            </Button>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" aria-hidden />
            <input
              type="search"
              className={`${editorInputClassName} pl-9`}
              placeholder={t("buyers.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="mt-3 -mx-2 flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 px-2 py-1">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                {buyers.length === 0 ? t("buyers.pickerEmpty") : t("buyers.noResults")}
              </p>
            ) : (
              <ul>
                {filtered.map((buyer) => (
                  <li key={buyer.id}>
                    <button
                      type="button"
                      className="w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
                      onClick={() => handleSelect(buyer)}
                    >
                      <span className="block truncate text-sm font-medium text-foreground">
                        {buyer.companyName}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {[buyer.contactPerson, buyer.tel, buyer.address].filter(Boolean).join(" · ")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <BuyerFormModal
        open={adding}
        initial={null}
        buyers={buyers}
        saving={saving}
        onSubmit={(values) => void handleCreate(values)}
        onClose={() => setAdding(false)}
      />
    </>
  );
}
