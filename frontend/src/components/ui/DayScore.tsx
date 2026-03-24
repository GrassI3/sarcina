'use client';

import { useEffect, useState } from 'react';

export function DayScore() {
  const [score, setScore] = useState(0);

  // Simulate score loading for visual effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setScore(68); // Example score
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
      
      <h3 className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-4 relative z-10 w-full text-center">Smart Day Score</h3>
      
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
          <span className="text-3xl font-bold font-heading text-white">{score}</span>
        </div>
      </div>
      
      <p className="text-[10px] text-[var(--foreground-muted)] mt-4 text-center">
        +12 points from habits
      </p>
    </div>
  );
}
