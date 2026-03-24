"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Settings2 } from "lucide-react";

export default function PomodoroTimer() {
  const [mode, setMode] = useState<"work" | "break">("work");
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const totalTime = mode === "work" ? workDuration * 60 : breakDuration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const playAlertSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio playback error", e);
    }
  }, []);

  const triggerNotification = useCallback(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(`Time's up! ${mode === "work" ? "Take a break." : "Back to work!"}`);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(`Time's up! ${mode === "work" ? "Take a break." : "Back to work!"}`);
          }
        });
      }
    }
  }, [mode]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      playAlertSound();
      triggerNotification();

      if (mode === "work") {
        setMode("break");
        setTimeLeft(breakDuration * 60);
      } else {
        setMode("work");
        setTimeLeft(workDuration * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, workDuration, breakDuration, playAlertSound, triggerNotification]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === "work" ? workDuration * 60 : breakDuration * 60);
  };

  const handleModeSwitch = (newMode: "work" | "break") => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === "work" ? workDuration * 60 : breakDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden transition-all w-full max-w-[400px] mx-auto min-h-[500px]">
      {/* Background glow */}
      <div className={`absolute -inset-20 blur-[100px] rounded-full opacity-20 pointer-events-none transition-colors duration-1000 ${mode === "work" ? "bg-violet-600" : "bg-emerald-600"}`} />

      <div className="flex justify-between items-center w-full mb-8 relative z-10">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Focus
        </h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-white/50 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
        >
          <Settings2 size={20} />
        </button>
      </div>

      {showSettings && (
        <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 transition-opacity">
          <h3 className="text-xl font-semibold text-white mb-6">Settings</h3>
          <div className="w-full space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-white/70 font-medium">Work Duration (min)</label>
              <input
                type="number"
                value={workDuration}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  setWorkDuration(val);
                  if (mode === "work" && !isRunning) setTimeLeft(val * 60);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70 font-medium">Break Duration (min)</label>
              <input
                type="number"
                value={breakDuration}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  setBreakDuration(val);
                  if (mode === "break" && !isRunning) setTimeLeft(val * 60);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-4 py-3 rounded-xl bg-white text-slate-950 font-semibold hover:bg-white/90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 p-1 bg-white/5 rounded-full mb-8 relative z-10 w-full max-w-[240px]">
        <button
          onClick={() => handleModeSwitch("work")}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${mode === "work" ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25" : "text-white/50 hover:text-white"}`}
        >
          Work
        </button>
        <button
          onClick={() => handleModeSwitch("break")}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${mode === "break" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" : "text-white/50 hover:text-white"}`}
        >
          Break
        </button>
      </div>

      <div className="relative flex items-center justify-center mb-10 z-10 group mt-4">
        <svg width="280" height="280" className="transform -rotate-90">
          {/* Background Ring */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          {/* Progress Ring */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: "stroke-dashoffset 1s linear"
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {mode === "work" ? (
                <>
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#d946ef" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </>
              )}
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-light tracking-tighter text-white drop-shadow-md">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm font-medium text-white/50 mt-2 uppercase tracking-widest">
            {mode}
          </span>
        </div>
      </div>

      <div className="flex gap-4 relative z-10 mt-auto">
        <button
          onClick={toggleTimer}
          className={`h-16 w-16 flex items-center justify-center rounded-full text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl ${isRunning
              ? "bg-white/10 hover:bg-white/20 border border-white/10"
              : mode === "work"
                ? "bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-violet-500/30"
                : "bg-gradient-to-tr from-emerald-500 to-blue-500 shadow-emerald-500/30"
            }`}
        >
          {isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>
        <button
          onClick={resetTimer}
          className="h-16 w-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-all transform hover:scale-105 active:scale-95"
          disabled={timeLeft === (mode === "work" ? workDuration * 60 : breakDuration * 60) && !isRunning}
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
}
