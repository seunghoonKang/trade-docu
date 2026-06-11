import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface ModalShellProps {
  open: boolean;
  /** aria-labelledby로 연결할 제목 요소의 id — 내용 쪽에서 같은 id를 붙인다. */
  labelledBy: string;
  onClose: () => void;
  /** 다이얼로그 카드 확장(max-w-*, flex 레이아웃 등). */
  className?: string;
  children: ReactNode;
}

/**
 * 오버레이 + 다이얼로그 카드 공통 셸 — 바깥 클릭으로 닫히고 내용은 주입받는다.
 * 도메인을 모르는 표현 셸(shared 규칙): 제목/본문/버튼은 children으로 구성한다.
 */
export function ModalShell({ open, labelledBy, onClose, className, children }: ModalShellProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn("bg-card rounded-lg border border-border w-full max-w-md p-6 shadow-lg", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
