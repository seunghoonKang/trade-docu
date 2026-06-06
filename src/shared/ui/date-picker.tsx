import { format, parse, isValid, type Locale } from "date-fns";
import { ko, enUS, zhCN, ja } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/shared/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { FieldLabel } from "./field-label";
import { editorLabelClassName } from "./input";

const localeMap: Record<string, Locale> = {
  ko,
  en: enUS,
  zh: zhCN,
  ja,
};

interface DatePickerProps {
  label?: string;
  required?: boolean;
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  className?: string;
  variant?: "default" | "editor";
}

export function DatePicker({ label, required, value, onChange, className, variant = "default" }: DatePickerProps) {
  const { i18n } = useTranslation();

  const locale = localeMap[i18n.language] ?? enUS;
  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const displayValue =
    selected && isValid(selected) ? format(selected, "PPP", { locale }) : "";

  const inputId = label?.toLowerCase().replace(/\s+/g, "-");

  const isEditor = variant === "editor";
  const currentYear = new Date().getFullYear();
  const calendarStartMonth = new Date(currentYear - 20, 0);
  const calendarEndMonth = new Date(currentYear + 5, 11);
  const initialMonth = selected && isValid(selected) ? selected : new Date();

  return (
    <div className={cn("flex flex-col", isEditor ? "gap-2" : "gap-1", className)}>
      {label && (
        <FieldLabel
          htmlFor={inputId}
          required={required}
          className={isEditor ? editorLabelClassName : "text-sm font-medium text-muted-foreground"}
        >
          {label}
        </FieldLabel>
      )}
      <Popover>
        <PopoverTrigger
          id={inputId}
          aria-required={required || undefined}
          className={cn(
            "w-full text-left bg-background border border-input transition-colors",
            "flex h-11 items-center justify-between cursor-pointer rounded-lg px-4 text-sm",
            "hover:border-ring/60",
            "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
            !isEditor && "rounded-md bg-card px-3 py-2 text-base focus:ring-2 focus:ring-primary/20",
            !displayValue && "text-muted-foreground/50",
          )}
        >
          <span>{displayValue || "\u00A0"}</span>
          <CalendarIcon className="size-4 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto min-w-0 p-0">
          <Calendar
            className="[--calendar-pad-inline:0.75rem] [--cell-size:2rem] p-3"
            mode="single"
            locale={locale}
            captionLayout="dropdown"
            navLayout="around"
            reverseYears
            startMonth={calendarStartMonth}
            endMonth={calendarEndMonth}
            selected={selected}
            defaultMonth={initialMonth}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, "yyyy-MM-dd"));
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
