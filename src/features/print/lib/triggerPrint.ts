import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  CAPTURE_WIDTH_PX,
  cloneDocumentStyles,
  cloneInvoiceForCapture,
  freezeMotion,
  isSinglePageContent,
  singlePageFitScale,
  waitForImages,
  waitForLayout,
} from "@/shared/lib/invoiceCapture";

/** 긴 문서용 — 가로만 여백 안에 맞춘다. */
const PRINT_MARGIN_MM = 12;
const PRINTABLE_WIDTH_MM = A4_WIDTH_MM - PRINT_MARGIN_MM * 2;
const MULTI_PAGE_WIDTH_SCALE = PRINTABLE_WIDTH_MM / A4_WIDTH_MM;

function buildPrintStyles(singlePage: boolean, scale: number): string {
  const colorAdjust = `
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  `;

  if (singlePage) {
    // PDF addCanvasFitOneA4Page와 동일 — @page 여백 0, A4 전체에 transform으로 맞춤
    return `
      @page { size: A4 portrait; margin: 0; }
      html, body {
        margin: 0;
        padding: 0;
        background: white;
        ${colorAdjust}
      }
      .print-wrapper {
        width: ${A4_WIDTH_MM}mm;
        height: ${A4_HEIGHT_MM}mm;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        page-break-after: avoid;
        break-inside: avoid;
      }
      .print-scaler {
        width: ${CAPTURE_WIDTH_PX}px;
        transform: scale(${scale});
        transform-origin: center center;
        box-shadow: none !important;
      }
    `;
  }

  return `
    @page { size: A4 portrait; margin: ${PRINT_MARGIN_MM}mm; }
    html, body {
      margin: 0;
      padding: 0;
      background: white;
      ${colorAdjust}
    }
    .print-wrapper {
      display: flex;
      justify-content: center;
      width: 100%;
      overflow: visible;
    }
    .print-scaler {
      width: ${CAPTURE_WIDTH_PX}px;
      transform: scale(${scale});
      transform-origin: top center;
      box-shadow: none !important;
    }
    @media print {
      .print-wrapper {
        height: auto;
        overflow: visible;
      }
    }
  `;
}

function computePrintLayout(contentHeightPx: number): { scale: number; singlePage: boolean } {
  const singlePage = isSinglePageContent(contentHeightPx);
  return {
    singlePage,
    scale: singlePage ? singlePageFitScale(contentHeightPx) : MULTI_PAGE_WIDTH_SCALE,
  };
}

export async function triggerPrint() {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("title", "Print");
  iframe.style.cssText = `position:fixed;left:-10000px;top:0;width:${CAPTURE_WIDTH_PX}px;border:0;opacity:0;pointer-events:none;`;
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    document.body.removeChild(iframe);
    return;
  }

  try {
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><base href="${window.location.origin}/" /></head><body></body></html>`);
    doc.close();
    await cloneDocumentStyles(doc);
    freezeMotion(doc);

    const wrapper = doc.createElement("div");
    wrapper.className = "print-wrapper";
    const scaler = doc.createElement("div");
    scaler.className = "print-scaler";
    const content = cloneInvoiceForCapture();
    scaler.appendChild(content);
    wrapper.appendChild(scaler);
    doc.body.appendChild(wrapper);

    await waitForLayout();
    await doc.fonts.ready;
    await waitForImages(doc);

    const { scale, singlePage } = computePrintLayout(content.offsetHeight);

    const printStyle = doc.createElement("style");
    printStyle.textContent = buildPrintStyles(singlePage, scale);
    doc.head.appendChild(printStyle);

    await waitForLayout();

    iframe.style.height = singlePage ? `${A4_HEIGHT_MM}mm` : `${wrapper.offsetHeight}px`;

    win.focus();
    win.print();
  } finally {
    window.setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 1000);
  }
}
