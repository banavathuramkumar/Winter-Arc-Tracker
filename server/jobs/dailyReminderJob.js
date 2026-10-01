import User from '../models/User.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import SleepLog from '../models/SleepLog.js';
import { calculateUserStreaks, getLocalDateString } from '../services/streakService.js';
import { sendDailyReminder } from '../services/emailService.js';

/**
 * Checks all users to see if their local time has reached or passed their configured daily reminder time.
 * If so, inspects their habits & sleep progress and dispatches a smart reminder once per day.
 */
export const runDailyReminderCheck = async () => {
  try {
    const users = await User.find({
      'notificationSettings.dailyReminder': true,
      onboarded: true,
    });

    for (const user of users) {
      let userTz = user.timezone || 'UTC';
      // Normalize timezone aliases
      if (userTz === 'Asia/Calcutta') userTz = 'Asia/Kolkata';

      const targetTimeStr = user.notificationSettings?.reminderTime || '21:00';
      const [targetHour, targetMin] = targetTimeStr.split(':').map(Number);
      const targetTotalMinutes = targetHour * 60 + targetMin;

      const now = new Date();
      let userTimeString = '00:00';
      try {
        const timeFormatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: userTz,
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23',
        });
        userTimeString = timeFormatter.format(now);
      } catch (e) {
        userTimeString = now.toISOString().substring(11, 16);
      }

      const [currentHour, currentMin] = userTimeString.split(':').map(Number);
      const currentTotalMinutes = currentHour * 60 + currentMin;
      const todayStr = getLocalDateString(now, userTz);

      // Trigger if current time has reached or passed target time (within 3-hour evening window)
      // and user has NOT received today's reminder yet
      const isWithinWindow =
        currentTotalMinutes >= targetTotalMinutes &&
        currentTotalMinutes <= targetTotalMinutes + 180;

      if (isWithinWindow) {
        if (user.lastReminderSentDate === todayStr) {
          continue; // Already dispatched today
        }

        console.log(`[Cron Dispatch] Sending daily reminder to ${user.email} (Local time: ${userTimeString} ${userTz}, Target: ${targetTimeStr})`);

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

        const emailResult = await sendDailyReminder({
          user,
          completedCount: habitLogs.length,
          totalActive: activeHabits.length,
          sleepLogged: !!sleepLog,
          streak: streaks.currentStreak,
        });

        if (emailResult.sentLive) {
          console.log(`[Cron Success] Daily reminder successfully delivered to ${user.email}`);
        }

        // Mark as sent for today
        user.lastReminderSentDate = todayStr;
        await user.save();
      }
    }
  } catch (error) {
    console.error('[Cron Job Error] Daily reminder check failed:', error.message);
  }
};
