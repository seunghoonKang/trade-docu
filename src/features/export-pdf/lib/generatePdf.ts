import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import type { Invoice } from "@/entities/invoice/model";
import { A4_WIDTH_MM, CAPTURE_WIDTH_PX, paginateInvoiceDom } from "./paginateInvoiceDom";

type FormData = Omit<Invoice, "id" | "userId" | "createdAt">;

async function waitForLayout() {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function captureElement(el: HTMLElement): Promise<HTMLCanvasElement> {
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
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
  const content = document.getElementById("invoice-preview-content");
  if (!content) throw new Error("Invoice preview not found");

  const clone = content.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  clone.style.width = `${CAPTURE_WIDTH_PX}px`;
  clone.style.maxWidth = `${CAPTURE_WIDTH_PX}px`;

  const pages = paginateInvoiceDom(clone);
  const mount = document.createElement("div");
  mount.style.cssText = "position:fixed;left:-10000px;top:0;";
  document.body.appendChild(mount);

  try {
    for (const page of pages) {
      page.style.position = "relative";
      page.style.left = "0";
      mount.appendChild(page);
    }

    await waitForLayout();

    const canvases: HTMLCanvasElement[] = [];
    for (const page of pages) {
      canvases.push(await captureElement(page));
    }
    return canvases;
  } finally {
    document.body.removeChild(mount);
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
