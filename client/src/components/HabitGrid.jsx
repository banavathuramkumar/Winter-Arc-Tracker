import React from 'react';
import { Check, Plus, Edit2, Archive, Trash2 } from 'lucide-react';
import { getMonthDaysArray } from '../utils/dateUtils';

export const HabitGrid = ({
  habits = [],
  habitLogs = [],
  monthKey = '2026-09',
  todayDateStr = '',
  onToggleHabit,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteHabit,
}) => {
  const daysArray = getMonthDaysArray(monthKey);

  // Map logs into quick lookup key: `${habitId}_${date}`
  const logMap = {};
  habitLogs.forEach((log) => {
    logMap[`${log.habitId}_${log.date}`] = log.completed;
  });

  return (
    <div className="w-full bg-white dark:bg-[#101726] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle overflow-hidden">
      
      {/* Header bar */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Monthly Habit Grid
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any cell to toggle daily completion. Keep the row unbroken.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-subtle transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Habit</span>
        </button>
      </div>

      {/* Grid Container with Horizontal Scroll and Sticky Habit Name Column */}
      <div className="overflow-x-auto relative">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              
              {/* Sticky Column: Habit Name Header */}
              <th className="sticky left-0 z-20 bg-slate-50 dark:bg-[#0c1220] py-3 px-4 font-semibold w-52 min-w-[180px] shadow-[1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[1px_0_0_0_rgba(30,41,59,1)]">
                HABIT
              </th>

              {/* Day Columns 1..31 */}
              {daysArray.map((dayNum) => {
                const dayStr = String(dayNum).padStart(2, '0');
                const cellDate = `${monthKey}-${dayStr}`;
                const isToday = cellDate === todayDateStr;

                return (
                  <th
                    key={dayNum}
                    className={`py-2 px-1 text-center font-medium w-8 min-w-[32px] ${
                      isToday
                        ? 'text-sky-500 dark:text-sky-400 font-bold bg-sky-500/10'
                        : ''
                    }`}
                  >
                    {dayNum}
                  </th>
                );
              })}

              {/* Actions Column */}
              <th className="py-3 px-3 text-center font-semibold w-16">
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {habits.length === 0 ? (
              <tr>
                <td
                  colSpan={daysArray.length + 2}
                  className="py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  <p className="text-sm font-medium">Your Winter Arc starts with one habit.</p>
                  <button
                    onClick={onOpenAddModal}
                    className="mt-3 px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400 transition"
                  >
                    Add Your First Habit
                  </button>
                </td>
              </tr>
            ) : (
              habits.map((habit) => {
                return (
                  <tr
                    key={habit._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Sticky Habit Name cell */}
                    <td className="sticky left-0 z-10 bg-white dark:bg-[#101726] group-hover:bg-slate-50 dark:group-hover:bg-[#131b2e] py-3 px-4 font-medium text-slate-800 dark:text-slate-200 shadow-[1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[1px_0_0_0_rgba(30,41,59,1)] transition-colors">
                      <div className="flex items-center space-x-2.5 truncate">
                        <span className="text-base flex-shrink-0">{habit.icon || '⚡'}</span>
                        <span className="truncate text-xs font-medium" title={habit.name}>
                          {habit.name}
                        </span>
                      </div>
                    </td>

                    {/* Day Cells 1..31 */}
                    {daysArray.map((dayNum) => {
                      const dayStr = String(dayNum).padStart(2, '0');
                      const cellDate = `${monthKey}-${dayStr}`;
                      const isFuture = cellDate > todayDateStr;
                      const isToday = cellDate === todayDateStr;
                      const isCompleted = !!logMap[`${habit._id}_${cellDate}`];

                      return (
                        <td
                          key={dayNum}
                          className={`py-1.5 px-0.5 text-center align-middle ${
                            isToday ? 'bg-sky-500/5 dark:bg-sky-500/10' : ''
                          }`}
                        >
                          <button
                            disabled={isFuture}
                            onClick={() => onToggleHabit(habit._id, cellDate, !isCompleted)}
                            title={`${habit.name} on ${cellDate}: ${
                              isFuture ? 'Future' : isCompleted ? 'Completed' : 'Not completed'
                            }`}
                            className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all ${
                              isFuture
                                ? 'opacity-20 cursor-not-allowed text-slate-300 dark:text-slate-700'
                                : isCompleted
                                ? 'bg-sky-500 text-white dark:bg-sky-400 dark:text-slate-950 shadow-sm font-bold scale-100 hover:scale-105'
                                : 'text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : isFuture ? (
                              <span className="text-[10px]">•</span>
                            ) : (
                              <span className="text-xs">○</span>
                            )}
                          </button>
                        </td>
                      );
                    })}

                    {/* Action buttons */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onOpenEditModal(habit)}
                          className="p-1 rounded text-slate-400 hover:text-sky-500 transition"
                          title="Edit Habit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteHabit(habit._id)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 transition"
                          title="Delete Habit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
