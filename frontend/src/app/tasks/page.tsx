import { TaskManagerWidget } from "@/components/dashboard/TaskManagerWidget";

export default function TasksPage() {
  return (
    <div className="p-4 md:p-8 w-full h-[calc(100dvh-4rem)] md:h-[100dvh] overflow-y-auto overflow-x-hidden pb-24 md:pb-8 relative z-10">
      <header className="mb-6 animate-fade-in-up">
        <h2 className="text-3xl font-bold font-heading text-foreground tracking-tight">Tasks</h2>
        <p className="text-[var(--foreground-muted)] text-sm mt-1">Manage and refine your task list.</p>
      </header>
      <TaskManagerWidget />
    </div>
  );
}
