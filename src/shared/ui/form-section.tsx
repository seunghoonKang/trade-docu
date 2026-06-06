import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: "default" | "card";
}

export function FormSection({ title, children, icon: Icon, variant = "default" }: FormSectionProps) {
  if (variant === "card") {
    return (
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <header className="mb-4 flex items-center gap-2 border-b border-border pb-3">
          {Icon && <Icon className="size-5 shrink-0 text-primary" aria-hidden />}
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        </header>
        <div className="space-y-4">{children}</div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h3 className={cn("border-b border-border pb-2 text-base font-semibold text-foreground")}>
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
