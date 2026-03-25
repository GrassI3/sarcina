"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TASKS_UPDATED_EVENT, appendTask, getInitialTasks, syncTasks, type Task } from "@/lib/tasks";

type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

interface AiTaskResponse {
  reply: string;
  task?: {
    title: string;
    due_date?: string;
  };
  tasks?: Array<{
    title: string;
    due_date?: string;
  }>;
}

interface NewTaskAiPanelProps {
  open: boolean;
  onClose: () => void;
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeoutId: number | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
  }
}

function toIsoDate(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function monthLabel(date: Date): string {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function monthCells(cursor: Date): Date[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function NewTaskAiPanel({ open, onClose }: NewTaskAiPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Tell me what task you want and when you want to do it. Example: 'Create portfolio draft next Tuesday'.",
    },
  ]);
  const [selectedDate, setSelectedDate] = useState<string>(toIsoDate(new Date()));
  const [calendarCursor, setCalendarCursor] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
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

  const cells = useMemo(() => monthCells(calendarCursor), [calendarCursor]);

  const submitToAi = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);

    try {
      const controller = new AbortController();
      const fetchTimeout = window.setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"}/api/agent/new-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, preferred_date: selectedDate }),
        signal: controller.signal,
      });

      window.clearTimeout(fetchTimeout);

      if (!response.ok) {
        throw new Error("Backend AI request failed");
      }

      const result = (await response.json()) as AiTaskResponse;
      const plannedTasks =
        result.tasks && result.tasks.length > 0
          ? result.tasks
          : result.task
            ? [result.task]
            : [];

      // Show assistant reply immediately so the chat never appears frozen.
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.reply || "Task plan created.",
        },
      ]);

      setLoading(false);

      if (plannedTasks.length > 0) {
        const writes = await Promise.allSettled(
          plannedTasks.map((planned) =>
            withTimeout(
              appendTask(planned.title, planned.due_date ?? selectedDate),
              8000,
              "Task write"
            )
          )
        );

        const failed = writes.filter((item) => item.status === "rejected").length;
        if (failed > 0) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `Created plan, but ${failed} task save${failed > 1 ? "s" : ""} failed. Please retry once.`,
            },
          ]);
        }

        try {
          const latest = await withTimeout(syncTasks(), 8000, "Task sync");
          setTasks(latest);
        } catch {
          // Keep UI responsive even if sync is slow.
        }

        const lastWithDate = [...plannedTasks].reverse().find((task) => Boolean(task.due_date));
        if (lastWithDate?.due_date) {
          setSelectedDate(lastWithDate.due_date);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I could not reach the backend AI service. Start backend on port 8000 and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 bg-slate-950/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 h-full w-full max-w-xl z-50 border-l border-white/10 bg-slate-950/95 backdrop-blur-xl p-5 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">AI Task Agent</h3>
                <p className="text-sm text-white/60">Create dated tasks with natural language and sync them to calendar.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <section className="rounded-xl border border-white/10 bg-white/3 p-3">
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    className="text-xs px-2 py-1 rounded bg-white/10"
                  >
                    Prev
                  </button>
                  <p className="text-sm font-medium">{monthLabel(calendarCursor)}</p>
                  <button
                    type="button"
                    onClick={() => setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    className="text-xs px-2 py-1 rounded bg-white/10"
                  >
                    Next
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-white/45 mb-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                    <span key={`${d}-${idx}`}>{d}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {cells.map((d) => {
                    const iso = toIsoDate(d);
                    const inMonth = d.getMonth() === calendarCursor.getMonth();
                    const selected = iso === selectedDate;
                    const count = dueDateMap[iso] ?? 0;
                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => setSelectedDate(iso)}
                        onMouseEnter={() => setHoveredDate(iso)}
                        onMouseLeave={() => setHoveredDate((prev) => (prev === iso ? null : prev))}
                        className={`h-9 rounded-md text-xs border ${selected ? "border-electric-blue bg-electric-blue/20" : "border-white/5 bg-white/2"} ${inMonth ? "text-foreground" : "text-white/30"}`}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span>{d.getDate()}</span>
                          {count > 0 ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 mt-1" /> : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-emerald-300/80 mt-2">Selected date: {selectedDate}</p>
                {hoveredDate && dueDateTasks[hoveredDate]?.length ? (
                  <div className="mt-2 rounded-lg border border-emerald-300/30 bg-emerald-500/10 p-2">
                    <p className="text-[11px] text-emerald-300/90 mb-1">Planned for {hoveredDate}</p>
                    <div className="space-y-1">
                      {dueDateTasks[hoveredDate].slice(0, 4).map((task) => (
                        <p key={task.id} className="text-[11px] text-white/85 truncate">• {task.text}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              <section className="rounded-xl border border-white/10 bg-white/3 p-3 flex flex-col">
                <p className="text-xs uppercase tracking-wide text-white/45 mb-2">Agent Chat</p>
                <div className="flex-1 min-h-40 max-h-56 overflow-y-auto space-y-2 pr-1">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-lg px-3 py-2 text-sm ${m.role === "assistant" ? "bg-white/10 text-white/90" : "bg-electric-blue/20 text-electric-blue"}`}
                    >
                      {m.content}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-auto space-y-2">
              <label className="text-xs text-white/50">Prompt AI to create task</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: Create a task to submit design review next Friday"
                className="w-full rounded-xl min-h-24 border border-white/10 bg-white/4 p-3 text-sm text-foreground placeholder:text-white/35 focus:outline-none focus:border-electric-blue"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/45">The backend AI parses date and adds task to your list.</p>
                <button
                  type="button"
                  onClick={submitToAi}
                  disabled={loading}
                  className="rounded-lg bg-electric-blue/25 hover:bg-electric-blue/35 text-electric-blue px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  {loading ? "Thinking..." : "Send to AI"}
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
