import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

interface LegalSection {
  title: string;
  body: string;
}

interface LegalDocumentPageProps {
  document: "terms" | "privacy";
}

export function LegalDocumentPage({ document }: LegalDocumentPageProps) {
  const { t } = useTranslation();
  const titleKey = document === "terms" ? "legal.termsTitle" : "legal.privacyTitle";
  const sectionsKey = document === "terms" ? "legal.termsSections" : "legal.privacySections";
  const sections = t(sectionsKey, { returnObjects: true }) as LegalSection[];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            {t("legal.back")}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">{t(titleKey)}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("legal.lastUpdated")}</p>
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-semibold text-foreground mb-2">{section.title}</h2>
              <p className="text-sm leading-relaxed text-secondary-foreground whitespace-pre-line">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
