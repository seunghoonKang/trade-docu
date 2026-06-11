export const CAPTURE_WIDTH_PX = 794;
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const A4_PAGE_HEIGHT_PX = Math.floor((A4_HEIGHT_MM * CAPTURE_WIDTH_PX) / A4_WIDTH_MM);
/** 미리보기 한 장(약 1.5×A4)까지는 PDF/인쇄 모두 1장에 맞춘다 — PI+은행정보 등. */
export const FIT_ONE_PAGE_MAX_MM = A4_HEIGHT_MM * 1.5;

export function contentHeightMm(contentHeightPx: number): number {
  return (contentHeightPx * A4_WIDTH_MM) / CAPTURE_WIDTH_PX;
}

export function isSinglePageContent(contentHeightPx: number): boolean {
  return contentHeightMm(contentHeightPx) <= FIT_ONE_PAGE_MAX_MM;
}

/** PDF addCanvasFitOneA4Page와 동일 — A4 세로(297mm)에 맞추는 비율. */
export function singlePageFitScale(contentHeightPx: number): number {
  return Math.min(1, A4_HEIGHT_MM / contentHeightMm(contentHeightPx));
}

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
  clone.classList.remove("paper-shadow", "paper-settle");
  return clone;
}

/** 캡처 전 A4 1장에 들어가는지 판단 — DOM을 잠깐 붙여 scrollHeight를 잰다. */
export function measureHiddenElementHeight(el: HTMLElement): number {
  const mount = document.createElement("div");
  mount.style.cssText = `position:fixed;left:-10000px;top:0;width:${CAPTURE_WIDTH_PX}px;visibility:hidden;`;
  mount.appendChild(el);
  document.body.appendChild(mount);
  const height = el.scrollHeight;
  mount.removeChild(el);
  document.body.removeChild(mount);
  return height;
}

export async function createCaptureFrame(): Promise<CaptureFrame> {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = `position:fixed;right:0;bottom:0;width:${CAPTURE_WIDTH_PX}px;height:0;border:0;visibility:hidden;`;
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    document.body.removeChild(iframe);
    throw new Error("Capture frame unavailable");
  }

  doc.open();
  doc.write(`<!DOCTYPE html><html><head><base href="${window.location.origin}/" /></head><body></body></html>`);
  doc.close();
  await cloneDocumentStyles(doc);
  freezeMotion(doc);

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

function waitForStylesheetLinks(links: HTMLLinkElement[]): Promise<void> {
  if (links.length === 0) return Promise.resolve();

  return Promise.all(
    links.map(
      (link) =>
        new Promise<void>((resolve) => {
          if (link.sheet) {
            resolve();
            return;
          }
          link.addEventListener("load", () => resolve(), { once: true });
          link.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  ).then(() => undefined);
}

/**
 * 메인 문서에 이미 적용된 CSS를 캡처/인쇄 iframe으로 복사한다.
 * link 태그 clone만 하면 비동기 로드 전에 print/capture가 실행되어 Tailwind가 빠진다.
 * same-origin stylesheet는 cssRules를 인라인하고, 읽을 수 없을 때만 link clone + load 대기.
 */
export async function cloneDocumentStyles(target: Document): Promise<void> {
  const fallbackLinks: HTMLLinkElement[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = Array.from(sheet.cssRules);
      if (rules.length > 0) {
        const style = target.createElement("style");
        style.textContent = rules.map((rule) => rule.cssText).join("\n");
        target.head.appendChild(style);
        continue;
      }
    } catch {
      // cross-origin 등 — owner node fallback
    }

    const owner = sheet.ownerNode;
    if (owner instanceof HTMLLinkElement) {
      const link = owner.cloneNode(true) as HTMLLinkElement;
      target.head.appendChild(link);
      fallbackLinks.push(link);
    } else if (owner instanceof HTMLStyleElement) {
      target.head.appendChild(owner.cloneNode(true));
    }
  }

  await waitForStylesheetLinks(fallbackLinks);
}

/**
 * 캡처/인쇄 프레임의 애니메이션·전환을 전부 정지시킨다. 노드를 새 문서에 넣으면
 * CSS 애니메이션이 처음부터 재시작되므로, 끄지 않으면 등장 안무(paper-settle 등)의
 * 중간 상태(반투명·오프셋)가 그대로 래스터화/인쇄된다.
 */
export function freezeMotion(target: Document) {
  const style = target.createElement("style");
  style.textContent =
    "*, *::before, *::after { animation: none !important; transition: none !important; }";
  target.head.appendChild(style);
}
