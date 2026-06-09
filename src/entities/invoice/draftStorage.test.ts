import { afterEach, describe, it, expect } from "vitest";
import { isEmptyDraft, saveDraft, loadDraft, clearDraft } from "./draftStorage";
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

describe("draft ownership", () => {
  afterEach(() => {
    clearDraft();
  });

  it("only restores a draft for the same owner", () => {
    const form = createEmptyInvoice();
    form.invoiceNo = "PI-USER-A";

    saveDraft(form, "user-a");
    expect(loadDraft("user-a")?.invoiceNo).toBe("PI-USER-A");
    expect(loadDraft("user-b")).toBeNull();
    expect(loadDraft()).toBeNull();
  });

  it("keeps guest drafts separate from logged-in users", () => {
    const guestDraft = createEmptyInvoice();
    guestDraft.invoiceNo = "PI-GUEST";

    saveDraft(guestDraft, null);
    expect(loadDraft(null)?.invoiceNo).toBe("PI-GUEST");
    expect(loadDraft("user-a")).toBeNull();
  });
});
