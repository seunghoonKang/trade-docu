import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";

interface ContinueAsGuestButtonProps {
  variant: "mobile" | "desktop";
  className?: string;
}

export function ContinueAsGuestButton({ variant, className }: ContinueAsGuestButtonProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = variant === "mobile";

  return (
    <div className={cn("flex justify-center", isMobile ? "pt-2" : "mb-10", className)}>
      <button
        type="button"
        onClick={() => navigate("/")}
        className={cn(
          "flex items-center gap-2 transition-colors active:scale-[0.98]",
          isMobile
            ? "px-4 py-2 text-muted-foreground hover:text-primary"
            : "text-sm text-secondary-foreground hover:text-primary hover:underline",
        )}
      >
        {isMobile && <ArrowRight className="size-5" />}
        <span className={isMobile ? "text-sm font-medium" : undefined}>{t("auth.continueWithoutLogin")}</span>
        {!isMobile && <ArrowRight className="size-[18px]" />}
      </button>
    </div>
  );
}
