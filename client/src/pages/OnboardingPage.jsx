import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Snowflake,
  Check,
  ArrowRight,
  ArrowLeft,
  Moon,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FOCUS_AREAS = [
  { id: 'Study', label: 'Study & Academics', icon: '📚' },
  { id: 'Coding', label: 'Coding & Engineering', icon: '💻' },
  { id: 'Fitness', label: 'Fitness & Physical Health', icon: '🏃' },
  { id: 'Reading', label: 'Reading & Mindset', icon: '📖' },
  { id: 'Sleep', label: 'Sleep & Recovery', icon: '🌙' },
  { id: 'Career', label: 'Career & Projects', icon: '🚀' },
  { id: 'Personal Growth', label: 'Personal Growth', icon: '🧘' },
];

export const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [selectedFocus, setSelectedFocus] = useState(['Coding', 'Fitness']);
  const [sleepGoal, setSleepGoal] = useState(8);
  const [reminderTime, setReminderTime] = useState('21:00'); // 9:00 PM
  const [loading, setLoading] = useState(false);

  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  // Toggle Focus Area
  const toggleFocus = (id) => {
    if (selectedFocus.includes(id)) {
      setSelectedFocus(selectedFocus.filter((f) => f !== id));
    } else {
      setSelectedFocus([...selectedFocus, id]);
    }
  };

  // Final Onboarding Submission
  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      // Update User Profile & Notification settings
      await updateProfile({
        focusAreas: selectedFocus,
        sleepGoal: Number(sleepGoal),
        onboarded: true,
        notificationSettings: {
          dailyReminder: true,
          reminderTime: reminderTime,
          weeklySummary: true,
          monthlySummary: true,
        },
      });

      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080c14] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/5 blur-3xl rounded-full pointer-events-none"></div>

      <div className="max-w-xl w-full mx-auto relative z-10">
        
        {/* Progress header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-mono font-semibold mb-3">
            <Snowflake className="w-3.5 h-3.5" />
            <span>Winter Arc Initiation • Step {step} of 3</span>
          </div>
          
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3 max-w-xs mx-auto">
            <div
              className="bg-sky-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-[#101726] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8">
          
          {/* STEP 1: FOCUS AREAS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  What do you want to improve?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose the pillars of your transformation this season.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FOCUS_AREAS.map((area) => {
                  const isSelected = selectedFocus.includes(area.id);
                  return (
                    <button
                      type="button"
                      key={area.id}
                      onClick={() => toggleFocus(area.id)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{area.icon}</span>
                        <span className="text-xs font-semibold">{area.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-sky-500" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-subtle flex items-center gap-2"
                >
                  <span>Next: Sleep Target</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SLEEP TARGET */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Moon className="w-5 h-5 text-sky-400" /> Set your sleep target
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Disciplined recovery is the bedrock of peak mental performance.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-6">
                
                {/* Number Display */}
                <div>
                  <div className="inline-flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold font-mono text-sky-500 dark:text-sky-400 tracking-tight">
                      {sleepGoal}
                    </span>
                    <span className="text-sm font-bold text-slate-400 uppercase font-mono">
                      HOURS / NIGHT
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    {sleepGoal >= 8 ? 'Optimal for physical & mental recovery' : 'Minimum acceptable recovery window'}
                  </p>
                </div>

                {/* Quick Selection Chips */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {[6, 6.5, 7, 7.5, 8, 8.5, 9].map((hours) => (
                    <button
                      type="button"
                      key={hours}
                      onClick={() => setSleepGoal(hours)}
                      className={`py-2 px-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                        sleepGoal === hours
                          ? 'border-sky-500 bg-sky-500 text-white dark:bg-sky-400 dark:text-slate-950 shadow-sm scale-105'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#101726]'
                      }`}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>

                {/* Slider with Precision Steppers & Exactly Aligned Ticks */}
                <div className="pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSleepGoal((prev) => Math.max(5, Math.round((prev - 0.5) * 2) / 2))}
                      className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-95 shadow-xs shrink-0"
                    >
                      -
                    </button>
                    
                    {/* Synchronized Slider & Tick Track Wrapper */}
                    <div className="flex-1 relative pt-1 pb-7">
                      <input
                        type="range"
                        min="5"
                        max="10"
                        step="0.5"
                        value={sleepGoal}
                        onChange={(e) => setSleepGoal(Number(e.target.value))}
                        className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 block focus:outline-none"
                      />
                      
                      {/* Pixel-perfect Ticks directly below the track */}
                      <div className="relative w-full px-2 mt-2 pointer-events-none">
                        <div className="relative w-full h-6">
                          {[
                            { val: 5, label: '5h', pct: 0 },
                            { val: 6, label: '6h', pct: 20 },
                            { val: 7, label: '7h', pct: 40 },
                            { val: 8, label: '8h', pct: 60 },
                            { val: 9, label: '9h', pct: 80 },
                            { val: 10, label: '10h', pct: 100 },
                          ].map((tick) => {
                            const isMatch = sleepGoal === tick.val;
                            return (
                              <div
                                key={tick.val}
                                style={{ left: `${tick.pct}%` }}
                                className="absolute -translate-x-1/2 flex flex-col items-center"
                              >
                                <div
                                  className={`w-0.5 h-1.5 rounded-full mb-1 transition-colors ${
                                    isMatch
                                      ? 'bg-sky-500 dark:bg-sky-400'
                                      : 'bg-slate-300 dark:bg-slate-700'
                                  }`}
                                />
                                <span
                                  className={`text-[11px] font-mono leading-none transition-all ${
                                    isMatch
                                      ? 'text-sky-500 dark:text-sky-400 font-bold scale-110'
                                      : 'text-slate-400 dark:text-slate-500 font-medium'
                                  }`}
                                >
                                  {tick.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSleepGoal((prev) => Math.min(10, Math.round((prev + 0.5) * 2) / 2))}
                      className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-95 shadow-xs shrink-0"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-subtle flex items-center gap-2"
                >
                  <span>Next: Reminder Time</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REMINDER TIME & INITIATION */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-400" /> Daily Check-in Time
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  We'll send you an intelligent reminder if you have unfinished habits.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-lg font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  Recommended: 9:00 PM (21:00) before bed
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center space-y-1">
                <p className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase font-mono">
                  "Your Winter Arc begins now."
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Ready to lock in? Your custom dashboard and tracking matrix are ready.
                </p>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFinishOnboarding}
                  className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-glow flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Enter Your Winter Arc</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
