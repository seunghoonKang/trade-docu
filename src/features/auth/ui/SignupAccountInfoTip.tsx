import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/primitives/tooltip";

export function SignupAccountInfoTip() {
  const { t } = useTranslation();

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger
          type="button"
          className="text-muted-foreground hover:text-foreground transition-colors rounded-full"
          aria-label={t("auth.separateAccountSignupTipTitle")}
        >
          <Info className="size-4" aria-hidden />
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px] space-y-2 text-left">
          <p>{t("auth.separateAccountSignupTip")}</p>
          <p className="text-muted-foreground">{t("auth.separateAccountSignupTipWarning")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
