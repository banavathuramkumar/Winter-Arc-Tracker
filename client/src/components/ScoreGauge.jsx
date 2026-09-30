import React, { useState } from 'react';
import { Info, HelpCircle } from 'lucide-react';

export const ScoreGauge = ({ score = 0, breakdown = {} }) => {
  const [showInfo, setShowInfo] = useState(false);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const { habitScore = 0, sleepScore = 0, goalScore = 0 } = breakdown;

  // Convert points back to intuitive percentage representation
  const habitPct = Math.round((habitScore / 50) * 100);
  const sleepPct = Math.round((sleepScore / 25) * 100);
  const goalPct = Math.round((goalScore / 25) * 100);

  // Determine icy color tone based on score
  let scoreColor = '#38bdf8'; // sky
  if (clampedScore >= 85) scoreColor = '#38bdf8';
  else if (clampedScore >= 60) scoreColor = '#60a5fa';
  else scoreColor = '#94a3b8';

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle relative overflow-hidden group">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-sky-500/10 blur-2xl rounded-full pointer-events-none"></div>

      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
          Winter Arc Score
        </span>
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="text-slate-400 hover:text-sky-500 transition p-1"
          title="What is Winter Arc Score?"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {showInfo && (
        <div className="w-full p-3 mb-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 space-y-1 animate-in fade-in duration-150">
          <p className="font-bold text-sky-600 dark:text-sky-400">Score Calculation (0–100):</p>
          <p>• <strong>Habits (50%)</strong>: Consistency in active daily habits.</p>
          <p>• <strong>Sleep (25%)</strong>: Nights meeting your sleep goal.</p>
          <p>• <strong>Goals (25%)</strong>: Progress toward monthly milestones.</p>
        </div>
      )}

      {/* Circular Progress Gauge */}
      <div className="relative w-36 h-36 flex items-center justify-center my-1">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="text-slate-100 dark:text-slate-800"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={scoreColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Inner Score Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            {clampedScore}
          </span>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            / 100
          </span>
        </div>
      </div>

      {/* Breakdown Badges with clear percentage & contribution labels */}
      <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Habits</span>
          <span className="text-xs font-bold text-sky-500 dark:text-sky-400 font-mono">{habitScore}/50 pts</span>
          <span className="text-[10px] text-slate-400 font-mono">{habitPct}% done</span>
        </div>
        <div className="flex flex-col items-center border-x border-slate-100 dark:border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Sleep</span>
          <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 font-mono">{sleepScore}/25 pts</span>
          <span className="text-[10px] text-slate-400 font-mono">{sleepPct}% goal</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Goals</span>
          <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 font-mono">{goalScore}/25 pts</span>
          <span className="text-[10px] text-slate-400 font-mono">{goalPct}% target</span>
        </div>
      </div>
    </div>
  );
};
