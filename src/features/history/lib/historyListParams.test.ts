import { describe, it, expect, vi } from "vitest";
import {
  parseHistoryPage,
  parseHistorySort,
  readHistoryListParams,
  patchHistoryListParams,
} from "./historyListParams";

describe("페이지 번호 파싱", () => {
  it("잘못되거나 비어 있는 값은 1페이지로 처리한다", () => {
    expect(parseHistoryPage(null)).toBe(1);
    expect(parseHistoryPage("")).toBe(1);
    expect(parseHistoryPage("0")).toBe(1);
    expect(parseHistoryPage("-2")).toBe(1);
    expect(parseHistoryPage("abc")).toBe(1);
  });

  it("양의 정수 페이지 번호를 파싱한다", () => {
    expect(parseHistoryPage("2")).toBe(2);
    expect(parseHistoryPage("2.9")).toBe(2);
  });
});

describe("정렬 방향 파싱", () => {
  it("asc 토큰일 때만 오름차순을 반환한다", () => {
    expect(parseHistorySort("asc")).toBe("asc");
    expect(parseHistorySort(null)).toBe("desc");
    expect(parseHistorySort("desc")).toBe("desc");
  });
});

describe("목록 URL 파라미터 읽기", () => {
  it("검색 파라미터에서 페이지·검색어·정렬을 읽는다", () => {
    const params = new URLSearchParams("page=3&q=acme&sort=asc");
    expect(readHistoryListParams(params)).toEqual({
      page: 3,
      query: "acme",
      sort: "asc",
    });
  });

  it("누락된 파라미터는 기본값으로 채운다", () => {
    expect(readHistoryListParams(new URLSearchParams())).toEqual({
      page: 1,
      query: "",
      sort: "desc",
    });
  });
});

describe("목록 URL 파라미터 갱신", () => {
  function runPatch(
    initial: string,
    updates: Parameters<typeof patchHistoryListParams>[1],
  ) {
    let result = "";
    const setSearchParams = vi.fn((updater) => {
      const prev = new URLSearchParams(initial);
      const next = typeof updater === "function" ? updater(prev) : updater;
      result = next.toString();
    }) as Parameters<typeof patchHistoryListParams>[0];

    patchHistoryListParams(setSearchParams, updates);
    return { result, setSearchParams };
  }

  it("1보다 큰 페이지는 page 파라미터를 추가한다", () => {
    const { result } = runPatch("", { page: 2 });
    expect(result).toBe("page=2");
  });

  it("1페이지로 돌아가면 page 파라미터를 제거한다", () => {
    const { result } = runPatch("page=3&q=test", { page: 1 });
    expect(result).toBe("q=test");
  });

  it("검색어 변경 시 query를 설정하고 페이지를 1로 초기화한다", () => {
    const { result } = runPatch("page=2", { query: "buyer", page: 1 });
    expect(result).toBe("q=buyer");
  });

  it("빈 검색어는 q 파라미터를 제거한다", () => {
    const { result } = runPatch("q=old", { query: "" });
    expect(result).toBe("");
  });

  it("오름차순은 유지하고 기본 내림차순은 파라미터에서 생략한다", () => {
    expect(runPatch("", { sort: "asc" }).result).toBe("sort=asc");
    expect(runPatch("sort=asc", { sort: "desc" }).result).toBe("");
  });

  it("파라미터 갱신 시 replace 네비게이션을 사용한다", () => {
    const { setSearchParams } = runPatch("", { page: 2 });
    expect(setSearchParams).toHaveBeenCalledWith(expect.any(Function), { replace: true });
  });
});
