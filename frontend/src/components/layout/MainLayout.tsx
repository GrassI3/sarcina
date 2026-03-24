import { Sidebar } from './Sidebar';
import { AmbientBackground } from '../ui/AmbientBackground';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row bg-transparent w-full flex-1 max-w-full overflow-hidden min-h-[100dvh]">
      <AmbientBackground />
      <Sidebar />
      <main className="flex-1 w-full max-w-full overflow-y-auto relative z-10 custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
