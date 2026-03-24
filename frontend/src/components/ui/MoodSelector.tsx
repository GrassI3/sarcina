'use client';

import { useState } from 'react';

type Mood = 'Low' | 'Medium' | 'High';

export function MoodSelector() {
  const [mood, setMood] = useState<Mood>('Medium');

  const getMoodColor = (m: Mood) => {
    switch(m) {
      case 'Low': return 'var(--accent-energy-low)';
      case 'Medium': return 'var(--accent-energy-med)';
      case 'High': return 'var(--accent-energy-high)';
      default: return 'var(--foreground-muted)';
    }
  };

  return (
    <div className="glass-card p-5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-heading font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Energy</h3>
        <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 border border-white/10" style={{ color: getMoodColor(mood) }}>
          {mood}
        </span>
      </div>
      
      <div className="flex gap-2 w-full mb-3">
        {(['Low', 'Medium', 'High'] as Mood[]).map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            className={`flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-300 ${
              mood === m 
                ? 'bg-white/10 text-white shadow-sm shadow-white/5' 
                : 'text-[var(--foreground-muted)] hover:bg-white/5 hover:text-white'
            }`}
            style={{
              borderColor: mood === m ? getMoodColor(m) : 'transparent',
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            {m}
          </button>
        ))}
      </div>
      
      <p className="text-[10px] text-[var(--foreground-muted)] leading-relaxed min-h-[30px]">
        {mood === 'Low' && "Focusing on easy wins and organization."}
        {mood === 'Medium' && "Steady pace. Ready for balanced work."}
        {mood === 'High' && "Deep focus mode. Tackle the hard tasks."}
      </p>
    </div>
  );
}
