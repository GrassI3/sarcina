import { MoodSelector } from '../components/ui/MoodSelector';
import { DayScore } from '../components/ui/DayScore';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { TaskManagerWidget } from '../components/dashboard/TaskManagerWidget';
import { PlannerWidget } from '../components/dashboard/PlannerWidget';
import { FocusTimerWidget } from '../components/dashboard/FocusTimerWidget';
import { HabitTrackerWidget } from '../components/dashboard/HabitTrackerWidget';
import { QuickNotesWidget } from '../components/dashboard/QuickNotesWidget';

export default function Dashboard() {
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full h-[calc(100dvh-4rem)] md:h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar pb-24 md:pb-8">
      {/* Header section */}
      <DashboardHeader />
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full relative z-10">
        
        {/* Left Column - Core Tools
            Member 2's workspace */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <TaskManagerWidget />
          <PlannerWidget />
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

          <FocusTimerWidget />
          <HabitTrackerWidget />
          <QuickNotesWidget />

        </div>
      </div>
    </div>
  );
}
