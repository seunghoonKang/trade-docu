import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

interface Props {
  rows: string[][];
  onChange: (rows: string[][]) => void;
}

/** 직사각형 보장 — 가장 긴 행 기준으로 모든 행을 패딩. */
function normalize(rows: string[][]): string[][] {
  const colCount = Math.max(1, ...rows.map((r) => r.length));
  return (rows.length ? rows : [[""]]).map((r) =>
    Array.from({ length: colCount }, (_, c) => r[c] ?? ""),
  );
}

/**
 * 추출 결과 검수·교정 그리드(plan: "확인해서" 단계의 본체).
 * 셀 값 편집 + 행/열 추가·삭제 지원. 병합/분할 등 고급 편집은 v1 제외.
 */
export function TableGrid({ rows, onChange }: Props) {
  const { t } = useTranslation();
  const grid = normalize(rows);
  const colCount = grid[0].length;

  function setCell(r: number, c: number, value: string) {
    const next = grid.map((row) => [...row]);
    next[r][c] = value;
    onChange(next);
  }

  function addRow(at: number) {
    const next = grid.map((row) => [...row]);
    next.splice(at, 0, Array.from({ length: colCount }, () => ""));
    onChange(next);
  }

  function deleteRow(r: number) {
    if (grid.length <= 1) {
      onChange([Array.from({ length: colCount }, () => "")]);
      return;
    }
    onChange(grid.filter((_, i) => i !== r));
  }

  function addColumn(at: number) {
    onChange(
      grid.map((row) => {
        const next = [...row];
        next.splice(at, 0, "");
        return next;
      }),
    );
  }

  function deleteColumn(c: number) {
    if (colCount <= 1) {
      onChange(grid.map(() => [""]));
      return;
    }
    onChange(grid.map((row) => row.filter((_, i) => i !== c)));
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="w-10 px-1 py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                #
              </th>
              {Array.from({ length: colCount }, (_, c) => (
                <th key={c} className="min-w-[8rem] border-l border-border px-1 py-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {colLabel(c)}
                    </span>
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="rounded p-0.5 text-muted-foreground/70 hover:bg-accent hover:text-foreground"
                        aria-label={t("pdfTool.addColumn")}
                        title={t("pdfTool.addColumn")}
                        onClick={() => addColumn(c + 1)}
                      >
                        <Plus className="size-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="rounded p-0.5 text-muted-foreground/70 hover:bg-accent hover:text-destructive"
                        aria-label={t("pdfTool.deleteColumn")}
                        title={t("pdfTool.deleteColumn")}
                        onClick={() => deleteColumn(c)}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) => (
              <tr key={r} className="border-b border-border last:border-b-0 hover:bg-muted/20">
                <td className="px-1 py-0.5 text-center align-middle">
                  <button
                    type="button"
                    className="rounded p-0.5 text-muted-foreground/60 hover:bg-accent hover:text-destructive"
                    aria-label={t("pdfTool.deleteRow")}
                    title={t("pdfTool.deleteRow")}
                    onClick={() => deleteRow(r)}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </td>
                {row.map((value, c) => (
                  <td key={c} className="border-l border-border p-0 align-top">
                    {/* 투명 sizer span이 내용 폭을 잡아 셀이 글자 길이에 맞게 늘어남
                        → 잘림 없이 전부 보이고, 표는 좌우 스크롤. 입력창은 그 위에 겹침. */}
                    <div className="grid">
                      <span
                        aria-hidden
                        className="[grid-area:1/1] min-w-[6rem] whitespace-pre select-none px-2 py-1.5 text-transparent"
                      >
                        {value || " "}
                      </span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setCell(r, c, e.target.value)}
                        className={cn(
                          "[grid-area:1/1] w-full bg-transparent px-2 py-1.5 text-foreground outline-none",
                          "focus:bg-primary/5 focus:ring-1 focus:ring-inset focus:ring-primary/40",
                        )}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => addRow(grid.length)}>
        <Plus className="size-4 shrink-0" aria-hidden />
        {t("pdfTool.addRow")}
      </Button>
    </div>
  );
}

/** 0 → A, 25 → Z, 26 → AA … 스프레드시트식 열 라벨. */
function colLabel(index: number): string {
  let label = "";
  let n = index;
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}
