import { useEffect, useRef, useState } from "react";
import { ChevronDown, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";
import { APP_LANGUAGES, resolveAppLanguage } from "@/shared/i18n";

interface GlobeLanguageSwitcherProps {
  placement?: "above" | "below";
  showLabel?: boolean;
  className?: string;
}

export function GlobeLanguageSwitcher({
  placement = "below",
  showLabel = true,
  className,
}: GlobeLanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const value = resolveAppLanguage(i18n.language);
  const currentLabel = APP_LANGUAGES.find((l) => l.value === value)?.loginLabel ?? "한국어 (KR)";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Language"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "text-muted-foreground transition-colors hover:text-primary",
          showLabel
            ? "flex items-center gap-1 text-xs"
            : "flex items-center justify-center size-10 rounded-full hover:bg-accent active:opacity-80",
        )}
      >
        <Languages className={showLabel ? "size-3.5" : "size-5"} />
        {showLabel && (
          <>
            <span>{currentLabel}</span>
            <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
          </>
        )}
      </button>
      {open && (
        <div
          className={cn(
            "absolute right-0 z-30 w-36 rounded-md border border-border bg-card py-1 shadow-md",
            placement === "above" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {APP_LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => {
                i18n.changeLanguage(lang.value);
                setOpen(false);
              }}
              className={cn(
                "block w-full px-3 py-2 text-left text-xs transition-colors hover:bg-muted",
                lang.value === value ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {lang.loginLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
