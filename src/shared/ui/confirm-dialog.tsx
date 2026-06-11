import { Button } from "./primitives/button";
import { ModalShell } from "./modal-shell";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  descriptionNote?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  descriptionNote,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive,
}: ConfirmDialogProps) {
  return (
    <ModalShell open={open} labelledBy="confirm-dialog-title" onClose={onCancel}>
      <h2 id="confirm-dialog-title" className="text-lg font-semibold text-primary">
        {title}
      </h2>
      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
        <p>{description}</p>
        {descriptionNote && <p>{descriptionNote}</p>}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={destructive ? "destructive" : "default"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </ModalShell>
  );
}
