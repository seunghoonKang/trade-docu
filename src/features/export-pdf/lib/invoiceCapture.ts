export const CAPTURE_WIDTH_PX = 794;
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const A4_PAGE_HEIGHT_PX = Math.floor((A4_HEIGHT_MM * CAPTURE_WIDTH_PX) / A4_WIDTH_MM);

export interface CaptureFrame {
  doc: Document;
  win: Window;
  cleanup: () => void;
}

export function cloneInvoiceForCapture(): HTMLElement {
  const content = document.getElementById("invoice-preview-content");
  if (!content) throw new Error("Invoice preview not found");

  const clone = content.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  clone.style.width = `${CAPTURE_WIDTH_PX}px`;
  clone.style.maxWidth = `${CAPTURE_WIDTH_PX}px`;
  clone.style.boxShadow = "none";
  clone.classList.remove("paper-shadow");
  return clone;
}

export function createCaptureFrame(): CaptureFrame {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    document.body.removeChild(iframe);
    throw new Error("Capture frame unavailable");
  }

  doc.open();
  doc.write("<!DOCTYPE html><html><head></head><body></body></html>");
  doc.close();
  cloneDocumentStyles(doc);

  return {
    doc,
    win,
    cleanup: () => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    },
  };
}

export async function prepareCaptureFrame(frame: CaptureFrame, element: HTMLElement) {
  frame.doc.body.replaceChildren(element);
  await waitForLayout();
  await frame.doc.fonts.ready;
  await waitForImages(frame.doc);
}

export async function waitForLayout() {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export async function waitForImages(doc: Document) {
  await Promise.all(
    Array.from(doc.images).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) resolve();
          else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        }),
    ),
  );
}

export function cloneDocumentStyles(target: Document) {
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    target.head.appendChild(node.cloneNode(true));
  });
}
