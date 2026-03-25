"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function AuthPage() {
  const router = useRouter();
  const { login, loginWithGoogle, signup, user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/?view=dashboard");
    }
  }, [loading, router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (mode === "signup") {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      router.replace("/?view=dashboard");
    } catch {
      setError("Authentication failed. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await loginWithGoogle();
      router.replace("/?view=dashboard");
    } catch {
      setError("Google login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8">
      <section className="glass-card w-full max-w-md p-7 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-(--foreground-muted)">FlowState Account</p>
        <h1 className="mt-2 text-3xl font-heading font-semibold text-foreground">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-(--foreground-muted)">
          {mode === "signup"
            ? "Sign up to keep your tasks, habits, notes, and chat saved per user."
            : "Login to access your personal workspace."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm"
              placeholder="Full name"
              required
            />
          ) : null}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm"
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm"
            placeholder="Password"
            minLength={6}
            required
          />

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white bg-linear-to-r from-electric-blue to-neon-purple hover:opacity-90 disabled:opacity-60"
          >
            {submitting
              ? "Please wait..."
              : mode === "signup"
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-(--foreground-muted)">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          onClick={() => void handleGoogle()}
          disabled={submitting}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-foreground hover:bg-white/10 disabled:opacity-60"
        >
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => setMode((prev) => (prev === "login" ? "signup" : "login"))}
          className="mt-4 text-sm text-(--foreground-muted) hover:text-foreground"
        >
          {mode === "signup" ? "Already have an account? Login" : "New here? Create an account"}
        </button>
      </section>
    </div>
  );
}
