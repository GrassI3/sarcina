"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  subTasks: SubTask[];
}

const TASKS_STORAGE_KEY = "flowstate-tasks";
const TASKS_UPDATED_EVENT = "flowstate:tasks-updated";

const defaultTasks: Task[] = [
  { id: "1", text: "Implement AI-driven UI", completed: false, subTasks: [] },
  { id: "2", text: "Design the new logo", completed: true, subTasks: [] },
  { id: "3", text: "Deploy to Vercel", completed: false, subTasks: [] },
];

function getInitialTasks(): Task[] {
  if (typeof window === "undefined") {
    return defaultTasks;
  }

  try {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!saved) {
      return defaultTasks;
    }
    return JSON.parse(saved) as Task[];
  } catch {
    return defaultTasks;
  }
}

export function TaskManagerWidget() {
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [newTask, setNewTask] = useState("");
  const [breakdownLoadingById, setBreakdownLoadingById] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    window.dispatchEvent(new Event(TASKS_UPDATED_EVENT));
  }, [tasks]);

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

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) {
            return t;
          }

          const merged = [...t.subTasks];
          for (const subTask of normalizedSubTasks) {
            const alreadyExists = merged.some(
              (existing) => existing.id === subTask.id || existing.text === subTask.text
            );
            if (!alreadyExists) {
              merged.push(subTask);
            }
          }

          return { ...t, subTasks: merged };
        })
      );
    } catch {
      setErrorMessage("Could not break down this task right now. Please try again.");
    } finally {
      setBreakdownLoadingById((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const addTask = () => {
    const trimmed = newTask.trim();
    if (!trimmed) {
      return;
    }

    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: trimmed,
        completed: false,
        subTasks: [],
      },
    ]);
    setNewTask("");
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
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
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-white/35 focus:outline-none focus:border-electric-blue"
          placeholder="Add a task"
        />
        <button
          type="button"
          onClick={addTask}
          className="rounded-lg bg-(--accent-electric-blue)/20 px-3 py-2 text-xs font-semibold text-electric-blue hover:bg-(--accent-electric-blue)/30"
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
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-2 text-left"
              >
                <span className={`h-4 w-4 rounded border border-white/30 ${task.completed ? "bg-emerald-500 border-emerald-500" : "bg-transparent"}`} />
                <span className={`${task.completed ? "line-through text-gray-500" : ""}`}>
                  {task.text}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleBreakDown(task.id)}
                disabled={breakdownLoadingById[task.id]}
                className="text-xs p-1 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
