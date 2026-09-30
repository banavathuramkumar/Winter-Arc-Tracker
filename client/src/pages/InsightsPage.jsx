import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  Flame,
  Award,
  Moon,
  CheckSquare,
  Target,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';

export const InsightsPage = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await api.get('/insights');
        if (res.data.success) {
          setInsights(res.data);
        }
      } catch (err) {
        console.error('Failed fetching insights:', err);
        setError(err.response?.data?.message || 'Failed to load insights analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  const {
    summary = {},
    timelineData = [],
    weeklyConsistency = [],
    goals = [],
  } = insights || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-sky-500" /> Insights & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Historical discipline metrics, sleep trends, and day-of-week consistency patterns.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-1">
            Current Streak
          </div>
          <p className="text-xl font-bold font-mono text-amber-500 flex items-center gap-1">
            <Flame className="w-4 h-4 fill-amber-500" /> {summary.currentStreak || 0}d
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-1">
            Longest Streak
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1">
            <Award className="w-4 h-4 text-sky-400" /> {summary.longestStreak || 0}d
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-1">
            Habit Completion
          </div>
          <p className="text-xl font-bold font-mono text-sky-500 dark:text-sky-400">
            {summary.habitCompletionRate || 0}%
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-1">
            Average Sleep
          </div>
          <p className="text-xl font-bold font-mono text-indigo-500 dark:text-indigo-400 flex items-center gap-1">
            <Moon className="w-4 h-4" /> {summary.averageSleep || 0}h
          </p>
        </div>

        <div className="col-span-2 md:col-span-1 p-4 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-1">
            Winter Arc Score
          </div>
          <p className="text-xl font-bold font-mono text-sky-500 dark:text-sky-400">
            {summary.winterArcScore || 0} / 100
          </p>
        </div>

      </div>

      {/* Chart 1: Habit Completion Over Time (30 Days) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
            Habit Completion Rate (Last 30 Days)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily percentage of active habits executed
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="habitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
              <XAxis
                dataKey="displayDate"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                stroke="#64748b"
                opacity={0.3}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                stroke="#64748b"
                opacity={0.3}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-xl text-xs font-mono">
                        <p className="text-slate-400">{data.date}</p>
                        <p className="text-sky-400 font-bold mt-1">
                          Completion: {data.completionRate}%
                        </p>
                        <p className="text-slate-300">
                          {data.completedHabits} of {data.totalHabits} habits checked
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="completionRate"
                stroke="#38bdf8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#habitGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 & 3: Weekly Consistency Breakdown & Sleep Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Consistency */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
              Weekly Consistency Pattern
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Average habit completion rate by day of week
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyConsistency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                  stroke="#64748b"
                  opacity={0.3}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                  stroke="#64748b"
                  opacity={0.3}
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-xl text-xs font-mono">
                          <p className="text-slate-400">{label}</p>
                          <p className="text-sky-400 font-bold mt-0.5">
                            Avg: {payload[0].value}% completion
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="completionRate"
                  fill="#0ea5e9"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Duration Timeline */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
              Sleep vs Target (Last 30 Days)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recorded hours compared against your target goal
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                  stroke="#64748b"
                  opacity={0.3}
                />
                <YAxis
                  domain={[0, 12]}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                  stroke="#64748b"
                  opacity={0.3}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-xl text-xs font-mono">
                          <p className="text-slate-400">{data.date}</p>
                          <p className="text-indigo-400 font-bold mt-0.5">
                            Sleep: {data.sleepHours !== null ? `${data.sleepHours}h` : 'No log'}
                          </p>
                          <p className="text-slate-400">Goal: {data.sleepGoal}h</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={summary.sleepGoal || 8} stroke="#64748b" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="sleepHours"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#818cf8' }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
