import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, FileSpreadsheet, FileUp, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import type { ExtractedPage, ExtractProgress } from "../model/types";
import { extractTablesFromPdf } from "../lib/extractTables";
import { downloadWorkbook } from "../lib/buildWorkbook";
import { TableGrid } from "./TableGrid";

type Status = "idle" | "extracting" | "ready";

function baseName(fileName: string): string {
  return fileName.replace(/\.pdf$/i, "").trim() || "converted";
}

/**
 * PDF → Excel 범용 변환기(plan). 업로드 → 페이지별 표 추출 → 리뷰 그리드에서 확인·수정 →
 * 원본 표 그대로 .xlsx 다운로드. 전부 클라이언트·일회성: 파일은 브라우저 밖으로 나가지 않는다.
 */
export function PdfToExcelTool() {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [pages, setPages] = useState<ExtractedPage[]>([]);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState<ExtractProgress | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
      toast.error(t("pdfTool.notPdf"));
      return;
    }
    setStatus("extracting");
    setProgress(null);
    setSourceName(file.name);
    try {
      const result = await extractTablesFromPdf(file, setProgress);
      if (result.length === 0) {
        toast.error(t("pdfTool.noContent"));
        setStatus("idle");
        return;
      }
      setPages(result);
      setActive(0);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      toast.error(t("pdfTool.extractFailed"));
      setStatus("idle");
    }
  }

  function updateActiveRows(rows: string[][]) {
    setPages((prev) => prev.map((p, i) => (i === active ? { ...p, rows } : p)));
  }

  async function handleDownload() {
    try {
      await downloadWorkbook(pages, `${baseName(sourceName)}.xlsx`);
      toast.success(t("pdfTool.downloaded"));
    } catch (err) {
      console.error(err);
      toast.error(t("pdfTool.downloadFailed"));
    }
  }

  function reset() {
    setStatus("idle");
    setPages([]);
    setActive(0);
    setProgress(null);
    setSourceName("");
  }

  const current = pages[active];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:p-8 space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{t("pdfTool.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("pdfTool.subtitle")}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void handleFile(file);
        }}
      />

      {status === "idle" && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-16 text-center transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/50 hover:bg-muted/30",
          )}
        >
          <FileUp className="size-10 text-muted-foreground/60" aria-hidden />
          <span className="text-sm font-medium text-foreground">{t("pdfTool.dropTitle")}</span>
          <span className="text-xs text-muted-foreground">{t("pdfTool.dropHint")}</span>
        </button>
      )}

      {status === "extracting" && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center">
          <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
          <p className="text-sm font-medium text-foreground">
            {progress
              ? progress.phase === "ocr"
                ? t("pdfTool.progressOcr", { page: progress.page, total: progress.total })
                : t("pdfTool.progressText", { page: progress.page, total: progress.total })
              : t("pdfTool.loading")}
          </p>
          <p className="text-xs text-muted-foreground">{t("pdfTool.localOnlyNote")}</p>
        </div>
      )}

      {status === "ready" && current && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="truncate text-sm text-muted-foreground">
              <FileSpreadsheet className="mr-1.5 inline size-4 align-text-bottom" aria-hidden />
              {sourceName}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={reset}>
                <RotateCcw className="size-4 shrink-0" aria-hidden />
                {t("pdfTool.uploadAnother")}
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => void handleDownload()}>
                <Download className="size-4 shrink-0" aria-hidden />
                {t("pdfTool.download")}
              </Button>
            </div>
          </div>

          {pages.length > 1 && (
            <div className="flex flex-wrap gap-1 border-b border-border">
              {pages.map((page, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                    i === active
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {page.sheetName}
                </button>
              ))}
            </div>
          )}

          {current.source === "ocr" && (
            <p className="rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              {t("pdfTool.ocrNote")}
            </p>
          )}
          {current.source === "empty" && (
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              {t("pdfTool.emptyNote")}
            </p>
          )}

          <TableGrid rows={current.rows} onChange={updateActiveRows} />
        </div>
      )}
    </div>
  );
}
