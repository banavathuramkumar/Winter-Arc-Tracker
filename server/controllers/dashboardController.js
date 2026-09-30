import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import SleepLog from '../models/SleepLog.js';
import Goal from '../models/Goal.js';
import User from '../models/User.js';
import { calculateUserStreaks, getLocalDateString } from '../services/streakService.js';
import { calculateWinterArcScore } from '../services/scoreService.js';

/**
 * @route   GET /api/dashboard
 * @desc    Get aggregated dashboard data for the authenticated user
 * @access  Private
 */
export const getDashboardOverview = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const timezone = user?.timezone || 'UTC';
    const sleepGoal = user?.sleepGoal || 8;

    const todayStr = getLocalDateString(new Date(), timezone);
    const currentMonthStr = todayStr.substring(0, 7); // 'YYYY-MM'

    // Format human-readable date & month
    const [year, month, day] = todayStr.split('-').map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    const monthName = dateObj.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
    const fullDateFormatted = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });

    // 1. Fetch Active Habits
    const habits = await Habit.find({
      userId: user._id,
      archived: false,
    }).sort({ order: 1, createdAt: 1 });

    const activeHabits = habits.filter((h) => h.active);

    // 2. Fetch Today's Habit Logs
    const todayLogs = await HabitLog.find({
      userId: user._id,
      date: todayStr,
    });

    const completedHabitIdSet = new Set(
      todayLogs.filter((l) => l.completed).map((l) => l.habitId.toString())
    );

    // Map habits with today's completed state
    const todayHabitsWithStatus = activeHabits.map((h) => ({
      _id: h._id,
      name: h.name,
      icon: h.icon,
      category: h.category,
      completedToday: completedHabitIdSet.has(h._id.toString()),
    }));

    const completedCount = todayHabitsWithStatus.filter((h) => h.completedToday).length;
    const totalActive = activeHabits.length;
    const todayProgressPct = totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;

    // 3. Fetch Today's Sleep
    const todaySleep = await SleepLog.findOne({
      userId: user._id,
      date: todayStr,
    });

    // 4. Calculate Streaks
    const streaks = await calculateUserStreaks(user._id, timezone);

    // 5. Calculate Winter Arc Score & Perfect Day
    const scoreData = await calculateWinterArcScore(user._id, sleepGoal, timezone, currentMonthStr);

    // 6. Fetch Active Goals for Current Month
    const currentGoals = await Goal.find({
      userId: user._id,
      month: currentMonthStr,
    });

    // 7. Monthly Calendar Day-by-day Overview
    const daysInMonth = new Date(year, month, 0).getDate();
    const allMonthHabitLogs = await HabitLog.find({
      userId: user._id,
      date: { $regex: `^${currentMonthStr}` },
      completed: true,
    });

    const allMonthSleepLogs = await SleepLog.find({
      userId: user._id,
      date: { $regex: `^${currentMonthStr}` },
    });

    const sleepMap = {};
    for (const s of allMonthSleepLogs) {
      sleepMap[s.date] = s.duration;
    }

    const habitLogsByDate = {};
    for (const log of allMonthHabitLogs) {
      if (!habitLogsByDate[log.date]) {
        habitLogsByDate[log.date] = 0;
      }
      habitLogsByDate[log.date]++;
    }

    const calendarDays = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayPad = String(d).padStart(2, '0');
      const dateKey = `${currentMonthStr}-${dayPad}`;
      const isFuture = dateKey > todayStr;
      const isToday = dateKey === todayStr;

      const habitsCompleted = habitLogsByDate[dateKey] || 0;
      const sleepDuration = sleepMap[dateKey] !== undefined ? sleepMap[dateKey] : null;

      let status = 'empty'; // 'perfect', 'partial', 'empty', 'future'
      if (isFuture) {
        status = 'future';
      } else if (totalActive > 0 && habitsCompleted >= totalActive && sleepDuration !== null && sleepDuration > 0) {
        status = 'perfect';
      } else if (habitsCompleted > 0 || (sleepDuration !== null && sleepDuration > 0)) {
        status = 'partial';
      }

      calendarDays.push({
        dayNumber: d,
        date: dateKey,
        isToday,
        isFuture,
        status,
        habitsCompleted,
        totalHabits: totalActive,
        sleepDuration,
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        timezone,
        sleepGoal,
      },
      currentDate: {
        dateStr: todayStr,
        monthStr: currentMonthStr,
        monthName: `${monthName} ${year}`,
        fullDateFormatted,
        dayNumber: day,
      },
      todayProgress: {
        completedCount,
        totalActive,
        percentage: todayProgressPct,
        habits: todayHabitsWithStatus,
      },
      todaySleep: todaySleep
        ? {
            duration: todaySleep.duration,
            quality: todaySleep.quality,
            notes: todaySleep.notes,
            goal: sleepGoal,
          }
        : null,
      streaks: {
        current: streaks.currentStreak,
        longest: streaks.longestStreak,
        isTodayComplete: streaks.isTodayComplete,
      },
      score: {
        overall: scoreData.score,
        breakdown: scoreData.breakdown,
        isPerfectDay: scoreData.isTodayPerfect,
      },
      goals: currentGoals,
      calendarDays,
    });
  } catch (error) {
    next(error);
  }
};
