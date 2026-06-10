import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, FolderInput, Printer } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/entities/session";
import { generatePdf } from "@/features/export-pdf";
import { InvoiceDetailSkeleton } from "@/features/history";
import {
  createShipment,
  dealToForm,
  deleteShipment,
  getDealBundle,
  issueDocument,
  nextSeq,
  quantityWarningKeys,
  remainingAllocations,
  suggestDocNo,
  updateShipmentAllocations,
  updateShipmentCharges,
} from "@/features/deal-crud";
import type { DealBundle } from "@/features/deal-crud";
import { triggerPrint } from "@/features/print";
import { Coachmark } from "@/features/service-guide";
import { validateDocument } from "@/entities/invoice";
import type { InvoiceDraft, AdditionalCharge, ChargeType } from "@/entities/invoice";
import { setLastDocType } from "@/entities/document";
import type { DocType } from "@/entities/document";
import type { Allocation, PackingLine } from "@/entities/shipment";
import { InvoicePreviewPanel } from "@/widgets/InvoicePreview";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { ShipmentManager } from "@/widgets/ShipmentManager";
import { ChargesEditor } from "@/widgets/ChargesEditor";
import { Button, Layout } from "@/shared/ui";

/**
 * 발행 플로우(상세/발행 분리): 선적 선택·배분/포장 편집 → 양식별 옵션(CI 비용, PL 가격 토글)
 * → 미리보기 → 발행. CI/PL 전용 — 발행 후 거래 상세로 복귀한다.
 */
export function DealIssuePage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { dealId, docType } = useParams<{ dealId: string; docType: string }>();
  const variant: DocType | null = docType === "CI" || docType === "PL" ? docType : null;

  const [bundle, setBundle] = useState<DealBundle | null>(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeShipmentId, setActiveShipmentId] = useState<string | null>(null);
  const [issuing, setIssuing] = useState(false);
  // PL 가격 표시 토글(기본 숨김). 발행 시 fieldOptions로 박제된다(#25).
  const [plShowPrice, setPlShowPrice] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [dealId, docType]);

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
  const dealForm = useMemo(() => (bundle ? dealToForm(bundle.deal, pi) : null), [bundle, pi]);
  const activeShipment = useMemo(
    () => bundle?.shipments.find((s) => s.id === activeShipmentId) ?? null,
    [bundle, activeShipmentId],
  );

  // CI/PL은 활성 선적의 배분 수량으로 렌더(거래 데이터 × 양식).
  const variantData = useMemo<InvoiceDraft | null>(() => {
    if (!bundle || !dealForm || !variant || !activeShipment) return null;
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

  // 활성 선적에 이미 발행된 문서(있으면 재발행 대신 보기로 유도).
  const issuedDoc = useMemo(
    () =>
      bundle?.documents.find((d) => d.docType === variant && d.shipmentId === activeShipmentId) ??
      null,
    [bundle, variant, activeShipmentId],
  );

  function passesValidation(): boolean {
    if (!variantData || !variant) return false;
    // 양식별 차단/경고 + 거래 차원 수량 위반 경고(초과배분/잔여완료)(#27).
    const { blocking, warnings } = validateDocument(variantData, variant);
    if (blocking.length > 0) {
      toast.error(
        `${t("validation.blockedTitle")}: ${blocking.map((k) => t(`validation.${k}`)).join(", ")}`,
      );
      return false;
    }
    const allWarnings = bundle
      ? [...warnings, ...quantityWarningKeys(bundle.deal, bundle.shipments)]
      : warnings;
    if (allWarnings.length > 0) {
      toast.warning(allWarnings.map((k) => t(`validation.${k}`)).join(", "));
    }
    return true;
  }

  async function handlePdf() {
    if (!variantData || !variant || !passesValidation()) return;
    try {
      await generatePdf(variantData, variant);
      setLastDocType(variant);
    } catch {
      toast.error(t("export.pdfFailed"));
    }
  }

  function handlePrint() {
    if (passesValidation()) triggerPrint();
  }

  async function handleIssue() {
    if (!user || !bundle || !variantData || !variant || !activeShipmentId || issuedDoc) return;
    if (!passesValidation()) return;
    setIssuing(true);
    try {
      const docId = await issueDocument(user.id, {
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
      setLastDocType(variant);
      toast.success(t("history.saved"));
      navigate(`/deals/${bundle.deal.id}/docs/${docId}`, { replace: true });
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

  if (!authLoading && !user) return <Navigate to="/login" replace />;
  if (!variant) return <Navigate to={dealId ? `/deals/${dealId}` : "/history"} replace />;

  const isLoading = authLoading || fetching;

  return (
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="historyDetail" />}>
      <div className="max-w-6xl mx-auto px-4 py-6 md:p-8 space-y-6 pb-8">
        {isLoading ? (
          <InvoiceDetailSkeleton />
        ) : notFound || !bundle || !dealForm ? (
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
                onClick={() => navigate(`/deals/${bundle.deal.id}`)}
                className="-ml-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" aria-hidden />
                {t("deal.backToDeal")}
              </Button>
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {dealForm.buyerSnapshot.companyName || dealForm.invoiceNo || t("history.noNumber")}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-primary">
                  {t("deal.issueTitle", { doc: variant })}
                </h1>
              </div>
            </div>

            {/* ① 선적 선택 + 배분/포장 편집 — 첫 분할선적 1회 안내(#28). */}
            <Coachmark id="split-shipment" />
            <ShipmentManager
              deal={bundle.deal}
              shipments={bundle.shipments}
              activeShipmentId={activeShipmentId}
              onSelectShipment={setActiveShipmentId}
              onAddShipment={() => void handleAddShipment()}
              onDeleteShipment={(id) => void handleDeleteShipment(id)}
              onSaveAllocations={(id, allocations) => void handleSaveAllocations(id, allocations)}
            />

            {/* ② 양식별 옵션 */}
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
            {variant === "PL" && (
              <>
                <Coachmark id="field-toggle" />
                <label className="flex w-fit items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={plShowPrice}
                    onChange={(e) => setPlShowPrice(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  {t("deal.showPrice")}
                </label>
              </>
            )}

            {/* ③ 미리보기 → 발행 */}
            <div className="flex flex-wrap items-center gap-2">
              {issuedDoc ? (
                <>
                  <span className="text-sm text-green-600">{t("deal.alreadyIssued")}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/deals/${bundle.deal.id}/docs/${issuedDoc.id}`)}
                  >
                    {t("history.view")}
                  </Button>
                </>
              ) : (
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
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void handlePdf()}>
                <FileText className="size-4" aria-hidden />
                {t("export.pdf")}
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
                <Printer className="size-4" aria-hidden />
                {t("export.print")}
              </Button>
            </div>

            {variantData && (
              <div className="min-h-[500px] rounded-xl border border-border bg-accent overflow-hidden">
                <InvoicePreviewPanel
                  data={variantData}
                  variant={variant}
                  packingLines={plPackingLines}
                  showPrice={plShowPrice}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
