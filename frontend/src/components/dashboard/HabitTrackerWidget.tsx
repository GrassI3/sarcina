"use client";

import { useState } from "react";
import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { useHabits } from "@/lib/HabitContext";

export function HabitTrackerWidget() {
  const { habits, mounted, addHabit, toggleHabit, deleteHabit, todayStr } = useHabits();
  const [newHabit, setNewHabit] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addHabit(newHabit);
    setNewHabit("");
  };

  if (!mounted) return (
    <section className="glass-card min-h-62.5 p-6 flex flex-col">
      <div className="animate-pulse flex flex-col gap-3">
        <div className="h-6 bg-white/5 rounded w-1/3" />
        <div className="h-10 bg-white/5 rounded" />
        <div className="h-10 bg-white/5 rounded" />
        <div className="h-10 bg-white/5 rounded" />
      </div>
    </section>
  );

  return (
    <section className="glass-card min-h-62.5 p-6 flex flex-col relative group">
      <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-neon-purple shadow-[0_0_10px_var(--accent-neon-purple)]"></span>
        Habit Tracker
      </h3>
      <div className="flex-1 flex flex-col gap-3">
        <form onSubmit={handleAdd} className="relative mb-2">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Add a new habit..."
            className="w-full bg-white/70 dark:bg-white/5 border border-(--glass-border) rounded-xl pl-4 pr-10 py-2.5 text-sm text-foreground placeholder-(--foreground-muted) focus:outline-none focus:border-foreground transition-all"
          />
          <button
            type="submit"
            disabled={!newHabit.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
          </button>
        </form>

        <div className="flex flex-col gap-2 overflow-y-auto max-h-40 pr-1">
          {habits.length === 0 && (
            <p className="text-center text-(--foreground-muted) text-sm py-4">No habits yet. Start small.</p>
          )}
          {habits.map((habit) => {
            const isCompletedToday = habit.lastCompletedDate === todayStr;
            return (
              <div
                key={habit.id}
                className={`group/habit min-h-10 rounded-xl flex items-center px-4 justify-between transition-all cursor-pointer border ${isCompletedToday ? "bg-black/8 dark:bg-white/10 border-(--glass-border)" : "bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/8 dark:hover:bg-white/8"}`}
                onClick={() => toggleHabit(habit.id)}
              >
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${isCompletedToday ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black" : "border-(--glass-border) text-transparent"}`}>
                    <Check size={12} className={`transition-all ${isCompletedToday ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
                  </div>
                  <span className={`text-sm truncate transition-all ${isCompletedToday ? "text-(--foreground-muted) line-through" : "text-foreground"}`}>
                    {habit.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {habit.streak > 0 && (
                    <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 text-foreground px-2 py-0.5 rounded-lg text-xs font-bold">
                      <Flame size={11} className={habit.streak >= 3 ? "animate-pulse" : ""} />
                      <span>{habit.streak}</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }}
                    className="opacity-0 group-hover/habit:opacity-100 p-1 text-(--foreground-muted) hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
