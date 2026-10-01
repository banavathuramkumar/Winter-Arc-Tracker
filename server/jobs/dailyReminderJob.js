import User from '../models/User.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import SleepLog from '../models/SleepLog.js';
import { calculateUserStreaks, getLocalDateString } from '../services/streakService.js';
import { sendDailyReminder } from '../services/emailService.js';

/**
 * Checks all users to see if their local time matches their configured daily reminder time.
 * If so, inspects their habits & sleep progress and dispatches a smart reminder.
 */
export const runDailyReminderCheck = async () => {
  try {
    const users = await User.find({
      'notificationSettings.dailyReminder': true,
      onboarded: true,
    });

    for (const user of users) {
      const userTz = user.timezone || 'UTC';
      const targetTimeStr = user.notificationSettings.reminderTime || '21:00';
      const [targetHour, targetMin] = targetTimeStr.split(':').map(Number);

      // Get current hour and min in user's timezone
      const now = new Date();
      const userTimeString = now.toLocaleTimeString('en-US', {
        timeZone: userTz,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });
      const [currentHour, currentMin] = userTimeString.split(':').map(Number);
      const todayStr = getLocalDateString(now, userTz);

      // Check if current hour and minute match target time, and not sent yet today
      if (currentHour === targetHour && currentMin === targetMin) {
        if (user.lastReminderSentDate === todayStr) {
          continue; // Already dispatched today
        }

        console.log(`[Cron Match] Triggering automated daily reminder for ${user.email} (${userTimeString} in ${userTz})`);

        // Fetch active habits
        const activeHabits = await Habit.find({ userId: user._id, active: true, archived: false });

        // Fetch today's completed habit logs
        const habitLogs = await HabitLog.find({
          userId: user._id,
          habitId: { $in: activeHabits.map((h) => h._id) },
          date: todayStr,
          completed: true,
        });

        // Fetch sleep log
        const sleepLog = await SleepLog.findOne({
          userId: user._id,
          date: todayStr,
        });

        const streaks = await calculateUserStreaks(user._id, userTz);

        await sendDailyReminder({
          user,
          completedCount: habitLogs.length,
          totalActive: activeHabits.length,
          sleepLogged: !!sleepLog,
          streak: streaks.currentStreak,
        });

        // Mark as sent for today
        user.lastReminderSentDate = todayStr;
        await user.save();
      }
    }
  } catch (error) {
    console.error('[Cron Job Error] Daily reminder check failed:', error.message);
  }
};
