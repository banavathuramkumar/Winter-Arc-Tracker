import React, { useState, useEffect, useCallback } from 'react';
import { Moon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import api from '../services/api';
import { SleepDotGrid } from '../components/SleepDotGrid';
import { SleepGraph } from '../components/SleepGraph';
import { SleepModal } from '../components/SleepModal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
import { formatMonthKey, getMonthName } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

export const SleepPage = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => formatMonthKey(new Date()));
  const [sleepLogs, setSleepLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(8);

  const todayDateStr = new Date().toISOString().split('T')[0];

  const fetchSleepData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/sleep?month=${currentMonth}`);
      if (res.data.success) {
        setSleepLogs(res.data.logs);
        setStats(res.data.stats || {});
      }
    } catch (err) {
      console.error('Failed loading sleep data:', err);
      setError(err.response?.data?.message || 'Failed to load sleep tracker data');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchSleepData();
  }, [fetchSleepData]);

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

  const handleSelectDay = (dateStr, currentDuration) => {
    setSelectedDate(dateStr);
    setSelectedDuration(currentDuration || user?.sleepGoal || 8);
    setShowModal(true);
  };

  const handleSaveSleep = async (sleepPayload) => {
    try {
      await api.post('/sleep', sleepPayload);
      fetchSleepData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to record sleep');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Moon className="w-7 h-7 text-sky-400" /> Sleep Matrix & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tracking duration, quality, and sleep consistency across the Winter Arc.
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
            onClick={() => handleSelectDay(todayDateStr, null)}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-subtle transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Log Sleep
          </button>
        </div>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      {loading ? (
        <LoadingSkeleton type="card" count={2} />
      ) : (
        <>
          {/* Dot Matrix Tracker (Requirement #12) */}
          <SleepDotGrid
            sleepLogs={sleepLogs}
            sleepGoal={user?.sleepGoal || 8}
            monthKey={currentMonth}
            todayDateStr={todayDateStr}
            onSelectDayToLog={handleSelectDay}
          />

          {/* Recharts Line Graph & Stats (Requirement #13) */}
          <SleepGraph
            sleepLogs={sleepLogs}
            sleepGoal={user?.sleepGoal || 8}
            monthKey={currentMonth}
            stats={stats}
          />
        </>
      )}

      {/* Sleep Modal */}
      <SleepModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveSleep}
        date={selectedDate}
        initialDuration={selectedDuration}
      />

    </div>
  );
};
