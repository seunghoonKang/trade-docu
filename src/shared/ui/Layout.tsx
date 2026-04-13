interface LayoutProps {
  toolbar: React.ReactNode;
  children: React.ReactNode;
}

export function Layout({ toolbar, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3">
        {toolbar}
      </header>
      <main className="max-w-screen-2xl mx-auto">{children}</main>
    </div>
  );
}
