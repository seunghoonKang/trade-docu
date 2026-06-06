import { cn } from "@/shared/lib/utils";

export const editorLabelClassName =
  "text-xs font-semibold uppercase tracking-wider text-secondary-foreground";

export const editorInputClassName =
  "w-full h-11 px-4 text-sm bg-background border border-input rounded-lg transition-colors hover:border-ring/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50";

export const editorInlineInputClassName =
  "w-full h-9 px-2 text-sm bg-background border border-input rounded-lg transition-colors hover:border-ring/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: "default" | "editor";
}

export function Input({ label, className, id, variant = "default", ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const isEditor = variant === "editor";

  return (
    <div className={cn("flex flex-col", isEditor ? "gap-2" : "gap-1")}>
      {label && (
        <label
          htmlFor={inputId}
          className={isEditor ? editorLabelClassName : "text-sm font-medium text-muted-foreground"}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
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
