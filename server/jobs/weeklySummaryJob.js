import User from '../models/User.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import SleepLog from '../models/SleepLog.js';
import Goal from '../models/Goal.js';
import { calculateUserStreaks, getLocalDateString } from '../services/streakService.js';
import { calculateWinterArcScore } from '../services/scoreService.js';
import { sendWeeklySummary } from '../services/emailService.js';

/**
 * Checks users who have weeklySummary enabled on Sunday evening.
 */
export const runWeeklySummaryCheck = async () => {
  try {
    const users = await User.find({
      'notificationSettings.weeklySummary': true,
      onboarded: true,
    });

    for (const user of users) {
      const userTz = user.timezone || 'UTC';
      const now = new Date();
      
      // Check if it is Sunday in user's timezone (Day 0)
      const dayOfWeek = parseInt(
        new Intl.DateTimeFormat('en-US', { timeZone: userTz, weekday: 'narrow' }).format(now),
        10
      );

      // Generate date strings for last 7 days
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dates.push(getLocalDateString(d, userTz));
      }

      const activeHabits = await Habit.find({ userId: user._id, active: true, archived: false });
      const expectedTotal = activeHabits.length * 7;

      const completedHabitLogs = await HabitLog.find({
        userId: user._id,
        habitId: { $in: activeHabits.map((h) => h._id) },
        date: { $in: dates },
        completed: true,
      });

      const habitCompletionPct = expectedTotal > 0 ? Math.round((completedHabitLogs.length / expectedTotal) * 100) : 0;

      const sleepLogs = await SleepLog.find({
        userId: user._id,
        date: { $in: dates },
      });

      const totalSleep = sleepLogs.reduce((sum, s) => sum + s.duration, 0);
      const averageSleepHours = sleepLogs.length > 0 ? parseFloat((totalSleep / sleepLogs.length).toFixed(1)) : 0;

      const streaks = await calculateUserStreaks(user._id, userTz);
      const currentMonth = getLocalDateString(now, userTz).substring(0, 7);
      const goals = await Goal.find({ userId: user._id, month: currentMonth });
      const scoreObj = await calculateWinterArcScore(user._id, user.sleepGoal || 8, userTz);

      await sendWeeklySummary({
        user,
        stats: {
          score: scoreObj.score,
          habitCompletionPct,
          averageSleepHours,
          currentStreak: streaks.currentStreak,
          longestStreak: streaks.longestStreak,
          goalsCount: goals.length,
        },
      });
    }
  } catch (error) {
    console.error('[Cron Job Error] Weekly summary check failed:', error.message);
  }
};
