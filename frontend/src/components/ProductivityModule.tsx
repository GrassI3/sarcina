import PomodoroTimer from "./PomodoroTimer";
import HabitTracker from "./HabitTracker";

export default function ProductivityModule() {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
      <div className="text-center mb-16 mt-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 mb-6 animate-gradient-x p-2">
          Focus & Flow
        </h1>
        <p className="text-white/60 font-medium text-lg max-w-xl mx-auto leading-relaxed">
          Master your time, build lasting habits, and unlock your peak productivity.
        </p>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-stretch justify-center px-4">
        <PomodoroTimer />
        <HabitTracker />
      </div>
    </div>
  );
}
