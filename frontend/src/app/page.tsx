"use client";
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { NewTaskAiPanel } from '@/components/dashboard/NewTaskAiPanel';
import { Glow } from '../components/ui/Glow';
import TeamChat from './chat/page';

type UiMode = 'Focus' | 'Chill' | 'Planning';
type AppView = 'dashboard' | 'tasks' | 'planner' | 'focus' | 'habits' | 'chat';

function ViewShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <header className="animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-semibold font-heading tracking-tight text-foreground">{title}</h2>
        <p className="text-(--foreground-muted) mt-2 text-sm md:text-base">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

export default function Home() {
  const searchParams = useSearchParams();
  const [uiMode, setUiMode] = useState<UiMode>('Focus');
  const [timerActive, setTimerActive] = useState(false);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const viewParam = searchParams.get('view');
  const activeView: AppView =
    viewParam === 'tasks' ||
    viewParam === 'planner' ||
    viewParam === 'focus' ||
    viewParam === 'habits' ||
    viewParam === 'chat' ||
    viewParam === 'dashboard'
      ? viewParam
      : 'dashboard';

  const leftColSpan = uiMode === 'Focus' ? 'lg:col-span-8' : uiMode === 'Planning' ? 'lg:col-span-5' : 'lg:col-span-4';
  const rightColSpan = uiMode === 'Focus' ? 'lg:col-span-4' : uiMode === 'Planning' ? 'lg:col-span-7' : 'lg:col-span-8';

  const renderView = () => {
    if (activeView === 'tasks') {
      return (
        <ViewShell title="Task Manager" subtitle="Capture and execute your priorities in one place.">
          <TaskManagerWidget />
        </ViewShell>
      );
    }

    if (activeView === 'planner') {
      return (
        <ViewShell title="Calendar Planner" subtitle="Review and adjust what is planned by day.">
          <PlannerWidget />
        </ViewShell>
      );
    }

    if (activeView === 'focus') {
      return (
        <ViewShell title="Focus Flow" subtitle="Run distraction-free sessions and keep momentum through the day.">
          <FocusTimerWidget setTimerActive={setTimerActive} />
        </ViewShell>
      );
    }

    if (activeView === 'habits') {
      return (
        <ViewShell title="Habit Tracker" subtitle="Track consistency daily and build streaks that stick.">
          <HabitTrackerWidget />
        </ViewShell>
      );
    }

    if (activeView === 'chat') {
      return <TeamChat />;
    }

    return (
      <>
        <DashboardHeader onOpenNewTask={() => setIsTaskPanelOpen(true)} />
        <AnimatePresence>
          <motion.div
            key={uiMode}
            className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={`${leftColSpan} flex flex-col gap-6`}>
              <TaskManagerWidget />
              <PlannerWidget />
            </div>

            <div className={`${rightColSpan} flex flex-col gap-6`}>
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
      </>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-7 xl:p-9 w-full h-[calc(100dvh-4rem)] md:h-dvh overflow-y-auto overflow-x-hidden pb-24 md:pb-10 selection:bg-black/20 dark:selection:bg-white/20 relative">
      <div className="absolute top-0 left-0 right-0 h-105 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_42%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_42%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 left-0 h-115 bg-[radial-gradient(circle_at_82%_70%,rgba(0,0,0,0.06),transparent_38%)] dark:bg-[radial-gradient(circle_at_82%_70%,rgba(255,255,255,0.04),transparent_38%)] pointer-events-none" />
      <AnimatePresence>
        {timerActive && <Glow color="rgba(72, 143, 255, 0.45)" />}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col gap-6 md:gap-7">
        {renderView()}
      </div>

      <NewTaskAiPanel
        open={isTaskPanelOpen && activeView === 'dashboard'}
        onClose={() => setIsTaskPanelOpen(false)}
      />
    </div>
  );
}