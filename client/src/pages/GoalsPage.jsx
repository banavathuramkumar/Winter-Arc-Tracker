import React, { useState, useEffect, useCallback } from 'react';
import { Target, Plus, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { GoalCard } from '../components/GoalCard';
import { GoalModal } from '../components/GoalModal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
import { formatMonthKey, getMonthName } from '../utils/dateUtils';

export const GoalsPage = () => {
  const [currentMonth, setCurrentMonth] = useState(() => formatMonthKey(new Date()));
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/goals?month=${currentMonth}`);
      if (res.data.success) {
        setGoals(res.data.goals);
      }
    } catch (err) {
      console.error('Failed fetching goals:', err);
      setError(err.response?.data?.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

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

  // Add Progress
  const handleAddProgress = async (goalId, delta) => {
    // Optimistic update
    setGoals((prev) =>
      prev.map((g) => {
        if (g._id === goalId) {
          const newProgress = Math.max(0, g.progress + delta);
          return {
            ...g,
            progress: newProgress,
            completed: newProgress >= g.target,
          };
        }
        return g;
      })
    );

    try {
      await api.patch(`/goals/${goalId}`, { addProgress: delta });
    } catch (err) {
      console.error('Failed updating progress:', err);
      fetchGoals();
    }
  };

  // Save (Create/Update) Goal
  const handleSaveGoal = async (goalData) => {
    try {
      if (editingGoal) {
        await api.patch(`/goals/${editingGoal._id}`, goalData);
      } else {
        await api.post('/goals', goalData);
      }
      setEditingGoal(null);
      fetchGoals();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to save goal');
    }
  };

  // Delete Goal
  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.delete(`/goals/${goalId}`);
      setGoals((prev) => prev.filter((g) => g._id !== goalId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete goal');
    }
  };

  const completedCount = goals.filter((g) => g.completed || g.progress >= g.target).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-7 h-7 text-sky-500" /> Monthly Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quantifiable targets to attack throughout the month.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Month Selector */}
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

          <button
            onClick={() => {
              setEditingGoal(null);
              setShowModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-subtle transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Goal
          </button>
        </div>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      {/* Progress Summary Header */}
      {!loading && goals.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-600 dark:text-slate-400">
            {completedCount} of {goals.length} goals completed this month
          </span>
          <span className="font-bold text-sky-500 dark:text-sky-400">
            {Math.round((completedCount / goals.length) * 100)}% overall completion
          </span>
        </div>
      )}

      {/* Goals Grid or Empty State */}
      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onAddProgress={handleAddProgress}
              onOpenEdit={(g) => {
                setEditingGoal(g);
                setShowModal(true);
              }}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 dark:text-sky-400 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Give this month a target.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Set milestones for DSA problems, gym sessions, books read, or miles run.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setShowModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-subtle transition"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        monthKey={currentMonth}
        initialData={editingGoal}
      />

    </div>
  );
};
