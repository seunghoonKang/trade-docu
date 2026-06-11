import { describe, expect, it } from "vitest";
import type { BuyerSnapshot } from "@/entities/invoice";
import { createSeparatedParty, partyDisplayValues } from "./partyMirror";

const buyer: BuyerSnapshot = {
  companyName: "ACME Trading",
  address: "Seoul",
  tel: "02-123-4567",
  contactPerson: "Kim",
};

describe("partyDisplayValues", () => {
  it("동일 상태(null)면 구매자 값을 미러링한다", () => {
    expect(partyDisplayValues(buyer, null)).toEqual(buyer);
  });

  it("구매자 값이 바뀌면 동일 상태의 표시값도 따라간다", () => {
    const updated = { ...buyer, address: "Busan" };
    expect(partyDisplayValues(updated, null).address).toBe("Busan");
  });

  it("분리 상태면 분리된 당사자 값을 그대로 쓴다", () => {
    const separate: BuyerSnapshot = { ...buyer, companyName: "Globex" };
    expect(partyDisplayValues(buyer, separate).companyName).toBe("Globex");
  });
});

describe("createSeparatedParty", () => {
  it("구매자 값의 복사본으로 시작한다 (빈 폼이 아님)", () => {
    expect(createSeparatedParty(buyer)).toEqual(buyer);
  });

  it("복사본 편집이 구매자 원본에 영향을 주지 않는다", () => {
    const separated = createSeparatedParty(buyer);
    separated.address = "Tokyo";
    expect(buyer.address).toBe("Seoul");
  });
});
