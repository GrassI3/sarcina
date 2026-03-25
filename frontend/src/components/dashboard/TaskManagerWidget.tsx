"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TASKS_UPDATED_EVENT,
  type SubTask,
  type Task,
  createTask,
  appendTask,
  getInitialTasks,
  syncTasks,
  updateTask,
} from "@/lib/tasks";

export function TaskManagerWidget() {
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [newTask, setNewTask] = useState("");
  const [breakdownLoadingById, setBreakdownLoadingById] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const latest = await syncTasks();
        setTasks(latest);
      } catch {
        setErrorMessage("Could not load tasks from backend.");
      }
    };

    load();
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

  const handleBreakDown = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || breakdownLoadingById[taskId]) return;

    setErrorMessage(null);
    setBreakdownLoadingById((prev) => ({ ...prev, [taskId]: true }));

    try {
      const response = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });

      if (!response.ok) {
        throw new Error("AI breakdown request failed");
      }

      const { subTasks } = (await response.json()) as { subTasks?: SubTask[] };
      const normalizedSubTasks = Array.isArray(subTasks) ? subTasks : [];

      const target = tasks.find((t) => t.id === taskId);
      if (!target) {
        return;
      }

      const merged = [...target.subTasks];
      for (const subTask of normalizedSubTasks) {
        const alreadyExists = merged.some(
          (existing) => existing.id === subTask.id || existing.text === subTask.text
        );
        if (!alreadyExists) {
          merged.push(subTask);
        }
      }

      const optimistic = tasks.map((t) => (t.id === taskId ? { ...t, subTasks: merged } : t));
      setTasks(optimistic);
      await updateTask(taskId, { subTasks: merged });
    } catch {
      setErrorMessage("Could not break down this task right now. Please try again.");
    } finally {
      setBreakdownLoadingById((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const addTask = async () => {
    const trimmed = newTask.trim();
    if (!trimmed) {
      return;
    }

    const optimistic = createTask(trimmed);
    setTasks((prev) => [...prev, optimistic]);
    setNewTask("");

    try {
      const created = await appendTask(trimmed);
      setTasks((prev) => prev.map((t) => (t.id === optimistic.id ? created : t)));
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== optimistic.id));
      setErrorMessage("Could not create task right now.");
    }
  };

  const toggleTask = async (taskId: string) => {
    const snapshot = tasks;
    const optimistic = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(optimistic);

    try {
      const target = optimistic.find((task) => task.id === taskId);
      if (target) {
        await updateTask(taskId, { completed: target.completed });
      }
    } catch {
      setTasks(snapshot);
      setErrorMessage("Could not update task status right now.");
    }
  };

  return (
    <section className="widget flex-1 min-h-87.5 p-6 flex flex-col relative overflow-hidden group">
      <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-electric-blue shadow-[0_0_10px_var(--accent-electric-blue)]"></span>
        Smart Task Manager
      </h3>
      <div className="mb-3 flex items-center gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTask();
            }
          }}
          className="flex-1 rounded-lg border border-(--glass-border) bg-white/70 dark:bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-(--foreground-muted) focus:outline-none focus:border-foreground"
          placeholder="Add a task"
        />
        <button
          type="button"
          onClick={addTask}
          className="rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-2 text-xs font-semibold hover:opacity-90"
        >
          Add
        </button>
      </div>
      {errorMessage ? (
        <p className="mb-2 text-xs text-rose-300">{errorMessage}</p>
      ) : null}
      <div className="flex-1 space-y-2">
        {tasks.map((task) => (
          <motion.div key={task.id} layout>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-2 text-left"
              >
                <span className={`h-4 w-4 rounded border border-(--glass-border) ${task.completed ? "bg-black border-black dark:bg-white dark:border-white" : "bg-transparent"}`} />
                <span className={`${task.completed ? "line-through text-(--foreground-muted)" : "text-foreground"}`}>
                  {task.text}
                </span>
              </button>
              {task.dueDate ? (
                <span className="text-[11px] text-(--foreground-muted) mr-2">
                  {task.dueDate}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => handleBreakDown(task.id)}
                disabled={breakdownLoadingById[task.id]}
                className="text-xs p-1 rounded text-foreground hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {breakdownLoadingById[task.id] ? "Analyzing..." : "✨ AI Break Down"}
              </button>
            </div>
            <AnimatePresence>
              {task.subTasks.length > 0 && (
                <motion.div
                  className="ml-8 space-y-1 mt-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {task.subTasks.map((sub) => (
                    <div key={sub.id} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        readOnly
                        className="mr-2"
                      />
                      <span>{sub.text}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
