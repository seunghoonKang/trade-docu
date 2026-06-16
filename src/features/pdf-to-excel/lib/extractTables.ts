import type { ExtractedPage, ExtractProgress } from "../model/types";
import { reconstructTable, type PositionedText } from "./reconstructTable";
import { ocrCanvasToRows } from "./ocrFallback";

/**
 * PDF 파일 → 페이지별 표 격자(plan: 페이지=시트, 전부 클라이언트, 일회성).
 *
 * 페이지마다 텍스트 레이어가 있으면 pdfjs로 즉시·정확·무료 추출하고,
 * 없는(스캔) 페이지만 OCR 폴백으로 떨어뜨린다 — "입력이 허용하는 가장 싸고 정확한 방법" 원칙.
 *
 * pdfjs/OCR 모두 이 함수 안에서만 **동적 import**되어 메인 번들에서 분리된다.
 */

interface PdfTextItem {
  str: string;
  width: number;
  height: number;
  transform: number[];
}

let workerConfigured = false;

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  if (!workerConfigured) {
    const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    workerConfigured = true;
  }
  return pdfjs;
}

function itemsFromTextContent(
  content: { items: unknown[] },
  viewportHeight: number,
): PositionedText[] {
  const items: PositionedText[] = [];
  for (const raw of content.items) {
    const it = raw as PdfTextItem;
    if (typeof it.str !== "string") continue;
    const x = it.transform[4];
    const yBottom = it.transform[5];
    const height = it.height || Math.abs(it.transform[3]) || 8;
    // pdfjs는 좌하단 원점 — top-down으로 변환해 reconstructTable 규약에 맞춘다.
    const top = viewportHeight - yBottom - height;
    items.push({ text: it.str, x, y: top, width: it.width, height });
  }
  return items;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function renderPageToCanvas(page: any, scale = 2): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_context_unavailable");
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return canvas;
}

export async function extractTablesFromPdf(
  file: File,
  onProgress?: (progress: ExtractProgress) => void,
): Promise<ExtractedPage[]> {
  const pdfjs = await loadPdfjs();
  const data = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;
  const pages: ExtractedPage[] = [];

  try {
    for (let n = 1; n <= pdf.numPages; n++) {
      onProgress?.({ page: n, total: pdf.numPages, phase: "text" });
      const page = await pdf.getPage(n);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const items = itemsFromTextContent(content, viewport.height);
      const hasText = items.some((i) => i.text.trim().length > 0);

      if (hasText) {
        pages.push({ sheetName: `Page ${n}`, rows: reconstructTable(items), source: "text" });
      } else {
        // 텍스트 레이어 없음 → 스캔으로 보고 OCR 폴백.
        onProgress?.({ page: n, total: pdf.numPages, phase: "ocr" });
        const canvas = await renderPageToCanvas(page);
        const rows = await ocrCanvasToRows(canvas);
        pages.push({ sheetName: `Page ${n}`, rows, source: rows.length ? "ocr" : "empty" });
      }
      page.cleanup();
    }
  } finally {
    await pdf.cleanup();
    void loadingTask.destroy();
  }

  return pages;
}
