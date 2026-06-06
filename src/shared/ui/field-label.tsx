import { cn } from "@/shared/lib/utils";

interface FieldLabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export function FieldLabel({ htmlFor, children, required, className }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
      {required && (
        <span className="ml-1 font-semibold text-destructive" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}

export function SectionTitle({ title, required, className }: { title: string; required?: boolean; className?: string }) {
  return (
    <span className={cn(className)}>
      {title}
      {required && (
        <span className="ml-1 font-semibold text-destructive" aria-hidden>
          *
        </span>
      )}
    </span>
  );
}
