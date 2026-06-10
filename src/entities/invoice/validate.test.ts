import { describe, it, expect } from "vitest";
import { validateDocument, validateInvoice } from "./validate";
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

describe("validateDocument (양식별, #27)", () => {
  it("CI는 원산지가 비면 경고하고(차단 아님), 채우면 경고도 없다", () => {
    const form = validInvoice();
    const empty = validateDocument(form, "CI");
    expect(empty.blocking).not.toContain("originCountry");
    expect(empty.warnings).toContain("originCountry");

    form.originCountry = "KOREA";
    expect(validateDocument(form, "CI").warnings).not.toContain("originCountry");
  });

  it("PI/PL은 원산지를 요구하지 않는다", () => {
    const form = validInvoice();
    expect(validateDocument(form, "PI").warnings).not.toContain("originCountry");
    expect(validateDocument(form, "PL").warnings).not.toContain("originCountry");
  });

  it("PL은 단가 0이어도 명세+수량만 있으면 품목을 통과시킨다(가격 숨김 양식)", () => {
    const form = validInvoice();
    form.items = [{ ...createEmptyItem(), description: "Widget", qty: 10, unitPrice: 0 }];
    expect(validateDocument(form, "PL").blocking).not.toContain("items");
    expect(validateDocument(form, "CI").blocking).toContain("items");
  });

  it("PL은 은행정보 경고를 내지 않는다(결제정보 없는 양식)", () => {
    const form = validInvoice();
    expect(validateDocument(form, "PI").warnings).toContain("bankInfo");
    expect(validateDocument(form, "PL").warnings).not.toContain("bankInfo");
  });

  it("legacy 폼(originCountry 필드 없음)도 CI 검증이 안전하게 경고한다", () => {
    const form = validInvoice();
    delete form.originCountry;
    expect(validateDocument(form, "CI").warnings).toContain("originCountry");
  });
});
