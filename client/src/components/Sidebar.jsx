import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Moon,
  Target,
  BarChart3,
  Settings,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Habits', path: '/habits', icon: CheckSquare },
  { name: 'Sleep', path: '/sleep', icon: Moon },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Insights', path: '/insights', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 p-4 space-y-1 bg-white/50 dark:bg-[#0b101c]/50 border-r border-slate-200 dark:border-slate-800/80 min-h-[calc(100vh-4rem)]">
      <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
        Navigation
      </div>
      
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-semibold border border-sky-200/50 dark:border-sky-800/50 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}

      <div className="pt-6 mt-auto">
        <div className="p-4 rounded-xl bg-gradient-to-b from-sky-500/5 to-sky-500/10 dark:from-sky-950/20 dark:to-sky-900/10 border border-sky-500/15 text-xs text-slate-600 dark:text-slate-400">
          <p className="font-semibold text-sky-600 dark:text-sky-400 mb-1">Winter Arc Mindset</p>
          <p className="text-[11px] leading-relaxed">
            "We don't rise to the level of our expectations, we fall to the level of our training."
          </p>
        </div>
      </div>
    </aside>
  );
};
