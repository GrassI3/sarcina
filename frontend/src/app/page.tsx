import React from 'react';
import ProductivityModule from "@/components/ProductivityModule";
import { MoodSelector } from '../components/ui/MoodSelector';
import { DayScore } from '../components/ui/DayScore';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { TaskManagerWidget } from '../components/dashboard/TaskManagerWidget';
import { PlannerWidget } from '../components/dashboard/PlannerWidget';
import { FocusTimerWidget } from '../components/dashboard/FocusTimerWidget';
import { HabitTrackerWidget } from '../components/dashboard/HabitTrackerWidget';
import { QuickNotesWidget } from '../components/dashboard/QuickNotesWidget';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 max-w-[1600px] mx-auto w-full h-[calc(100dvh-4rem)] md:h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar pb-24 md:pb-8 selection:bg-fuchsia-500/30 relative">
      
      {/* Background glow effects from sanat branch */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-violet-500/20 via-violet-500/5 to-transparent pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-full h-[500px] bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none mix-blend-screen" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Header section */}
        <DashboardHeader />

        {/* New Productivity Module from sanat branch */}
        <ProductivityModule />
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          
          {/* Left Column - Core Tools */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <TaskManagerWidget />
            <PlannerWidget />
          </div>

          {/* Right Column - Focus & Gamification */}
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

            <FocusTimerWidget />
            <HabitTrackerWidget />
            <QuickNotesWidget />

          </div>
        </div>
      </div>
    </div>
  );
}