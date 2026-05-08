import { cn } from "@/shared/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-500">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md transition-colors",
          "hover:border-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-500",
          "placeholder:text-gray-300",
          className
        )}
        {...props}
      />
    </div>
  );
}
