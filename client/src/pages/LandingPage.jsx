import React from 'react';
import { Link } from 'react-router-dom';
import {
  Snowflake,
  Flame,
  CheckCircle2,
  Moon,
  Target,
  BarChart3,
  Mail,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080c14] text-slate-900 dark:text-slate-100 transition-colors selection:bg-sky-500/20 selection:text-sky-500">
      
      {/* Top Navigation */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 dark:bg-sky-400/10 border border-sky-500/20 dark:border-sky-400/20 flex items-center justify-center text-sky-500 dark:text-sky-400">
            <Snowflake className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight uppercase font-sans">
            Winter Arc
          </span>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {user ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition shadow-glow flex items-center gap-1.5"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-500 transition"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition shadow-subtle hover:shadow-glow"
              >
                Start Winter Arc
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        
        {/* Subtle Ambient Icy Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 dark:bg-sky-400/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-mono font-semibold uppercase tracking-wider mb-6">
          <Snowflake className="w-3.5 h-3.5" />
          <span>The Digital Winter Arc Protocol</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase font-sans leading-none">
          WINTER ARC
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          "Build discipline. Track the grind. Become the version you want."
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={user ? '/dashboard' : '/register'}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm tracking-wider uppercase transition shadow-glow hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>START YOUR WINTER ARC</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm tracking-wider uppercase transition"
          >
            SEE HOW IT WORKS
          </a>
        </div>
      </section>

      {/* Why Winter Arc Section */}
      <section className="py-20 bg-slate-100/60 dark:bg-[#0c1220]/60 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-semibold uppercase text-sky-500 tracking-wider">
              Discipline Over Motivation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-2">
              Why Winter Arc?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
              Winter is when the average person retreats. The Winter Arc is a sacred window where you lock in, eliminate noise, and build undeniable momentum.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1: Habit Tracking */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-sky-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Habit Tracking
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Classic 1–31 monthly grid inspired by the original paper template. Check off deep work, coding, exercise, and reading daily.
              </p>
            </div>

            {/* Feature 2: Sleep Tracking */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-sky-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-5">
                <Moon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Sleep Matrix & Graphs
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dot matrix plotting 4h to 10h sleep alongside interactive Recharts line trends and recovery insights.
              </p>
            </div>

            {/* Feature 3: Streaks */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-sky-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center mb-5">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Streak Calculation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Strict streak math. A day only counts when all active habits are completed. No shortcuts, no fake numbers.
              </p>
            </div>

            {/* Feature 4: Monthly Goals */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-sky-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mb-5">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Monthly Goals
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Define quantifiable monthly objectives like solving 100 DSA problems, finishing 3 books, or running 50 km.
              </p>
            </div>

            {/* Feature 5: Insights */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-sky-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Analytics & Score
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Winter Arc Score (0–100) combining habit discipline (50%), sleep consistency (25%), and goal execution (25%).
              </p>
            </div>

            {/* Feature 6: Email Reminders */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-sky-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 flex items-center justify-center mb-5">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Smart Email Reminders
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Targeted notifications at your chosen time reminding you only of remaining habits, plus weekly and monthly reviews.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold uppercase text-sky-500 tracking-wider">
            Three Steps
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-2">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 relative">
            <span className="text-4xl font-extrabold font-mono text-sky-500/20 dark:text-sky-400/20">
              01
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2 mb-2">
              Choose your habits
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Select foundational habits: DSA practice, deep work, gym sessions, hydration, and sleep targets.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 relative">
            <span className="text-4xl font-extrabold font-mono text-sky-500/20 dark:text-sky-400/20">
              02
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2 mb-2">
              Show up every day
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              No excuses. Check off each habit daily, log your sleep duration, and lock in your consecutive day streak.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 relative">
            <span className="text-4xl font-extrabold font-mono text-sky-500/20 dark:text-sky-400/20">
              03
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2 mb-2">
              Track your progress
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Inspect your Winter Arc Score, sleep graphs, and weekly consistency reports as you transform.
            </p>
          </div>

        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-slate-900 dark:bg-[#060a12] text-white border-t border-slate-800 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 mx-auto mb-6">
            <Snowflake className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase">
            Your Winter Arc starts today.
          </h2>

          <p className="mt-4 text-sm text-slate-400 max-w-xl mx-auto">
            Do not wait for January. The real shift happens when everyone else is slowing down.
          </p>

          <div className="mt-8">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-glow hover:scale-105 active:scale-95"
            >
              <span>ENTER THE WINTER ARC</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-xs font-mono text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-[#080c14] border-t border-slate-200 dark:border-slate-800">
        <p>Winter Arc Tracker • Engineered for relentless discipline.</p>
      </footer>
    </div>
  );
};
