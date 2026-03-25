"use client";

import { useState } from "react";
import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { useHabits } from "@/lib/HabitContext";

export default function HabitsPage() {
  const { habits, mounted, addHabit, toggleHabit, deleteHabit, todayStr } = useHabits();
  const [newHabitName, setNewHabitName] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addHabit(newHabitName);
    setNewHabitName("");
  };

  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse bg-slate-900/50 rounded-3xl h-[500px] w-full max-w-[500px]" />
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 w-full h-[calc(100dvh-4rem)] md:h-[100dvh] overflow-y-auto overflow-x-hidden pb-24 md:pb-8 relative">
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent pointer-events-none mix-blend-screen" />

      <div className="relative z-10 flex flex-col gap-6 items-center justify-start pt-8">
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-3 py-1">
            Daily Habits
          </h1>
          <p className="text-white/50 font-medium text-base leading-relaxed">
            Build lasting habits and track your streaks every day.
          </p>
        </div>

        <div className="flex flex-col p-8 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl w-full max-w-[500px] min-h-[460px]">
          {/* Add habit form */}
          <form onSubmit={handleAdd} className="relative mb-6">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Add a new habit..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-14 py-3.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!newHabitName.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 transition-colors"
            >
              <Plus size={18} />
            </button>
          </form>

          {/* Habits list */}
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {habits.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4 py-12">
                <div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                  <Plus size={28} />
                </div>
                <p className="text-sm">No habits yet. Start small.</p>
              </div>
            ) : (
              habits.map((habit: any) => {
                const isCompletedToday = habit.lastCompletedDate === todayStr;
                const progressPct = Math.min(100, (habit.streak / 7) * 100);
                return (
                  <div
                    key={habit.id}
                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                      isCompletedToday ? "bg-white/10 border-white/20" : "bg-white/5 border-transparent hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCompletedToday
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-white/30 text-transparent hover:border-white/50"
                        }`}
                      >
                        <Check size={14} className={`transition-all duration-300 ${isCompletedToday ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={`text-base font-medium block truncate transition-all ${isCompletedToday ? "text-white/50 line-through" : "text-white/90"}`}>
                          {habit.name}
                        </span>
                        {/* Progress bar */}
                        <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden w-full">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      {habit.streak > 0 && (
                        <div className="flex items-center gap-1 text-orange-400 font-semibold text-sm bg-orange-400/10 px-2.5 py-1 rounded-lg">
                          <Flame size={14} className={habit.streak >= 3 ? "animate-pulse" : ""} />
                          <span>{habit.streak}</span>
                        </div>
                      )}
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
