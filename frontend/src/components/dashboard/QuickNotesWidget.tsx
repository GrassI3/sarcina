export function QuickNotesWidget() {
  return (
    <section className="glass-card flex-1 min-h-[150px] p-4 flex flex-col group relative">
       <textarea 
         className="w-full h-full bg-transparent resize-none outline-none text-sm text-white placeholder-[var(--foreground-muted)] font-sans"
         placeholder="Brain dump... (auto-saves)"
       />
    </section>
  );
}
