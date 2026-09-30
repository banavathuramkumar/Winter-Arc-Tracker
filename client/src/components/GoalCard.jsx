import React, { useState } from 'react';
import { Target, Plus, Check, MoreVertical, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

export const GoalCard = ({
  goal,
  onAddProgress,
  onOpenEdit,
  onDelete,
}) => {
  const [customAdd, setCustomAdd] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const percentage = Math.min(100, Math.round((goal.progress / (goal.target || 1)) * 100));
  const isFinished = goal.completed || percentage >= 100;

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const num = Number(customAdd);
    if (!isNaN(num) && num > 0) {
      onAddProgress(goal._id, num);
      setCustomAdd('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-[#101726] border transition-all ${
      isFinished
        ? 'border-emerald-500/30 dark:border-emerald-500/30 bg-emerald-50/10'
        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
    } shadow-subtle flex flex-col justify-between`}>
      
      <div>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {goal.title}
              </h3>
              {isFinished && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Check className="w-3 h-3 mr-0.5" /> Done
                </span>
              )}
            </div>
            {goal.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {goal.description}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onOpenEdit(goal)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Edit Goal"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(goal._id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Delete Goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Stats */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-baseline text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">
              {goal.progress} / {goal.target} {goal.unit || 'units'}
            </span>
            <span className={`font-bold ${isFinished ? 'text-emerald-500' : 'text-sky-500 dark:text-sky-400'}`}>
              {percentage}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isFinished
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-sky-500 to-indigo-500 dark:from-sky-400 dark:to-indigo-400'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Action Controls */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onAddProgress(goal._id, 1)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 text-xs font-semibold font-mono transition active:scale-95"
          >
            +1
          </button>
          <button
            onClick={() => onAddProgress(goal._id, 5)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 text-xs font-semibold font-mono transition active:scale-95"
          >
            +5
          </button>
          
          {showCustomInput ? (
            <form onSubmit={handleCustomSubmit} className="flex items-center space-x-1">
              <input
                type="number"
                min="1"
                placeholder="Amt"
                value={customAdd}
                onChange={(e) => setCustomAdd(e.target.value)}
                className="w-14 px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-1 rounded-lg bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                className="text-xs text-slate-400 hover:text-slate-600 px-1"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowCustomInput(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-medium transition"
            >
              +Custom
            </button>
          )}
        </div>

        {isFinished && (
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Target Reached
          </div>
        )}
      </div>
    </div>
  );
};
