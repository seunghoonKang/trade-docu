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
import { editorLabelClassName } from "./input";

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
  variant?: "default" | "editor";
}

export function DatePicker({ label, value, onChange, className, variant = "default" }: DatePickerProps) {
  const { i18n } = useTranslation();

  const locale = localeMap[i18n.language] ?? enUS;
  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const displayValue =
    selected && isValid(selected) ? format(selected, "PPP", { locale }) : "";

  const inputId = label?.toLowerCase().replace(/\s+/g, "-");

  const isEditor = variant === "editor";

  return (
    <div className={cn("flex flex-col", isEditor ? "gap-2" : "gap-1", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className={isEditor ? editorLabelClassName : "text-sm font-medium text-muted-foreground"}
        >
          {label}
        </label>
      )}
      <Popover>
        <PopoverTrigger
          id={inputId}
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
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            locale={locale}
            selected={selected}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, "yyyy-MM-dd"));
              }
            }}
            defaultMonth={selected}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
