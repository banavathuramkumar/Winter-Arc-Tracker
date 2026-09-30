import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { Moon, Award, TrendingDown, Target, Clock } from 'lucide-react';

export const SleepGraph = ({
  sleepLogs = [],
  sleepGoal = 8,
  monthKey = '2026-09',
  stats = {},
}) => {
  // Build chart dataset
  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  const sleepMap = {};
  sleepLogs.forEach((log) => {
    sleepMap[log.date] = log.duration;
  });

  const chartData = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const dateKey = `${monthKey}-${dayStr}`;
    const hours = sleepMap[dateKey] !== undefined ? sleepMap[dateKey] : null;

    chartData.push({
      day: d,
      date: dateKey,
      hours: hours,
      goal: sleepGoal,
    });
  }

  const {
    averageFormatted = '0h 0m',
    bestSleep = 0,
    lowestSleep = 0,
    daysLogged = 0,
  } = stats;

  return (
    <div className="space-y-6">
      
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Average Sleep */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 dark:text-slate-500">
              Average Sleep
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
              {averageFormatted}
            </p>
          </div>
        </div>

        {/* Sleep Goal */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 dark:text-slate-500">
              Sleep Goal
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
              {sleepGoal}h
            </p>
          </div>
        </div>

        {/* Best Sleep */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 dark:text-slate-500">
              Best Sleep
            </span>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {bestSleep > 0 ? `${bestSleep}h` : '—'}
            </p>
          </div>
        </div>

        {/* Lowest Sleep */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 dark:text-slate-500">
              Lowest Sleep
            </span>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">
              {lowestSleep > 0 ? `${lowestSleep}h` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Sleep Duration Trend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily recorded sleep plotted against your target goal
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-sky-500 rounded"></span>
              <span className="text-slate-600 dark:text-slate-300">Actual Sleep</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-slate-400 dark:bg-slate-600 stroke-dashed rounded"></span>
              <span className="text-slate-400 dark:text-slate-500">Goal ({sleepGoal}h)</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                stroke="#64748b"
                opacity={0.3}
              />
              <YAxis
                domain={[0, 12]}
                ticks={[0, 2, 4, 6, 8, 10, 12]}
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                stroke="#64748b"
                opacity={0.3}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-xl text-xs font-mono">
                        <p className="text-slate-400">Day {label} ({data.date})</p>
                        <p className="text-sky-400 font-bold mt-1">
                          Sleep: {data.hours !== null ? `${data.hours} hours` : 'Not recorded'}
                        </p>
                        <p className="text-slate-400">Target: {data.goal} hours</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={sleepGoal} stroke="#64748b" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={{ fill: '#38bdf8', r: 3 }}
                activeDot={{ r: 6, fill: '#0284c7' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
