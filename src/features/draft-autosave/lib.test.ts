import { describe, it, expect } from "vitest";
import { isEmptyDraft } from "./lib";
import { createEmptyInvoice } from "@/entities/invoice/model";

describe("isEmptyDraft", () => {
  it("treats a freshly created invoice as empty", () => {
    expect(isEmptyDraft(createEmptyInvoice())).toBe(true);
  });

  it("still treats a profile-only form (seller + bank auto-filled) as empty", () => {
    const form = createEmptyInvoice();
    form.sellerCompanyName = "Upsight Co.";
    form.sellerAddress = "Seoul";
    form.bankInfo.bankName = "KB";
    form.bankInfo.accountNo = "123-456";
    expect(isEmptyDraft(form)).toBe(true);
  });

  it("is not empty once an invoice number is entered", () => {
    const form = createEmptyInvoice();
    form.invoiceNo = "PI-2026-001";
    expect(isEmptyDraft(form)).toBe(false);
  });

  it("is not empty once a buyer company is entered", () => {
    const form = createEmptyInvoice();
    form.buyerSnapshot.companyName = "ACME Importers";
    expect(isEmptyDraft(form)).toBe(false);
  });

  it("is not empty once an item gains a description", () => {
    const form = createEmptyInvoice();
    form.items[0].description = "Widget";
    expect(isEmptyDraft(form)).toBe(false);
  });
});
