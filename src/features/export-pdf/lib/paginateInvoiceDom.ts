import { A4_PAGE_HEIGHT_PX, CAPTURE_WIDTH_PX } from "@/shared/lib/invoiceCapture";

const PAGE_HEIGHT_PX = A4_PAGE_HEIGHT_PX;

interface PageBlock {
  isTableRow: boolean;
  render: (withTableHeader: boolean) => HTMLElement;
}

function createPageShell(template: HTMLElement): HTMLElement {
  const page = document.createElement("div");
  page.className = template.className;
  page.style.width = `${CAPTURE_WIDTH_PX}px`;
  page.style.maxWidth = `${CAPTURE_WIDTH_PX}px`;
  page.style.boxSizing = "border-box";
  page.style.background = "#ffffff";
  page.style.overflow = "visible";
  page.style.borderRadius = "0";
  page.style.minHeight = "auto";
  page.style.boxShadow = "none";
  return page;
}

function buildWrappedTableFragment(
  wrapper: Element,
  table: HTMLTableElement,
  thead: Element | null,
  row: Element | null,
  tfoot: Element | null,
  withHeader: boolean,
): HTMLElement {
  const container = document.createElement("div");
  if (wrapper.tagName !== "TABLE") {
    container.className = wrapper.className;
  }

  const fragment = document.createElement("table");
  fragment.className = table.className;
  if (withHeader && thead) {
    fragment.appendChild(thead.cloneNode(true));
  }
  if (row) {
    const tbody = document.createElement("tbody");
    tbody.appendChild(row.cloneNode(true));
    fragment.appendChild(tbody);
  }
  if (tfoot) {
    fragment.appendChild(tfoot.cloneNode(true));
  }

  if (wrapper.tagName === "TABLE") {
    return fragment;
  }

  container.appendChild(fragment);
  return container;
}

function extractBlocks(source: HTMLElement): PageBlock[] {
  const blocks: PageBlock[] = [];

  for (const child of Array.from(source.children)) {
    const table =
      child.tagName === "TABLE" ? (child as HTMLTableElement) : child.querySelector("table");

    if (table) {
      const thead = table.querySelector("thead");
      const tfoot = table.querySelector("tfoot");

      for (const row of table.querySelectorAll("tbody tr")) {
        blocks.push({
          isTableRow: true,
          render: (withHeader) =>
            buildWrappedTableFragment(child, table, thead, row, null, withHeader),
        });
      }

      if (tfoot) {
        blocks.push({
          isTableRow: false,
          render: () => buildWrappedTableFragment(child, table, null, null, tfoot, false),
        });
      }
      continue;
    }

    blocks.push({
      isTableRow: false,
      render: () => child.cloneNode(true) as HTMLElement,
    });
  }

  return blocks;
}

function measurePage(page: HTMLElement): number {
  void page.offsetHeight;
  return page.scrollHeight;
}

export function paginateInvoiceDom(source: HTMLElement): HTMLElement[] {
  const blocks = extractBlocks(source);
  const mount = document.createElement("div");
  mount.style.cssText = "position:fixed;left:-10000px;top:0;visibility:hidden;";
  document.body.appendChild(mount);

  const pages: HTMLElement[] = [];
  let currentPage = createPageShell(source);
  mount.appendChild(currentPage);
  let needsTableHeader = true;

  try {
    for (const block of blocks) {
      let element = block.render(block.isTableRow && needsTableHeader);
      currentPage.appendChild(element);

      if (measurePage(currentPage) > PAGE_HEIGHT_PX) {
        currentPage.removeChild(element);

        if (currentPage.childElementCount > 0) {
          mount.removeChild(currentPage);
          pages.push(currentPage);
          currentPage = createPageShell(source);
          mount.appendChild(currentPage);
          needsTableHeader = true;
        }

        element = block.render(block.isTableRow);
        currentPage.appendChild(element);
        if (block.isTableRow) needsTableHeader = false;
      } else if (block.isTableRow) {
        needsTableHeader = false;
      }
    }

    if (currentPage.childElementCount > 0) {
      mount.removeChild(currentPage);
      pages.push(currentPage);
    }
  } finally {
    document.body.removeChild(mount);
  }

  return pages.length > 0 ? pages : [createPageShell(source)];
}
