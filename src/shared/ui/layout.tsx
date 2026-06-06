interface LayoutProps {
  toolbar: React.ReactNode;
  children: React.ReactNode;
}

export function Layout({ toolbar, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 h-16 flex items-center bg-card border-b border-border shadow-sm px-6">
        {toolbar}
      </header>
      <main className="max-w-screen-2xl mx-auto">{children}</main>
    </div>
  );
}
