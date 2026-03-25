"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  chatApi,
  type ApiChatGroup,
  type ApiChatMember,
  type ApiChatMessage,
  type ApiChatTask,
} from "@/lib/backendApi";
import { useAuth } from "@/lib/AuthContext";

type SharedTask = {
  id: string;
  text: string;
  completed: boolean;
  tag: string;
  assignee?: string;
};

type ChatMessage = {
  id: string;
  author: string;
  text: string;
  time: string;
};

function toChatMessage(message: ApiChatMessage): ChatMessage {
  return {
    id: message.id,
    author: message.author,
    text: message.text,
    time: message.time,
  };
}

function toSharedTask(task: ApiChatTask): SharedTask {
  return {
    id: task.id,
    text: task.text,
    completed: task.completed,
    tag: task.tag,
    assignee: task.assignee,
  };
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function TeamChat() {
  const { user } = useAuth();
  const listRef = useRef<HTMLDivElement | null>(null);

  const [groups, setGroups] = useState<ApiChatGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<ApiChatMember[]>([]);
  const [sharedTasks, setSharedTasks] = useState<SharedTask[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [newGroupName, setNewGroupName] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskTag, setNewTaskTag] = useState("General");
  const [newTaskAssignee, setNewTaskAssignee] = useState("Unassigned");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingGroupData, setLoadingGroupData] = useState(false);

  const activeGroup = useMemo(
    () => groups.find((group) => group.id === activeGroupId) ?? null,
    [activeGroupId, groups]
  );

  const loadGroups = async (preferredGroupId?: string | null) => {
    setLoadingGroups(true);
    try {
      const existing = await chatApi.listGroups();
      setGroups(existing);

      if (existing.length === 0) {
        setActiveGroupId(null);
        setMembers([]);
        setMessages([]);
        setSharedTasks([]);
        return;
      }

      const preferred = preferredGroupId && existing.some((group) => group.id === preferredGroupId)
        ? preferredGroupId
        : null;
      setActiveGroupId(preferred ?? existing[0].id);
    } catch {
      setError("Could not load chat groups.");
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadActiveGroupData = async (groupId: string) => {
    setLoadingGroupData(true);
    try {
      const [incomingMembers, incomingMessages, incomingTasks] = await Promise.all([
        chatApi.listMembers(groupId),
        chatApi.listMessages(groupId),
        chatApi.listTasks(groupId),
      ]);
      setMembers(incomingMembers);
      setMessages(incomingMessages.map(toChatMessage));
      setSharedTasks(incomingTasks.map(toSharedTask));
    } catch {
      setError("Could not load group data.");
    } finally {
      setLoadingGroupData(false);
    }
  };

  useEffect(() => {
    void loadGroups();
  }, []);

  useEffect(() => {
    if (!activeGroupId) {
      return;
    }

    void loadActiveGroupData(activeGroupId);
  }, [activeGroupId]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }
    listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const createGroup = async () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      return;
    }

    try {
      setError(null);
      const created = await chatApi.createGroup({ name: trimmed });
      await chatApi.addMember(created.id, {
        name: user?.displayName || user?.email || "Owner",
        email: user?.email || undefined,
        role: "owner",
      });
      await loadGroups(created.id);
      setNewGroupName("");
    } catch {
      setError("Could not create group.");
    }
  };

  const removeGroup = async (groupId: string) => {
    if (!window.confirm("Delete this group? Members, messages, and shared tasks will no longer be visible.")) {
      return;
    }

    try {
      setError(null);
      await chatApi.removeGroup(groupId);
      await loadGroups();
    } catch {
      setError("Could not delete group.");
    }
  };

  const addMember = async () => {
    if (!activeGroupId) {
      return;
    }

    const trimmedName = newMemberName.trim();
    if (!trimmedName) {
      return;
    }

    try {
      setError(null);
      const created = await chatApi.addMember(activeGroupId, {
        name: trimmedName,
        email: newMemberEmail.trim() || undefined,
        role: "member",
      });
      setMembers((prev) => [...prev, created]);
      setNewMemberName("");
      setNewMemberEmail("");
    } catch {
      setError("Could not add member.");
    }
  };

  const removeMember = async (memberId: string) => {
    if (!activeGroupId) {
      return;
    }

    const snapshot = members;
    setMembers((prev) => prev.filter((member) => member.id !== memberId));

    try {
      setError(null);
      await chatApi.removeMember(activeGroupId, memberId);
    } catch {
      setMembers(snapshot);
      setError("Could not remove member.");
    }
  };

  const addTask = async () => {
    if (!activeGroupId) {
      return;
    }

    const trimmed = newTaskText.trim();
    if (!trimmed) {
      return;
    }

    const optimistic: SharedTask = {
      id: `optimistic-${Date.now()}`,
      text: trimmed,
      completed: false,
      tag: newTaskTag.trim() || "General",
      assignee: newTaskAssignee === "Unassigned" ? undefined : newTaskAssignee,
    };

    setSharedTasks((prev) => [...prev, optimistic]);
    setNewTaskText("");

    try {
      setError(null);
      const created = await chatApi.createTask(activeGroupId, {
        text: optimistic.text,
        tag: optimistic.tag,
        assignee: optimistic.assignee,
      });
      setSharedTasks((prev) => prev.map((task) => (task.id === optimistic.id ? toSharedTask(created) : task)));
    } catch {
      setSharedTasks((prev) => prev.filter((task) => task.id !== optimistic.id));
      setError("Could not create task.");
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!activeGroupId) {
      return;
    }

    const snapshot = sharedTasks;
    const optimistic = sharedTasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setSharedTasks(optimistic);

    try {
      setError(null);
      const target = optimistic.find((task) => task.id === taskId);
      if (target) {
        await chatApi.patchTask(activeGroupId, taskId, { completed: target.completed });
      }
    } catch {
      setSharedTasks(snapshot);
      setError("Could not update task status.");
    }
  };

  const assignTask = async (taskId: string, assignee: string) => {
    if (!activeGroupId) {
      return;
    }

    const snapshot = sharedTasks;
    const nextAssignee = assignee === "Unassigned" ? undefined : assignee;
    setSharedTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, assignee: nextAssignee } : task)));

    try {
      setError(null);
      await chatApi.patchTask(activeGroupId, taskId, { assignee: nextAssignee });
    } catch {
      setSharedTasks(snapshot);
      setError("Could not assign task.");
    }
  };

  const sendMessage = async () => {
    if (!activeGroupId) {
      return;
    }

    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    const author = user?.displayName || user?.email || "You";
    const optimistic: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      author,
      text: trimmed,
      time: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    try {
      setError(null);
      const created = await chatApi.createMessage(activeGroupId, {
        author,
        text: trimmed,
      });
      setMessages((prev) => prev.map((message) => (message.id === optimistic.id ? toChatMessage(created) : message)));
    } catch {
      setMessages((prev) => prev.filter((message) => message.id !== optimistic.id));
      setError("Could not send message.");
    }
  };

  return (
    <div className="p-4 md:p-8 w-full h-[calc(100dvh-4rem)] md:h-dvh flex flex-col overflow-y-auto overflow-x-hidden relative z-10 pb-24 md:pb-8">
      <header className="mb-6 animate-fade-in-up shrink-0 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold font-heading text-foreground tracking-tight">Team Flow</h2>
          <p className="text-(--foreground-muted) text-sm mt-2">Create groups, add people, chat, and assign tasks in one place.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(event) => setNewGroupName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void createGroup();
              }
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            placeholder="New group name"
          />
          <button
            type="button"
            onClick={() => void createGroup()}
            className="rounded-lg bg-electric-blue/20 text-electric-blue px-3 py-2 text-sm font-semibold hover:bg-electric-blue/30"
          >
            Create Group
          </button>
          <button
            type="button"
            onClick={() => void loadGroups(activeGroupId)}
            className="rounded-lg bg-white/10 text-foreground px-3 py-2 text-sm font-semibold hover:bg-white/20"
          >
            Refresh
          </button>
        </div>
      </header>

      {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full flex-1 min-h-0 relative z-10">
        <section className="lg:col-span-4 flex flex-col gap-4 h-full">
          <div className="glass-card p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-(--foreground-muted) mb-2">Groups</p>
            <div className="space-y-2">
              {loadingGroups ? <p className="text-xs text-(--foreground-muted)">Loading groups...</p> : null}
              {!loadingGroups && groups.length === 0 ? (
                <p className="text-xs text-(--foreground-muted)">No groups yet. Create one to start collaborating.</p>
              ) : null}
              {groups.map((group) => (
                <div key={group.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveGroupId(group.id)}
                    className={`flex-1 text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                      activeGroupId === group.id ? "bg-electric-blue/20 text-electric-blue" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {group.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeGroup(group.id)}
                    className="rounded-lg border border-rose-300/30 px-2 py-2 text-[11px] text-rose-300 hover:bg-rose-300/10"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4 flex-1 min-h-60">
            <p className="text-xs uppercase tracking-[0.18em] text-(--foreground-muted) mb-2">Members</p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newMemberName}
                onChange={(event) => setNewMemberName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void addMember();
                  }
                }}
                className="w-1/2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs"
                placeholder="Name"
              />
              <input
                type="text"
                value={newMemberEmail}
                onChange={(event) => setNewMemberEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void addMember();
                  }
                }}
                className="w-1/2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs"
                placeholder="Email (optional)"
              />
            </div>
            <button
              type="button"
              onClick={() => void addMember()}
              disabled={!activeGroupId}
              className="mb-3 rounded-lg bg-white/10 px-3 py-2 text-xs hover:bg-white/20 disabled:opacity-40"
            >
              Add Member
            </button>

            <div className="space-y-2">
              {members.length === 0 ? (
                <p className="text-xs text-(--foreground-muted)">No members yet.</p>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-foreground">{member.name}</p>
                      <p className="text-[11px] text-(--foreground-muted)">{member.email ?? member.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeMember(member.id)}
                      className="text-xs text-rose-300 hover:text-rose-200"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-4 flex-1 min-h-72 overflow-hidden flex flex-col">
            <p className="text-xs uppercase tracking-[0.18em] text-(--foreground-muted) mb-2">Shared Tasks</p>
            <div className="space-y-2 mb-3">
              <input
                type="text"
                value={newTaskText}
                onChange={(event) => setNewTaskText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void addTask();
                  }
                }}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs"
                placeholder="Task title"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newTaskTag}
                  onChange={(event) => setNewTaskTag(event.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs"
                  placeholder="Tag"
                />
                <select
                  value={newTaskAssignee}
                  onChange={(event) => setNewTaskAssignee(event.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs"
                >
                  <option>Unassigned</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void addTask()}
              disabled={!activeGroupId}
              className="mb-3 rounded-lg bg-white/10 px-3 py-2 text-xs hover:bg-white/20 disabled:opacity-40"
            >
              Create Task
            </button>

            <div className="space-y-2 overflow-y-auto pr-1">
              {sharedTasks.length === 0 ? (
                <p className="text-xs text-(--foreground-muted)">No shared tasks yet.</p>
              ) : null}
              {sharedTasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => void toggleTask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${task.completed ? "line-through text-white/50" : "text-foreground"}`}>{task.text}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] rounded bg-electric-blue/20 px-2 py-0.5 text-electric-blue">{task.tag}</span>
                        <select
                          value={task.assignee ?? "Unassigned"}
                          onChange={(event) => void assignTask(task.id, event.target.value)}
                          className="text-[11px] rounded border border-white/10 bg-white/5 px-2 py-1"
                        >
                          <option>Unassigned</option>
                          {members.map((member) => (
                            <option key={member.id} value={member.name}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lg:col-span-8 glass-card flex flex-col overflow-hidden min-h-125">
          <div className="h-16 border-b border-(--glass-border) flex items-center justify-between px-6 bg-white/5">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-electric-blue shadow-[0_0_8px_var(--accent-electric-blue)]"></span>
              <h3 className="text-lg font-heading font-bold text-foreground"># {activeGroup?.name ?? "Group Chat"}</h3>
            </div>
            <span className="text-xs text-(--foreground-muted)">{members.length} members</span>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
            {loadingGroupData ? <p className="text-sm text-(--foreground-muted)">Loading conversation...</p> : null}
            {messages.length === 0 ? (
              <p className="text-sm text-(--foreground-muted)">No messages yet. Start the conversation.</p>
            ) : (
              messages.map((message) => {
                const mine = message.author === (user?.displayName || user?.email || "You");
                return mine ? (
                  <div key={message.id} className="self-end max-w-[85%]">
                    <div className="bg-linear-to-r from-electric-blue to-neon-purple p-px rounded-xl rounded-tr-none">
                      <div className="bg-panel rounded-xl rounded-tr-none p-3">
                        <p className="text-sm text-foreground leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-(--foreground-muted) mt-1 block text-right">{formatTime(message.time)}</span>
                  </div>
                ) : (
                  <div key={message.id} className="max-w-[85%] rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-sm text-foreground">{message.author}</span>
                      <span className="text-[10px] text-(--foreground-muted)">{formatTime(message.time)}</span>
                    </div>
                    <p className="text-sm text-foreground/90">{message.text}</p>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 bg-black/20 border-t border-(--glass-border)">
            <div className="relative">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                className="w-full bg-background border border-(--glass-border) rounded-full px-5 py-3 pr-12 text-sm text-foreground placeholder-(--foreground-muted)"
                placeholder="Message group..."
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!activeGroupId}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-electric-blue hover:text-black transition-colors text-foreground disabled:opacity-40"
              >
                <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
