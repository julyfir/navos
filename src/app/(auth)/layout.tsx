export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-neutral-100 to-neutral-200 p-6 dark:from-neutral-950 dark:to-black">
      <div className="w-full max-w-sm rounded-3xl border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
        {children}
      </div>
    </div>
  );
}