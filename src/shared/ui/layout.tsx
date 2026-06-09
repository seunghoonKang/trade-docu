import { cn } from "@/shared/lib/utils";

interface LayoutProps {
  toolbar: React.ReactNode;
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function Layout({ toolbar, children, showSidebar = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 h-16 flex items-center bg-card border-b border-border shadow-sm px-6">
        {toolbar}
      </header>
      <div className={cn(showSidebar && "md:pl-[72px]")}>
        <main className="max-w-screen-2xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
