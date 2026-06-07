import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ConfirmDialog } from "./confirm-dialog";

const baseProps = {
  open: true,
  title: "인보이스 삭제",
  description: "PI-001 문서를 삭제하시겠습니까?",
  descriptionNote: "이 작업은 되돌릴 수 없습니다.",
  confirmLabel: "삭제",
  cancelLabel: "취소",
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe("확인 다이얼로그", () => {
  it("닫혀 있으면 아무것도 렌더하지 않는다", () => {
    const { container } = render(<ConfirmDialog {...baseProps} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("제목과 두 줄 설명을 표시한다", () => {
    render(<ConfirmDialog {...baseProps} />);
    expect(screen.getByRole("heading", { name: "인보이스 삭제" })).toBeDefined();
    expect(screen.getByText("PI-001 문서를 삭제하시겠습니까?")).toBeDefined();
    expect(screen.getByText("이 작업은 되돌릴 수 없습니다.")).toBeDefined();
  });

  it("배경을 클릭하면 onCancel을 호출한다", () => {
    const onCancel = vi.fn();
    const { container } = render(<ConfirmDialog {...baseProps} onCancel={onCancel} />);

    const backdrop = container.firstElementChild;
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("다이얼로그 패널을 클릭해도 onCancel을 호출하지 않는다", () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("dialog"));

    expect(onCancel).not.toHaveBeenCalled();
  });
});
