import User from '../models/User.js';
import HabitLog from '../models/HabitLog.js';
import SleepLog from '../models/SleepLog.js';
import { calculateWinterArcScore } from '../services/scoreService.js';
import { sendMonthlySummary } from '../services/emailService.js';
import { getLocalDateString } from '../services/streakService.js';

export const runMonthlySummaryCheck = async () => {
  try {
    const users = await User.find({
      'notificationSettings.monthlySummary': true,
      onboarded: true,
    });

    for (const user of users) {
      const userTz = user.timezone || 'UTC';
      const now = new Date();
      
      // Target previous month
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthStr = prevMonthDate.toISOString().substring(0, 7);
      const monthName = prevMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

      const scoreObj = await calculateWinterArcScore(user._id, user.sleepGoal || 8, userTz, prevMonthStr);
      
      const totalHabitsDone = await HabitLog.countDocuments({
        userId: user._id,
        date: { $regex: `^${prevMonthStr}` },
        completed: true,
      });

      const sleepLogs = await SleepLog.find({
        userId: user._id,
        date: { $regex: `^${prevMonthStr}` },
      });

      const totalSleep = sleepLogs.reduce((sum, s) => sum + s.duration, 0);
      const avgSleep = sleepLogs.length > 0 ? parseFloat((totalSleep / sleepLogs.length).toFixed(1)) : 0;

      await sendMonthlySummary({
        user,
        stats: {
          monthName,
          score: scoreObj.score,
          perfectDaysCount: scoreObj.habitStats.completedCount > 0 ? Math.floor(scoreObj.score / 10) : 0,
          totalHabitsDone,
          avgSleep,
        },
      });
    }
  } catch (error) {
    console.error('[Cron Job Error] Monthly summary check failed:', error.message);
  }
};
