export function DashboardHeader() {
  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="animate-fade-in-up">
        <h2 className="text-3xl font-bold font-heading text-foreground tracking-tight">Good Morning, Creator.</h2>
        <p className="text-(--foreground-muted) text-sm mt-1">
          &ldquo;The secret of getting ahead is getting started.&rdquo;
        </p>
      </div>
      <div className="hidden md:block">
         <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-foreground text-sm font-semibold transition-all border border-white/5 shadow-sm hover:shadow-[0_0_15px_var(--glass-glow)] hover:-translate-y-0.5">
           + New Task
         </button>
      </div>
    </header>
  );
}
