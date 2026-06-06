import { describe, it, expect } from "vitest";
import { validateInvoice } from "./validate";
import { createEmptyInvoice, createEmptyItem } from "./model";

function validInvoice() {
  const form = createEmptyInvoice();
  form.invoiceNo = "PI-2026-001";
  form.buyerSnapshot.companyName = "ACME Importers";
  form.items = [{ ...createEmptyItem(), description: "Widget", qty: 10, unitPrice: 5 }];
  return form;
}

describe("validateInvoice", () => {
  it("blocks an empty invoice on the three core requirements", () => {
    const { blocking } = validateInvoice(createEmptyInvoice());
    expect(blocking).toContain("invoiceNo");
    expect(blocking).toContain("buyerCompanyName");
    expect(blocking).toContain("items");
  });

  it("passes a complete invoice with no blocking issues", () => {
    expect(validateInvoice(validInvoice()).blocking).toEqual([]);
  });

  it("warns (but does not block) when bank info is missing", () => {
    const result = validateInvoice(validInvoice());
    expect(result.warnings).toContain("bankInfo");
    expect(result.blocking).not.toContain("bankInfo");
  });

  it("does not warn about bank info once a bank name is present", () => {
    const form = validInvoice();
    form.bankInfo.bankName = "KB Bank";
    expect(validateInvoice(form).warnings).not.toContain("bankInfo");
  });

  it("blocks items when the only item has zero quantity or zero unit price", () => {
    const zeroQty = createEmptyInvoice();
    zeroQty.invoiceNo = "PI-1";
    zeroQty.buyerSnapshot.companyName = "ACME";
    zeroQty.items = [{ ...createEmptyItem(), description: "Widget", qty: 0, unitPrice: 5 }];
    expect(validateInvoice(zeroQty).blocking).toContain("items");

    const zeroPrice = createEmptyInvoice();
    zeroPrice.invoiceNo = "PI-1";
    zeroPrice.buyerSnapshot.companyName = "ACME";
    zeroPrice.items = [{ ...createEmptyItem(), description: "Widget", qty: 5, unitPrice: 0 }];
    expect(validateInvoice(zeroPrice).blocking).toContain("items");
  });
});
