export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Marca: monograma "L" de Linux de Camões */}
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
          L
        </div>
        <span className="text-xl font-semibold text-foreground">Linux de Camões</span>
      </div>
      {children}
    </div>
  );
}
