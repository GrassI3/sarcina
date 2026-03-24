"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

interface FocusState {
  mode: "work" | "break";
  workDuration: number;
  breakDuration: number;
  timeLeft: number;
  isRunning: boolean;
  lastTickAt: number | null; // timestamp for elapsed calculation on reload
  focusMinutesToday: number;
  focusSessionsToday: number;
  statsDate: string;
}

interface FocusContextType extends FocusState {
  toggleTimer: () => void;
  resetTimer: () => void;
  handleModeSwitch: (newMode: "work" | "break") => void;
  setWorkDuration: (val: number) => void;
  setBreakDuration: (val: number) => void;
  progress: number;
  totalTime: number;
  formatTime: (seconds: number) => string;
}

const STORAGE_KEY = "focus-timer-state";

const defaultState: FocusState = {
  mode: "work",
  workDuration: 25,
  breakDuration: 5,
  timeLeft: 25 * 60,
  isRunning: false,
  lastTickAt: null,
  focusMinutesToday: 0,
  focusSessionsToday: 0,
  statsDate: new Date().toISOString().split("T")[0],
};

function getInitialFocusState(): FocusState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return defaultState;
    }

    const parsed: Partial<FocusState> = JSON.parse(saved);
    const today = new Date().toISOString().split("T")[0];

    const baseState: FocusState = {
      ...defaultState,
      ...parsed,
      statsDate: parsed.statsDate ?? today,
      focusMinutesToday: parsed.focusMinutesToday ?? 0,
      focusSessionsToday: parsed.focusSessionsToday ?? 0,
    };

    const normalizedState =
      baseState.statsDate === today
        ? baseState
        : { ...baseState, statsDate: today, focusMinutesToday: 0, focusSessionsToday: 0 };
    if (normalizedState.isRunning && normalizedState.lastTickAt) {
      const elapsed = Math.floor((Date.now() - normalizedState.lastTickAt) / 1000);
      const newTimeLeft = Math.max(0, normalizedState.timeLeft - elapsed);
      return { ...normalizedState, timeLeft: newTimeLeft, lastTickAt: Date.now() };
    }

    return { ...normalizedState, isRunning: false };
  } catch {
    return defaultState;
  }
}

const FocusContext = createContext<FocusContextType | null>(null);

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FocusState>(getInitialFocusState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const playAlertSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio error", e);
    }
  }, []);

  const triggerNotification = useCallback((mode: "work" | "break") => {
    if ("Notification" in window) {
      const message = mode === "work" ? "Work session done! Time for a break." : "Break over! Back to work.";
      if (Notification.permission === "granted") {
        new Notification("FlowState", { body: message, icon: "/favicon.ico" });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") new Notification("FlowState", { body: message });
        });
      }
    }
  }, []);

  // Core timer tick — runs interval at root layout level, survives page navigation
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeLeft <= 1) {
            playAlertSound();
            triggerNotification(prev.mode);
            const nextMode = prev.mode === "work" ? "break" : "work";
            const nextTime = nextMode === "work" ? prev.workDuration * 60 : prev.breakDuration * 60;
            const today = new Date().toISOString().split("T")[0];
            const shouldReset = prev.statsDate !== today;
            const completedWorkSession = prev.mode === "work";
            return {
              ...prev,
              mode: nextMode,
              timeLeft: nextTime,
              isRunning: false,
              lastTickAt: null,
              statsDate: today,
              focusMinutesToday:
                (shouldReset ? 0 : prev.focusMinutesToday) + (completedWorkSession ? prev.workDuration : 0),
              focusSessionsToday:
                (shouldReset ? 0 : prev.focusSessionsToday) + (completedWorkSession ? 1 : 0),
            };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1, lastTickAt: Date.now() };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isRunning, playAlertSound, triggerNotification]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const toggleTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: !prev.isRunning,
      lastTickAt: !prev.isRunning ? Date.now() : null,
    }));
  }, []);

  const resetTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
      lastTickAt: null,
      timeLeft: prev.mode === "work" ? prev.workDuration * 60 : prev.breakDuration * 60,
    }));
  }, []);

  const handleModeSwitch = useCallback((newMode: "work" | "break") => {
    setState((prev) => ({
      ...prev,
      mode: newMode,
      isRunning: false,
      lastTickAt: null,
      timeLeft: newMode === "work" ? prev.workDuration * 60 : prev.breakDuration * 60,
    }));
  }, []);

  const setWorkDuration = useCallback((val: number) => {
    setState((prev) => ({
      ...prev,
      workDuration: val,
      timeLeft: prev.mode === "work" && !prev.isRunning ? val * 60 : prev.timeLeft,
    }));
  }, []);

  const setBreakDuration = useCallback((val: number) => {
    setState((prev) => ({
      ...prev,
      breakDuration: val,
      timeLeft: prev.mode === "break" && !prev.isRunning ? val * 60 : prev.timeLeft,
    }));
  }, []);

  const totalTime = state.mode === "work" ? state.workDuration * 60 : state.breakDuration * 60;
  const progress = ((totalTime - state.timeLeft) / totalTime) * 100;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <FocusContext.Provider
      value={{
        ...state,
        toggleTimer,
        resetTimer,
        handleModeSwitch,
        setWorkDuration,
        setBreakDuration,
        progress,
        totalTime,
        formatTime,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error("useFocus must be used within FocusProvider");
  return ctx;
}
