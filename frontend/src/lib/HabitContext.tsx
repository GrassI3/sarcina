"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Habit = {
  id: string;
  name: string;
  streak: number;
  lastCompletedDate: string | null;
};

interface HabitContextType {
  habits: Habit[];
  mounted: boolean;
  addHabit: (name: string) => void;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  todayStr: string;
}

const STORAGE_KEY = "productivity-habits";

const HabitContext = createContext<HabitContextType | null>(null);

function getInitialHabits(todayStr: string): Habit[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return [];
  }

  try {
    const parsed: Habit[] = JSON.parse(saved);
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    return parsed.map((habit) => {
      if (
        habit.lastCompletedDate &&
        habit.lastCompletedDate !== todayStr &&
        habit.lastCompletedDate !== yesterday
      ) {
        return { ...habit, streak: 0 };
      }
      return habit;
    });
  } catch {
    return [];
  }
}

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [habits, setHabits] = useState<Habit[]>(() => getInitialHabits(todayStr));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  const addHabit = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: trimmed,
      streak: 0,
      lastCompletedDate: null,
    };
    setHabits((prev) => [...prev, newHabit]);
  }, []);

  const toggleHabit = useCallback((id: string) => {
    const today = new Date().toISOString().split("T")[0];
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;
        const isCompletedToday = habit.lastCompletedDate === today;
        if (isCompletedToday) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
          return {
            ...habit,
            streak: Math.max(0, habit.streak - 1),
            lastCompletedDate: habit.streak > 1 ? yesterday : null,
          };
        } else {
          return { ...habit, streak: habit.streak + 1, lastCompletedDate: today };
        }
      })
    );
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return (
    <HabitContext.Provider value={{ habits, mounted: true, addHabit, toggleHabit, deleteHabit, todayStr }}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error("useHabits must be used within HabitProvider");
  return ctx;
}
