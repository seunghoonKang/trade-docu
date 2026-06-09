import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ProfileSectionCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
  headerExtra?: ReactNode;
}

export function ProfileSectionCard({
  icon,
  title,
  children,
  collapsible = false,
  defaultOpen = true,
  className,
  headerExtra,
}: ProfileSectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border shadow-sm overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 p-4 border-b border-border bg-secondary/50",
          collapsible && "cursor-pointer select-none",
        )}
        onClick={collapsible ? () => setOpen((v) => !v) : undefined}
        onKeyDown={
          collapsible
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen((v) => !v);
                }
              }
            : undefined
        }
        role={collapsible ? "button" : undefined}
        tabIndex={collapsible ? 0 : undefined}
        aria-expanded={collapsible ? open : undefined}
      >
        <span className="text-primary shrink-0">{icon}</span>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary md:text-base md:normal-case md:tracking-normal md:font-semibold flex-1">
          {title}
        </h3>
        {headerExtra}
        {collapsible && (
          <ChevronDown
            className={cn(
              "size-5 text-muted-foreground transition-transform shrink-0",
              open && "rotate-180",
            )}
            aria-hidden
          />
        )}
      </div>
      {(!collapsible || open) && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}
