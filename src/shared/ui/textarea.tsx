import { cn } from "@/shared/lib/utils";
import { editorInputClassName, editorLabelClassName } from "./input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  variant?: "default" | "editor";
}

export function Textarea({ label, className, id, variant = "default", ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const isEditor = variant === "editor";

  return (
    <div className={cn("flex flex-col", isEditor ? "gap-2" : "gap-1")}>
      {label && (
        <label
          htmlFor={textareaId}
          className={isEditor ? editorLabelClassName : "text-sm font-medium text-muted-foreground"}
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          isEditor
            ? cn(editorInputClassName, "h-auto min-h-[72px] resize-none py-3")
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
