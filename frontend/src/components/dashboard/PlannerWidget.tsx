"use client";

import { useEffect, useMemo, useState } from "react";
import { TASKS_UPDATED_EVENT, type Task, getInitialTasks, syncTasks } from "@/lib/tasks";

function formatMonth(date: Date): string {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function getMonthGrid(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const startDate = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, idx) => {
    const cell = new Date(startDate);
    cell.setDate(startDate.getDate() + idx);
    return cell;
  });
}

export function PlannerWidget() {
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const latest = await syncTasks();
      setTasks(latest);
    };

    void load();
  }, []);

  useEffect(() => {
    const handleTasksUpdated = () => {
      setTasks([...getInitialTasks()]);
    };

    window.addEventListener(TASKS_UPDATED_EVENT, handleTasksUpdated);
    return () => {
      window.removeEventListener(TASKS_UPDATED_EVENT, handleTasksUpdated);
    };
  }, []);

  const monthGrid = useMemo(() => getMonthGrid(monthCursor), [monthCursor]);
  const monthIndex = monthCursor.getMonth();

  const dueDateMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const task of tasks) {
      if (!task.dueDate) continue;
      map[task.dueDate] = (map[task.dueDate] ?? 0) + 1;
    }
    return map;
  }, [tasks]);

  const dueDateTasks = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const task of tasks) {
      if (!task.dueDate) continue;
      if (!map[task.dueDate]) {
        map[task.dueDate] = [];
      }
      map[task.dueDate].push(task);
    }
    return map;
  }, [tasks]);

  const upcomingTasks = tasks
    .filter((task) => Boolean(task.dueDate))
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
    .slice(0, 4);

  return (
    <section className="glass-card flex-1 min-h-87.5 p-6 flex flex-col relative group">
      <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-electric-blue shadow-[0_0_10px_var(--accent-electric-blue)]"></span>
        Calendar Planner
      </h3>

      <div className="flex items-center justify-between mb-3 text-sm">
        <button
          type="button"
          onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          className="px-2 py-1 rounded-md bg-black/8 dark:bg-white/10 hover:bg-black/12 dark:hover:bg-white/15"
        >
          Prev
        </button>
        <p className="font-medium text-foreground">{formatMonth(monthCursor)}</p>
        <button
          type="button"
          onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          className="px-2 py-1 rounded-md bg-black/8 dark:bg-white/10 hover:bg-black/12 dark:hover:bg-white/15"
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs text-center text-(--foreground-muted) mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
          <span key={`${day}-${idx}`}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 rounded-xl border border-(--glass-border) p-2 bg-black/4 dark:bg-white/3">
        {monthGrid.map((date) => {
          const key = date.toISOString().slice(0, 10);
          const inMonth = date.getMonth() === monthIndex;
          const hasTasks = Boolean(dueDateMap[key]);

          return (
            <div
              key={key}
              onMouseEnter={() => setHoveredDate(key)}
              onMouseLeave={() => setHoveredDate((prev) => (prev === key ? null : prev))}
              className={`h-9 rounded-md flex flex-col items-center justify-center text-xs ${inMonth ? "text-foreground" : "text-(--foreground-muted)"} ${hasTasks ? "bg-black/10 dark:bg-white/10 border border-(--glass-border)" : ""}`}
            >
              <span>{date.getDate()}</span>
              {hasTasks ? <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-1" /> : null}
            </div>
          );
        })}
      </div>

      {hoveredDate && dueDateTasks[hoveredDate]?.length ? (
        <div className="mt-3 rounded-lg border border-(--glass-border) bg-black/5 dark:bg-white/6 p-3 text-xs">
          <p className="text-foreground font-medium mb-2">Planned for {hoveredDate}</p>
          <div className="space-y-1.5 text-foreground">
            {dueDateTasks[hoveredDate].map((task) => (
              <p key={task.id} className="truncate">• {task.text}</p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 space-y-2 text-sm text-foreground">
        <p className="text-xs uppercase tracking-wider text-(--foreground-muted)">Upcoming Scheduled Tasks</p>
        {upcomingTasks.length === 0 ? (
          <p className="text-xs text-(--foreground-muted)">No scheduled tasks yet. Use + New Task to ask AI for a dated task.</p>
        ) : (
          upcomingTasks.map((task) => (
            <div key={task.id} className="rounded-lg border border-(--glass-border) bg-black/5 dark:bg-white/6 px-3 py-2">
              <p className="text-foreground">{task.text}</p>
              <p className="text-(--foreground-muted) text-xs mt-1">{task.dueDate}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
