export function HabitTrackerWidget() {
  return (
    <section className="glass-card min-h-[200px] p-6 flex flex-col relative group">
       <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--accent-neon-purple)] shadow-[0_0_10px_var(--accent-neon-purple)]"></span>
        Habit Tracker
      </h3>
      <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-[var(--foreground-muted)] text-sm text-center bg-white/[0.02]">
        <div className="w-full px-4">
          <div className="h-8 bg-white/5 rounded my-2 flex items-center px-3 justify-between"><span>Meditation</span> <div className="w-4 h-4 rounded-full border border-white/20"></div></div>
          <div className="h-8 bg-white/5 rounded my-2 flex items-center px-3 justify-between"><span>Hydration</span> <div className="w-4 h-4 rounded-full border border-white/20"></div></div>
          <p className="text-xs mt-3 opacity-50">[Member 3: Add Streaks]</p>
        </div>
      </div>
    </section>
  );
}
