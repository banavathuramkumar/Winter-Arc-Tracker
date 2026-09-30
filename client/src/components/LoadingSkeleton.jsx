import React from 'react';

export const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <div className="space-y-4 w-full">
        {items.map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800/80 animate-pulse space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            </div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'grid') {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800/80 animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-8 md:grid-cols-16 gap-2">
          {Array.from({ length: 32 }).map((_, idx) => (
            <div key={idx} className="h-8 bg-slate-200 dark:bg-slate-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-12">
      <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};
