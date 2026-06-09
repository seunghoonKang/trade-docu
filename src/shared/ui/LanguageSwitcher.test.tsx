import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/shared/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

describe("LanguageSwitcher", () => {
  it("renders all 4 language options", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );
    expect(screen.getByRole("option", { name: "한국어" })).toBeDefined();
    expect(screen.getByRole("option", { name: "English" })).toBeDefined();
    expect(screen.getByRole("option", { name: "中文" })).toBeDefined();
    expect(screen.getByRole("option", { name: "日本語" })).toBeDefined();
  });

  it("switches language when selection changes", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "ja" } });
    expect(i18n.language).toBe("ja");
  });
});
