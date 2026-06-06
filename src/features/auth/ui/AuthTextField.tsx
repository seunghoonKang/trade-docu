import { cn } from "@/shared/lib/utils";

interface AuthTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function AuthTextField({ icon, trailing, className, ...props }: AuthTextFieldProps) {
  return (
    <div
      className={cn(
        "group relative h-12 w-full rounded-lg border border-input bg-card",
        "transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
        className
      )}
    >
      {icon && (
        <span className="pointer-events-none absolute left-3 top-[15.5px] flex size-5 items-center justify-center text-muted-foreground transition-colors group-focus-within:text-primary [&_svg]:block [&_svg]:size-5">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={cn(
          "h-12 w-full rounded-lg border-0 bg-transparent py-[14px] text-base leading-5 outline-none placeholder:text-muted-foreground/50",
          icon ? "pl-10" : "pl-3",
          trailing ? "pr-10" : "pr-3"
        )}
      />
      {trailing && (
        <span className="absolute right-3 top-[15.5px] flex size-5 items-center justify-center [&_svg]:block [&_svg]:size-5">
          {trailing}
        </span>
      )}
    </div>
  );
}
