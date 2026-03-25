'use client';

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(88,162,255,0.2),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(40,196,170,0.16),transparent_30%),linear-gradient(to_bottom,rgba(8,14,26,0.2),transparent_45%)]" />
      <div className="absolute top-[-18%] left-[-10%] w-[48%] h-[48%] rounded-full bg-[var(--accent-electric-blue)] blur-[165px] opacity-10 animate-pulse-slow" />
      <div className="absolute bottom-[-24%] right-[-12%] w-[62%] h-[62%] rounded-full bg-[var(--accent-vibrant-green)] blur-[190px] opacity-10 animate-blob" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
    </div>
  );
}
