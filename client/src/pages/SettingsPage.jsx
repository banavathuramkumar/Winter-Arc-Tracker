import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Bell,
  Download,
  KeyRound,
  Trash2,
  LogOut,
  Mail,
  CheckCircle2,
  Clock,
  Globe,
  AlertTriangle,
  X,
  Eye,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ErrorAlert } from '../components/ErrorAlert';
import { downloadJSON, downloadCSV } from '../utils/exportUtils';

const COMMON_TIMEZONES = [
  { value: 'Asia/Kolkata', label: '🇮🇳 India Standard Time (IST) — Asia/Kolkata (GMT+5:30)' },
  { value: 'UTC', label: '🌐 UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: '🇺🇸 US Eastern Time (EST/EDT) — New York' },
  { value: 'America/Chicago', label: '🇺🇸 US Central Time (CST/CDT) — Chicago' },
  { value: 'America/Denver', label: '🇺🇸 US Mountain Time (MST/MDT) — Denver' },
  { value: 'America/Los_Angeles', label: '🇺🇸 US Pacific Time (PST/PDT) — Los Angeles' },
  { value: 'Europe/London', label: '🇬🇧 UK / Greenwich Mean Time (GMT/BST) — London' },
  { value: 'Europe/Paris', label: '🇫🇷 Central European Time (CET) — Paris' },
  { value: 'Europe/Berlin', label: '🇩🇪 Central European Time (CET) — Berlin' },
  { value: 'Asia/Dubai', label: '🇦🇪 Gulf Standard Time (GST) — Dubai (GMT+4)' },
  { value: 'Asia/Singapore', label: '🇸🇬 Singapore Standard Time (SGT) — Singapore (GMT+8)' },
  { value: 'Asia/Tokyo', label: '🇯🇵 Japan Standard Time (JST) — Tokyo (GMT+9)' },
  { value: 'Australia/Sydney', label: '🇦🇺 Australian Eastern Time (AEST) — Sydney' },
];

export const SettingsPage = () => {
  const { user, logout, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [sleepGoal, setSleepGoal] = useState(user?.sleepGoal || 8);

  // Notification fields
  const [dailyReminder, setDailyReminder] = useState(user?.notificationSettings?.dailyReminder ?? true);
  const [reminderTime, setReminderTime] = useState(user?.notificationSettings?.reminderTime || '21:00');
  const [weeklySummary, setWeeklySummary] = useState(user?.notificationSettings?.weeklySummary ?? true);
  const [monthlySummary, setMonthlySummary] = useState(user?.notificationSettings?.monthlySummary ?? true);

  // Change Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Status indicators
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [testEmailMsg, setTestEmailMsg] = useState('');
  const [emailPreview, setEmailPreview] = useState(null);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [error, setError] = useState('');

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTimezone(user.timezone || 'UTC');
      setSleepGoal(user.sleepGoal || 8);
      if (user.notificationSettings) {
        setDailyReminder(user.notificationSettings.dailyReminder ?? true);
        setReminderTime(user.notificationSettings.reminderTime || '21:00');
        setWeeklySummary(user.notificationSettings.weeklySummary ?? true);
        setMonthlySummary(user.notificationSettings.monthlySummary ?? true);
      }
    }
  }, [user]);

  // Save Profile & Notification Preferences
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setError('');
    setProfileMsg('');

    try {
      await updateProfile({
        name,
        timezone,
        sleepGoal: Number(sleepGoal),
      });

      await api.patch('/notifications/preferences', {
        dailyReminder,
        reminderTime,
        weeklySummary,
        monthlySummary,
      });

      setProfileMsg('Preferences saved successfully.');
      setTimeout(() => setProfileMsg(''), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update preferences');
    } finally {
      setSavingProfile(false);
    }
  };

  // Test Email
  const handleSendTestEmail = async () => {
    setSendingTestEmail(true);
    setTestEmailMsg('');
    setError('');
    try {
      const res = await api.post('/notifications/test-email');
      setTestEmailMsg(res.data.message || 'Test reminder email processed!');
      if (res.data.preview) {
        setEmailPreview(res.data.preview);
        setShowEmailPreviewModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch test email');
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Please provide both current and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordMsg(res.data.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordMsg(''), 4000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password. Please check your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Data Export (JSON / CSV)
  const handleExportData = async (format = 'json') => {
    try {
      const res = await api.get('/auth/export-data');
      if (res.data.success) {
        if (format === 'json') {
          downloadJSON(res.data.data, `winter-arc-backup-${new Date().toISOString().split('T')[0]}.json`);
        } else {
          downloadCSV(res.data.data, `winter-arc-habits-${new Date().toISOString().split('T')[0]}.csv`);
        }
      }
    } catch (err) {
      setError('Failed exporting data');
    }
  };

  // Permanent Account Deletion via Dedicated In-App Modal
  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmText.toUpperCase() !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion.');
      return;
    }

    setDeleteLoading(true);
    try {
      await api.delete('/auth/delete-account');
      await logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-sky-500" /> Account Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal profile, notification schedule, theme, and data exports.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      {/* Success Messages */}
      {profileMsg && (
        <div className="p-3.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {profileMsg}
        </div>
      )}

      {/* SECTION 1: PROFILE & PREFERENCES */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle space-y-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-sky-400" /> Profile & Protocol Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Registered Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 text-xs cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timezone */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-sky-400" /> Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-sky-500 font-medium"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sleep Goal */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-400" /> Sleep Goal ({sleepGoal}h)
              </label>
              <input
                type="number"
                min="4"
                max="14"
                step="0.5"
                value={sleepGoal}
                onChange={(e) => setSleepGoal(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Theme Selector (Clean 2-way Light & Dark mode as requested) */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-slate-700 dark:text-slate-300 mb-2">
              Appearance & Theme
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  theme === 'dark'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Moon className="w-4 h-4" /> Dark Mode
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  theme === 'light'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-600 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" /> Light Mode
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-subtle disabled:opacity-50"
            >
              {savingProfile ? 'Saving Changes...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {/* SECTION 2: EMAIL NOTIFICATIONS */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-400" /> Email Notifications & Reminders
            </h2>
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={sendingTestEmail}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{sendingTestEmail ? 'Sending...' : 'Send Test Reminder'}</span>
            </button>
          </div>

          {testEmailMsg && (
            <div className="p-3 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-500/20 rounded-xl flex items-center justify-between">
              <span>{testEmailMsg}</span>
              {emailPreview && (
                <button
                  type="button"
                  onClick={() => setShowEmailPreviewModal(true)}
                  className="text-xs font-bold underline ml-2 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Email Preview
                </button>
              )}
            </div>
          )}

          <div className="space-y-4">
            
            {/* Daily Reminder */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Smart Daily Habit Reminder
                </span>
                <span className="text-[11px] text-slate-500">
                  Sends an intelligent check-in if you have remaining habits before the day ends.
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
                <input
                  type="checkbox"
                  checked={dailyReminder}
                  onChange={(e) => setDailyReminder(e.target.checked)}
                  className="w-5 h-5 rounded text-sky-500 focus:ring-sky-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Weekly Review */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Weekly Discipline Review
                </span>
                <span className="text-[11px] text-slate-500">
                  Sunday evening summary with streak count, sleep averages, and Winter Arc Score.
                </span>
              </div>
              <input
                type="checkbox"
                checked={weeklySummary}
                onChange={(e) => setWeeklySummary(e.target.checked)}
                className="w-5 h-5 rounded text-sky-500 focus:ring-sky-400 cursor-pointer"
              />
            </div>

            {/* Monthly Summary */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Monthly Arc Milestone Summary
                </span>
                <span className="text-[11px] text-slate-500">
                  Detailed monthly report dispatched on the 1st of each month.
                </span>
              </div>
              <input
                type="checkbox"
                checked={monthlySummary}
                onChange={(e) => setMonthlySummary(e.target.checked)}
                className="w-5 h-5 rounded text-sky-500 focus:ring-sky-400 cursor-pointer"
              />
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-subtle disabled:opacity-50"
            >
              {savingProfile ? 'Saving Changes...' : 'Save Notification Preferences'}
            </button>
          </div>
        </div>
      </form>

      {/* SECTION 3: DATA EXPORT (Requirement #34) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-2">
          <Download className="w-4 h-4 text-sky-400" /> Export My Data
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Download your complete history of habits, daily logs, sleep records, and goals anytime.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleExportData('json')}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export as JSON
          </button>
          <button
            type="button"
            onClick={() => handleExportData('csv')}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export Habits (CSV)
          </button>
        </div>
      </div>

      {/* SECTION 4: CHANGE PASSWORD */}
      <form onSubmit={handleChangePassword} className="p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-sky-400" /> Change Password
        </h2>

        {passwordMsg && (
          <div className="p-3 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {passwordMsg}
          </div>
        )}

        {passwordError && (
          <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-500/20 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {passwordError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-sky-500"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider transition hover:opacity-90 disabled:opacity-50"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>

      {/* SECTION 5: ACCOUNT DELETION (Requirement #35) */}
      <div className="p-6 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 shadow-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase font-mono tracking-wider flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Danger Zone
          </h2>
          <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">
            Permanently delete your account and all associated habits, logs, sleep history, and monthly goals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setDeleteConfirmText('');
            setShowDeleteModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm self-start sm:self-auto flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Delete Account
        </button>
      </div>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#101726] rounded-2xl border border-red-500/30 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Winter Arc Account?
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This action is <strong>irreversible</strong>. All your habits, daily 1–31 records, sleep matrix logs, and monthly goals will be permanently purged from the database.
            </p>

            <div>
              <label className="block text-[11px] font-mono text-slate-500 uppercase mb-1.5">
                Type <strong className="text-red-500">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-red-300 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-red-500"
                autoFocus
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText.toUpperCase() !== 'DELETE' || deleteLoading}
                onClick={handleConfirmDeleteAccount}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition disabled:opacity-40"
              >
                {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL PREVIEW MODAL */}
      {showEmailPreviewModal && emailPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-[#101726] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Email Notification Dispatch
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    To: {emailPreview.to} | Subject: {emailPreview.subject}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-slate-100 dark:bg-[#080c14]">
              <div
                className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800"
                dangerouslySetInnerHTML={{ __html: emailPreview.html }}
              />
            </div>

            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="px-4 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
