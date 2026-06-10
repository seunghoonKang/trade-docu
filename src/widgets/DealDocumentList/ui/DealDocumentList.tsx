import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TradeDocument } from "@/entities/document";
import type { Shipment } from "@/entities/shipment";

interface Props {
  documents: TradeDocument[];
  shipments: Shipment[];
  onOpen: (doc: TradeDocument) => void;
}

/**
 * 거래 건 상세의 발행 문서 리스트(#26): PI(거래 건 레벨)·CI/PL(선적 레벨)을 발행 배지와
 * 함께 보여주고, 클릭하면 해당 선적 + 양식 탭을 연다(혼합 UI). 발행 문서가 없으면 숨긴다.
 */
export function DealDocumentList({ documents, shipments, onOpen }: Props) {
  const { t } = useTranslation();
  if (documents.length === 0) return null;

  const seqByShipment = new Map(shipments.map((s) => [s.id, s.seq]));

  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="mb-3 text-sm font-semibold">{t("deal.issuedDocuments")}</h3>
      <ul className="divide-y divide-border/60">
        {documents.map((doc) => {
          const seq = doc.shipmentId ? seqByShipment.get(doc.shipmentId) : null;
          return (
            <li key={doc.id}>
              <button
                type="button"
                onClick={() => onOpen(doc)}
                className="flex w-full items-center gap-3 py-2 text-left text-sm hover:bg-muted/30 transition-colors rounded"
              >
                <span className="inline-flex items-center rounded border border-primary/30 bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                  {doc.docType}
                </span>
                <span className="font-medium text-foreground">
                  {doc.docNo || t("history.noNumber")}
                </span>
                {seq != null && (
                  <span className="text-xs text-muted-foreground">
                    {t("deal.shipment")} {seq}
                  </span>
                )}
                <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                  {doc.docDate || new Date(doc.createdAt).toLocaleDateString()}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
