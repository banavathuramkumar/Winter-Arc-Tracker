import React, { useState, useEffect } from 'react';
import { X, Moon, Star } from 'lucide-react';

const QUICK_DURATIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

export const SleepModal = ({
  isOpen,
  onClose,
  onSave,
  date = '',
  initialDuration = 8,
}) => {
  const [duration, setDuration] = useState(8);
  const [quality, setQuality] = useState(4);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialDuration) {
      setDuration(initialDuration);
    } else {
      setDuration(8);
    }
    setNotes('');
    setError('');
  }, [isOpen, initialDuration, date]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        date,
        duration: Number(duration),
        quality: Number(quality),
        notes,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save sleep log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#101726] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Moon className="w-4 h-4 text-sky-400" /> Log Night Sleep
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">Date: {date}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg">
              {error}
            </p>
          )}

          {/* Quick Duration Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono mb-2">
              Sleep Duration ({duration} hours)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_DURATIONS.map((hours) => (
                <button
                  type="button"
                  key={hours}
                  onClick={() => setDuration(hours)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                    duration === hours
                      ? 'border-sky-500 bg-sky-500 text-white dark:bg-sky-400 dark:text-slate-950 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          {/* Slider for precision */}
          <div>
            <input
              type="range"
              min="0"
              max="14"
              step="0.5"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono mb-2">
              Sleep Quality (1 - 5)
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setQuality(star)}
                  className={`p-2 rounded-lg border transition ${
                    quality >= star
                      ? 'text-amber-400 border-amber-400/40 bg-amber-400/10'
                      : 'text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Star className={`w-4 h-4 ${quality >= star ? 'fill-amber-400' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono mb-2">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Deep sleep, woke up at 6:00 AM energized"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 rounded-xl shadow-subtle transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Sleep Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
