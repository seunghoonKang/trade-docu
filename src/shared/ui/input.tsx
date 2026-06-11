import { cn } from "@/shared/lib/utils";
import { FieldLabel } from "./field-label";

export const editorLabelClassName =
  "text-xs font-semibold uppercase tracking-wider text-secondary-foreground";

export const editorInputClassName =
  "w-full h-11 px-4 text-sm bg-background border border-input rounded-lg transition-colors hover:border-ring/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-muted/50 disabled:text-muted-foreground disabled:hover:border-input";

export const editorInlineInputClassName =
  "w-full h-9 px-2 text-sm bg-background border border-input rounded-lg transition-colors hover:border-ring/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";

export const editorInlineDismissButtonClassName =
  "flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground";

export const editorDismissButtonClassName = cn(
  editorInlineDismissButtonClassName,
  "absolute -right-2 -top-2",
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  variant?: "default" | "editor";
}

export function Input({ label, required, className, id, variant = "default", ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const isEditor = variant === "editor";

  return (
    <div className={cn("flex flex-col", isEditor ? "gap-2" : "gap-1")}>
      {label && (
        <FieldLabel
          htmlFor={inputId}
          required={required}
          className={isEditor ? editorLabelClassName : "text-sm font-medium text-muted-foreground"}
        >
          {label}
        </FieldLabel>
      )}
      <input
        id={inputId}
        aria-required={required || undefined}
        className={cn(
          isEditor
            ? editorInputClassName
            : [
                "w-full px-3 py-2 text-base bg-card border border-input rounded-md transition-colors",
                "hover:border-ring/60",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "placeholder:text-muted-foreground/50",
              ],
          className,
        )}
        {...props}
      />
    </div>
  );
}
