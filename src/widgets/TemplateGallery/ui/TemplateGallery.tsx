import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DocType } from "@/entities/document";

interface Props {
  onSelect: (docType: DocType) => void;
  lastDocType?: DocType | null; // 마지막 사용 양식 — 배지로 표시(원클릭 진입, #31)
}

const TEMPLATES: DocType[] = ["PI", "CI", "PL"];

/**
 * 템플릿 갤러리(#31): 양식(PI/CI/PL) 카드에서 단건 작성으로 진입한다.
 * Stitch 'Document Templates' 시안 기반 — 상단 문서 썸네일(양식별 미니 목업) +
 * 하단 제목/양식 배지/설명. 게스트 랜딩과 로그인 홈 양쪽에서 쓰는 표현 위젯.
 */
export function TemplateGallery({ onSelect, lastDocType = null }: Props) {
  const { t } = useTranslation();

  return (
    <section data-guide="template-gallery">
      <div className="mb-6 space-y-1">
        <h2 className="font-serif text-xl md:text-2xl font-semibold text-primary">{t("home.galleryTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("home.gallerySubtitle")}</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {TEMPLATES.map((docType) => (
          <button
            key={docType}
            type="button"
            onClick={() => onSelect(docType)}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="relative flex items-center justify-center bg-accent/60 py-7 transition-colors group-hover:bg-accent">
              {docType === lastDocType && (
                <span className="absolute left-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  {t("home.lastUsedBadge")}
                </span>
              )}
              <PaperThumbnail docType={docType} />
            </div>
            <div className="space-y-1.5 border-t border-border p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-bold text-foreground leading-snug">
                  {t(`home.template.${docType}.title`)}
                </span>
                <span className="shrink-0 rounded-sm border border-accent-foreground/30 bg-accent px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-accent-foreground">
                  {docType}
                </span>
              </div>
              <p className="text-sm leading-snug text-muted-foreground">
                {t(`home.template.${docType}.desc`)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/** 양식별 미니 문서 목업 — 잉크 네이비 블록 + 웜스톤 라인 + 버밀리언 도장. */
function PaperThumbnail({ docType }: { docType: DocType }) {
  const paper =
    "relative flex h-40 w-[7.5rem] flex-col gap-1.5 rounded-sm bg-white p-3 shadow-md ring-1 ring-black/5 transition-transform group-hover:-translate-y-0.5";

  if (docType === "PI") {
    // 다크 타이틀 바 + 텍스트 라인 + 점선 본문 영역(Proforma Invoice)
    return (
      <div className={`${paper} -rotate-2`}>
        <div className="h-2.5 w-3/4 rounded-[2px] bg-primary" />
        <div className="h-1.5 w-1/2 rounded-full bg-stone-300" />
        <div className="h-1.5 w-2/3 rounded-full bg-stone-200" />
        <div className="mt-1 flex flex-1 items-center justify-center rounded-sm border border-dashed border-stone-300">
          <FileText className="size-6 text-stone-300" aria-hidden />
        </div>
      </div>
    );
  }

  if (docType === "CI") {
    // 로고 블록 + 라인 + 본문 블록 + 다크 푸터, 정본임을 알리는 버밀리언 인장(Commercial Invoice)
    return (
      <div className={paper}>
        <div className="flex items-start justify-between">
          <div className="size-6 rounded-[2px] bg-primary" />
          <div className="mt-1 h-1.5 w-8 rounded-full bg-stone-300" />
        </div>
        <div className="h-1.5 w-2/3 rounded-full bg-stone-300" />
        <div className="h-1.5 w-1/2 rounded-full bg-stone-200" />
        <div className="mt-1 flex-1 rounded-sm bg-accent/80" />
        <div className="h-2 w-3/5 self-center rounded-[2px] bg-primary" />
        <span
          aria-hidden
          className="absolute bottom-6 right-2.5 flex size-7 rotate-12 items-center justify-center rounded-full border-[1.5px] border-accent-foreground/50"
        >
          <span className="size-5 rounded-full border border-accent-foreground/40" />
        </span>
      </div>
    );
  }

  // PL: 라인 + 체크 항목 행 + 합계 블록(Packing List)
  return (
    <div className={paper}>
      <div className="ml-auto h-1.5 w-2/3 rounded-full bg-stone-300" />
      <div className="ml-auto h-1.5 w-1/2 rounded-full bg-stone-200" />
      <div className="mt-1 flex items-center gap-1.5">
        <div className="size-4 rounded-[2px] bg-accent" />
        <div className="h-1.5 flex-1 rounded-full bg-stone-300" />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="size-4 rounded-[2px] bg-accent" />
        <div className="h-1.5 flex-1 rounded-full bg-stone-200" />
      </div>
      <div className="mt-auto h-6 rounded-sm bg-stone-200/80" />
    </div>
  );
}
