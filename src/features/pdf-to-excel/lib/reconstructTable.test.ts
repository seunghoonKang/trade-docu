import { describe, expect, it } from "vitest";
import { reconstructTable, type PositionedText } from "./reconstructTable";

/** 좌표 텍스트 조각 헬퍼 (top-down y). */
function t(text: string, x: number, y: number, width = 30, height = 10): PositionedText {
  return { text, x, y, width, height };
}

describe("reconstructTable — 좌표 텍스트 → 격자", () => {
  it("빈 입력은 빈 격자", () => {
    expect(reconstructTable([])).toEqual([]);
    expect(reconstructTable([t("   ", 0, 0)])).toEqual([]);
  });

  it("같은 y의 조각들은 한 행, 넓은 간격은 열로 분리", () => {
    // 두 행 × 세 열의 정렬된 표.
    const items = [
      t("Item", 0, 0), t("Qty", 200, 0), t("Price", 400, 0),
      t("Widget", 0, 30), t("10", 200, 30), t("5.00", 400, 30),
    ];
    const grid = reconstructTable(items);
    expect(grid).toEqual([
      ["Item", "Qty", "Price"],
      ["Widget", "10", "5.00"],
    ]);
  });

  it("열이 어긋나도 가장 가까운 앵커로 정렬된다", () => {
    // 둘째 행의 x가 살짝 밀려도 같은 열에 들어가야 함.
    const items = [
      t("A", 0, 0), t("B", 200, 0),
      t("a", 4, 30), t("b", 205, 30),
    ];
    const grid = reconstructTable(items);
    expect(grid).toEqual([
      ["A", "B"],
      ["a", "b"],
    ]);
  });

  it("좁은 간격의 조각들은 한 셀로 합쳐진다", () => {
    // "Hello" "World" 가 작은 간격으로 → 한 셀.
    const items = [t("Hello", 0, 0, 40, 10), t("World", 45, 0, 40, 10)];
    const grid = reconstructTable(items);
    expect(grid).toEqual([["Hello World"]]);
  });

  it("한 줄 문장은 보통 띄어쓰기로 칸칸이 쪼개지지 않는다(과분할 방지)", () => {
    // 단어 사이 간격(12)이 글자 높이(10)보다 크지만 2배(20) 미만 → 한 칸 유지.
    const items = [t("AAA", 0, 0, 30), t("BBB", 42, 0, 30), t("CCC", 84, 0, 30)];
    expect(reconstructTable(items)).toEqual([["AAA BBB CCC"]]);
  });

  it("머리말 블록과 품목표를 구획으로 분리(블록 사이 빈 행)", () => {
    // 머리말 한 줄 → 큰 세로 간격 → 품목표 3행. 블록마다 열을 따로 잡아야 한다.
    const items = [
      t("INVOICE NO", 0, 0, 80), t("2024-1", 400, 0, 50),
      t("Description", 0, 100, 80), t("Qty", 400, 100, 30),
      t("Widget", 0, 120, 60), t("10", 400, 120, 20),
      t("Gadget", 0, 140, 60), t("5", 400, 140, 10),
    ];
    const grid = reconstructTable(items);
    expect(grid).toEqual([
      ["INVOICE NO", "2024-1"], // 머리말 블록
      ["", ""], // 구획 구분 빈 행
      ["Description", "Qty"], // 품목표 블록
      ["Widget", "10"],
      ["Gadget", "5"],
    ]);
  });
});
