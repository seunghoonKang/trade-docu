import { useEffect, useState } from "react";
import {
  HelpCircle,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { mainNavItems } from "@/shared/config";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logout } from "@/features/auth";
import { useServiceGuide } from "@/features/service-guide";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

interface SidebarItem {
  id: string;
  icon: LucideIcon;
  labelKey: string;
  href?: string;
  disabled?: boolean;
  action?: "logout" | "guide";
  guideTarget?: string;
}

const navGuideTargets: Record<string, string> = {
  invoices: "nav-invoices",
  history: "nav-history",
};

// 본 콘텐츠(상단)와 보조 도구(하단)를 구역으로 분리해 배치한다.
const primaryItems: SidebarItem[] = mainNavItems
  .filter((item) => item.section !== "secondary")
  .map((item) => ({ ...item, guideTarget: navGuideTargets[item.id] }));

const toolItems: SidebarItem[] = mainNavItems.filter((item) => item.section === "secondary");

const bottomItems: SidebarItem[] = [
  { id: "userGuide", icon: HelpCircle, labelKey: "nav.userGuide", action: "guide" },
  { id: "logout", icon: LogOut, labelKey: "nav.logout", action: "logout" },
];

function SidebarNavButton({
  item,
  active,
  expanded,
  onNavigate,
  onLogout,
  onOpenGuide,
}: {
  item: SidebarItem;
  active: boolean;
  expanded: boolean;
  onNavigate: (href: string) => void;
  onLogout: () => void;
  onOpenGuide: () => void;
}) {
  const { t } = useTranslation();
  const label = t(item.labelKey);
  const Icon = item.icon;

  const iconShellClass = cn(
    "flex size-10 shrink-0 items-center justify-center rounded-lg transition-all",
    active && "bg-primary text-primary-foreground shadow-md",
    !active && !item.disabled && "text-muted-foreground hover:bg-accent hover:text-foreground",
    item.disabled && "border border-dashed border-border/70 bg-muted/40 text-muted-foreground/70",
  );

  const rowClass = cn(
    "flex h-12 w-full items-center transition-colors",
    expanded ? "gap-3 px-3" : "justify-center gap-0 px-0",
  );

  const labelClass = cn(
    "block truncate text-xs font-semibold tracking-wide whitespace-nowrap",
    item.disabled ? "text-muted-foreground" : "text-foreground",
  );

  const content = (
    <>
      <span className={iconShellClass}>
        <Icon className="size-5" aria-hidden />
      </span>
      <span
        className={cn(
          "min-w-0 overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          expanded ? "flex-1" : "w-0",
        )}
      >
        <span className={labelClass}>{label}</span>
      </span>
    </>
  );

  if (item.disabled) {
    return (
      <Tooltip>
        <TooltipTrigger className={cn(rowClass, "cursor-not-allowed")}>
          <span
            role="button"
            aria-disabled="true"
            aria-label={label}
            title={label}
            tabIndex={0}
            className={cn("flex w-full items-center", expanded ? "gap-3" : "justify-center gap-0")}
          >
            {content}
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">{t("nav.comingSoon")}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      className={rowClass}
      aria-label={label}
      title={label}
      aria-current={active ? "page" : undefined}
      data-guide={item.guideTarget}
      onClick={() => {
        if (item.action === "logout") {
          onLogout();
        } else if (item.action === "guide") {
          onOpenGuide();
        } else if (item.href) {
          onNavigate(item.href);
        }
      }}
    >
      {content}
    </button>
  );
}

export function AppSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { openGuide, isOpen, currentStep } = useServiceGuide();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (currentStep?.target?.includes('data-guide="nav-')) {
      setExpanded(true);
    }
  }, [isOpen, currentStep]);

  function isActive(item: SidebarItem) {
    if (!item.href) return false;
    if (pathname === item.href) return true;
    return item.href !== "/" && pathname.startsWith(`${item.href}/`);
  }

  async function handleLogout() {
    await logout();
    toast.success(t("auth.logoutSuccess"));
  }

  return (
    <TooltipProvider delay={200}>
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] flex-col overflow-hidden border-r border-border bg-secondary transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex",
          expanded ? "w-[260px]" : "w-[72px]",
        )}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
          {primaryItems.map((item) => (
            <SidebarNavButton
              key={item.id}
              item={item}
              active={isActive(item)}
              expanded={expanded}
              onNavigate={navigate}
              onLogout={handleLogout}
              onOpenGuide={openGuide}
            />
          ))}
        </nav>

        <div className="mt-auto shrink-0">
          {toolItems.length > 0 && (
            <div className="space-y-1 border-t border-border/60 px-2 py-3">
              {toolItems.map((item) => (
                <SidebarNavButton
                  key={item.id}
                  item={item}
                  active={isActive(item)}
                  expanded={expanded}
                  onNavigate={navigate}
                  onLogout={handleLogout}
                  onOpenGuide={openGuide}
                />
              ))}
            </div>
          )}

          <div className="space-y-1 border-t border-border px-2 py-4">
            {bottomItems.map((item) => (
              <SidebarNavButton
                key={item.id}
                item={item}
                active={isActive(item)}
                expanded={expanded}
                onNavigate={navigate}
                onLogout={handleLogout}
                onOpenGuide={openGuide}
              />
            ))}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
