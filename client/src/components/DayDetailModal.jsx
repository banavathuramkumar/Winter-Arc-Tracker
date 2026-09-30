import React from 'react';
import { X, CheckCircle2, Moon, Target, Award, Snowflake } from 'lucide-react';

export const DayDetailModal = ({
  isOpen,
  onClose,
  dayData = null,
  allHabits = [],
  allLogs = [],
  goals = [],
}) => {
  if (!isOpen || !dayData) return null;

  const { date, dayNumber, status, sleepDuration, habitsCompleted, totalHabits } = dayData;
  const isPerfect = status === 'perfect';

  // Find habits completed on this date
  const completedHabitIds = new Set(
    allLogs.filter((l) => l.date === date && l.completed).map((l) => l.habitId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#101726] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm font-mono ${
              isPerfect
                ? 'bg-sky-500 text-white shadow-glow'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {dayNumber}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Breakdown
              </h3>
              <p className="text-xs font-mono text-slate-400">{date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Status Badge */}
          {isPerfect ? (
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold">
              <Snowflake className="w-4 h-4" />
              <span>❄ Perfect Day — 100% Habits & Sleep Recorded</span>
            </div>
          ) : status === 'partial' ? (
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <span>◐ Partially Completed</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-medium">
              <span>○ No logged activity recorded</span>
            </div>
          )}

          {/* Sleep Stats */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono uppercase">
                <Moon className="w-4 h-4 text-sky-400" /> Sleep Logged
              </span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {sleepDuration !== null ? `${sleepDuration} hours` : 'Not recorded'}
              </span>
            </div>
          </div>

          {/* Habits Breakdown */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono mb-2.5">
              <span>Habits ({habitsCompleted}/{totalHabits})</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {allHabits.map((h) => {
                const done = completedHabitIds.has(h._id);
                return (
                  <div
                    key={h._id}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs border ${
                      done
                        ? 'bg-sky-500/5 dark:bg-sky-500/10 border-sky-500/20 text-slate-900 dark:text-white'
                        : 'bg-white dark:bg-[#101726] border-slate-200 dark:border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{h.icon || '⚡'}</span>
                      <span className="font-medium">{h.name}</span>
                    </div>
                    {done ? (
                      <span className="text-sky-500 font-bold font-mono">✓ Done</span>
                    ) : (
                      <span className="text-slate-400 font-mono">○ Missed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
