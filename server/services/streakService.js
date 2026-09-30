import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';

/**
 * Helper to get local date string YYYY-MM-DD for a given Date and timezone.
 */
export const getLocalDateString = (date = new Date(), timezone = 'UTC') => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date); // outputs YYYY-MM-DD
  } catch (e) {
    // Fallback if invalid timezone
    return new Date(date).toISOString().split('T')[0];
  }
};

/**
 * Calculates current streak and longest streak for a user.
 * A day is considered "Complete" if all active, non-archived habits
 * have a completed HabitLog on that day.
 * If user has no active habits, streak is 0.
 * 
 * @param {string} userId
 * @param {string} timezone
 * @returns {Promise<{ currentStreak: number, longestStreak: number, isTodayComplete: boolean, completedDates: string[] }>}
 */
export const calculateUserStreaks = async (userId, timezone = 'UTC') => {
  const activeHabits = await Habit.find({ userId, active: true, archived: false }).select('_id');
  const activeCount = activeHabits.length;

  if (activeCount === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      isTodayComplete: false,
      completedDates: [],
    };
  }

  const activeHabitIds = activeHabits.map((h) => h._id.toString());

  // Aggregate all completed habit logs for this user
  const completedLogs = await HabitLog.find({
    userId,
    habitId: { $in: activeHabits.map((h) => h._id) },
    completed: true,
  }).select('date habitId');

  // Group logs by date
  const dateMap = {};
  for (const log of completedLogs) {
    if (!dateMap[log.date]) {
      dateMap[log.date] = new Set();
    }
    dateMap[log.date].add(log.habitId.toString());
  }

  // Find all dates where all active habits were completed
  const completeDates = [];
  for (const [dateStr, habitSet] of Object.entries(dateMap)) {
    if (activeHabitIds.every((id) => habitSet.has(id))) {
      completeDates.push(dateStr);
    }
  }

  // Sort dates chronologically
  completeDates.sort();

  const todayStr = getLocalDateString(new Date(), timezone);
  const isTodayComplete = completeDates.includes(todayStr);

  // Calculate current streak backwards from today or yesterday
  let currentStreak = 0;
  
  // Calculate yesterday's date string
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday, timezone);

  // Check if today is completed
  let checkDate = new Date(now);
  let checkDateStr = todayStr;

  if (completeDates.includes(todayStr)) {
    currentStreak = 1;
    // Walk backward from yesterday
    let dayCursor = new Date(now);
    while (true) {
      dayCursor.setDate(dayCursor.getDate() - 1);
      const prevDateStr = getLocalDateString(dayCursor, timezone);
      if (completeDates.includes(prevDateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else if (completeDates.includes(yesterdayStr)) {
    // Today not yet complete, but yesterday was — streak is maintained from yesterday
    currentStreak = 1;
    let dayCursor = new Date(yesterday);
    while (true) {
      dayCursor.setDate(dayCursor.getDate() - 1);
      const prevDateStr = getLocalDateString(dayCursor, timezone);
      if (completeDates.includes(prevDateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  // Calculate longest streak across history
  let longestStreak = 0;
  let runningStreak = 0;
  let prevDateObj = null;

  for (const dateStr of completeDates) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const currentDateObj = new Date(Date.UTC(y, m - 1, d));

    if (!prevDateObj) {
      runningStreak = 1;
    } else {
      const diffDays = Math.round((currentDateObj - prevDateObj) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak++;
      } else if (diffDays === 0) {
        // Same day, no-op
      } else {
        runningStreak = 1;
      }
    }
    prevDateObj = currentDateObj;

    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
  }

  return {
    currentStreak,
    longestStreak,
    isTodayComplete,
    completedDates: completeDates,
  };
};
