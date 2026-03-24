import { MoodSelector } from '../components/ui/MoodSelector';
import { DayScore } from '../components/ui/DayScore';

export default function Dashboard() {
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full h-[calc(100dvh-4rem)] md:h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar pb-24 md:pb-8">
      {/* Header section */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="animate-fade-in-up">
          <h2 className="text-3xl font-bold font-heading text-white tracking-tight">Good Morning, Creator.</h2>
          <p className="text-[var(--foreground-muted)] text-sm mt-1">
            "The secret of getting ahead is getting started."
          </p>
        </div>
        <div className="hidden md:block">
           <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all border border-white/5 shadow-sm hover:shadow-[0_0_15px_var(--glass-glow)] hover:-translate-y-0.5">
             + New Task
           </button>
        </div>
      </header>
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full relative z-10">
        
        {/* Left Column - Core Tools
            Member 2's workspace */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Smart Task Manager Placeholder */}
          <section className="glass-card flex-1 min-h-[350px] p-6 flex flex-col relative overflow-hidden group">
            <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-electric-blue)] shadow-[0_0_10px_var(--accent-electric-blue)]"></span>
              Smart Task Manager
            </h3>
            <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-[var(--foreground-muted)] text-sm group-hover:border-[var(--glass-glow)] transition-colors bg-white/[0.02]">
              <div className="text-center">
                <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>[Member 2: Task Manager Component]</p>
              </div>
            </div>
          </section>

          {/* Daily Planner Placeholder */}
          <section className="glass-card flex-1 min-h-[350px] p-6 flex flex-col relative group">
            <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-vibrant-green)] shadow-[0_0_10px_var(--accent-vibrant-green)]"></span>
              Daily Planner / Time Blocks
            </h3>
            <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-[var(--foreground-muted)] text-sm group-hover:border-white/20 transition-colors bg-white/[0.02]">
              <div className="text-center">
                <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>[Member 2: Timeline Component]</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Focus & Gamification
            Member 3 & 4 workspace */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Top Row: Mood & Score */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 xl:col-span-1">
              <MoodSelector />
            </div>
            <div className="col-span-2 xl:col-span-1 h-full">
              <DayScore />
            </div>
          </div>

          {/* Focus Timer Placeholder */}
          <section className="glass-card min-h-[250px] p-6 flex flex-col relative group justify-center items-center">
            <h3 className="text-lg font-heading font-bold mb-6 flex items-center gap-2 text-center w-full justify-center absolute top-6">
               Focus Flow
            </h3>
            <div className="w-48 h-48 border-[6px] border-dashed border-white/10 rounded-full flex flex-col items-center justify-center text-[var(--foreground-muted)] text-sm text-center p-4 mt-8 group-hover:border-[var(--accent-neon-purple)] group-hover:shadow-[0_0_30px_rgba(176,38,255,0.2)] transition-all duration-500">
              <span className="text-3xl font-heading font-bold text-white mb-2">25:00</span>
              <p className="text-xs">[Member 3: Timer]</p>
            </div>
          </section>

          {/* Habit Tracker Placeholder */}
          <section className="glass-card min-h-[200px] p-6 flex flex-col relative group">
             <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-neon-purple)] shadow-[0_0_10px_var(--accent-neon-purple)]"></span>
              Habit Tracker
            </h3>
            <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-[var(--foreground-muted)] text-sm text-center bg-white/[0.02]">
              <div className="w-full px-4">
                <div className="h-8 bg-white/5 rounded my-2 flex items-center px-3 justify-between"><span>Meditation</span> <div className="w-4 h-4 rounded-full border border-white/20"></div></div>
                <div className="h-8 bg-white/5 rounded my-2 flex items-center px-3 justify-between"><span>Hydration</span> <div className="w-4 h-4 rounded-full border border-white/20"></div></div>
                <p className="text-xs mt-3 opacity-50">[Member 3: Add Streaks]</p>
              </div>
            </div>
          </section>

          {/* Quick Notes / Brain Dump Placeholder */}
          <section className="glass-card flex-1 min-h-[150px] p-4 flex flex-col group relative">
             <textarea 
               className="w-full h-full bg-transparent resize-none outline-none text-sm text-white placeholder-[var(--foreground-muted)] font-sans"
               placeholder="Brain dump... (auto-saves)"
             />
          </section>

        </div>
      </div>
    </div>
  );
}
