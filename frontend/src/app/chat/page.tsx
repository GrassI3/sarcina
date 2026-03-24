"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TeamStatus = "Deep Work" | "Available" | "Away";

type TeamMember = {
  id: string;
  name: string;
  status: TeamStatus;
  detail: string;
};

type SharedTask = {
  id: string;
  text: string;
  completed: boolean;
  tag: string;
  assignee?: string;
};

type ChatMessage = {
  id: string;
  author: "Alex" | "You";
  text: string;
  time: string;
};

const CHAT_MESSAGES_KEY = "flowstate-team-chat-messages";
const SHARED_TASKS_KEY = "flowstate-team-shared-tasks";

const defaultMembers: TeamMember[] = [
  { id: "alex", name: "Alex", status: "Deep Work", detail: "Deep Work (15m left)" },
  { id: "sarah", name: "Sarah", status: "Available", detail: "Available / Browsing" },
];

const defaultTasks: SharedTask[] = [
  { id: "s1", text: "Finalize Presentation Deck", completed: false, tag: "Design", assignee: "Alex" },
  { id: "s2", text: "Write Copy for Landing Page", completed: false, tag: "Copy" },
  { id: "s3", text: "Review user testing notes", completed: true, tag: "Research" },
];

const defaultMessages: ChatMessage[] = [
  {
    id: "m1",
    author: "Alex",
    time: "10:42 AM",
    text: "I am going to enter High Energy Flow mode to knock out the presentation design. Ping me only if urgent!",
  },
  {
    id: "m2",
    author: "You",
    time: "10:45 AM",
    text: "Got it! Good luck. I will pick up the copy writing in the meantime.",
  },
];

function readStoredMessages(): ChatMessage[] {
  if (typeof window === "undefined") {
    return defaultMessages;
  }

  try {
    const raw = localStorage.getItem(CHAT_MESSAGES_KEY);
    if (!raw) {
      return defaultMessages;
    }
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return defaultMessages;
  }
}

function readStoredSharedTasks(): SharedTask[] {
  if (typeof window === "undefined") {
    return defaultTasks;
  }

  try {
    const raw = localStorage.getItem(SHARED_TASKS_KEY);
    if (!raw) {
      return defaultTasks;
    }
    return JSON.parse(raw) as SharedTask[];
  } catch {
    return defaultTasks;
  }
}

function formatCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function TeamChat() {
  const [members, setMembers] = useState<TeamMember[]>(defaultMembers);
  const [myStatus, setMyStatus] = useState<TeamStatus>("Available");
  const [sharedTasks, setSharedTasks] = useState<SharedTask[]>(readStoredSharedTasks);
  const [messages, setMessages] = useState<ChatMessage[]>(readStoredMessages);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(SHARED_TASKS_KEY, JSON.stringify(sharedTasks));
  }, [sharedTasks]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === "sarah"
          ? {
              ...member,
              status: myStatus,
              detail:
                myStatus === "Deep Work"
                  ? "Deep Work (you are heads-down)"
                  : myStatus === "Available"
                  ? "Available / Responsive"
                  : "Away / Async only",
            }
          : member
      )
    );
  }, [myStatus]);

  const completedSharedTasks = useMemo(
    () => sharedTasks.filter((task) => task.completed).length,
    [sharedTasks]
  );

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        author: "You",
        text: trimmed,
        time: formatCurrentTime(),
      },
    ]);
    setDraft("");
  };

  const toggleSharedTask = (taskId: string) => {
    setSharedTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-400 mx-auto w-full h-[calc(100dvh-4rem)] md:h-dvh flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10 pb-24 md:pb-8">
      {/* Header section */}
      <header className="mb-6 animate-fade-in-up shrink-0">
        <h2 className="text-3xl font-bold font-heading text-foreground tracking-tight flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-linear-to-tr from-electric-blue to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </span>
          Team Flow
        </h2>
        <p className="text-(--foreground-muted) text-sm mt-2 ml-14">
          Sync on shared tasks, align flow states, and communicate.
        </p>
      </header>
      
      {/* Main Layout for Team Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full flex-1 min-h-0 relative z-10">
        
        {/* Left Column - Team Hub / Shared Tasks and Members */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          {/* Active Flow States (Team presence) */}
          <section className="glass-card flex flex-col p-5 group relative">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-heading font-bold uppercase text-(--foreground-muted) tracking-wider">
                Live Flow States
              </h3>
              <div className="flex gap-1 rounded-full bg-white/5 p-1">
                {(["Deep Work", "Available", "Away"] as TeamStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setMyStatus(status)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                      myStatus === status
                        ? "bg-white/15 text-foreground"
                        : "text-white/50 hover:text-foreground"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <p className="mb-4 text-[10px] text-white/45">Set your current status to keep collaboration focused.</p>
            <div className="flex flex-col gap-4">
              {members.map((member) => {
                const isFocused = member.status === "Deep Work";
                const isAvailable = member.status === "Available";
                return (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-full ${
                          isFocused
                            ? "bg-linear-to-tr from-(--accent-energy-high) to-orange-500 p-0.5 animate-pulse-slow"
                            : isAvailable
                            ? "bg-white/20 p-0.5"
                            : "bg-white/10 p-0.5"
                        }`}
                      >
                        <div className="w-full h-full rounded-full bg-background overflow-hidden" />
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center ${
                          isFocused
                            ? "bg-(--accent-energy-high)"
                            : isAvailable
                            ? "bg-(--accent-vibrant-green)"
                            : "bg-amber-400"
                        }`}
                      >
                        {isFocused && (
                          <svg
                            className="w-2.5 h-2.5 text-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-none">{member.name}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isFocused
                            ? "text-(--accent-energy-high)"
                            : isAvailable
                            ? "text-(--foreground-muted)"
                            : "text-amber-300"
                        }`}
                      >
                        {member.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Shared Tasks / Collective Goals */}
          <section className="glass-card flex-1 min-h-62.5 flex flex-col p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
               <button type="button" className="text-electric-blue hover:text-foreground transition-colors">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
               </button>
            </div>
            <h3 className="text-sm font-heading font-bold mb-1 uppercase text-(--foreground-muted) tracking-wider">
              Shared Backlog
            </h3>
            <p className="text-[10px] text-white/45 mb-4">{completedSharedTasks}/{sharedTasks.length} completed</p>
            
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {sharedTasks.map((task) => (
                <label
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 ${
                    task.completed ? "opacity-60" : "opacity-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleSharedTask(task.id)}
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-(--accent-vibrant-green) focus:ring-(--accent-vibrant-green) focus:ring-offset-0 transition-all checked:bg-(--accent-vibrant-green)"
                  />
                  <div className="flex-1">
                    <p
                      className={`text-sm text-foreground font-medium leading-tight ${
                        task.completed ? "line-through" : ""
                      }`}
                    >
                      {task.text}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-electric-blue/20 text-electric-blue font-bold">
                        {task.tag}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded text-(--foreground-muted) font-medium">
                        {task.assignee ? `Assigned: ${task.assignee}` : "Unassigned"}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - Chat Area */}
        <section className="lg:col-span-8 glass-card flex flex-col overflow-hidden min-h-125">
          {/* Chat Header */}
          <div className="h-16 border-b border-(--glass-border) flex items-center justify-between px-6 bg-white/5">
             <div className="flex items-center gap-3">
               <span className="w-2.5 h-2.5 rounded-full bg-electric-blue shadow-[0_0_8px_var(--accent-electric-blue)]"></span>
               <h3 className="text-lg font-heading font-bold text-foreground"># General Chat</h3>
             </div>
             <div className="flex items-center -space-x-2">
                {/* User Avatars stacked */}
                <div className="w-8 h-8 rounded-full border-2 border-panel bg-gray-600 z-30" />
                <div className="w-8 h-8 rounded-full border-2 border-panel bg-gray-500 z-20" />
                <div className="w-8 h-8 rounded-full border-2 border-panel bg-white/10 z-10 flex items-center justify-center text-[10px] font-bold">+2</div>
             </div>
          </div>

          {/* Messages Area */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col custom-scrollbar">
            {messages.map((message) =>
              message.author === "Alex" ? (
                <div key={message.id} className="flex bg-white/5 p-3 rounded-lg mr-12 border border-white/5 w-fit max-w-[85%]">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-600 shrink-0" />
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-sm text-foreground">Alex</span>
                        <span className="text-[10px] text-(--foreground-muted)">{message.time}</span>
                      </div>
                      <p className="text-sm text-foreground opacity-90 leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex flex-col gap-1 items-end ml-12 self-end w-fit max-w-[85%]">
                  <div className="bg-linear-to-r from-electric-blue to-neon-purple p-px rounded-xl rounded-tr-none">
                    <div className="bg-panel rounded-xl rounded-tr-none p-3 h-full w-full">
                      <p className="text-sm text-foreground leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-(--foreground-muted) mr-1">{message.time}</span>
                </div>
              )
            )}

            {/* System Message */}
            <div className="flex items-center justify-center gap-3 opacity-60 my-4">
              <div className="h-px bg-white/20 flex-1"></div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 text-foreground">Alex started a 50m Focus Session</span>
              <div className="h-px bg-white/20 flex-1"></div>
            </div>

          </div>

          {/* Input Area */}
          <div className="p-4 bg-black/20 border-t border-(--glass-border)">
             <div className="relative group">
                <input 
                  type="text" 
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="w-full bg-background border border-(--glass-border) rounded-full px-5 py-3 pr-12 text-sm text-foreground placeholder-(--foreground-muted) focus:outline-none focus:border-white/30 focus:shadow-[0_0_15px_var(--glass-glow)] transition-all font-sans"
                  placeholder="Message team... (Shift + Enter for new line)"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-electric-blue hover:text-black transition-colors text-foreground"
                >
                  <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}
