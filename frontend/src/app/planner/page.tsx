import { PlannerWidget } from "@/components/dashboard/PlannerWidget";

export default function PlannerPage() {
  return (
    <div className="p-4 md:p-8 w-full h-[calc(100dvh-4rem)] md:h-[100dvh] overflow-y-auto overflow-x-hidden pb-24 md:pb-8 relative z-10">
      <header className="mb-6 animate-fade-in-up">
        <h2 className="text-3xl font-bold font-heading text-foreground tracking-tight">Planner</h2>
        <p className="text-[var(--foreground-muted)] text-sm mt-1">Plan your day with time blocks.</p>
      </header>
      <PlannerWidget />
    </div>
  );
}
