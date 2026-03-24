"use client";

import { useEffect, useState } from "react";

const NOTES_STORAGE_KEY = "flowstate-quick-notes";

type NotesState = {
  text: string;
  savedAt: string | null;
};

function getInitialNotesState(): NotesState {
  if (typeof window === "undefined") {
    return { text: "", savedAt: null };
  }

  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) {
      return { text: "", savedAt: null };
    }

    const parsed = JSON.parse(raw) as NotesState;
    return {
      text: parsed.text ?? "",
      savedAt: parsed.savedAt ?? null,
    };
  } catch {
    return { text: "", savedAt: null };
  }
}

export function QuickNotesWidget() {
  const [notesState, setNotesState] = useState<NotesState>(getInitialNotesState);

  useEffect(() => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesState));
  }, [notesState]);

  const handleChange = (value: string) => {
    setNotesState({
      text: value,
      savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  };

  return (
    <section className="glass-card flex-1 min-h-37.5 p-4 flex flex-col group relative">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-heading font-semibold text-foreground/80">Quick Notes</h3>
        {notesState.savedAt && <span className="text-[10px] text-(--foreground-muted)">Saved {notesState.savedAt}</span>}
      </div>
       <textarea 
         value={notesState.text}
         onChange={(e) => handleChange(e.target.value)}
         className="w-full h-full bg-transparent resize-none outline-none text-sm text-foreground placeholder-(--foreground-muted) font-sans"
         placeholder="Brain dump... (auto-saves)"
       />
    </section>
  );
}
