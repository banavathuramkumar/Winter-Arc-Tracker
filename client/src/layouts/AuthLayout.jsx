import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Snowflake } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#f8fafc] dark:bg-[#080c14] transition-colors relative overflow-hidden">
      {/* Subtle Icy Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/5 blur-3xl rounded-full pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 dark:bg-sky-400/10 border border-sky-500/20 dark:border-sky-400/20 flex items-center justify-center text-sky-500 dark:text-sky-400 group-hover:scale-105 transition-transform">
            <Snowflake className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white uppercase font-sans">
            Winter Arc
          </span>
        </Link>
        <p className="mt-2 text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
          The Personal Discipline Tracker
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 z-10">
        <div className="bg-white dark:bg-[#101726] py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle dark:shadow-glow transition-all">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
