import User from '../models/User.js';
import { sendDailyReminder } from '../services/emailService.js';
import { dispatchTestEmail } from '../services/emailService.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import SleepLog from '../models/SleepLog.js';
import { calculateUserStreaks, getLocalDateString } from '../services/streakService.js';

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get user's notification settings
 * @access  Private
 */
export const getPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      notificationSettings: user.notificationSettings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/notifications/preferences
 * @desc    Update user's notification settings
 * @access  Private
 */
export const updatePreferences = async (req, res, next) => {
  try {
    const { dailyReminder, reminderTime, weeklySummary, monthlySummary } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (dailyReminder !== undefined) user.notificationSettings.dailyReminder = Boolean(dailyReminder);
    if (reminderTime !== undefined) user.notificationSettings.reminderTime = reminderTime;
    if (weeklySummary !== undefined) user.notificationSettings.weeklySummary = Boolean(weeklySummary);
    if (monthlySummary !== undefined) user.notificationSettings.monthlySummary = Boolean(monthlySummary);

    await user.save();

    res.status(200).json({
      success: true,
      notificationSettings: user.notificationSettings,
      message: 'Notification preferences updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/notifications/test-email
 * @desc    Send a test reminder email to logged in user and return full preview
 * @access  Private
 */
export const sendTestEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const timezone = user.timezone || 'UTC';
    const todayStr = getLocalDateString(new Date(), timezone);

    const activeHabits = await Habit.find({ userId: user._id, active: true, archived: false });
    const habitLogs = await HabitLog.find({
      userId: user._id,
      habitId: { $in: activeHabits.map((h) => h._id) },
      date: todayStr,
      completed: true,
    });

    const sleepLog = await SleepLog.findOne({
      userId: user._id,
      date: todayStr,
    });

    const streaks = await calculateUserStreaks(user._id, timezone);

    const emailResult = await sendDailyReminder({
      user,
      completedCount: habitLogs.length,
      totalActive: activeHabits.length,
      sleepLogged: !!sleepLog,
      streak: streaks.currentStreak,
    });

    res.status(200).json({
      success: true,
      sentLive: emailResult.sentLive,
      message: emailResult.sentLive
        ? `Email dispatched to ${user.email} via Resend!`
        : emailResult.error
        ? `Resend: ${emailResult.error}`
        : `Email dispatched! (In preview mode, check preview below)`,
      preview: emailResult.preview,
      error: emailResult.error,
    });
  } catch (error) {
    next(error);
  }
};
