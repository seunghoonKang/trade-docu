import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import type { Invoice } from "@/entities/invoice";
import {
  A4_WIDTH_MM,
  CAPTURE_WIDTH_PX,
  cloneInvoiceForCapture,
  createCaptureFrame,
  prepareCaptureFrame,
} from "@/shared/lib/invoiceCapture";
import { paginateInvoiceDom } from "./paginateInvoiceDom";

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

function addCanvasToPdfPage(pdf: jsPDF, canvas: HTMLCanvasElement, isFirstPage: boolean) {
  if (!isFirstPage) pdf.addPage();

  const imgHeightMm = (canvas.height * A4_WIDTH_MM) / canvas.width;
  pdf.addImage(
    canvas.toDataURL("image/png"),
    "PNG",
    0,
    0,
    A4_WIDTH_MM,
    imgHeightMm,
  );
}

async function capturePaginatedPages(): Promise<HTMLCanvasElement[]> {
  const clone = cloneInvoiceForCapture();
  const pages = paginateInvoiceDom(clone);
  const frame = createCaptureFrame();

  try {
    const canvases: HTMLCanvasElement[] = [];

    for (const page of pages) {
      await prepareCaptureFrame(frame, page);
      canvases.push(await captureElement(page));
    }

    return canvases;
  } finally {
    frame.cleanup();
  }
}

export async function generatePdf(data: FormData) {
  const canvases = await capturePaginatedPages();
  const pdf = new jsPDF("p", "mm", "a4");

  canvases.forEach((canvas, index) => {
    addCanvasToPdfPage(pdf, canvas, index === 0);
  });

  const filename = `PI_${data.invoiceNo || "draft"}_${data.date || "undated"}.pdf`;
  pdf.save(filename);
}
