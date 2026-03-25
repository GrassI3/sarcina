import { onAuthStateChanged, type User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firebaseAuth, firestoreDb } from "@/lib/firebase";

export interface ApiSubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface ApiTask {
  id: string;
  text: string;
  completed: boolean;
  subTasks: ApiSubTask[];
  dueDate?: string | null;
}

export interface ApiHabit {
  id: string;
  name: string;
  streak: number;
  lastCompletedDate: string | null;
}

export interface ApiQuickNote {
  id: string;
  text: string;
  savedAt: string | null;
}

export interface ApiChatMessage {
  id: string;
  author: string;
  text: string;
  time: string;
}

export interface ApiChatTask {
  id: string;
  text: string;
  completed: boolean;
  tag: string;
  assignee?: string;
}

export interface ApiChatGroup {
  id: string;
  name: string;
  createdAt: string;
}

export interface ApiChatMember {
  id: string;
  name: string;
  email?: string;
  role: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

let authBootstrapPromise: Promise<void> | null = null;

function waitForAuthBootstrap(): Promise<void> {
  if (firebaseAuth.currentUser) {
    return Promise.resolve();
  }

  if (authBootstrapPromise) {
    return authBootstrapPromise;
  }

  authBootstrapPromise = new Promise<void>((resolve) => {
    const timeout = window.setTimeout(() => {
      unsubscribe();
      resolve();
    }, 15000);

    const unsubscribe = onAuthStateChanged(firebaseAuth, () => {
      window.clearTimeout(timeout);
      unsubscribe();
      resolve();
    });
  }).finally(() => {
    authBootstrapPromise = null;
  });

  return authBootstrapPromise;
}

async function getAuthedUser(): Promise<User> {
  if (firebaseAuth.currentUser) {
    return firebaseAuth.currentUser;
  }

  await waitForAuthBootstrap();

  if (firebaseAuth.currentUser) {
    return firebaseAuth.currentUser;
  }

  throw new Error("User is not authenticated");
}

async function userCollection(name: string) {
  const user = await getAuthedUser();
  return collection(firestoreDb, "users", user.uid, name);
}

async function userDoc(collectionName: string, id: string) {
  const user = await getAuthedUser();
  return doc(firestoreDb, "users", user.uid, collectionName, id);
}

async function quickNoteDoc() {
  const user = await getAuthedUser();
  return doc(firestoreDb, "users", user.uid, "notes", "quick");
}

function toApiTask(raw: Record<string, unknown>, id: string): ApiTask {
  return {
    id,
    text: String(raw.text ?? ""),
    completed: Boolean(raw.completed ?? false),
    subTasks: Array.isArray(raw.subTasks) ? (raw.subTasks as ApiSubTask[]) : [],
    dueDate: typeof raw.dueDate === "string" ? raw.dueDate : null,
  };
}

function toApiHabit(raw: Record<string, unknown>, id: string): ApiHabit {
  return {
    id,
    name: String(raw.name ?? ""),
    streak: Number(raw.streak ?? 0),
    lastCompletedDate: typeof raw.lastCompletedDate === "string" ? raw.lastCompletedDate : null,
  };
}

function toApiChatMessage(raw: Record<string, unknown>, id: string): ApiChatMessage {
  return {
    id,
    author: String(raw.author ?? "You"),
    text: String(raw.text ?? ""),
    time: String(raw.time ?? nowIso()),
  };
}

function toApiChatTask(raw: Record<string, unknown>, id: string): ApiChatTask {
  return {
    id,
    text: String(raw.text ?? ""),
    completed: Boolean(raw.completed ?? false),
    tag: String(raw.tag ?? "General"),
    assignee: typeof raw.assignee === "string" ? raw.assignee : undefined,
  };
}

function toApiChatGroup(raw: Record<string, unknown>, id: string): ApiChatGroup {
  return {
    id,
    name: String(raw.name ?? "Untitled Group"),
    createdAt: String(raw.createdAt ?? nowIso()),
  };
}

function toApiChatMember(raw: Record<string, unknown>, id: string): ApiChatMember {
  return {
    id,
    name: String(raw.name ?? "Member"),
    email: typeof raw.email == "string" ? raw.email : undefined,
    role: String(raw.role ?? "member"),
  };
}

async function listByCreatedAt(path: string) {
  const col = await userCollection(path);
  const snaps = await getDocs(col);
  return snaps.docs.sort((a, b) => {
    const at = String(a.data().createdAt ?? "");
    const bt = String(b.data().createdAt ?? "");
    return at.localeCompare(bt);
  });
}

async function chatGroupsCollection() {
  const user = await getAuthedUser()
  return collection(firestoreDb, "users", user.uid, "chatGroups");
}

async function chatGroupDoc(groupId: string) {
  const user = await getAuthedUser();
  return doc(firestoreDb, "users", user.uid, "chatGroups", groupId);
}

async function chatGroupMembersCollection(groupId: string) {
  const user = await getAuthedUser();
  return collection(firestoreDb, "users", user.uid, "chatGroups", groupId, "members");
}

async function chatGroupMemberDoc(groupId: string, memberId: string) {
  const user = await getAuthedUser();
  return doc(firestoreDb, "users", user.uid, "chatGroups", groupId, "members", memberId);
}

async function chatGroupMessagesCollection(groupId: string) {
  const user = await getAuthedUser();
  return collection(firestoreDb, "users", user.uid, "chatGroups", groupId, "messages");
}

async function chatGroupMessageDoc(groupId: string, messageId: string) {
  const user = await getAuthedUser();
  return doc(firestoreDb, "users", user.uid, "chatGroups", groupId, "messages", messageId);
}

async function chatGroupTasksCollection(groupId: string) {
  const user = await getAuthedUser();
  return collection(firestoreDb, "users", user.uid, "chatGroups", groupId, "tasks");
}

async function chatGroupTaskDoc(groupId: string, taskId: string) {
  const user = await getAuthedUser();
  return doc(firestoreDb, "users", user.uid, "chatGroups", groupId, "tasks", taskId);
}

export const taskApi = {
  list: async () => {
    const docs = await listByCreatedAt("tasks");
    return docs.map((snap) => toApiTask(snap.data() as Record<string, unknown>, snap.id));
  },
  create: async (payload: { text: string; dueDate?: string }) => {
    const id = crypto.randomUUID();
    const ref = await userDoc("tasks", id);
    const value: ApiTask & { createdAt: string } = {
      id,
      text: payload.text,
      completed: false,
      subTasks: [],
      dueDate: payload.dueDate ?? null,
      createdAt: nowIso(),
    };
    await setDoc(ref, value);
    return value;
  },
  patch: async (id: string, payload: Partial<ApiTask>) => {
    const ref = await userDoc("tasks", id);
    await updateDoc(ref, { ...payload, updatedAt: nowIso() });
    const next = await getDoc(ref);
    return toApiTask(next.data() as Record<string, unknown>, id);
  },
  remove: async (id: string) => {
    const ref = await userDoc("tasks", id);
    await deleteDoc(ref);
    return { status: "ok" };
  },
};

export const habitApi = {
  list: async () => {
    const docs = await listByCreatedAt("habits");
    return docs.map((snap) => toApiHabit(snap.data() as Record<string, unknown>, snap.id));
  },
  create: async (payload: { name: string }) => {
    const id = crypto.randomUUID();
    const ref = await userDoc("habits", id);
    const value: ApiHabit & { createdAt: string } = {
      id,
      name: payload.name,
      streak: 0,
      lastCompletedDate: null,
      createdAt: nowIso(),
    };
    await setDoc(ref, value);
    return value;
  },
  patch: async (id: string, payload: Partial<ApiHabit>) => {
    const ref = await userDoc("habits", id);
    await updateDoc(ref, { ...payload, updatedAt: nowIso() });
    const next = await getDoc(ref);
    return toApiHabit(next.data() as Record<string, unknown>, id);
  },
  remove: async (id: string) => {
    const ref = await userDoc("habits", id);
    await deleteDoc(ref);
    return { status: "ok" };
  },
};

export const noteApi = {
  getQuick: async () => {
    const ref = await quickNoteDoc();
    const snap = await getDoc(ref);
    const value = snap.exists() ? (snap.data() as Record<string, unknown>) : {};
    return {
      id: "quick",
      text: String(value.text ?? ""),
      savedAt: typeof value.savedAt === "string" ? value.savedAt : null,
    };
  },
  saveQuick: async (payload: { text: string }) => {
    const ref = await quickNoteDoc();
    const value: ApiQuickNote = {
      id: "quick",
      text: payload.text,
      savedAt: nowIso(),
    };
    await setDoc(ref, value, { merge: true });
    return value;
  },
};

export const chatApi = {
  listGroups: async () => {
    const col = await chatGroupsCollection();
    const snaps = await getDocs(col);
    const docs = snaps.docs.sort((a, b) => {
      const at = String(a.data().createdAt ?? "");
      const bt = String(b.data().createdAt ?? "");
      return at.localeCompare(bt);
    });
    return docs.map((snap) => toApiChatGroup(snap.data() as Record<string, unknown>, snap.id));
  },
  createGroup: async (payload: { name: string }) => {
    const id = crypto.randomUUID();
    const ref = await chatGroupDoc(id);
    const value: ApiChatGroup = {
      id,
      name: payload.name,
      createdAt: nowIso(),
    };
    await setDoc(ref, value);
    return value;
  },
  removeGroup: async (groupId: string) => {
    const ref = await chatGroupDoc(groupId);
    await deleteDoc(ref);
    return { status: "ok" };
  },
  listMembers: async (groupId: string) => {
    const col = await chatGroupMembersCollection(groupId);
    const snaps = await getDocs(col);
    return snaps.docs
      .sort((a, b) => String(a.data().name ?? "").localeCompare(String(b.data().name ?? "")))
      .map((snap) => toApiChatMember(snap.data() as Record<string, unknown>, snap.id));
  },
  addMember: async (groupId: string, payload: { name: string; email?: string; role?: string }) => {
    const id = crypto.randomUUID();
    const ref = await chatGroupMemberDoc(groupId, id);
    const value: ApiChatMember = {
      id,
      name: payload.name,
      email: payload.email,
      role: payload.role ?? "member",
    };
    await setDoc(ref, value);
    return value;
  },
  removeMember: async (groupId: string, memberId: string) => {
    const ref = await chatGroupMemberDoc(groupId, memberId);
    await deleteDoc(ref);
    return { status: "ok" };
  },
  listMessages: async (groupId: string) => {
    const col = await chatGroupMessagesCollection(groupId);
    const snaps = await getDocs(col);
    const docs = snaps.docs.sort((a, b) => {
      const at = String(a.data().createdAt ?? "");
      const bt = String(b.data().createdAt ?? "");
      return at.localeCompare(bt);
    });
    return docs.map((snap) => toApiChatMessage(snap.data() as Record<string, unknown>, snap.id));
  },
  createMessage: async (groupId: string, payload: { author: string; text: string }) => {
    const id = crypto.randomUUID();
    const ref = await chatGroupMessageDoc(groupId, id);
    const value: ApiChatMessage & { createdAt: string } = {
      id,
      author: payload.author,
      text: payload.text,
      time: nowIso(),
      createdAt: nowIso(),
    };
    await setDoc(ref, value);
    return value;
  },
  listTasks: async (groupId: string) => {
    const col = await chatGroupTasksCollection(groupId);
    const snaps = await getDocs(col);
    const docs = snaps.docs.sort((a, b) => {
      const at = String(a.data().createdAt ?? "");
      const bt = String(b.data().createdAt ?? "");
      return at.localeCompare(bt);
    });
    return docs.map((snap) => toApiChatTask(snap.data() as Record<string, unknown>, snap.id));
  },
  createTask: async (groupId: string, payload: { text: string; tag?: string; assignee?: string }) => {
    const id = crypto.randomUUID();
    const ref = await chatGroupTaskDoc(groupId, id);
    const value: ApiChatTask & { createdAt: string } = {
      id,
      text: payload.text,
      completed: false,
      tag: payload.tag ?? "General",
      assignee: payload.assignee,
      createdAt: nowIso(),
    };
    await setDoc(ref, value);
    return value;
  },
  patchTask: async (groupId: string, id: string, payload: Partial<ApiChatTask>) => {
    const ref = await chatGroupTaskDoc(groupId, id);
    await updateDoc(ref, { ...payload, updatedAt: nowIso() });
    const next = await getDoc(ref);
    return toApiChatTask(next.data() as Record<string, unknown>, id);
  },
  removeTask: async (groupId: string, id: string) => {
    const ref = await chatGroupTaskDoc(groupId, id);
    await deleteDoc(ref);
    return { status: "ok" };
  },
};
