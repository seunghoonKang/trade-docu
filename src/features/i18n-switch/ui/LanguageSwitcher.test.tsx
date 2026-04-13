import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../shared/i18n/config";
import { LanguageSwitcher } from "./LanguageSwitcher";

describe("LanguageSwitcher", () => {
  it("renders all 4 language buttons", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );
    expect(screen.getByText("한국어")).toBeDefined();
    expect(screen.getByText("EN")).toBeDefined();
    expect(screen.getByText("中文")).toBeDefined();
    expect(screen.getByText("日本語")).toBeDefined();
  });

  it("switches language when clicked", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );
    fireEvent.click(screen.getByText("日本語"));
    expect(i18n.language).toBe("ja");
  });
});
