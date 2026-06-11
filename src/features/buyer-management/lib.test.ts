import { describe, expect, it } from "vitest";
import type { Buyer } from "@/entities/buyer";
import {
  buyerToPartySnapshot,
  filterBuyers,
  hasDuplicateCompanyName,
  sortBuyersByRecentUse,
} from "./lib";

function buyer(overrides: Partial<Buyer>): Buyer {
  return {
    id: "b1",
    userId: "u1",
    companyName: "ACME Trading",
    address: "Seoul",
    tel: "02-123-4567",
    contactPerson: "Kim",
    createdAt: "2026-01-01T00:00:00Z",
    lastUsedAt: null,
    ...overrides,
  };
}

describe("buyerToPartySnapshot", () => {
  it("4개 당사자 필드만 복사한다 (id·메타데이터 제외)", () => {
    const snapshot = buyerToPartySnapshot(buyer({}));
    expect(snapshot).toEqual({
      companyName: "ACME Trading",
      address: "Seoul",
      tel: "02-123-4567",
      contactPerson: "Kim",
    });
  });
});

describe("hasDuplicateCompanyName", () => {
  const buyers = [buyer({ id: "b1", companyName: "ACME Trading" })];

  it("동일 회사명이 있으면 true", () => {
    expect(hasDuplicateCompanyName(buyers, "ACME Trading")).toBe(true);
  });

  it("대소문자·앞뒤 공백을 무시한다", () => {
    expect(hasDuplicateCompanyName(buyers, "  acme trading ")).toBe(true);
  });

  it("자기 자신(수정 중)은 제외한다", () => {
    expect(hasDuplicateCompanyName(buyers, "ACME Trading", "b1")).toBe(false);
  });

  it("빈 회사명은 중복으로 보지 않는다", () => {
    expect(hasDuplicateCompanyName(buyers, "   ")).toBe(false);
  });

  it("다른 회사명은 false", () => {
    expect(hasDuplicateCompanyName(buyers, "Globex")).toBe(false);
  });
});

describe("filterBuyers", () => {
  const buyers = [
    buyer({ id: "b1", companyName: "ACME Trading", contactPerson: "Kim" }),
    buyer({ id: "b2", companyName: "Globex", contactPerson: "Lee Minho" }),
  ];

  it("회사명 부분 일치(대소문자 무시)", () => {
    expect(filterBuyers(buyers, "acme").map((b) => b.id)).toEqual(["b1"]);
  });

  it("담당자명으로도 검색된다", () => {
    expect(filterBuyers(buyers, "minho").map((b) => b.id)).toEqual(["b2"]);
  });

  it("빈 검색어는 전체를 반환한다", () => {
    expect(filterBuyers(buyers, "  ")).toHaveLength(2);
  });

  it("일치 없으면 빈 배열", () => {
    expect(filterBuyers(buyers, "zzz")).toEqual([]);
  });
});

describe("sortBuyersByRecentUse", () => {
  it("최근 사용이 위, 미사용은 생성순으로 뒤", () => {
    const buyers = [
      buyer({ id: "old-unused", createdAt: "2026-01-01T00:00:00Z" }),
      buyer({ id: "new-unused", createdAt: "2026-03-01T00:00:00Z" }),
      buyer({ id: "used-early", lastUsedAt: "2026-02-01T00:00:00Z" }),
      buyer({ id: "used-late", lastUsedAt: "2026-05-01T00:00:00Z" }),
    ];
    expect(sortBuyersByRecentUse(buyers).map((b) => b.id)).toEqual([
      "used-late",
      "used-early",
      "new-unused",
      "old-unused",
    ]);
  });

  it("원본 배열을 변형하지 않는다", () => {
    const buyers = [
      buyer({ id: "a", lastUsedAt: null }),
      buyer({ id: "b", lastUsedAt: "2026-05-01T00:00:00Z" }),
    ];
    sortBuyersByRecentUse(buyers);
    expect(buyers.map((b) => b.id)).toEqual(["a", "b"]);
  });
});
