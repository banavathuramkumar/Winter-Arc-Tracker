import React, { useEffect } from 'react';
import { Snowflake, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PerfectDayBanner = ({ isPerfect = false }) => {
  useEffect(() => {
    if (isPerfect) {
      // Fire subtle icy snowflake celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#7dd3fc', '#e0f2fe', '#ffffff'],
          disableForReducedMotion: true,
        });
      } catch (e) {
        // Fallback gracefully
      }
    }
  }, [isPerfect]);

  if (!isPerfect) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-sky-500/15 dark:from-sky-950/40 dark:via-indigo-950/30 dark:to-sky-950/40 border border-sky-500/30 dark:border-sky-500/40 p-5 shadow-glow animate-frost-glow mb-6">
      
      {/* Background ambient accents */}
      <div className="absolute -right-6 -bottom-6 text-sky-500/10 dark:text-sky-400/10 pointer-events-none">
        <Snowflake className="w-32 h-32" />
      </div>

      <div className="flex items-center space-x-3.5 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md animate-bounce">
          <Snowflake className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-300 font-mono flex items-center gap-1.5">
              ❄ PERFECT DAY
            </h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
            Everything checked off. All habits completed and sleep logged. Relentless execution.
          </p>
        </div>
      </div>
    </div>
  );
};
