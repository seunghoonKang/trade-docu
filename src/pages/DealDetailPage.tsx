import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, FolderInput, Printer, Trash2 } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/entities/session";
import { generatePdf } from "@/features/export-pdf";
import { InvoiceDetailSkeleton } from "@/features/history";
import {
  computeBalance,
  createShipment,
  dealToForm,
  deleteDeal,
  deleteShipment,
  getDealBundle,
  issueDocument,
  nextSeq,
  remainingAllocations,
  setDealStatus,
  suggestDocNo,
  updateShipmentAllocations,
  updateShipmentCharges,
} from "@/features/deal-crud";
import type { DealBundle } from "@/features/deal-crud";
import { triggerPrint } from "@/features/print";
import { validateInvoice } from "@/entities/invoice";
import type { InvoiceDraft, AdditionalCharge, ChargeType } from "@/entities/invoice";
import type { DocType } from "@/entities/document";
import type { Allocation, PackingLine } from "@/entities/shipment";
import { InvoicePreviewPanel } from "@/widgets/InvoicePreview";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { ShipmentManager } from "@/widgets/ShipmentManager";
import { ChargesEditor } from "@/widgets/ChargesEditor";
import { DealDocumentList } from "@/widgets/DealDocumentList";
import { Button, ConfirmDialog, Layout } from "@/shared/ui";

const TEMPLATES: DocType[] = ["PI", "CI", "PL"];

export function DealDetailPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { dealId } = useParams<{ dealId: string }>();

  const [bundle, setBundle] = useState<DealBundle | null>(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [variant, setVariant] = useState<DocType>("PI");
  const [activeShipmentId, setActiveShipmentId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [issuing, setIssuing] = useState(false);
  // PL 가격 표시 토글(기본 숨김). 발행 시 fieldOptions로 박제된다(#25).
  const [plShowPrice, setPlShowPrice] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [dealId]);

  const loadBundle = useCallback(async () => {
    if (!dealId) return;
    setFetching(true);
    setNotFound(false);
    try {
      const data = await getDealBundle(dealId);
      if (!data) {
        setNotFound(true);
        setBundle(null);
      } else {
        setBundle(data);
      }
    } finally {
      setFetching(false);
    }
  }, [dealId]);

  useEffect(() => {
    void loadBundle();
  }, [loadBundle]);

  // 활성 선적: 없거나 사라졌으면 첫 선적으로.
  useEffect(() => {
    if (!bundle) return;
    setActiveShipmentId((cur) =>
      cur && bundle.shipments.some((s) => s.id === cur) ? cur : (bundle.shipments[0]?.id ?? null),
    );
  }, [bundle]);

  const pi = useMemo(() => bundle?.documents.find((d) => d.docType === "PI") ?? null, [bundle]);
  // PI(거래 건 레벨)는 주문 전체. CI/PL(선적 레벨)은 활성 선적의 배분 수량으로 렌더.
  const dealForm = useMemo(() => (bundle ? dealToForm(bundle.deal, pi) : null), [bundle, pi]);
  const activeShipment = useMemo(
    () => bundle?.shipments.find((s) => s.id === activeShipmentId) ?? null,
    [bundle, activeShipmentId],
  );

  const variantData = useMemo<InvoiceDraft | null>(() => {
    if (!bundle || !dealForm) return dealForm;
    if (variant === "PI" || !activeShipment) return dealForm;
    const allocByItem = new Map(activeShipment.allocations.map((a) => [a.itemId, a.qty]));
    const items = bundle.deal.items.map((it) => {
      const qty = allocByItem.get(it.id) ?? 0;
      return {
        description: it.description,
        hsCode: it.hsCode,
        qty,
        unit: it.unit,
        unitPrice: it.unitPrice,
        amount: qty * it.unitPrice,
        remarks: it.remarks,
      };
    });
    const goods = items.reduce((sum, i) => sum + i.amount, 0);
    // CI는 선적 레벨 비용, PL은 가격 숨김(비용 없음).
    const additionalCharges: AdditionalCharge[] =
      variant === "CI"
        ? activeShipment.charges.map((c) => ({
            type: (c.type as ChargeType) || "other",
            description: c.label,
            amount: c.amount,
          }))
        : [];
    const chargesTotal = additionalCharges.reduce((sum, c) => sum + c.amount, 0);
    return {
      ...dealForm,
      items,
      additionalCharges,
      totalAmount: goods + chargesTotal,
      invoiceNo: suggestDocNo(dealForm.invoiceNo, activeShipment.seq),
    };
  }, [bundle, dealForm, variant, activeShipment]);

  // PL per-line 포장: 활성 선적 배분에서 items와 같은 순서로 추출(채운 항목만 PL에 출력).
  const plPackingLines = useMemo<PackingLine[]>(() => {
    if (!bundle || !activeShipment) return [];
    const allocByItem = new Map(activeShipment.allocations.map((a) => [a.itemId, a]));
    return bundle.deal.items.map((it) => {
      const a = allocByItem.get(it.id);
      return a
        ? {
            cartonQty: a.cartonQty,
            netWeight: a.netWeight,
            grossWeight: a.grossWeight,
            cbm: a.cbm,
            cartonNo: a.cartonNo,
          }
        : {};
    });
  }, [bundle, activeShipment]);

  // CI 선적 비용 편집 초안(활성 선적/데이터 변경 시 동기화).
  const [ciCharges, setCiCharges] = useState<AdditionalCharge[]>([]);
  useEffect(() => {
    setCiCharges(
      activeShipment
        ? activeShipment.charges.map((c) => ({
            type: (c.type as ChargeType) || "other",
            description: c.label,
            amount: c.amount,
          }))
        : [],
    );
  }, [activeShipmentId, bundle]); // eslint-disable-line react-hooks/exhaustive-deps

  // 탭 발행 배지: PI는 거래 건 레벨, CI/PL은 활성 선적 레벨.
  const issuedForTab = useCallback(
    (tpl: DocType): boolean => {
      if (!bundle) return false;
      if (tpl === "PI") return bundle.documents.some((d) => d.docType === "PI");
      return bundle.documents.some((d) => d.docType === tpl && d.shipmentId === activeShipmentId);
    },
    [bundle, activeShipmentId],
  );

  function passesValidation(): boolean {
    if (!variantData) return false;
    const { blocking, warnings } = validateInvoice(variantData);
    if (blocking.length > 0) {
      toast.error(
        `${t("validation.blockedTitle")}: ${blocking.map((k) => t(`validation.${k}`)).join(", ")}`,
      );
      return false;
    }
    if (warnings.length > 0) {
      toast.warning(warnings.map((k) => t(`validation.${k}`)).join(", "));
    }
    return true;
  }

  async function handlePdf() {
    if (!variantData || !passesValidation()) return;
    try {
      await generatePdf(variantData, variant);
    } catch {
      toast.error(t("export.pdfFailed"));
    }
  }

  function handlePrint() {
    if (passesValidation()) triggerPrint();
  }

  async function handleIssue() {
    if (!user || !bundle || !variantData || variant === "PI" || !activeShipmentId) return;
    setIssuing(true);
    try {
      await issueDocument(user.id, {
        dealId: bundle.deal.id,
        shipmentId: activeShipmentId,
        docType: variant,
        docNo: variantData.invoiceNo,
        docDate: variantData.date,
        fieldOptions: variant === "PL" ? { showPrice: plShowPrice } : {},
        snapshot: (variant === "PL"
          ? { ...variantData, packingLines: plPackingLines, showPrice: plShowPrice }
          : variantData) as unknown as Record<string, unknown>,
      });
      toast.success(t("history.saved"));
      await loadBundle();
    } finally {
      setIssuing(false);
    }
  }

  async function handleAddShipment() {
    if (!user || !bundle) return;
    const id = await createShipment(
      user.id,
      bundle.deal.id,
      nextSeq(bundle.shipments),
      remainingAllocations(bundle.deal, bundle.shipments),
    );
    setActiveShipmentId(id);
    await loadBundle();
  }

  async function handleDeleteShipment(id: string) {
    if (!bundle || bundle.shipments.length <= 1) return;
    await deleteShipment(id);
    await loadBundle();
  }

  async function handleSaveAllocations(id: string, allocations: Allocation[]) {
    await updateShipmentAllocations(id, allocations);
    toast.success(t("deal.save"));
    await loadBundle();
  }

  async function handleSaveCharges() {
    if (!activeShipmentId) return;
    await updateShipmentCharges(
      activeShipmentId,
      ciCharges.map((c) => ({ type: c.type ?? "other", label: c.description, amount: c.amount })),
    );
    toast.success(t("deal.save"));
    await loadBundle();
  }

  async function handleCompleteDeal() {
    if (!bundle) return;
    if (computeBalance(bundle.deal, bundle.shipments).hasRemaining) {
      toast.warning(t("deal.remainingWarning"));
    }
    await setDealStatus(bundle.deal.id, "closed");
    toast.success(t("deal.complete"));
    await loadBundle();
  }

  async function handleDelete() {
    if (!bundle) return;
    await deleteDeal(bundle.deal.id);
    toast.success(t("history.deleted"));
    navigate("/history");
  }

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  const isLoading = authLoading || fetching;
  const dealTitle = dealForm?.buyerSnapshot.companyName || dealForm?.invoiceNo || t("history.noNumber");

  return (
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="historyDetail" />}>
      <div className="max-w-6xl mx-auto px-4 py-6 md:p-8 space-y-6 pb-8">
        {isLoading ? (
          <InvoiceDetailSkeleton />
        ) : notFound || !bundle || !variantData || !dealForm ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <p className="text-muted-foreground">{t("history.detailNotFound")}</p>
            <Button variant="outline" className="gap-1.5" onClick={() => navigate("/history")}>
              <ArrowLeft className="size-4" aria-hidden />
              {t("history.backToList")}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate("/history")}
                className="-ml-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" aria-hidden />
                {t("history.backToList")}
              </Button>

              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("deal.documents")}
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold text-primary truncate">{dealTitle}</h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={bundle.deal.status === "closed"}
                    onClick={() => void handleCompleteDeal()}
                  >
                    <CheckCircle2 className="size-4" aria-hidden />
                    {t("deal.complete")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    {t("history.delete")}
                  </Button>
                </div>
              </div>
            </div>

            <ShipmentManager
              deal={bundle.deal}
              shipments={bundle.shipments}
              activeShipmentId={activeShipmentId}
              onSelectShipment={setActiveShipmentId}
              onAddShipment={() => void handleAddShipment()}
              onDeleteShipment={(id) => void handleDeleteShipment(id)}
              onSaveAllocations={(id, allocations) => void handleSaveAllocations(id, allocations)}
            />

            {/* 발행 문서 리스트 — 클릭하면 해당 선적 + 양식 탭을 연다(혼합 UI, #26). */}
            <DealDocumentList
              documents={bundle.documents}
              shipments={bundle.shipments}
              onOpen={(doc) => {
                if (doc.shipmentId) setActiveShipmentId(doc.shipmentId);
                setVariant(doc.docType);
              }}
            />

            {/* 양식 탭 — PI는 거래 건 전체, CI/PL은 활성 선적 배분 수량으로 렌더. */}
            <div className="flex items-center gap-1 border-b border-border">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => setVariant(tpl)}
                  className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
                    variant === tpl
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tpl}
                  {issuedForTab(tpl) && <span className="ml-1.5 text-green-600">✓</span>}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void handlePdf()}>
                <FileText className="size-4" aria-hidden />
                {t("export.pdf")}
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
                <Printer className="size-4" aria-hidden />
                {t("export.print")}
              </Button>
              {variant !== "PI" && !issuedForTab(variant) && (
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5"
                  disabled={issuing}
                  onClick={() => void handleIssue()}
                >
                  <FolderInput className="size-4" aria-hidden />
                  {t("deal.issue")} {variant}
                </Button>
              )}
              {variant !== "PI" && issuedForTab(variant) && (
                <span className="text-sm text-green-600">{t("deal.issued")}</span>
              )}
              {variant === "PL" && (
                <label className="ml-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={plShowPrice}
                    onChange={(e) => setPlShowPrice(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  {t("deal.showPrice")}
                </label>
              )}
            </div>

            {variant === "CI" && (
              <div className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{t("form.additionalCharges")}</h3>
                  <Button variant="default" size="sm" onClick={() => void handleSaveCharges()}>
                    {t("deal.save")}
                  </Button>
                </div>
                <ChargesEditor charges={ciCharges} currency={bundle.deal.currency} onChange={setCiCharges} />
              </div>
            )}

            <div className="min-h-[500px] rounded-xl border border-border bg-accent overflow-hidden">
              <InvoicePreviewPanel
                data={variantData}
                variant={variant}
                packingLines={plPackingLines}
                showPrice={plShowPrice}
              />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t("history.confirmDeleteTitle")}
        description={t("history.confirmDeleteDescription", {
          id: dealForm?.invoiceNo || t("history.noNumber"),
        })}
        descriptionNote={t("history.confirmDeleteNote")}
        confirmLabel={t("history.delete")}
        cancelLabel={t("history.cancel")}
        destructive
        onConfirm={() => {
          setConfirmDelete(false);
          void handleDelete();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </Layout>
  );
}
