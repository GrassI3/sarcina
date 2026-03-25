"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { habitApi } from "@/lib/backendApi";
import { useAuth } from "@/lib/AuthContext";

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

const HabitContext = createContext<HabitContextType | null>(null);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const todayStr = new Date().toISOString().split("T")[0];
  const [habits, setHabits] = useState<Habit[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      setHabits([]);
      setMounted(true);
      return;
    }

    const load = async () => {
      try {
        const incoming = await habitApi.list();
        setHabits(incoming);
      } finally {
        setMounted(true);
      }
    };

    setMounted(false);
    void load();
  }, [loading, user]);

  const addHabit = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const optimistic: Habit = {
      id: crypto.randomUUID(),
      name: trimmed,
      streak: 0,
      lastCompletedDate: null,
    };
    setHabits((prev) => [...prev, optimistic]);

    try {
      const created = await habitApi.create({ name: trimmed });
      setHabits((prev) => prev.map((habit) => (habit.id === optimistic.id ? created : habit)));
    } catch {
      setHabits((prev) => prev.filter((habit) => habit.id !== optimistic.id));
    }
  }, []);

  const toggleHabit = useCallback(async (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    const snapshot = habits;
    const optimistic = habits.map((habit) => {
      if (habit.id !== id) return habit;
      const isCompletedToday = habit.lastCompletedDate === today;
      if (isCompletedToday) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        return {
          ...habit,
          streak: Math.max(0, habit.streak - 1),
          lastCompletedDate: habit.streak > 1 ? yesterday : null,
        };
      }
      return { ...habit, streak: habit.streak + 1, lastCompletedDate: today };
    });

    setHabits(optimistic);

    const target = optimistic.find((habit) => habit.id === id);
    if (!target) {
      return;
    }

    try {
      await habitApi.patch(id, {
        streak: target.streak,
        lastCompletedDate: target.lastCompletedDate,
      });
    } catch {
      setHabits(snapshot);
    }
  }, [habits]);

  const deleteHabit = useCallback(async (id: string) => {
    const snapshot = habits;
    setHabits((prev) => prev.filter((h) => h.id !== id));

    try {
      await habitApi.remove(id);
    } catch {
      setHabits(snapshot);
    }
  }, [habits]);

  return (
    <HabitContext.Provider value={{ habits, mounted, addHabit, toggleHabit, deleteHabit, todayStr }}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error("useHabits must be used within HabitProvider");
  return ctx;
}
