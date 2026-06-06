import { useTranslation } from "react-i18next";

export function LoginHero() {
  const { t } = useTranslation();

  return (
    <div className="relative hidden md:block md:w-1/2 lg:w-[60%] min-h-screen overflow-hidden">
      <img
        src="/assets/login-hero.jpg"
        alt=""
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-primary/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/10" />
      <div className="relative z-10 h-full flex flex-col items-start justify-center px-8 lg:px-10 text-primary-foreground">
        <div className="flex items-center gap-4 mb-6">
          <img
            src="/assets/tradedocu-logo.png"
            alt="TradeDocu"
            className="w-12 h-12 lg:w-16 lg:h-16 drop-shadow-lg"
          />
          <h1 className="text-3xl font-bold tracking-tight text-white">TradeDocu</h1>
        </div>
        <p className="text-4xl md:text-5xl lg:text-6xl font-bold max-w-md leading-tight text-white drop-shadow-md">
          {t("auth.heroTagline").split(", ").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <>
                  ,<br className="hidden md:block" />{" "}
                </>
              )}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
