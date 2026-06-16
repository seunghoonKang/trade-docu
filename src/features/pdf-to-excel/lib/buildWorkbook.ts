import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { ExtractedPage } from "../model/types";

/** Excel 시트명 제약(31자, : \ / ? * [ ] 금지) 회피 + 중복 시 접미사. */
function safeSheetName(name: string, used: Set<string>): string {
  const base = name.replace(/[:\\/?*[\]]/g, " ").trim().slice(0, 31) || "Sheet";
  let candidate = base;
  let i = 2;
  while (used.has(candidate)) {
    const suffix = ` (${i})`;
    candidate = `${base.slice(0, 31 - suffix.length)}${suffix}`;
    i++;
  }
  used.add(candidate);
  return candidate;
}

/**
 * 깔끔한 숫자만 number로 — 받는 쪽에서 SUM 등 계산이 되도록.
 * 단 **비파괴적**으로만: 숫자로 바꿔도 보이는 값이 달라지지 않을 때에 한한다.
 * → HS코드("8471.30"), 코드("007"), 금액 표기("5.00")는 텍스트로 보존, "10"·"1234"만 number.
 */
function coerceCell(value: string): string | number {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const stripped = trimmed.replace(/,/g, "");
  if (/^-?\d+(\.\d+)?$/.test(stripped)) {
    const n = Number(stripped);
    if (Number.isFinite(n) && String(n) === stripped) return n;
  }
  return value;
}

/**
 * 페이지별 격자 → 워크북(plan: 원본 표 미러링, 페이지=시트). 기존 Proforma `generateExcel`는
 * 재사용하지 않는다 — 이건 서식 없는 범용 그리드 출력이다.
 */
export function buildWorkbook(pages: ExtractedPage[]): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  const usedNames = new Set<string>();

  for (const page of pages) {
    const ws = wb.addWorksheet(safeSheetName(page.sheetName, usedNames));
    const rows = page.rows.length ? page.rows : [[""]];
    const colCount = rows.reduce((max, r) => Math.max(max, r.length), 1);

    for (const row of rows) {
      const padded = Array.from({ length: colCount }, (_, c) => coerceCell(row[c] ?? ""));
      ws.addRow(padded);
    }

    // 열 너비 자동(상한 60) — 내용 길이에 맞춰 대략.
    for (let c = 1; c <= colCount; c++) {
      let maxLen = 8;
      ws.getColumn(c).eachCell?.({ includeEmpty: false }, (cell) => {
        const len = String(cell.value ?? "").length;
        if (len > maxLen) maxLen = len;
      });
      ws.getColumn(c).width = Math.min(maxLen + 2, 60);
    }
  }

  return wb;
}

export async function downloadWorkbook(pages: ExtractedPage[], filename: string): Promise<void> {
  const wb = buildWorkbook(pages);
  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), filename);
}
