import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, FileText, FolderInput, Printer } from "lucide-react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/entities/session";
import { generatePdf } from "@/features/export-pdf";
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
  updateDealOriginCountry,
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
import { normalizeAllocation } from "@/entities/shipment";
import type { Allocation, PackingLine, Shipment } from "@/entities/shipment";
import { InvoicePreviewPanel } from "@/widgets/InvoicePreview";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { ShipmentManager } from "@/widgets/ShipmentManager";
import { ChargesEditor } from "@/widgets/ChargesEditor";
import { Button, ConfirmDialog, Input, Layout, Skeleton } from "@/shared/ui";

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
  // 재발행 진입 등에서 ?shipment=:id로 특정 선적을 미리 선택한다.
  const [searchParams] = useSearchParams();
  const preferredShipmentId = searchParams.get("shipment");

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

  // 선적 초안(자동 반영) — 입력 즉시 미리보기에 반영하고, 디바운스로 조용히 서버 저장한다.
  const [shipments, setShipments] = useState<Shipment[]>([]);
  useEffect(() => {
    setShipments(bundle?.shipments ?? []);
  }, [bundle]);

  const pendingSaves = useRef<Map<string, { timer: number; allocations: Allocation[] }>>(new Map());

  function handleChangeAllocations(shipmentId: string, allocations: Allocation[]) {
    setShipments((prev) => prev.map((s) => (s.id === shipmentId ? { ...s, allocations } : s)));
    const pending = pendingSaves.current.get(shipmentId);
    if (pending) window.clearTimeout(pending.timer);
    const timer = window.setTimeout(() => {
      pendingSaves.current.delete(shipmentId);
      void updateShipmentAllocations(shipmentId, allocations.map(normalizeAllocation));
    }, 600);
    pendingSaves.current.set(shipmentId, { timer, allocations });
  }

  // 선적 추가/삭제/발행 전엔 대기 중인 저장을 먼저 비운다(서버-초안 불일치 방지).
  const flushPendingSaves = useCallback(async () => {
    const entries = [...pendingSaves.current.entries()];
    pendingSaves.current.clear();
    await Promise.all(
      entries.map(([id, pending]) => {
        window.clearTimeout(pending.timer);
        return updateShipmentAllocations(id, pending.allocations.map(normalizeAllocation));
      }),
    );
  }, []);

  useEffect(() => {
    return () => {
      // 페이지 이탈 시 잔여 저장 flush(베스트 에포트).
      void flushPendingSaves();
    };
  }, [flushPendingSaves]);

  // 활성 선적: 유지 → URL 지정(?shipment=) → 첫 선적 순.
  useEffect(() => {
    if (!bundle) return;
    setActiveShipmentId((cur) => {
      if (cur && bundle.shipments.some((s) => s.id === cur)) return cur;
      if (preferredShipmentId && bundle.shipments.some((s) => s.id === preferredShipmentId)) {
        return preferredShipmentId;
      }
      return bundle.shipments[0]?.id ?? null;
    });
  }, [bundle, preferredShipmentId]);

  const pi = useMemo(() => bundle?.documents.find((d) => d.docType === "PI") ?? null, [bundle]);
  const dealForm = useMemo(() => (bundle ? dealToForm(bundle.deal, pi) : null), [bundle, pi]);
  const activeShipment = useMemo(
    () => shipments.find((s) => s.id === activeShipmentId) ?? null,
    [shipments, activeShipmentId],
  );

  // CI 원산지 초안(거래 건 레벨) — 미리보기에 즉시 반영, 저장 시 거래 건에 기록.
  const [ciOrigin, setCiOrigin] = useState("");
  useEffect(() => {
    setCiOrigin(bundle?.deal.originCountry ?? "");
  }, [bundle]);

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
      ...(variant === "CI" ? { originCountry: ciOrigin } : {}),
    };
  }, [bundle, dealForm, variant, activeShipment, ciOrigin]);

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
      ? [...warnings, ...quantityWarningKeys(bundle.deal, shipments)]
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

  // 원산지 없이 CI 발행 시 토스트 대신 확인 팝업으로 묻는다(연속 토스트 가독성 문제).
  const [confirmNoOrigin, setConfirmNoOrigin] = useState(false);

  function handleIssue() {
    if (!user || !bundle || !variantData || !variant || !activeShipmentId || issuedDoc) return;
    const { blocking, warnings } = validateDocument(variantData, variant);
    if (blocking.length > 0) {
      toast.error(
        `${t("validation.blockedTitle")}: ${blocking.map((k) => t(`validation.${k}`)).join(", ")}`,
      );
      return;
    }
    const otherWarnings = [
      ...warnings.filter((k) => k !== "originCountry"),
      ...quantityWarningKeys(bundle.deal, shipments),
    ];
    if (otherWarnings.length > 0) {
      toast.warning(otherWarnings.map((k) => t(`validation.${k}`)).join(", "));
    }
    if (warnings.includes("originCountry")) {
      setConfirmNoOrigin(true);
      return;
    }
    void doIssue();
  }

  async function doIssue() {
    if (!user || !bundle || !variantData || !variant || !activeShipmentId || issuedDoc) return;
    setIssuing(true);
    await flushPendingSaves();
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
    await flushPendingSaves();
    const id = await createShipment(
      user.id,
      bundle.deal.id,
      nextSeq(shipments),
      remainingAllocations(bundle.deal, shipments),
    );
    setActiveShipmentId(id);
    await loadBundle();
  }

  async function handleDeleteShipment(id: string) {
    if (!bundle || shipments.length <= 1) return;
    await flushPendingSaves();
    await deleteShipment(id);
    await loadBundle();
  }

  // CI 옵션 저장: 선적 비용(선적 레벨) + 원산지(거래 건 레벨)를 함께 저장한다.
  async function handleSaveCharges() {
    if (!activeShipmentId || !bundle) return;
    await Promise.all([
      updateShipmentCharges(
        activeShipmentId,
        ciCharges.map((c) => ({ type: c.type ?? "other", label: c.description, amount: c.amount })),
      ),
      updateDealOriginCountry(bundle.deal.id, ciOrigin.trim()),
    ]);
    toast.success(t("deal.save"));
    await loadBundle();
  }

  if (!authLoading && !user) return <Navigate to="/login" replace />;
  if (!variant) return <Navigate to={dealId ? `/deals/${dealId}` : "/history"} replace />;

  const isLoading = authLoading || fetching;

  if (isLoading || notFound || !bundle || !dealForm || bundle.deal.status === "closed") {
    return (
      <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="historyDetail" />}>
        <div className="max-w-6xl mx-auto px-4 py-6 md:p-8 space-y-6 pb-8">
          {isLoading ? (
            <DealIssueSkeleton />
          ) : notFound || !bundle || !dealForm ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <p className="text-muted-foreground">{t("history.detailNotFound")}</p>
              <Button variant="outline" className="gap-1.5" onClick={() => navigate("/history")}>
                <ArrowLeft className="size-4" aria-hidden />
                {t("history.backToList")}
              </Button>
            </div>
          ) : (
            // 완료된 거래는 발행 불가 — 재개 후 발행하도록 안내.
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <p className="text-muted-foreground">{t("deal.closedNotice")}</p>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => navigate(`/deals/${bundle!.deal.id}`)}
              >
                <ArrowLeft className="size-4" aria-hidden />
                {t("deal.backToDeal")}
              </Button>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // 서류 작성과 같은 좌(편집)/우(미리보기) 2분할 — 왼쪽을 만지면 오른쪽이 실시간 반영.
  return (
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="historyDetail" />}>
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {/* 상단 액션 바: 복귀 · 제목 · 발행/PDF/인쇄 */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/deals/${bundle.deal.id}`)}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("deal.backToDeal")}
          </Button>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-primary leading-tight">
              {t("deal.issueTitle", { doc: variant })}
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {dealForm.buyerSnapshot.companyName || dealForm.invoiceNo || t("history.noNumber")}
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
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
                onClick={handleIssue}
              >
                <FolderInput className="size-4" aria-hidden />
                {t("deal.issueDocAction", { doc: variant })}
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
        </div>

        <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
          {/* 좌: 편집(선적/배분 → 양식 옵션) — 서류 작성 폼과 같은 에디터 영역 */}
          <div className="editor-container w-full overflow-y-auto border-b border-border bg-[#cbdbf5] xl:w-1/2 xl:border-b-0 xl:border-r">
            <div className="space-y-6 p-6">
              {/* ① 선적/배분 — 기본 전량, 분할은 옵트인(매트릭스). 입력은 자동 저장. */}
              <div className="rounded-xl border border-border bg-card p-5">
                <ShipmentManager
                  deal={bundle.deal}
                  shipments={shipments}
                  activeShipmentId={activeShipmentId}
                  showPacking={variant === "PL"}
                  onSelectShipment={setActiveShipmentId}
                  onAddShipment={() => void handleAddShipment()}
                  onDeleteShipment={(id) => void handleDeleteShipment(id)}
                  onChangeAllocations={handleChangeAllocations}
                />
                {/* CI/PL이 같은 선적 데이터를 공유한다는 안내 — "두 번 입력" 오해 방지. */}
                <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  {t("deal.sharedShipmentHint")}
                </p>
              </div>

              {/* ② 양식별 옵션 */}
              {variant === "CI" && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{t("deal.ciOptions")}</h3>
                    <Button variant="default" size="sm" onClick={() => void handleSaveCharges()}>
                      {t("deal.save")}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      variant="editor"
                      label={t("form.originCountry")}
                      value={ciOrigin}
                      onChange={(e) => setCiOrigin(e.target.value)}
                    />
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-secondary-foreground">
                      {t("form.additionalCharges")}
                    </h4>
                    <ChargesEditor charges={ciCharges} currency={bundle.deal.currency} onChange={setCiCharges} />
                  </div>
                </div>
              )}
              {variant === "PL" && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
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
                </div>
              )}

              {/* 모바일(xl 미만)에서는 우측 패널이 없으므로 미리보기를 아래에 노출 */}
              {variantData && (
                <div className="min-h-[400px] overflow-hidden rounded-xl border border-border bg-accent xl:hidden">
                  <InvoicePreviewPanel
                    data={variantData}
                    variant={variant}
                    packingLines={plPackingLines}
                    showPrice={plShowPrice}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 우: 실시간 미리보기 — 서류 작성과 동일한 구도 */}
          <div className="hidden min-w-0 bg-accent xl:flex xl:w-1/2">
            {variantData && (
              <InvoicePreviewPanel
                data={variantData}
                variant={variant}
                packingLines={plPackingLines}
                showPrice={plShowPrice}
              />
            )}
          </div>
        </div>
      </div>

      {/* 원산지 없이 발행 확인 — 토스트 연속 노출 대신 명시적으로 묻는다. */}
      <ConfirmDialog
        open={confirmNoOrigin}
        title={t("deal.confirmIssueNoOriginTitle")}
        description={t("deal.confirmIssueNoOriginDescription", { doc: variant })}
        confirmLabel={t("deal.issueDocAction", { doc: variant })}
        cancelLabel={t("history.cancel")}
        onConfirm={() => {
          setConfirmNoOrigin(false);
          void doIssue();
        }}
        onCancel={() => setConfirmNoOrigin(false)}
      />
    </Layout>
  );
}

/** 발행 플로우 레이아웃에 맞춘 스켈레톤(헤더 + 선적/배분 카드 + 옵션 + 버튼 + 프리뷰). */
function DealIssueSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-9 w-44" />
      </div>
      <Skeleton className="h-52 w-full rounded-lg" />
      <Skeleton className="h-28 w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
      <Skeleton className="h-[500px] w-full rounded-xl" />
    </div>
  );
}
