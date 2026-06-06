const CAPTURE_WIDTH_PX = 794;
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PAGE_HEIGHT_PX = Math.floor((A4_HEIGHT_MM * CAPTURE_WIDTH_PX) / A4_WIDTH_MM);

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
  return page;
}

function buildTableFragment(
  table: HTMLTableElement,
  thead: Element | null,
  row: Element,
  withHeader: boolean,
): HTMLTableElement {
  const fragment = document.createElement("table");
  fragment.className = table.className;
  if (withHeader && thead) {
    fragment.appendChild(thead.cloneNode(true));
  }
  const tbody = document.createElement("tbody");
  tbody.appendChild(row.cloneNode(true));
  fragment.appendChild(tbody);
  return fragment;
}

function extractBlocks(source: HTMLElement): PageBlock[] {
  const blocks: PageBlock[] = [];

  for (const child of Array.from(source.children)) {
    if (child.tagName === "TABLE") {
      const table = child as HTMLTableElement;
      const thead = table.querySelector("thead");
      const rows = table.querySelectorAll("tbody tr");
      for (const row of rows) {
        blocks.push({
          isTableRow: true,
          render: (withHeader) => buildTableFragment(table, thead, row, withHeader),
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
  /** Each page's first table row should repeat the column header (thead). */
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

export { CAPTURE_WIDTH_PX, A4_WIDTH_MM, A4_HEIGHT_MM };
