interface DashboardHeaderProps {
  onOpenNewTask: () => void;
}

export function DashboardHeader({ onOpenNewTask }: DashboardHeaderProps) {
  return (
    <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
      <div className="animate-fade-in-up space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-(--foreground-muted)">FlowState Workspace</p>
        <h2 className="text-3xl md:text-4xl font-semibold font-heading text-foreground tracking-tight">Your day, designed for deep work.</h2>
        <p className="text-(--foreground-muted) text-sm md:text-base max-w-2xl">
          Plan intentionally, execute in focused blocks, and keep your priorities visible across tasks, habits, and team updates.
        </p>
      </div>
      <div className="hidden md:block">
         <button
           type="button"
           onClick={onOpenNewTask}
           className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm font-semibold transition-all shadow-[0_8px_24px_rgba(0,0,0,0.2)] dark:shadow-[0_8px_24px_rgba(255,255,255,0.08)] hover:-translate-y-0.5"
         >
           + New Task
         </button>
      </div>
    </header>
  );
}
