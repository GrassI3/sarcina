export function FocusTimerWidget() {
  return (
    <section className="glass-card min-h-[250px] p-6 flex flex-col relative group justify-center items-center">
      <h3 className="text-lg font-heading font-bold mb-6 flex items-center gap-2 text-center w-full justify-center absolute top-6">
         Focus Flow
      </h3>
      <div className="w-48 h-48 border-[6px] border-dashed border-white/10 rounded-full flex flex-col items-center justify-center text-[var(--foreground-muted)] text-sm text-center p-4 mt-8 group-hover:border-[var(--accent-neon-purple)] group-hover:shadow-[0_0_30px_rgba(176,38,255,0.2)] transition-all duration-500">
        <span className="text-3xl font-heading font-bold text-white mb-2">25:00</span>
        <p className="text-xs">[Member 3: Timer]</p>
      </div>
    </section>
  );
}
