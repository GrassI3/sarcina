"use client";

import { useEffect, useState } from "react";
import { noteApi } from "@/lib/backendApi";
import { useAuth } from "@/lib/AuthContext";

type NotesState = {
  text: string;
  savedAt: string | null;
};

export function QuickNotesWidget() {
  const { user, loading } = useAuth();
  const [notesState, setNotesState] = useState<NotesState>({ text: "", savedAt: null });

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      setNotesState({ text: "", savedAt: null });
      return;
    }

    const load = async () => {
      try {
        const note = await noteApi.getQuick();
        setNotesState({ text: note.text ?? "", savedAt: note.savedAt ?? null });
      } catch {
        // Keep local blank state on initial failure.
      }
    };

    void load();
  }, [loading, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const saved = await noteApi.saveQuick({ text: notesState.text });
        setNotesState((prev) => ({ ...prev, savedAt: saved.savedAt ?? prev.savedAt }));
      } catch {
        // Preserve optimistic text if backend save fails.
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [notesState.text, user]);

  const handleChange = (value: string) => {
    setNotesState({
      text: value,
      savedAt: new Date().toISOString(),
    });
  };

  return (
    <section className="glass-card flex-1 min-h-37.5 p-4 flex flex-col group relative">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-heading font-semibold text-foreground/80">Quick Notes</h3>
        {notesState.savedAt && (
          <span className="text-[10px] text-(--foreground-muted)">
            Saved {new Date(notesState.savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
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
