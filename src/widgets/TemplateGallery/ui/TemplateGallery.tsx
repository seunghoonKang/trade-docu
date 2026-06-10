import { FileText, Package, Receipt } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DocType } from "@/entities/document";

interface Props {
  onSelect: (docType: DocType) => void;
  lastDocType?: DocType | null; // 마지막 사용 양식 — 배지로 표시(원클릭 진입, #31)
}

const TEMPLATE_ICONS: Record<DocType, LucideIcon> = {
  PI: FileText,
  CI: Receipt,
  PL: Package,
};

const TEMPLATES: DocType[] = ["PI", "CI", "PL"];

/**
 * 템플릿 갤러리(#31): 양식(PI/CI/PL) 카드에서 단건 작성으로 진입한다.
 * 게스트 랜딩과 로그인 홈(빈/첫 로그인 폴백) 양쪽에서 쓰는 표현 위젯.
 */
export function TemplateGallery({ onSelect, lastDocType = null }: Props) {
  const { t } = useTranslation();

  return (
    <section data-guide="template-gallery">
      <div className="mb-6 space-y-1">
        <h2 className="text-xl md:text-2xl font-bold text-primary">{t("home.galleryTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("home.gallerySubtitle")}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TEMPLATES.map((docType) => {
          const Icon = TEMPLATE_ICONS[docType];
          return (
            <button
              key={docType}
              type="button"
              onClick={() => onSelect(docType)}
              className="group relative flex flex-col items-start gap-3 rounded-xl border border-border bg-card/80 p-5 text-left transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              {docType === lastDocType && (
                <span className="absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {t("home.lastUsedBadge")}
                </span>
              )}
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/5 text-primary border border-primary/10">
                <Icon className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block text-base font-semibold text-foreground">
                  {t(`home.template.${docType}.title`)}
                </span>
                <span className="mt-1 block text-sm leading-snug text-muted-foreground">
                  {t(`home.template.${docType}.desc`)}
                </span>
              </span>
              <span className="mt-auto text-sm font-semibold text-primary group-hover:underline">
                {t("home.create")} →
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
