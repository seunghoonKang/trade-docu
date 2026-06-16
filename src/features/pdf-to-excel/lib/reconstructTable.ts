/**
 * 좌표를 가진 텍스트 조각들 → 행×열 격자(string[][]) 재구성.
 *
 * 디지털 경로(pdfjs 텍스트 아이템)와 스캔 경로(OCR 박스)가 **동일하게** 사용한다.
 * 좌표계는 top-down(y가 클수록 아래). 호출부에서 그 규약으로 변환해 넘긴다.
 *
 * 레이아웃 인식 2단계 — 무역서류처럼 머리말 블록 + 품목표 + 꼬리말이 섞인 문서를
 * "구획에 맞게" 나누기 위해:
 *   1) 블록 분리: 행 간격이 평소보다 크게 벌어지는 지점을 경계로 페이지를 블록으로 나눈다.
 *   2) 블록별 공백강(whitespace river): 여러 행에 걸쳐 세로로 뚫린 빈 공간을 열 경계로 잡는다.
 * 블록마다 열을 따로 잡으므로 머리말 텍스트가 품목표 열에 끼워 맞춰지지 않는다.
 *
 * 휴리스틱이라 100%가 아니다 — 어차피 사람이 리뷰 그리드에서 교정한다(검수가 본체).
 */
export interface PositionedText {
  text: string;
  /** 왼쪽 x. */
  x: number;
  /** 위쪽 y (top-down). */
  y: number;
  width: number;
  height: number;
}

/**
 * 여러 행에 걸쳐 이 비율 이상이 비어 있어야 열 경계(공백강)로 인정.
 * 높게(0.8) 잡아 "거의 모든 행에서 일관되게 빈" 띠만 열로 본다 → 자유 문장 구역의 과분할 방지.
 */
const GAP_EMPTY_FRACTION = 0.8;

interface Line {
  items: PositionedText[];
  top: number;
  bottom: number;
}

function median(values: number[], fallback: number): number {
  const sorted = values.filter((v) => v > 0).sort((a, b) => a - b);
  if (sorted.length === 0) return fallback;
  return sorted[Math.floor(sorted.length / 2)];
}

/** y중심으로 행(라인) 클러스터링. */
function groupIntoLines(items: PositionedText[], rowTol: number): Line[] {
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: Line[] = [];
  for (const item of sorted) {
    const cy = item.y + item.height / 2;
    const line = lines.find((l) => {
      const ly = (l.top + l.bottom) / 2;
      return Math.abs(ly - cy) <= rowTol;
    });
    if (line) {
      line.items.push(item);
      line.top = Math.min(line.top, item.y);
      line.bottom = Math.max(line.bottom, item.y + item.height);
    } else {
      lines.push({ items: [item], top: item.y, bottom: item.y + item.height });
    }
  }
  for (const line of lines) line.items.sort((a, b) => a.x - b.x);
  return lines.sort((a, b) => a.top - b.top);
}

/** 행 사이 세로 간격이 크게 벌어지는 지점을 경계로 블록(구획)을 나눈다. */
function segmentBlocks(lines: Line[], medianH: number): Line[][] {
  if (lines.length <= 1) return lines.length ? [lines] : [];
  const gaps: number[] = [];
  for (let i = 1; i < lines.length; i++) gaps.push(lines[i].top - lines[i - 1].bottom);
  const medGap = median(gaps, medianH * 0.4);
  const breakThreshold = Math.max(medGap * 1.6, medianH * 1.2);

  const blocks: Line[][] = [[lines[0]]];
  for (let i = 1; i < lines.length; i++) {
    const gap = lines[i].top - lines[i - 1].bottom;
    if (gap > breakThreshold) blocks.push([lines[i]]);
    else blocks[blocks.length - 1].push(lines[i]);
  }
  return blocks;
}

/** 블록 안에서 공백강(여러 행에 걸쳐 비어 있는 세로 구간)을 찾아 열 경계 x들을 반환. */
function detectColumnSeparators(block: Line[], medianH: number): number[] {
  const items = block.flatMap((l) => l.items);
  if (items.length === 0) return [];

  // 한 줄짜리 블록(제목·머리말)은 보수적으로 — 글자 높이의 2배 이상 넓은 간격만 열로 본다.
  // (일반 문장이 단어마다 칸칸이 쪼개지지 않게.) 여러 줄 표는 평소 기준.
  const minGap = block.length === 1 ? medianH * 2 : Math.max(medianH * 0.8, 6);

  // 모든 아이템 좌/우 경계를 후보 컷으로.
  const edges = Array.from(
    new Set(items.flatMap((it) => [it.x, it.x + it.width])),
  ).sort((a, b) => a - b);

  // 인접 경계 구간마다 "몇 개 행이 비었는지" 계산해 공백강 후보를 모은다.
  const gapRanges: { start: number; end: number }[] = [];
  for (let i = 1; i < edges.length; i++) {
    const a = edges[i - 1];
    const b = edges[i];
    if (b - a <= 0) continue;
    let coveredLines = 0;
    for (const line of block) {
      if (line.items.some((it) => it.x < b && it.x + it.width > a)) coveredLines++;
    }
    const emptyFraction = (block.length - coveredLines) / block.length;
    if (emptyFraction >= GAP_EMPTY_FRACTION) {
      const last = gapRanges[gapRanges.length - 1];
      if (last && Math.abs(last.end - a) < 0.01) last.end = b;
      else gapRanges.push({ start: a, end: b });
    }
  }

  return gapRanges
    .filter((g) => g.end - g.start >= minGap)
    .map((g) => (g.start + g.end) / 2);
}

/** 한 블록 → 격자(라인×열). 끝의 빈 열은 제거. */
function buildBlockGrid(block: Line[], separators: number[]): string[][] {
  const colCount = separators.length + 1;
  const colIndexOf = (centerX: number): number => {
    let idx = 0;
    while (idx < separators.length && centerX >= separators[idx]) idx++;
    return idx;
  };

  const grid = block.map((line) => {
    const cells = new Array<string>(colCount).fill("");
    for (const it of line.items) {
      const ci = colIndexOf(it.x + it.width / 2);
      cells[ci] = cells[ci] ? `${cells[ci]} ${it.text}` : it.text;
    }
    return cells.map((c) => c.trim());
  });

  // 끝의 전부-빈 열 제거.
  let lastUsed = 0;
  for (const line of grid) {
    for (let c = line.length - 1; c >= 0; c--) {
      if (line[c]) {
        lastUsed = Math.max(lastUsed, c);
        break;
      }
    }
  }
  return grid.map((line) => line.slice(0, lastUsed + 1));
}

export function reconstructTable(items: PositionedText[]): string[][] {
  const clean = items.filter((it) => it.text.trim().length > 0);
  if (clean.length === 0) return [];

  const medianH = median(
    clean.map((i) => i.height),
    8,
  );
  const rowTol = Math.max(medianH * 0.6, 2);

  const lines = groupIntoLines(clean, rowTol);
  const blocks = segmentBlocks(lines, medianH);

  // 블록별로 열을 따로 잡아 격자를 만들고, 블록 사이엔 빈 행을 넣어 구획을 시각적으로 분리.
  const blockGrids = blocks.map((block) =>
    buildBlockGrid(block, detectColumnSeparators(block, medianH)),
  );

  const pageWidth = Math.max(1, ...blockGrids.flat().map((row) => row.length));
  const pad = (row: string[]) =>
    Array.from({ length: pageWidth }, (_, c) => row[c] ?? "");

  const page: string[][] = [];
  blockGrids.forEach((grid, i) => {
    if (i > 0) page.push(new Array<string>(pageWidth).fill("")); // 구획 구분 빈 행
    for (const row of grid) page.push(pad(row));
  });
  return page;
}
