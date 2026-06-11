import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { FieldLabel } from "./field-label";
import { editorInputClassName, editorLabelClassName } from "./input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  variant?: "default" | "editor";
}

export function Select({ label, required, options, className, id, variant = "default", ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const isEditor = variant === "editor";

  return (
    <div className={cn("flex flex-col", isEditor ? "gap-2" : "gap-1")}>
      {label && (
        <FieldLabel
          htmlFor={selectId}
          required={required}
          className={isEditor ? editorLabelClassName : "text-sm font-medium text-muted-foreground"}
        >
          {label}
        </FieldLabel>
      )}
      <div className="relative">
        <select
          id={selectId}
          aria-required={required || undefined}
          className={cn(
            isEditor
              ? cn(editorInputClassName, "appearance-none pr-9")
              : [
                  "w-full px-3 pr-9 py-2 text-base bg-card border border-input rounded-md transition-colors appearance-none",
                  "hover:border-ring/60",
                  "focus:outline-none focus:ring-2 focus:ring-ring/25 focus:border-ring",
                ],
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}
