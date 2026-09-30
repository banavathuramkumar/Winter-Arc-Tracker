import React from 'react';
import { Moon, Plus } from 'lucide-react';
import { getMonthDaysArray } from '../utils/dateUtils';

const SLEEP_HOURS_LEVELS = [10, 9, 8, 7, 6, 5, 4];

export const SleepDotGrid = ({
  sleepLogs = [],
  sleepGoal = 8,
  monthKey = '2026-09',
  todayDateStr = '',
  onSelectDayToLog,
}) => {
  const daysArray = getMonthDaysArray(monthKey);

  // Map sleep duration by date
  const sleepMap = {};
  sleepLogs.forEach((log) => {
    sleepMap[log.date] = log.duration;
  });

  return (
    <div className="w-full bg-white dark:bg-[#101726] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Sleep Duration Matrix
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[11px] font-mono font-medium">
              Goal: {sleepGoal}h
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dot Matrix tracking based on the Winter Arc physical template. Click any day to log sleep.
          </p>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto p-4 sm:p-6">
        <div className="min-w-[720px]">
          
          {/* Main Matrix */}
          <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
            {SLEEP_HOURS_LEVELS.map((hourLevel) => {
              const isGoalRow = hourLevel === sleepGoal;
              return (
                <div
                  key={hourLevel}
                  className={`flex items-center border-b border-slate-200/70 dark:border-slate-800/60 last:border-b-0 h-10 ${
                    isGoalRow ? 'bg-sky-500/5 dark:bg-sky-500/10' : ''
                  }`}
                >
                  {/* Y-Axis Label (e.g. 10h, 9h, 8h...) */}
                  <div
                    className={`w-14 min-w-[56px] text-center font-mono text-xs font-semibold py-2 border-r border-slate-200 dark:border-slate-800 ${
                      isGoalRow
                        ? 'text-sky-600 dark:text-sky-400 font-bold bg-sky-500/10'
                        : 'text-slate-500 dark:text-slate-400 bg-white dark:bg-[#101726]'
                    }`}
                  >
                    {hourLevel}h
                  </div>

                  {/* Day Columns */}
                  <div className="flex-1 grid grid-flow-col auto-cols-fr h-full">
                    {daysArray.map((dayNum) => {
                      const dayStr = String(dayNum).padStart(2, '0');
                      const cellDate = `${monthKey}-${dayStr}`;
                      const loggedHours = sleepMap[cellDate];
                      const isFuture = cellDate > todayDateStr;

                      // Dot is rendered in this hour row if user's sleep falls near this level
                      // Supports half-hours: e.g. 7.5h or 7h in the 7h row
                      const hasDot =
                        loggedHours !== undefined &&
                        Math.floor(loggedHours) === hourLevel;

                      return (
                        <div
                          key={dayNum}
                          onClick={() => !isFuture && onSelectDayToLog(cellDate, loggedHours)}
                          className={`relative border-r border-slate-100 dark:border-slate-800/40 last:border-r-0 flex items-center justify-center transition-colors ${
                            isFuture
                              ? 'cursor-not-allowed bg-slate-100/30 dark:bg-slate-900/40'
                              : 'cursor-pointer hover:bg-sky-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          {hasDot && (
                            <div className="relative group/dot">
                              <div className="w-3.5 h-3.5 rounded-full bg-sky-500 dark:bg-sky-400 shadow-glow flex items-center justify-center animate-in zoom-in-50 duration-200">
                                <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-950"></div>
                              </div>
                              <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover/dot:block px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono whitespace-nowrap z-30 shadow-lg">
                                {loggedHours}h
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-Axis (Days 1..31) */}
          <div className="flex items-center mt-2">
            <div className="w-14 min-w-[56px] text-center text-[10px] font-mono text-slate-400 uppercase font-semibold">
              Day
            </div>
            <div className="flex-1 grid grid-flow-col auto-cols-fr text-center font-mono text-xs text-slate-500 dark:text-slate-400">
              {daysArray.map((dayNum) => {
                const dayStr = String(dayNum).padStart(2, '0');
                const cellDate = `${monthKey}-${dayStr}`;
                const isToday = cellDate === todayDateStr;

                return (
                  <div
                    key={dayNum}
                    className={`py-1 ${
                      isToday ? 'text-sky-500 dark:text-sky-400 font-bold bg-sky-500/10 rounded' : ''
                    }`}
                  >
                    {dayNum}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
