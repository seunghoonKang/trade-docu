import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/shared/i18n/config";
import { ItemsTableSection } from "./ItemsTableSection";
import { createEmptyItem } from "@/entities/invoice/model";

beforeEach(() => {
  i18n.changeLanguage("en");
});

function renderComponent(overrides = {}) {
  const props = {
    items: [createEmptyItem()],
    currency: "USD",
    totalAmount: 0,
    onUpdateItem: vi.fn(),
    onAddItem: vi.fn(),
    onRemoveItem: vi.fn(),
    ...overrides,
  };
  render(
    <I18nextProvider i18n={i18n}>
      <ItemsTableSection {...props} />
    </I18nextProvider>
  );
  return props;
}

describe("ItemsTableSection", () => {
  it("renders one item row by default", () => {
    renderComponent();
    const descInputs = screen.getAllByRole("textbox");
    expect(descInputs.length).toBeGreaterThan(0);
  });

  it("calls onAddItem when add button is clicked", () => {
    const props = renderComponent();
    fireEvent.click(screen.getByText(/add/i));
    expect(props.onAddItem).toHaveBeenCalledOnce();
  });

  it("does not show remove button when only one item", () => {
    renderComponent();
    expect(screen.queryByText(/remove/i)).toBeNull();
  });

  it("shows remove button when multiple items", () => {
    renderComponent({ items: [createEmptyItem(), createEmptyItem()] });
    // 2 items × (mobile card + desktop table row) = 4 remove buttons in JSDOM
    expect(screen.getAllByText(/remove/i)).toHaveLength(4);
  });
});
