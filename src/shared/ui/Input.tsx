import { cn } from "../lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-gray-500">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-3 py-2 text-sm border border-gray-200 rounded",
          "focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400",
          "placeholder:text-gray-300",
          className
        )}
        {...props}
      />
    </div>
  );
}
