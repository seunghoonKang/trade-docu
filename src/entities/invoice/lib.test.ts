import { describe, it, expect } from "vitest";
import {
  calcItemAmount,
  calcSubtotal,
  calcAdditionalChargesTotal,
  calcTotalAmount,
} from "./lib";
import type { InvoiceItem, AdditionalCharge } from "./model";

describe("calcItemAmount", () => {
  it("multiplies qty by unitPrice", () => {
    expect(calcItemAmount(3, 27.2)).toBe(81.6);
  });

  it("returns 0 when qty is 0", () => {
    expect(calcItemAmount(0, 100)).toBe(0);
  });

  it("handles decimal precision", () => {
    expect(calcItemAmount(7, 14.99)).toBe(104.93);
  });
});

describe("calcSubtotal", () => {
  it("sums all item amounts", () => {
    const items: InvoiceItem[] = [
      { description: "", hsCode: "", qty: 3, unit: "PCS", unitPrice: 27.2, amount: 81.6, remarks: "" },
      { description: "", hsCode: "", qty: 3, unit: "PCS", unitPrice: 30.6, amount: 91.8, remarks: "" },
    ];
    expect(calcSubtotal(items)).toBe(173.4);
  });

  it("returns 0 for empty items", () => {
    expect(calcSubtotal([])).toBe(0);
  });
});

describe("calcAdditionalChargesTotal", () => {
  it("sums all additional charges", () => {
    const charges: AdditionalCharge[] = [
      { description: "EMS", amount: 30 },
      { description: "Insurance", amount: 15 },
    ];
    expect(calcAdditionalChargesTotal(charges)).toBe(45);
  });

  it("returns 0 for empty charges", () => {
    expect(calcAdditionalChargesTotal([])).toBe(0);
  });
});

describe("calcTotalAmount", () => {
  it("sums subtotal and additional charges", () => {
    const items: InvoiceItem[] = [
      { description: "", hsCode: "", qty: 3, unit: "PCS", unitPrice: 27.2, amount: 81.6, remarks: "" },
      { description: "", hsCode: "", qty: 3, unit: "PCS", unitPrice: 27.2, amount: 81.6, remarks: "" },
      { description: "", hsCode: "", qty: 3, unit: "PCS", unitPrice: 30.6, amount: 91.8, remarks: "" },
    ];
    const charges: AdditionalCharge[] = [{ description: "EMS", amount: 30 }];
    expect(calcTotalAmount(items, charges)).toBe(285);
  });
});
