export function TaskManagerWidget() {
  return (
    <section className="glass-card flex-1 min-h-[350px] p-6 flex flex-col relative overflow-hidden group">
      <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--accent-electric-blue)] shadow-[0_0_10px_var(--accent-electric-blue)]"></span>
        Smart Task Manager
      </h3>
      <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-[var(--foreground-muted)] text-sm group-hover:border-[var(--glass-glow)] transition-colors bg-white/[0.02]">
        <div className="text-center">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>[Member 2: Task Manager Component]</p>
        </div>
      </div>
    </section>
  );
}
