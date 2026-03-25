'use client';

import { useState } from 'react';

type Mood = 'Low' | 'Medium' | 'High';
type UiMode = 'Focus' | 'Chill' | 'Planning';

interface MoodSelectorProps {
  setUiMode: (mode: UiMode) => void;
}

export function MoodSelector({ setUiMode }: MoodSelectorProps) {
  const [mood, setMood] = useState<Mood>('Medium');

  const handleMoodChange = (newMood: Mood) => {
    setMood(newMood);
    if (newMood === 'High') setUiMode('Focus');
    else if (newMood === 'Medium') setUiMode('Planning');
    else setUiMode('Chill');
  };

  const getMoodColor = (m: Mood) => {
    switch(m) {
      case 'Low': return 'var(--accent-energy-low)';
      case 'Medium': return 'var(--accent-energy-med)';
      case 'High': return 'var(--accent-energy-high)';
      default: return 'var(--foreground-muted)';
    }
  };

  return (
    <div className="widget p-5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-heading font-bold text-(--foreground-muted) uppercase tracking-wider">Energy</h3>
        <span className="text-[10px] font-bold px-2 py-1 rounded bg-black/8 dark:bg-white/10 border border-(--glass-border)" style={{ color: getMoodColor(mood) }}>
          {mood}
        </span>
      </div>
      
      <div className="flex gap-2 w-full mb-3">
        {(['Low', 'Medium', 'High'] as Mood[]).map((m) => (
          <button
            key={m}
            onClick={() => handleMoodChange(m)}
            className={`flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-300 ${
              mood === m 
                ? 'bg-black/10 dark:bg-white/10 text-foreground shadow-sm' 
                : 'text-(--foreground-muted) hover:bg-black/8 dark:hover:bg-white/8 hover:text-foreground'
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
      
      <p className="text-[10px] text-(--foreground-muted) leading-relaxed min-h-7.5">
        {mood === 'Low' && "Focusing on easy wins and organization."}
        {mood === 'Medium' && "Steady pace. Ready for balanced work."}
        {mood === 'High' && "Deep focus mode. Tackle the hard tasks."}
      </p>
    </div>
  );
}
