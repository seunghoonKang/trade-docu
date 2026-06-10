import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import i18n from "@/shared/i18n";
import { ServiceGuideOverlay } from "./ServiceGuideOverlay";
import { MEMBER_GUIDE_STEPS } from "../lib/steps";

function renderOverlay(
  overrides: Partial<React.ComponentProps<typeof ServiceGuideOverlay>> = {},
  routerPath = "/",
) {
  const props = {
    isOpen: true,
    steps: MEMBER_GUIDE_STEPS,
    stepIndex: 0,
    onClose: vi.fn(),
    onNext: vi.fn(),
    onPrev: vi.fn(),
    onNavigate: vi.fn(),
    onFinish: vi.fn(),
    ...overrides,
  };

  return {
    ...render(
      <MemoryRouter initialEntries={[routerPath]}>
        <I18nextProvider i18n={i18n}>
          <ServiceGuideOverlay {...props} />
        </I18nextProvider>
      </MemoryRouter>,
    ),
    props,
  };
}

describe("ServiceGuideOverlay", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(min-width: 768px)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("닫혀 있으면 렌더하지 않는다", () => {
    const { container } = renderOverlay({ isOpen: false });
    expect(container.firstChild).toBeNull();
  });

  it("환영 단계 제목과 설명을 표시한다", () => {
    renderOverlay();
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByRole("heading", { name: /One deal|한 거래/i })).toBeDefined();
  });

  it("다음 버튼 클릭 시 onNext를 호출한다", () => {
    const { props } = renderOverlay();
    fireEvent.click(screen.getByRole("button", { name: /Next|다음|次へ|下一步/i }));
    expect(props.onNext).toHaveBeenCalledOnce();
  });

  it("닫기 버튼 클릭 시 onClose를 호출한다", () => {
    const { props } = renderOverlay();
    fireEvent.click(screen.getByRole("button", { name: /Close|닫기|閉じる|关闭/i }));
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it("Esc 키 입력 시 onClose를 호출한다", () => {
    const { props } = renderOverlay();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it("다른 페이지 스텝에서는 이동 CTA를 표시한다", () => {
    renderOverlay({ stepIndex: 3 });
    expect(screen.getByRole("button", { name: /History|기록|履歴|历史/i })).toBeDefined();
  });

  it("다른 페이지 스텝에서는 카드를 중앙에 표시한다", () => {
    renderOverlay({ stepIndex: 1 }, "/history");
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("-translate-x-1/2");
    expect(dialog.className).toContain("-translate-y-1/2");
  });
});
