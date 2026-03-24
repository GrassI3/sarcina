export interface DayScoreInput {
  tasksCompleted: number;
  tasksTotal: number;
  habitsCompleted: number;
  habitsTotal: number;
  focusMinutes: number;
  focusSessions?: number;
  habitStreakAverage?: number;
}

export interface DayScoreBreakdown {
  tasks: number;
  habits: number;
  focus: number;
  momentum: number;
}

export interface DayScoreResult {
  score: number;
  breakdown: DayScoreBreakdown;
}

const WEIGHTS = {
  tasks: 40,
  habits: 30,
  focus: 24,
  momentum: 6,
} as const;

const FOCUS_TARGET_MINUTES = 120;

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function calculateDayScore(input: DayScoreInput): DayScoreResult {
  const taskRatio = input.tasksTotal > 0 ? input.tasksCompleted / input.tasksTotal : 0;
  const habitRatio = input.habitsTotal > 0 ? input.habitsCompleted / input.habitsTotal : 0;
  const sessionRatio = clamp((input.focusSessions ?? 0) / 4);
  const focusMinutesRatio = clamp(input.focusMinutes / FOCUS_TARGET_MINUTES);
  const focusRatio = clamp(focusMinutesRatio * 0.8 + sessionRatio * 0.2);
  const streakRatio = clamp((input.habitStreakAverage ?? 0) / 7);

  const boostedTaskRatio = clamp(taskRatio * 0.9 + (taskRatio >= 0.6 ? 0.1 : 0));
  const boostedHabitRatio = clamp(habitRatio * 0.85 + streakRatio * 0.15);
  const balancedRatio = Math.min(boostedTaskRatio, boostedHabitRatio, focusRatio);

  const breakdown: DayScoreBreakdown = {
    tasks: Math.round(boostedTaskRatio * WEIGHTS.tasks),
    habits: Math.round(boostedHabitRatio * WEIGHTS.habits),
    focus: Math.round(focusRatio * WEIGHTS.focus),
    momentum: Math.round(balancedRatio * WEIGHTS.momentum),
  };

  const score = Math.min(
    100,
    breakdown.tasks + breakdown.habits + breakdown.focus + breakdown.momentum
  );

  return { score, breakdown };
}
