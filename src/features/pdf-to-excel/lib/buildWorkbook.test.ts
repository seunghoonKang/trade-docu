import { describe, expect, it } from "vitest";
import { buildWorkbook } from "./buildWorkbook";
import type { ExtractedPage } from "../model/types";

function page(sheetName: string, rows: string[][], source: ExtractedPage["source"] = "text"): ExtractedPage {
  return { sheetName, rows, source };
}

describe("buildWorkbook — 격자 → xlsx", () => {
  it("페이지마다 시트 하나(plan: 페이지=시트)", () => {
    const wb = buildWorkbook([page("Page 1", [["a"]]), page("Page 2", [["b"]])]);
    expect(wb.worksheets.map((w) => w.name)).toEqual(["Page 1", "Page 2"]);
  });

  it("깔끔한 숫자만 number로(비파괴) — 보이는 값이 바뀌면 텍스트 유지", () => {
    const wb = buildWorkbook([page("P", [["10", "1,234", "ABC123"]])]);
    const ws = wb.worksheets[0];
    expect(ws.getCell(1, 1).value).toBe(10);
    expect(ws.getCell(1, 2).value).toBe(1234); // 천단위 콤마만 제거
    expect(ws.getCell(1, 3).value).toBe("ABC123");
  });

  it("코드·금액 표기는 텍스트로 보존(HS코드·leading zero·trailing zero)", () => {
    const wb = buildWorkbook([page("P", [["8471.30", "007", "5.00"]])]);
    const ws = wb.worksheets[0];
    expect(ws.getCell(1, 1).value).toBe("8471.30"); // HS코드 보존
    expect(ws.getCell(1, 2).value).toBe("007"); // leading zero 보존
    expect(ws.getCell(1, 3).value).toBe("5.00"); // trailing zero 보존
  });

  it("불규칙한 행 길이를 직사각형으로 패딩", () => {
    const wb = buildWorkbook([page("P", [["a", "b", "c"], ["d"]])]);
    const ws = wb.worksheets[0];
    expect(ws.getCell(2, 1).value).toBe("d");
    // 짧은 행의 빈 칸은 비어 있음(throw 없이 접근 가능).
    expect(ws.getCell(2, 3).value ?? "").toBe("");
  });

  it("금지문자·중복 시트명을 안전하게 보정", () => {
    const wb = buildWorkbook([
      page("a/b:c", [[""]]),
      page("dup", [[""]]),
      page("dup", [[""]]),
    ]);
    const names = wb.worksheets.map((w) => w.name);
    expect(names[0]).not.toMatch(/[:\\/?*[\]]/);
    expect(new Set(names).size).toBe(3); // 전부 유일
  });
});
