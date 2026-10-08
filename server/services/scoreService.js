import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import SleepLog from '../models/SleepLog.js';
import Goal from '../models/Goal.js';
import { getLocalDateString } from './streakService.js';

/**
 * Calculates the Winter Arc Score (0-100) and Perfect Day status.
 * Formula:
 * - Habit Completion (0 - 50 points): % of habits completed in the selected window (default: current month or last 30 days)
 * - Sleep Consistency (0 - 25 points): % of logged sleep days meeting >= 85% of sleep goal
 * - Goal Progress (0 - 25 points): average progress % towards active monthly goals
 * 
 * @param {string} userId
 * @param {number} sleepGoal
 * @param {string} timezone
 * @param {string} targetMonth YYYY-MM (e.g. 2026-09)
 */
export const calculateWinterArcScore = async (userId, sleepGoal = 8, timezone = 'UTC', targetMonth = null) => {
  const todayStr = getLocalDateString(new Date(), timezone);
  const currentMonth = targetMonth || todayStr.substring(0, 7);

  // 1. Active Habits & Monthly Logs
  const activeHabits = await Habit.find({ userId, active: true, archived: false });
  const activeHabitCount = activeHabits.length;

  let habitScore = 0;
  let habitStats = { totalExpected: 0, completedCount: 0, percentage: 0 };

  if (activeHabitCount > 0) {
    const [year, month] = currentMonth.split('-').map(Number);

    // If evaluating current month, only evaluate days elapsed so far
    const isCurrentMonth = currentMonth === todayStr.substring(0, 7);
    const todayDayNum = parseInt(todayStr.split('-')[2], 10);

    // For each habit, calculate expected days from MAX(habit.createdAt date, month start) to today
    // This prevents new habits from showing as "missing" for days before they existed
    let totalExpected = 0;
    for (const habit of activeHabits) {
      // Get the day the habit was created (within this timezone context, use UTC date as approximation)
      const habitCreatedStr = getLocalDateString(new Date(habit.createdAt), timezone);
      const habitCreatedMonth = habitCreatedStr.substring(0, 7);

      let startDayNum = 1; // default: start of month
      if (habitCreatedMonth === currentMonth) {
        // Habit was created this month — only count from creation day
        startDayNum = parseInt(habitCreatedStr.split('-')[2], 10);
      } else if (habitCreatedMonth > currentMonth) {
        // Habit created after the target month — skip (0 expected days)
        startDayNum = null;
      }

      if (startDayNum !== null) {
        const endDayNum = isCurrentMonth ? todayDayNum : new Date(year, month, 0).getDate();
        const daysForHabit = Math.max(0, endDayNum - startDayNum + 1);
        totalExpected += daysForHabit;
      }
    }

    // Count completed logs for this month up to today
    const habitLogs = await HabitLog.find({
      userId,
      habitId: { $in: activeHabits.map((h) => h._id) },
      date: { $regex: `^${currentMonth}`, $lte: todayStr },
      completed: true,
    });

    const completedCount = habitLogs.length;
    const habitPct = totalExpected > 0 ? Math.min(100, Math.round((completedCount / totalExpected) * 100)) : 0;
    habitScore = (habitPct / 100) * 50; // max 50 points
    habitStats = { totalExpected, completedCount, percentage: habitPct };
  }


  // 2. Sleep Consistency (0 - 25 pts)
  const sleepLogs = await SleepLog.find({
    userId,
    date: { $regex: `^${currentMonth}`, $lte: todayStr },
  });

  let sleepScore = 0;
  let sleepStats = { totalLogged: sleepLogs.length, goalMetCount: 0, averageHours: 0, percentage: 0 };

  if (sleepLogs.length > 0) {
    const totalHours = sleepLogs.reduce((sum, log) => sum + log.duration, 0);
    const avgHours = parseFloat((totalHours / sleepLogs.length).toFixed(1));
    
    // Count days meeting at least 85% of target sleep
    const minAcceptable = sleepGoal * 0.85;
    const goalMetCount = sleepLogs.filter((log) => log.duration >= minAcceptable).length;
    const sleepPct = Math.min(100, Math.round((goalMetCount / sleepLogs.length) * 100));

    sleepScore = (sleepPct / 100) * 25; // max 25 points
    sleepStats = { totalLogged: sleepLogs.length, goalMetCount, averageHours: avgHours, percentage: sleepPct };
  }

  // 3. Goal Progress (0 - 25 pts)
  const goals = await Goal.find({ userId, month: currentMonth });
  let goalScore = 0;
  let goalStats = { totalGoals: goals.length, completedGoals: 0, averageProgressPct: 0 };

  if (goals.length > 0) {
    const totalProgressPcts = goals.reduce((sum, g) => {
      const pct = Math.min(100, Math.round((g.progress / (g.target || 1)) * 100));
      return sum + pct;
    }, 0);

    const avgProgress = Math.round(totalProgressPcts / goals.length);
    const completedCount = goals.filter((g) => g.completed || g.progress >= g.target).length;
    
    goalScore = (avgProgress / 100) * 25; // max 25 points
    goalStats = { totalGoals: goals.length, completedGoals: completedCount, averageProgressPct: avgProgress };
  }

  // Total Winter Arc Score (0 - 100)
  const totalScore = Math.min(100, Math.round(habitScore + sleepScore + goalScore));

  // 4. Perfect Day Evaluation for Today
  let isTodayPerfect = false;
  if (activeHabitCount > 0) {
    const todayHabitLogs = await HabitLog.find({
      userId,
      habitId: { $in: activeHabits.map((h) => h._id) },
      date: todayStr,
      completed: true,
    });
    const todaySleepLog = await SleepLog.findOne({
      userId,
      date: todayStr,
    });

    const allHabitsDone = todayHabitLogs.length >= activeHabitCount;
    const sleepLogged = !!todaySleepLog && todaySleepLog.duration > 0;
    isTodayPerfect = allHabitsDone && sleepLogged;
  }

  return {
    score: totalScore,
    breakdown: {
      habitScore: Math.round(habitScore),
      sleepScore: Math.round(sleepScore),
      goalScore: Math.round(goalScore),
    },
    habitStats,
    sleepStats,
    goalStats,
    isTodayPerfect,
    date: todayStr,
    month: currentMonth,
  };
};
