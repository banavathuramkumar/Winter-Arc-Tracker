import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  BarChart2,
  Activity,
  Zap,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = 'banavathuramkumar@gmail.com';

const Badge = ({ value, label, icon: Icon, color = 'sky' }) => {
  const colors = {
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };
  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} flex flex-col gap-1`}>
      <div className="flex items-center gap-2 text-xs font-mono uppercase opacity-70">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </div>
      <div className="text-2xl font-extrabold tracking-tight">{value}</div>
    </div>
  );
};

const typeLabel = (type) =>
  ({ daily_reminder: 'Daily Reminder', weekly_summary: 'Weekly Summary', monthly_summary: 'Monthly Summary', password_reset: 'Password Reset', test: 'Test Email' }[type] || type);

const providerColor = (p) =>
  ({ brevo: 'text-emerald-400', resend: 'text-violet-400', gmail: 'text-sky-400', mock: 'text-amber-400' }[p] || 'text-slate-400');

export const AdminEmailStatsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/email-stats');
      setStats(res.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load email stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="text-center space-y-2">
          <AlertTriangle className="w-8 h-8 mx-auto text-amber-400" />
          <p className="font-semibold">Admin access only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-7 h-7 text-sky-500" /> Email Stats Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track every email dispatch across all users in real time.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-3.5 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-500/20 rounded-xl">
          {error}
        </div>
      )}

      {loading && !stats && (
        <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
          Loading stats...
        </div>
      )}

      {stats && (
        <>
          {/* Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Badge label="Total Sent" value={stats.overview.totalSent} icon={Mail} color="sky" />
            <Badge label="Delivered" value={stats.overview.totalDelivered} icon={CheckCircle2} color="emerald" />
            <Badge label="Failed" value={stats.overview.totalFailed} icon={XCircle} color="red" />
            <Badge
              label="Delivery Rate"
              value={`${stats.overview.deliveryRate}%`}
              icon={Activity}
              color={stats.overview.deliveryRate >= 80 ? 'emerald' : 'amber'}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Badge label="Sent Today" value={stats.overview.sentToday} icon={Zap} color="amber" />
            <Badge label="Last 7 Days" value={stats.overview.sentLast7Days} icon={BarChart2} color="sky" />
            <Badge label="Last 30 Days" value={stats.overview.sentLast30Days} icon={Clock} color="violet" />
            <Badge
              label="Users Reached"
              value={`${stats.overview.uniqueUsersReached} / ${stats.overview.totalUsersWithReminders}`}
              icon={Users}
              color="emerald"
            />
          </div>

          {/* By Type + By Provider */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Type */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> By Email Type
              </h2>
              <div className="space-y-2">
                {stats.byType.map((item) => {
                  const rate = item.total > 0 ? Math.round((item.delivered / item.total) * 100) : 0;
                  return (
                    <div key={item._id} className="flex items-center gap-3">
                      <span className="w-36 text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate">
                        {typeLabel(item._id)}
                      </span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-sky-500 transition-all"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 w-20 text-right">
                        {item.delivered}/{item.total} ({rate}%)
                      </span>
                    </div>
                  );
                })}
                {stats.byType.length === 0 && (
                  <p className="text-xs text-slate-500">No data yet</p>
                )}
              </div>
            </div>

            {/* By Provider */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> By Provider
              </h2>
              <div className="space-y-2">
                {stats.byProvider.map((item) => {
                  const rate = item.total > 0 ? Math.round((item.delivered / item.total) * 100) : 0;
                  return (
                    <div key={item._id} className="flex items-center gap-3">
                      <span className={`w-20 text-[11px] font-bold uppercase ${providerColor(item._id)}`}>
                        {item._id}
                      </span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 w-20 text-right">
                        {item.delivered}/{item.total} ({rate}%)
                      </span>
                    </div>
                  );
                })}
                {stats.byProvider.length === 0 && (
                  <p className="text-xs text-slate-500">No data yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Daily Trend */}
          {stats.dailyTrend.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5" /> Delivered Emails — Last 7 Days
              </h2>
              <div className="flex items-end gap-2 h-24">
                {(() => {
                  const max = Math.max(...stats.dailyTrend.map((d) => d.count), 1);
                  return stats.dailyTrend.map((d) => (
                    <div key={d._id} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-sky-400">{d.count}</span>
                      <div
                        className="w-full rounded-t-lg bg-sky-500 transition-all"
                        style={{ height: `${Math.round((d.count / max) * 64)}px`, minHeight: '4px' }}
                      />
                      <span className="text-[9px] text-slate-500">{d._id.slice(5)}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Recent Logs */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Recent Email Logs (last 20)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-left text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <th className="pb-2 pr-4 font-mono uppercase">Time</th>
                    <th className="pb-2 pr-4 font-mono uppercase">Recipient</th>
                    <th className="pb-2 pr-4 font-mono uppercase">Type</th>
                    <th className="pb-2 pr-4 font-mono uppercase">Provider</th>
                    <th className="pb-2 font-mono uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-2 pr-4 text-slate-500 font-mono whitespace-nowrap">
                        {new Date(log.sentAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-2 pr-4 text-slate-700 dark:text-slate-300 max-w-[160px] truncate">
                        <span className="block font-semibold">{log.user?.name || '—'}</span>
                        <span className="text-slate-400">{log.recipientEmail}</span>
                      </td>
                      <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{typeLabel(log.type)}</td>
                      <td className={`py-2 pr-4 font-bold uppercase ${providerColor(log.provider)}`}>{log.provider}</td>
                      <td className="py-2">
                        {log.sentLive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Delivered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 font-semibold" title={log.error || ''}>
                            <XCircle className="w-3 h-3" /> {log.error ? 'Failed' : 'Mock'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {stats.recentLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        No email logs yet. Emails will appear here after the first delivery.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
