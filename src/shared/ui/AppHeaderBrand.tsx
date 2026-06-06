import { useNavigate } from "react-router-dom";

interface AppHeaderBrandProps {
  pageTitle: string;
}

export function AppHeaderBrand({ pageTitle }: AppHeaderBrandProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/")}
      className="flex min-w-0 items-center gap-2.5 rounded-lg text-left transition-opacity hover:opacity-90"
      aria-label="TradeDocu"
    >
      <img
        src="/assets/tradedocu-logo.png"
        alt=""
        className="size-7 shrink-0 md:size-8"
      />
      <span className="flex min-w-0 items-center gap-2 leading-none">
        <span className="hidden text-xl font-bold tracking-tight text-primary md:inline">
          TradeDocu
        </span>
        <span aria-hidden className="hidden text-muted-foreground md:inline">
          ·
        </span>
        <span className="truncate text-base font-semibold text-muted-foreground md:text-sm">
          {pageTitle}
        </span>
      </span>
    </button>
  );
}
