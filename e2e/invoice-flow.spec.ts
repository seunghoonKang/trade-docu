import { test, expect } from "@playwright/test";

test("guest can fill invoice and see preview update", async ({ page }) => {
  await page.goto("/");

  // Fill invoice number — Input generates id from label: "Invoice No." → "invoice-no."
  // Use label text via for/htmlFor association; getByLabel handles this
  await page.getByLabel("Invoice No.").fill("TEST-001");

  // Fill seller company name — first "Company Name" input (seller comes before buyer)
  const companyInputs = page.getByLabel("Company Name");
  await companyInputs.first().fill("Test Seller Co.");

  // Preview panel shows invoiceNo and sellerCompanyName
  const preview = page.locator("#invoice-preview");
  await expect(preview).toContainText("TEST-001");
  await expect(preview).toContainText("Test Seller Co.");
});

test("language switcher changes UI labels", async ({ page }) => {
  await page.goto("/");

  // Click Japanese language button
  await page.getByText("日本語").click();

  // Japanese translation for invoice.proformaInvoice is "プロフォーマインボイス"
  await expect(page.getByText("プロフォーマインボイス")).toBeVisible();
});
