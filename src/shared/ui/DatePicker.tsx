import { format, parse, isValid, type Locale } from "date-fns";
import { ko, enUS, zhCN, ja } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

  const locale = localeMap[i18n.language] ?? enUS;
  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const displayValue =
    selected && isValid(selected) ? format(selected, "PPP", { locale }) : "";

  const inputId = label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-500">
          {label}
        </label>
      )}
      <Popover>
        <PopoverTrigger
          id={inputId}
          className={cn(
            "w-full px-3 py-2 text-base text-left border border-gray-200 rounded",
            "flex items-center justify-between",
            "hover:bg-gray-50 cursor-pointer",
            "focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400",
            !displayValue && "text-gray-300"
          )}
        >
          <span>{displayValue || "\u00A0"}</span>
          <CalendarIcon className="size-4 text-gray-400" />
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
