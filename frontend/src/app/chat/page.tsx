import { DayScore } from '../../components/ui/DayScore';

export default function TeamChat() {
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full h-[calc(100dvh-4rem)] md:h-[100dvh] flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10 pb-24 md:pb-8">
      {/* Header section */}
      <header className="mb-6 animate-fade-in-up flex-shrink-0">
        <h2 className="text-3xl font-bold font-heading text-white tracking-tight flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--accent-electric-blue)] to-[var(--accent-neon-purple)] flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </span>
          Team Flow
        </h2>
        <p className="text-[var(--foreground-muted)] text-sm mt-2 ml-14">
          Sync on shared tasks, align flow states, and communicate.
        </p>
      </header>
      
      {/* Main Layout for Team Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full flex-1 min-h-0 relative z-10">
        
        {/* Left Column - Team Hub / Shared Tasks and Members */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          {/* Active Flow States (Team presence) */}
          <section className="glass-card flex flex-col p-5 group relative">
            <h3 className="text-sm font-heading font-bold mb-4 uppercase text-[var(--foreground-muted)] tracking-wider">
              Live Flow States
            </h3>
            <div className="flex flex-col gap-4">
              {/* Member 1: Deep Work */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent-energy-high)] to-orange-500 p-[2px] animate-pulse-slow">
                    <div className="w-full h-full rounded-full bg-[var(--background)] overflow-hidden" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent-energy-high)] border-2 border-[var(--background)] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-none">Alex</p>
                  <p className="text-xs text-[var(--accent-energy-high)] mt-1">Deep Work (15m left)</p>
                </div>
              </div>

              {/* Member 2: Available */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 p-[2px]">
                    <div className="w-full h-full rounded-full bg-[var(--background)]" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent-vibrant-green)] border-2 border-[var(--background)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-none">Sarah</p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">Available / Browsing</p>
                </div>
              </div>

            </div>
          </section>

          {/* Shared Tasks / Collective Goals */}
          <section className="glass-card flex-1 min-h-[250px] flex flex-col p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
               <button className="text-[var(--accent-electric-blue)] hover:text-white transition-colors">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
               </button>
            </div>
            <h3 className="text-sm font-heading font-bold mb-4 uppercase text-[var(--foreground-muted)] tracking-wider">
              Shared Backlog
            </h3>
            
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
              <label className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-[var(--accent-vibrant-green)] focus:ring-[var(--accent-vibrant-green)] focus:ring-offset-0 transition-all checked:bg-[var(--accent-vibrant-green)] appearance-none checked:border-transparent checked:before:content-['✓'] checked:before:text-background checked:before:text-xs checked:before:flex checked:before:justify-center checked:before:items-center" />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium leading-tight">Finalize Presentation Deck</p>
                  <div className="flex gap-2 mt-2">
                     <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--accent-electric-blue)]/20 text-[var(--accent-electric-blue)] font-bold">Design</span>
                     <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--accent-neon-purple)]/20 text-[var(--accent-neon-purple)] font-bold border border-[var(--accent-neon-purple)]/30">Assigned: Alex</span>
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-[var(--accent-vibrant-green)] focus:ring-[var(--accent-vibrant-green)] focus:ring-offset-0 transition-all checked:bg-[var(--accent-vibrant-green)] appearance-none checked:border-transparent checked:before:content-['✓'] checked:before:text-background checked:before:text-xs checked:before:flex checked:before:justify-center checked:before:items-center" />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium leading-tight">Write Copy for Landing Page</p>
                  <div className="flex gap-2 mt-2">
                     <span className="text-[10px] px-2 py-0.5 rounded pl-0 text-[var(--foreground-muted)] font-medium">Unassigned</span>
                  </div>
                </div>
              </label>

               <label className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 opacity-50">
                <input type="checkbox" checked readOnly className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-[var(--accent-vibrant-green)] focus:ring-[var(--accent-vibrant-green)] focus:ring-offset-0 transition-all checked:bg-[var(--accent-vibrant-green)] appearance-none checked:border-transparent checked:before:content-['✓'] checked:before:text-background checked:before:text-xs checked:before:flex checked:before:justify-center checked:before:items-center" />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium leading-tight line-through">Review user testing notes</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column - Chat Area */}
        <section className="lg:col-span-8 glass-card flex flex-col overflow-hidden min-h-[500px]">
          {/* Chat Header */}
          <div className="h-16 border-b border-[var(--glass-border)] flex items-center justify-between px-6 bg-white/5">
             <div className="flex items-center gap-3">
               <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-electric-blue)] shadow-[0_0_8px_var(--accent-electric-blue)]"></span>
               <h3 className="text-lg font-heading font-bold text-white"># General Chat</h3>
             </div>
             <div className="flex items-center -space-x-2">
                {/* User Avatars stacked */}
                <div className="w-8 h-8 rounded-full border-2 border-[var(--background-panel)] bg-gray-600 z-30" />
                <div className="w-8 h-8 rounded-full border-2 border-[var(--background-panel)] bg-gray-500 z-20" />
                <div className="w-8 h-8 rounded-full border-2 border-[var(--background-panel)] bg-white/10 z-10 flex items-center justify-center text-[10px] font-bold">+2</div>
             </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col custom-scrollbar">
            
            <div className="flex bg-white/5 p-3 rounded-lg mr-12 border border-white/5 w-fit max-w-[85%]">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0" />
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-sm text-white">Alex</span>
                    <span className="text-[10px] text-[var(--foreground-muted)]">10:42 AM</span>
                  </div>
                  <p className="text-sm text-[var(--foreground)] opacity-90 leading-relaxed">I'm going to enter High Energy Flow mode to knock out the presentation design. Ping me only if urgent!</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 items-end ml-12 self-end w-fit max-w-[85%]">
              <div className="bg-gradient-to-r from-[var(--accent-electric-blue)] to-[var(--accent-neon-purple)] p-[1px] rounded-xl rounded-tr-none">
                <div className="bg-[var(--background-panel)] rounded-xl rounded-tr-none p-3 h-full w-full">
                  <p className="text-sm text-white leading-relaxed">Got it! Good luck. I'll pick up the copy writing in the meantime.</p>
                </div>
              </div>
              <span className="text-[10px] text-[var(--foreground-muted)] mr-1">10:45 AM</span>
            </div>

            {/* System Message */}
            <div className="flex items-center justify-center gap-3 opacity-60 my-4">
              <div className="h-px bg-white/20 flex-1"></div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 text-white">Alex started a 50m Focus Session</span>
              <div className="h-px bg-white/20 flex-1"></div>
            </div>

          </div>

          {/* Input Area */}
          <div className="p-4 bg-black/20 border-t border-[var(--glass-border)]">
             <div className="relative group">
                <input 
                  type="text" 
                  className="w-full bg-[var(--background)] border border-[var(--glass-border)] rounded-full px-5 py-3 pr-12 text-sm text-white placeholder-[var(--foreground-muted)] focus:outline-none focus:border-white/30 focus:shadow-[0_0_15px_var(--glass-glow)] transition-all font-sans"
                  placeholder="Message team... (Shift + Enter for new line)"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[var(--accent-electric-blue)] hover:text-black transition-colors text-white">
                  <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}
