import SleepLog from '../models/SleepLog.js';
import User from '../models/User.js';

/**
 * @route   GET /api/sleep
 * @desc    Get sleep logs for a given month or date range with statistical summary
 * @access  Private
 */
export const getSleepLogs = async (req, res, next) => {
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

    const logs = await SleepLog.find(query).sort({ date: 1 });
    const user = await User.findById(req.user.id);
    const sleepGoal = user?.sleepGoal || 8;

    // Calculate sleep metrics
    let totalDuration = 0;
    let minSleep = null;
    let maxSleep = null;

    for (const log of logs) {
      totalDuration += log.duration;
      if (minSleep === null || log.duration < minSleep) minSleep = log.duration;
      if (maxSleep === null || log.duration > maxSleep) maxSleep = log.duration;
    }

    const count = logs.length;
    const average = count > 0 ? parseFloat((totalDuration / count).toFixed(2)) : 0;
    const avgHours = Math.floor(average);
    const avgMinutes = Math.round((average - avgHours) * 60);

    res.status(200).json({
      success: true,
      count,
      logs,
      stats: {
        sleepGoal,
        averageHours: average,
        averageFormatted: `${avgHours}h ${avgMinutes}m`,
        bestSleep: maxSleep !== null ? maxSleep : 0,
        lowestSleep: minSleep !== null ? minSleep : 0,
        daysLogged: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/sleep
 * @desc    Log or update sleep for a date (upsert)
 * @access  Private
 */
export const logSleep = async (req, res, next) => {
  try {
    const { date, duration, quality, notes } = req.body;

    if (!date || duration === undefined) {
      return res.status(400).json({ success: false, message: 'Date and sleep duration are required' });
    }

    const numDuration = Number(duration);
    if (isNaN(numDuration) || numDuration < 0 || numDuration > 24) {
      return res.status(400).json({ success: false, message: 'Duration must be between 0 and 24 hours' });
    }

    const log = await SleepLog.findOneAndUpdate(
      { userId: req.user.id, date },
      {
        duration: numDuration,
        quality: quality !== undefined ? Number(quality) : 3,
        notes: notes || '',
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/sleep/:id
 * @desc    Update an existing sleep log
 * @access  Private
 */
export const updateSleep = async (req, res, next) => {
  try {
    const { duration, quality, notes } = req.body;
    const log = await SleepLog.findOne({ _id: req.params.id, userId: req.user.id });

    if (!log) {
      return res.status(404).json({ success: false, message: 'Sleep log not found' });
    }

    if (duration !== undefined) log.duration = Number(duration);
    if (quality !== undefined) log.quality = Number(quality);
    if (notes !== undefined) log.notes = notes;

    await log.save();

    res.status(200).json({
      success: true,
      log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/sleep/:id
 * @desc    Delete a sleep log
 * @access  Private
 */
export const deleteSleep = async (req, res, next) => {
  try {
    const log = await SleepLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!log) {
      return res.status(404).json({ success: false, message: 'Sleep log not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Sleep log deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};
