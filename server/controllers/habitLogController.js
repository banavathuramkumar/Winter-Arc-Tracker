import HabitLog from '../models/HabitLog.js';
import Habit from '../models/Habit.js';

/**
 * @route   GET /api/habit-logs
 * @desc    Get habit completion logs for a month or date range
 * @access  Private
 */
export const getHabitLogs = async (req, res, next) => {
  try {
    const { month, date, startDate, endDate } = req.query;
    const query = { userId: req.user.id };

    if (date) {
      query.date = date;
    } else if (month) {
      query.date = { $regex: `^${month}` };
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const logs = await HabitLog.find(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/habit-logs
 * @desc    Toggle habit completion status for a given date
 * @access  Private
 */
export const toggleHabitLog = async (req, res, next) => {
  try {
    const { habitId, date, completed } = req.body;

    if (!habitId || !date) {
      return res.status(400).json({ success: false, message: 'Habit ID and date are required' });
    }

    // Verify habit belongs to user
    const habit = await Habit.findOne({ _id: habitId, userId: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    let log = await HabitLog.findOne({
      userId: req.user.id,
      habitId,
      date,
    });

    if (log) {
      // If completed param is provided explicitly, use it, else toggle
      const newStatus = completed !== undefined ? Boolean(completed) : !log.completed;
      log.completed = newStatus;
      await log.save();
    } else {
      const newStatus = completed !== undefined ? Boolean(completed) : true;
      log = await HabitLog.create({
        userId: req.user.id,
        habitId,
        date,
        completed: newStatus,
      });
    }

    res.status(200).json({
      success: true,
      log,
    });
  } catch (error) {
    next(error);
  }
};
