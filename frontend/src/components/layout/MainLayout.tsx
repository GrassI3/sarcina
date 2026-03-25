"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from './Sidebar';
import { AmbientBackground } from '../ui/AmbientBackground';
import { useAuth } from "@/lib/AuthContext";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAuthRoute = pathname === "/auth";

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user && !isAuthRoute) {
      router.replace("/auth");
      return;
    }

    if (user && isAuthRoute) {
      router.replace("/?view=dashboard");
    }
  }, [isAuthRoute, loading, router, user]);

  if (loading) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center">
        <div className="glass-card px-6 py-4 text-sm text-(--foreground-muted)">Loading workspace...</div>
      </div>
    );
  }

  if (isAuthRoute) {
    return <div className="min-h-dvh w-full">{children}</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row bg-transparent w-full flex-1 max-w-full overflow-hidden min-h-dvh">
      <AmbientBackground />
      <Sidebar />
      <main className="flex-1 w-full max-w-full overflow-y-auto relative z-10 md:pl-1">
        {children}
      </main>
    </div>
  );
}
