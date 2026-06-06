import { describe, it, expect } from "vitest";
import { buildBuyerDetailLines, buildSellerDetailLines } from "./partyDetails";

describe("buildBuyerDetailLines", () => {
  it("includes address, contact, and tel when present", () => {
    expect(
      buildBuyerDetailLines({
        companyName: "Buyer Co.",
        address: "123 Export Rd",
        tel: "02-111-2222",
        contactPerson: "Jane Doe",
      }),
    ).toEqual(["123 Export Rd", "Attn.: Jane Doe", "Tel: 02-111-2222"]);
  });

  it("omits empty fields", () => {
    expect(
      buildBuyerDetailLines({
        companyName: "Buyer Co.",
        address: "",
        tel: "",
        contactPerson: "",
      }),
    ).toEqual([]);
  });
});

describe("buildSellerDetailLines", () => {
  it("includes address, representative, and combined contact lines", () => {
    expect(
      buildSellerDetailLines({
        companyName: "Seller Co.",
        address: "456 Trade St",
        representative: "Kim",
        tel: "02-333-4444",
        fax: "02-333-4445",
      }),
    ).toEqual([
      "456 Trade St",
      "Representative: Kim",
      "Tel: 02-333-4444  /  Fax: 02-333-4445",
    ]);
  });
});
