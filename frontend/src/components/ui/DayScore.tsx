'use client';

import { useEffect, useState } from 'react';
import { useHabits } from '@/lib/HabitContext';
import { useFocus } from '@/lib/FocusContext';
import { calculateDayScore } from '@/lib/scoreCalculator';
import { TASKS_UPDATED_EVENT, getInitialTasks, syncTasks } from '@/lib/tasks';

type TaskSnapshot = {
  id: string;
  completed: boolean;
};

function readTaskSnapshot(): TaskSnapshot[] {
  return getInitialTasks().map((task) => ({
    id: task.id,
    completed: task.completed,
  }));
}

export function DayScore() {
  const { habits, todayStr } = useHabits();
  const { focusMinutesToday, focusSessionsToday } = useFocus();
  const [tasks, setTasks] = useState<TaskSnapshot[]>([]);

  useEffect(() => {
    const updateTasks = () => {
      setTasks(readTaskSnapshot());
    };

    const bootstrap = async () => {
      await syncTasks();
      updateTasks();
    };

    void bootstrap();
    window.addEventListener(TASKS_UPDATED_EVENT, updateTasks);

    return () => {
      window.removeEventListener(TASKS_UPDATED_EVENT, updateTasks);
    };
  }, []);

  const tasksCompleted = tasks.filter((task) => task.completed).length;
  const habitsCompleted = habits.filter((habit) => habit.lastCompletedDate === todayStr).length;
  const avgHabitStreak =
    habits.length > 0
      ? habits.reduce((sum, habit) => sum + habit.streak, 0) / habits.length
      : 0;

  const { score, breakdown } = calculateDayScore({
    tasksCompleted,
    tasksTotal: tasks.length,
    habitsCompleted,
    habitsTotal: habits.length,
    focusMinutes: focusMinutesToday,
    focusSessions: focusSessionsToday,
    habitStreakAverage: avgHabitStreak,
  });

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-4 flex flex-col items-center justify-center relative overflow-hidden group">
      {/* Background glow based on score */}
      <div 
        className="absolute inset-0 opacity-20 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at center, var(--accent-vibrant-green) 0%, transparent 70%)`,
          opacity: score > 0 ? 0.15 : 0
        }}
      />
      
      <h3 className="text-xs font-bold text-(--foreground-muted) uppercase tracking-wider mb-4 relative z-10 w-full text-center">Smart Day Score</h3>
      
      <div className="relative w-24 h-24 flex items-center justify-center z-10">
        {/* Background Circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="var(--glass-border)"
            strokeWidth="8"
          />
          {/* Progress Circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="url(#score-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1500 ease-out"
          />
          <defs>
            <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent-electric-blue)" />
              <stop offset="100%" stopColor="var(--accent-vibrant-green)" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold font-heading text-foreground">{score}</span>
        </div>
      </div>
      
      <p className="text-[10px] text-(--foreground-muted) mt-4 text-center">
        {`Tasks +${breakdown.tasks} | Habits +${breakdown.habits} | Focus +${breakdown.focus} | Momentum +${breakdown.momentum}`}
      </p>
    </div>
  );
}
