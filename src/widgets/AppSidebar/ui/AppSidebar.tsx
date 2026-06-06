import {
  Archive,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Package,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logout } from "@/features/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/primitives/tooltip";
import { cn } from "@/shared/lib/utils";

interface SidebarItem {
  id: string;
  icon: LucideIcon;
  labelKey: string;
  href?: string;
  disabled?: boolean;
  action?: "logout";
}

const mainItems: SidebarItem[] = [
  { id: "dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard", disabled: true },
  { id: "invoices", icon: FileText, labelKey: "nav.invoices", href: "/" },
  { id: "packingLists", icon: Package, labelKey: "nav.packingLists", disabled: true },
  { id: "archive", icon: Archive, labelKey: "nav.archive", href: "/history" },
];

const bottomItems: SidebarItem[] = [
  { id: "helpCenter", icon: HelpCircle, labelKey: "nav.helpCenter", disabled: true },
  { id: "logout", icon: LogOut, labelKey: "nav.logout", action: "logout" },
];

function SidebarNavButton({
  item,
  active,
  onNavigate,
  onLogout,
}: {
  item: SidebarItem;
  active: boolean;
  onNavigate: (href: string) => void;
  onLogout: () => void;
}) {
  const { t } = useTranslation();
  const label = t(item.labelKey);
  const Icon = item.icon;

  const iconShellClass = cn(
    "flex size-10 shrink-0 items-center justify-center rounded-lg transition-all",
    active && "bg-primary text-primary-foreground shadow-md",
    !active && !item.disabled && "text-muted-foreground hover:bg-accent hover:text-foreground",
    item.disabled && "opacity-50",
  );

  const rowClass = "flex h-12 w-full items-center gap-3 px-3 transition-colors";

  const labelClass =
    "text-xs font-semibold tracking-wide opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap text-foreground";

  const content = (
    <>
      <span className={iconShellClass}>
        <Icon className="size-5" aria-hidden />
      </span>
      <span className={labelClass}>{label}</span>
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
            className="flex w-full items-center gap-3"
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
      onClick={() => {
        if (item.action === "logout") {
          onLogout();
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

  function isActive(item: SidebarItem) {
    if (!item.href) return false;
    return pathname === item.href;
  }

  async function handleLogout() {
    await logout();
    toast.success(t("auth.logoutSuccess"));
  }

  return (
    <TooltipProvider delay={200}>
      <aside className="group/sidebar fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-[72px] flex-col overflow-hidden border-r border-border bg-secondary transition-all duration-300 ease-in-out hover:w-[260px] md:flex">
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
          {mainItems.map((item) => (
            <SidebarNavButton
              key={item.id}
              item={item}
              active={isActive(item)}
              onNavigate={navigate}
              onLogout={handleLogout}
            />
          ))}
        </nav>
        <div className="mt-auto space-y-1 border-t border-border px-2 py-4">
          {bottomItems.map((item) => (
            <SidebarNavButton
              key={item.id}
              item={item}
              active={isActive(item)}
              onNavigate={navigate}
              onLogout={handleLogout}
            />
          ))}
        </div>
      </aside>
    </TooltipProvider>
  );
}
