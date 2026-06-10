import { describe, expect, it } from "vitest";
import type { Deal } from "@/entities/deal";
import { createEmptyDeal } from "@/entities/deal";
import { buildDealSummaries, matchesDealSummary } from "./summary";

function deal(id: string, overrides: Partial<Deal> = {}): Deal {
  return {
    ...createEmptyDeal(),
    id,
    userId: "u1",
    createdAt: "2026-06-01T00:00:00Z",
    ...overrides,
  };
}

describe("buildDealSummaries", () => {
  it("거래 건별 선적 수·양식별 발행 수·PI 번호를 집계한다(deals 순서 유지)", () => {
    const summaries = buildDealSummaries(
      [deal("d1"), deal("d2")],
      ["d1", "d1", "d2"],
      [
        { dealId: "d1", docType: "PI", docNo: "INV-001" },
        { dealId: "d1", docType: "CI", docNo: "INV-001-1" },
        { dealId: "d1", docType: "PL", docNo: "INV-001-1" },
        { dealId: "d2", docType: "PI", docNo: "INV-002" },
      ],
    );

    expect(summaries.map((s) => s.deal.id)).toEqual(["d1", "d2"]);
    expect(summaries[0].piNo).toBe("INV-001");
    expect(summaries[0].shipmentCount).toBe(2);
    expect(summaries[0].issuedCount).toEqual({ PI: 1, CI: 1, PL: 1 });
    expect(summaries[1].issuedCount).toEqual({ PI: 1, CI: 0, PL: 0 });
  });

  it("선적·문서가 없으면 0으로 채운다", () => {
    const [s] = buildDealSummaries([deal("d1")], [], []);
    expect(s.piNo).toBe("");
    expect(s.shipmentCount).toBe(0);
    expect(s.issuedCount).toEqual({ PI: 0, CI: 0, PL: 0 });
  });
});

describe("matchesDealSummary", () => {
  const [summary] = buildDealSummaries(
    [
      deal("d1", {
        poNo: "PO-77",
        buyerSnapshot: { companyName: "Acme Trading", address: "", tel: "", contactPerson: "" },
      }),
    ],
    [],
    [{ dealId: "d1", docType: "PI", docNo: "INV-001" }],
  );

  it("PI 번호·PO 번호·구매자명으로 대소문자 무시 검색", () => {
    expect(matchesDealSummary(summary, "inv-001")).toBe(true);
    expect(matchesDealSummary(summary, "po-77")).toBe(true);
    expect(matchesDealSummary(summary, "acme")).toBe(true);
    expect(matchesDealSummary(summary, "nope")).toBe(false);
  });

  it("빈 질의는 전부 통과", () => {
    expect(matchesDealSummary(summary, "  ")).toBe(true);
  });
});
