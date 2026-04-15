import { useRef, useState, useEffect } from "react";
import { format, parse, isValid } from "date-fns";
import { ko, enUS, zhCN, ja } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Calendar } from "./Calendar";
import { cn } from "../lib/cn";

const localeMap: Record<string, Locale> = {
  ko,
  en: enUS,
  zh: zhCN,
  ja,
};

interface DatePickerProps {
  label?: string;
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  className?: string;
}

export function DatePicker({ label, value, onChange, className }: DatePickerProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const locale = localeMap[i18n.language] ?? enUS;
  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const displayValue =
    selected && isValid(selected) ? format(selected, "PPP", { locale }) : "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const inputId = label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div ref={containerRef} className={cn("relative flex flex-col gap-1", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-500">
          {label}
        </label>
      )}
      <button
        id={inputId}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full px-3 py-2 text-base text-left border border-gray-200 rounded",
          "focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400",
          !displayValue && "text-gray-300"
        )}
      >
        {displayValue || "Pick a date"}
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded shadow-lg">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, "yyyy-MM-dd"));
              }
              setOpen(false);
            }}
            defaultMonth={selected}
          />
        </div>
      )}
    </div>
  );
}
