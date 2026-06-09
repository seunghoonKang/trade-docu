import {
  A4_WIDTH_MM,
  CAPTURE_WIDTH_PX,
  cloneDocumentStyles,
  cloneInvoiceForCapture,
  waitForImages,
  waitForLayout,
} from "@/shared/lib/invoiceCapture";

/** Typical browser "Default" print margin (Chrome/Safari ~10–12 mm per side). */
const PRINT_MARGIN_MM = 12;
const PRINT_SCALE = (A4_WIDTH_MM - PRINT_MARGIN_MM * 2) / A4_WIDTH_MM;

const PRINT_STYLES = `
  @page { size: A4 portrait; margin: ${PRINT_MARGIN_MM}mm; }
  html, body {
    margin: 0;
    padding: 0;
    background: white;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    overflow: visible;
  }
  .print-scaler {
    width: ${CAPTURE_WIDTH_PX}px;
    zoom: ${PRINT_SCALE};
    box-shadow: none !important;
  }
  @media print {
    .print-wrapper {
      height: auto;
      overflow: visible;
    }
  }
`;

function fitPrintWrapper(doc: Document) {
  const wrapper = doc.querySelector<HTMLElement>(".print-wrapper");
  const scaler = doc.querySelector<HTMLElement>(".print-scaler");
  const content = scaler?.firstElementChild as HTMLElement | null;
  if (!wrapper || !scaler || !content) return;

  wrapper.style.height = `${content.offsetHeight * PRINT_SCALE}px`;
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
    cloneDocumentStyles(doc);

    const printStyle = doc.createElement("style");
    printStyle.textContent = PRINT_STYLES;
    doc.head.appendChild(printStyle);

    const wrapper = doc.createElement("div");
    wrapper.className = "print-wrapper";
    const scaler = doc.createElement("div");
    scaler.className = "print-scaler";
    scaler.appendChild(cloneInvoiceForCapture());
    wrapper.appendChild(scaler);
    doc.body.appendChild(wrapper);

    await waitForLayout();
    await doc.fonts.ready;
    await waitForImages(doc);
    fitPrintWrapper(doc);

    iframe.style.height = `${wrapper.offsetHeight}px`;

    win.focus();
    win.print();
  } finally {
    window.setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 1000);
  }
}
