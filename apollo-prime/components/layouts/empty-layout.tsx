interface EmptyLayoutProps {
  children: React.ReactNode;
}

export function EmptyLayout({ children }: EmptyLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
