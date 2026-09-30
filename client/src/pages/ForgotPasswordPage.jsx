import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { ErrorAlert } from '../components/ErrorAlert';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Reset Password
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enter your registered email to receive a recovery link.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      {submitted ? (
        <div className="text-center p-6 bg-sky-500/10 rounded-2xl border border-sky-500/20 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-sky-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Reset Link Dispatched
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            If an account exists for <span className="font-semibold text-sky-500">{email}</span>, a password reset link has been dispatched to your inbox.
          </p>
          <Link
            to="/login"
            className="inline-block mt-4 text-xs font-semibold text-sky-500 hover:underline"
          >
            Back to Log In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-sky-500 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-subtle hover:shadow-glow disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Send Reset Link</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Log In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
