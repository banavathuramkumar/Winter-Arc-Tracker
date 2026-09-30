import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Award,
  CheckCircle2,
  Circle,
  Moon,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar as CalendarIcon,
  Clock,
  Star,
  Target,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { PerfectDayBanner } from '../components/PerfectDayBanner';
import { DayDetailModal } from '../components/DayDetailModal';
import { SleepModal } from '../components/SleepModal';
import { HabitModal } from '../components/HabitModal';
import { GoalModal } from '../components/GoalModal';
import { GoalCard } from '../components/GoalCard';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [selectedDay, setSelectedDay] = useState(null);
  const [allMonthLogs, setAllMonthLogs] = useState([]);
  const [allHabitsList, setAllHabitsList] = useState([]);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data);
      }

      // Pre-fetch month habit logs for day details
      const todayStr = res.data?.currentDate?.dateStr || new Date().toISOString().split('T')[0];
      const monthStr = todayStr.substring(0, 7);

      const [logsRes, habitsRes] = await Promise.all([
        api.get(`/habit-logs?month=${monthStr}`),
        api.get('/habits'),
      ]);

      if (logsRes.data.success) setAllMonthLogs(logsRes.data.logs);
      if (habitsRes.data.success) setAllHabitsList(habitsRes.data.habits);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Quick Toggle Today Habit
  const handleToggleHabit = async (habitId, currentStatus) => {
    if (!data?.currentDate?.dateStr) return;
    const dateStr = data.currentDate.dateStr;

    // Optimistic UI update
    setData((prev) => {
      if (!prev) return prev;
      const updatedHabits = prev.todayProgress.habits.map((h) =>
        h._id === habitId ? { ...h, completedToday: !currentStatus } : h
      );
      const completedCount = updatedHabits.filter((h) => h.completedToday).length;
      const percentage = Math.round((completedCount / (prev.todayProgress.totalActive || 1)) * 100);

      return {
        ...prev,
        todayProgress: {
          ...prev.todayProgress,
          habits: updatedHabits,
          completedCount,
          percentage,
        },
      };
    });

    try {
      await api.post('/habit-logs', {
        habitId,
        date: dateStr,
        completed: !currentStatus,
      });
      // Re-fetch in background to update streaks accurately
      const refreshRes = await api.get('/dashboard');
      if (refreshRes.data.success) {
        setData(refreshRes.data);
      }
    } catch (err) {
      console.error('Failed toggling habit:', err);
      fetchDashboardData();
    }
  };

  // Handle Save Sleep
  const handleSaveSleep = async (sleepData) => {
    try {
      await api.post('/sleep', sleepData);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to log sleep:', err);
    }
  };

  // Handle Add Habit
  const handleSaveHabit = async (habitData) => {
    try {
      await api.post('/habits', habitData);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to add habit:', err);
    }
  };

  // Handle Goal Progress Update
  const handleGoalProgress = async (goalId, delta) => {
    try {
      await api.patch(`/goals/${goalId}`, { addProgress: delta });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update goal progress:', err);
    }
  };

  // Handle Open Edit Goal
  const handleOpenEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  // Handle Save (Create / Update) Goal
  const handleSaveGoal = async (goalData) => {
    try {
      if (editingGoal) {
        await api.patch(`/goals/${editingGoal._id}`, goalData);
      } else {
        await api.post('/goals', goalData);
      }
      setEditingGoal(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to save goal:', err);
      throw err;
    }
  };

  // Handle Delete Goal
  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.delete(`/goals/${goalId}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  const {
    currentDate = {},
    todayProgress = {},
    todaySleep = null,
    streaks = {},
    score = {},
    goals = [],
    calendarDays = [],
  } = data || {};

  const completedGoalsCount = goals.filter((g) => g.completed || g.progress >= g.target).length;

  // Greeting helper
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {greeting}, {user?.name || 'Warrior'}
          </h1>
          <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">
            {currentDate.fullDateFormatted || currentDate.monthName}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHabitModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Habit
          </button>
          <button
            onClick={() => {
              setEditingGoal(null);
              setShowGoalModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Goal
          </button>
          <button
            onClick={() => setShowSleepModal(true)}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition shadow-subtle flex items-center gap-1.5"
          >
            <Moon className="w-4 h-4" /> Log Sleep
          </button>
        </div>
      </div>

      {/* Perfect Day Celebration Banner */}
      <PerfectDayBanner isPerfect={score.isPerfectDay} />

      {/* Top 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Current Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 dark:text-slate-500 font-semibold">
              Current Streak
            </span>
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{streaks.current || 0}</span>
              <span className="text-xs font-normal text-slate-400">days</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Longest</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
              🏆 {streaks.longest || 0}d
            </span>
          </div>
        </div>

        {/* Metric 2: Today's Habit Progress */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[11px] font-mono uppercase text-slate-400 dark:text-slate-500 font-semibold">
              Today's Progress
            </span>
            <span className="text-xs font-bold font-mono text-sky-500 dark:text-sky-400">
              {todayProgress.percentage || 0}%
            </span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">
            {todayProgress.completedCount || 0} / {todayProgress.totalActive || 0} habits
          </p>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${todayProgress.percentage || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 3: Today's Sleep */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 dark:text-slate-500 font-semibold">
              Sleep Logged
            </span>
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
              <Moon className="w-5 h-5 text-indigo-400" />
              <span>{todaySleep?.duration !== undefined ? `${todaySleep.duration}h` : '—'}</span>
            </p>
          </div>
          <button
            onClick={() => setShowSleepModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition"
          >
            {todaySleep ? 'Edit' : 'Log'}
          </button>
        </div>

        {/* Metric 4: Monthly Goals Execution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 dark:text-slate-500 font-semibold">
              Monthly Goals
            </span>
            <p className="text-2xl font-bold font-mono text-emerald-500 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <Target className="w-5 h-5 text-emerald-500" />
              <span>{completedGoalsCount} / {goals.length}</span>
              <span className="text-xs font-normal text-slate-400">done</span>
            </p>
          </div>
          <Link
            to="/goals"
            className="text-xs font-semibold text-sky-500 hover:underline flex items-center gap-1"
          >
            View <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Main Grid: Today's Habits (Left 2 cols) & Sleep Recovery Hub (Right 1 col) with matching heights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left 2 Cols: Today's Habit Checklist */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="flex items-center justify-between h-7">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sky-500" /> Today's Habits Checklist
            </h2>
            <Link
              to="/habits"
              className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-sky-500 flex items-center gap-1"
            >
              Full 31-Day Matrix Grid <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 bg-white dark:bg-[#101726] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden flex flex-col">
            {todayProgress.habits && todayProgress.habits.length > 0 ? (
              todayProgress.habits.map((habit) => (
                <div
                  key={habit._id}
                  onClick={() => handleToggleHabit(habit._id, habit.completedToday)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 select-none ${
                    habit.completedToday ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <span className="text-xl flex-shrink-0">{habit.icon || '⚡'}</span>
                    <div>
                      <h4
                        className={`text-sm font-semibold transition-colors ${
                          habit.completedToday
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {habit.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {habit.category || 'General'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      habit.completedToday
                        ? 'bg-sky-500 text-white dark:bg-sky-400 dark:text-slate-950 shadow-sm scale-105'
                        : 'border border-slate-300 dark:border-slate-700 text-transparent hover:border-sky-400'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 fill-current" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-3 my-auto">
                <p className="text-sm font-medium">Your Winter Arc starts with one habit.</p>
                <button
                  onClick={() => setShowHabitModal(true)}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-subtle transition"
                >
                  Add Your First Habit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Sleep Recovery Hub matching height */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between h-7">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" /> Sleep Recovery Hub
            </h2>
            <Link
              to="/sleep"
              className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-sky-500 flex items-center gap-1"
            >
              View Matrix <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between space-y-4">
            
            {/* Top Details */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono uppercase">
                    Last Night's Sleep
                  </span>
                  <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                    {todaySleep?.duration ? `${todaySleep.duration} hours` : 'Not recorded'}
                  </p>
                </div>
                <button
                  onClick={() => setShowSleepModal(true)}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-subtle transition active:scale-95"
                >
                  {todaySleep ? 'Edit Sleep' : 'Log Sleep'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Sleep Goal</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{user?.sleepGoal || 8}h / night</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Sleep Quality</span>
                  <span className="font-bold text-amber-500 text-sm">
                    {todaySleep?.quality ? '★'.repeat(todaySleep.quality) : '—'}
                  </span>
                </div>
              </div>

              {todaySleep?.notes && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5 font-semibold">Journal Note:</span>
                  "{todaySleep.notes}"
                </div>
              )}
            </div>

            {/* Bottom Status Row */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
              <span>Status:</span>
              <span className={`font-semibold ${todaySleep?.duration ? 'text-emerald-500' : 'text-amber-500'}`}>
                {todaySleep?.duration ? '✓ Logged for today' : '○ Pending sleep log'}
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Monthly Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Monthly Goals ({currentDate.monthName})
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setEditingGoal(null);
                setShowGoalModal(true);
              }}
              className="text-xs font-semibold text-sky-500 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Goal
            </button>
            <Link
              to="/goals"
              className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-sky-500 flex items-center gap-1"
            >
              Manage Goals <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {goals && goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal}
                onAddProgress={handleGoalProgress}
                onOpenEdit={handleOpenEditGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">Give this month a target.</p>
            <button
              onClick={() => {
                setEditingGoal(null);
                setShowGoalModal(true);
              }}
              className="inline-block px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-subtle transition"
            >
              Create Monthly Goal
            </button>
          </div>
        )}
      </div>

      {/* Monthly Discipline Calendar (Requirement #18) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-sky-400" /> Monthly Discipline Calendar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily status breakdown. Click any day to inspect detailed logs.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-sky-500 font-bold">✓ Perfect</span>
            <span className="flex items-center gap-1 text-amber-500">◐ Partial</span>
            <span className="flex items-center gap-1 text-slate-400">○ None</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-16 gap-2 text-center">
            {calendarDays.map((day) => {
              const isPerfect = day.status === 'perfect';
              const isPartial = day.status === 'partial';
              const isFuture = day.status === 'future';
              const isToday = day.isToday;

              return (
                <button
                  key={day.date}
                  disabled={isFuture}
                  onClick={() => setSelectedDay(day)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    isFuture
                      ? 'border-slate-100 dark:border-slate-800/40 opacity-30 cursor-not-allowed bg-slate-50 dark:bg-slate-900/30'
                      : isToday
                      ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/50 dark:bg-sky-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-sky-400 hover:scale-105'
                  }`}
                >
                  <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                    {day.dayNumber}
                  </span>
                  <span className="text-xs mt-1">
                    {isPerfect ? (
                      <span className="text-sky-500 font-bold">✓</span>
                    ) : isPartial ? (
                      <span className="text-amber-500 font-bold">◐</span>
                    ) : isFuture ? (
                      <span className="text-slate-400">•</span>
                    ) : (
                      <span className="text-slate-400">○</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DayDetailModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        dayData={selectedDay}
        allHabits={allHabitsList}
        allLogs={allMonthLogs}
        goals={goals}
      />

      <SleepModal
        isOpen={showSleepModal}
        onClose={() => setShowSleepModal(false)}
        onSave={handleSaveSleep}
        date={currentDate.dateStr || new Date().toISOString().split('T')[0]}
        initialDuration={todaySleep?.duration || user?.sleepGoal || 8}
      />

      <HabitModal
        isOpen={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        onSave={handleSaveHabit}
      />

      <GoalModal
        isOpen={showGoalModal}
        onClose={() => {
          setShowGoalModal(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        monthKey={currentDate.monthStr || new Date().toISOString().substring(0, 7)}
        initialData={editingGoal}
      />

    </div>
  );
};
