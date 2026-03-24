"use client";
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoodSelector } from '../components/ui/MoodSelector';
import { DayScore } from '../components/ui/DayScore';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { TaskManagerWidget } from '../components/dashboard/TaskManagerWidget';
import { PlannerWidget } from '../components/dashboard/PlannerWidget';
import { FocusTimerWidget } from '../components/dashboard/FocusTimerWidget';
import { HabitTrackerWidget } from '../components/dashboard/HabitTrackerWidget';
import { QuickNotesWidget } from '../components/dashboard/QuickNotesWidget';
import { QuoteTicker } from '../components/dashboard/QuoteTicker';
import { Glow } from '../components/ui/Glow';

type UiMode = 'Focus' | 'Chill' | 'Planning';

export default function Home() {
  const [uiMode, setUiMode] = useState<UiMode>('Focus');
  const [timerActive, setTimerActive] = useState(false);
  const leftColSpan = uiMode === 'Focus' ? 'lg:col-span-8' : uiMode === 'Planning' ? 'lg:col-span-5' : 'lg:col-span-4';
  const rightColSpan = uiMode === 'Focus' ? 'lg:col-span-4' : uiMode === 'Planning' ? 'lg:col-span-7' : 'lg:col-span-8';

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 max-w-[1600px] mx-auto w-full h-[calc(100dvh-4rem)] md:h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar pb-24 md:pb-8 selection:bg-fuchsia-500/30 relative">

      {/* Background glow effects from sanat branch */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-violet-500/20 via-violet-500/5 to-transparent pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-full h-[500px] bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none mix-blend-screen" />
      <AnimatePresence>
        {timerActive && <Glow color="rgba(139, 92, 246, 0.5)" />}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col gap-6">
        {/* Header section */}
        <DashboardHeader />

        {/* Main Grid Layout */}
        <AnimatePresence>
        <motion.div 
          key={uiMode}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          
          {/* Left Column - Core Tools */}
          <div className={`${leftColSpan} flex flex-col gap-6`}>
            <TaskManagerWidget />
            <PlannerWidget />
          </div>

          {/* Right Column - Focus & Gamification */}
          <div className={`${rightColSpan} flex flex-col gap-6`}>
            
            {/* Top Row: Mood & Score */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 xl:col-span-1">
                <MoodSelector setUiMode={setUiMode} />
              </div>
              <div className="col-span-2 xl:col-span-1 h-full">
                <DayScore />
              </div>
            </div>

            <QuoteTicker />

            <FocusTimerWidget setTimerActive={setTimerActive} />
            <HabitTrackerWidget />
            <QuickNotesWidget />

          </div>
        </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}