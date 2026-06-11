import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import type { Invoice } from "@/entities/invoice";
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  CAPTURE_WIDTH_PX,
  cloneInvoiceForCapture,
  createCaptureFrame,
  isSinglePageContent,
  prepareCaptureFrame,
  singlePageFitScale,
} from "@/shared/lib/invoiceCapture";

type FormData = Omit<Invoice, "id" | "userId" | "createdAt">;

async function captureElement(el: HTMLElement): Promise<HTMLCanvasElement> {
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    width: CAPTURE_WIDTH_PX,
    windowWidth: CAPTURE_WIDTH_PX,
  });

  if (canvas.width <= 0 || canvas.height <= 0) {
    throw new Error("Invoice capture produced an empty canvas");
  }

  return canvas;
}

function canvasHeightMm(canvas: HTMLCanvasElement): number {
  return (canvas.height * A4_WIDTH_MM) / canvas.width;
}

/** 캔버스를 A4 높이 단위로 잘라 연속 페이지로 만든다(DOM 재조립 없음). */
function sliceCanvasToA4Pages(canvas: HTMLCanvasElement): HTMLCanvasElement[] {
  const sliceHeightPx = Math.floor(canvas.width * (A4_HEIGHT_MM / A4_WIDTH_MM));
  const slices: HTMLCanvasElement[] = [];

  for (let y = 0; y < canvas.height; y += sliceHeightPx) {
    const h = Math.min(sliceHeightPx, canvas.height - y);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = h;
    const ctx = slice.getContext("2d");
    if (!ctx) continue;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
    slices.push(slice);
  }

  return slices.length > 0 ? slices : [canvas];
}

function addCanvasSliceToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, isFirstPage: boolean) {
  if (!isFirstPage) pdf.addPage();
  const imgHeightMm = canvasHeightMm(canvas);
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, A4_WIDTH_MM, imgHeightMm);
}

/** 내용 전체를 A4 한 장 안에 비율 유지하며 맞춘다. */
function addCanvasFitOneA4Page(pdf: jsPDF, canvas: HTMLCanvasElement) {
  const naturalH = canvasHeightMm(canvas);
  const elementHeightPx = (canvas.height / canvas.width) * CAPTURE_WIDTH_PX;
  const scale = singlePageFitScale(elementHeightPx);
  const w = A4_WIDTH_MM * scale;
  const h = naturalH * scale;
  const x = (A4_WIDTH_MM - w) / 2;
  const y = (A4_HEIGHT_MM - h) / 2;
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, w, h);
}

function writeCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement) {
  const elementHeightPx = (canvas.height / canvas.width) * CAPTURE_WIDTH_PX;

  if (isSinglePageContent(elementHeightPx)) {
    addCanvasFitOneA4Page(pdf, canvas);
    return;
  }

  const slices = sliceCanvasToA4Pages(canvas);
  slices.forEach((slice, index) => addCanvasSliceToPdf(pdf, slice, index === 0));
}

async function captureInvoiceCanvas(): Promise<HTMLCanvasElement> {
  const clone = cloneInvoiceForCapture();
  const frame = await createCaptureFrame();

  try {
    await prepareCaptureFrame(frame, clone);
    return await captureElement(clone);
  } finally {
    frame.cleanup();
  }
}

export async function generatePdf(data: FormData, docPrefix = "PI") {
  const canvas = await captureInvoiceCanvas();
  const pdf = new jsPDF("p", "mm", "a4");
  writeCanvasToPdf(pdf, canvas);

  const filename = `${docPrefix}_${data.invoiceNo || "draft"}_${data.date || "undated"}.pdf`;
  pdf.save(filename);
}
