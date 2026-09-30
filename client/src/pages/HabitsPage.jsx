import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, Archive, CheckSquare } from 'lucide-react';
import api from '../services/api';
import { HabitGrid } from '../components/HabitGrid';
import { HabitModal } from '../components/HabitModal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
import { formatMonthKey, getMonthName } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

export const HabitsPage = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => formatMonthKey(new Date()));
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const todayDateStr = new Date().toISOString().split('T')[0];

  // Fetch habits and monthly logs
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [habitsRes, logsRes] = await Promise.all([
        api.get('/habits'),
        api.get(`/habit-logs?month=${currentMonth}`),
      ]);

      if (habitsRes.data.success) setHabits(habitsRes.data.habits);
      if (logsRes.data.success) setLogs(logsRes.data.logs);
    } catch (err) {
      console.error('Failed loading habits:', err);
      setError(err.response?.data?.message || 'Failed to load habit tracker data');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Month navigation
  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    setCurrentMonth(formatMonthKey(prevDate));
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    setCurrentMonth(formatMonthKey(nextDate));
  };

  // Toggle habit cell
  const handleToggleHabit = async (habitId, date, completed) => {
    // Optimistic state update
    setLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.habitId === habitId && l.date === date);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], completed };
        return updated;
      } else {
        return [...prev, { habitId, date, completed }];
      }
    });

    try {
      await api.post('/habit-logs', {
        habitId,
        date,
        completed,
      });
    } catch (err) {
      console.error('Failed toggling habit cell:', err);
      // Revert
      fetchData();
    }
  };

  // Save (Create or Update) Habit
  const handleSaveHabit = async (habitData) => {
    try {
      if (editingHabit) {
        await api.patch(`/habits/${editingHabit._id}`, habitData);
      } else {
        await api.post('/habits', habitData);
      }
      setEditingHabit(null);
      fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to save habit');
    }
  };

  // Delete Habit
  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit and all its history?')) return;
    try {
      await api.delete(`/habits/${habitId}`);
      setHabits((prev) => prev.filter((h) => h._id !== habitId));
      setLogs((prev) => prev.filter((l) => l.habitId !== habitId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete habit');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-sky-500" /> Habit Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Inspired by the physical Winter Arc tracker. Complete every box, day by day.
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center space-x-2 bg-white dark:bg-[#101726] p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-xs font-mono font-bold text-slate-900 dark:text-white min-w-[120px] text-center">
            {getMonthName(currentMonth)}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      {/* Grid or Skeleton */}
      {loading ? (
        <LoadingSkeleton type="grid" />
      ) : (
        <HabitGrid
          habits={habits}
          habitLogs={logs}
          monthKey={currentMonth}
          todayDateStr={todayDateStr}
          onToggleHabit={handleToggleHabit}
          onOpenAddModal={() => {
            setEditingHabit(null);
            setModalOpen(true);
          }}
          onOpenEditModal={(habit) => {
            setEditingHabit(habit);
            setModalOpen(true);
          }}
          onDeleteHabit={handleDeleteHabit}
        />
      )}

      {/* Modal */}
      <HabitModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        initialData={editingHabit}
      />

    </div>
  );
};
