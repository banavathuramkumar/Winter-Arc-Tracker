import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import SleepLog from '../models/SleepLog.js';
import Goal from '../models/Goal.js';
import User from '../models/User.js';
import { calculateUserStreaks, getLocalDateString } from '../services/streakService.js';
import { calculateWinterArcScore } from '../services/scoreService.js';

/**
 * @route   GET /api/insights
 * @desc    Get detailed analytics for habit completion, sleep trends, streaks and weekly patterns
 * @access  Private
 */
export const getInsights = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const timezone = user?.timezone || 'UTC';
    const sleepGoal = user?.sleepGoal || 8;

    const todayStr = getLocalDateString(new Date(), timezone);
    const currentMonthStr = todayStr.substring(0, 7);

    // 1. Calculate streaks & score
    const streaks = await calculateUserStreaks(user._id, timezone);
    const scoreData = await calculateWinterArcScore(user._id, sleepGoal, timezone, currentMonthStr);

    // 2. Query last 30 days data
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last30Days.push(getLocalDateString(d, timezone));
    }

    const activeHabits = await Habit.find({ userId: user._id, active: true, archived: false });
    const activeHabitCount = activeHabits.length;

    const habitLogs30 = await HabitLog.find({
      userId: user._id,
      date: { $in: last30Days },
      completed: true,
    });

    const sleepLogs30 = await SleepLog.find({
      userId: user._id,
      date: { $in: last30Days },
    });

    // Map logs by date
    const habitCountByDate = {};
    for (const log of habitLogs30) {
      habitCountByDate[log.date] = (habitCountByDate[log.date] || 0) + 1;
    }

    const sleepByDate = {};
    for (const s of sleepLogs30) {
      sleepByDate[s.date] = s.duration;
    }

    // Build timeline charts data (Last 30 Days)
    const timelineData = last30Days.map((dateStr) => {
      const [, m, d] = dateStr.split('-');
      const completedHabits = habitCountByDate[dateStr] || 0;
      const completionRate = activeHabitCount > 0 ? Math.round((completedHabits / activeHabitCount) * 100) : 0;
      const sleepHours = sleepByDate[dateStr] !== undefined ? sleepByDate[dateStr] : null;

      return {
        date: dateStr,
        displayDate: `${m}/${d}`,
        completedHabits,
        totalHabits: activeHabitCount,
        completionRate,
        sleepHours,
        sleepGoal,
      };
    });

    // 3. Weekly consistency heatmap / day-of-week breakdown
    const dayOfWeekStats = {
      Sun: { totalCompleted: 0, count: 0 },
      Mon: { totalCompleted: 0, count: 0 },
      Tue: { totalCompleted: 0, count: 0 },
      Wed: { totalCompleted: 0, count: 0 },
      Thu: { totalCompleted: 0, count: 0 },
      Fri: { totalCompleted: 0, count: 0 },
      Sat: { totalCompleted: 0, count: 0 },
    };

    const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (const item of timelineData) {
      const [y, m, d] = item.date.split('-').map(Number);
      const dayIdx = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      const dayName = daysShort[dayIdx];
      dayOfWeekStats[dayName].totalCompleted += item.completionRate;
      dayOfWeekStats[dayName].count++;
    }

    const weeklyConsistency = daysShort.map((dayName) => {
      const { totalCompleted, count } = dayOfWeekStats[dayName];
      const avgRate = count > 0 ? Math.round(totalCompleted / count) : 0;
      return {
        day: dayName,
        completionRate: avgRate,
      };
    });

    // 4. Goals summary
    const goals = await Goal.find({ userId: user._id, month: currentMonthStr });
    const completedGoals = goals.filter((g) => g.completed || g.progress >= g.target).length;

    // 5. Total Sleep metrics for all time / 30 days
    const totalSleepHours = sleepLogs30.reduce((acc, curr) => acc + curr.duration, 0);
    const avgSleep30 = sleepLogs30.length > 0 ? parseFloat((totalSleepHours / sleepLogs30.length).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      summary: {
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak,
        winterArcScore: scoreData.score,
        habitCompletionRate: scoreData.habitStats.percentage,
        averageSleep: avgSleep30,
        sleepGoal,
        goalsCompleted: completedGoals,
        totalGoals: goals.length,
      },
      timelineData,
      weeklyConsistency,
      goals,
    });
  } catch (error) {
    next(error);
  }
};
