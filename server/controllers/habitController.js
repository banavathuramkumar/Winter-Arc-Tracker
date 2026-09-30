import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';

/**
 * @route   GET /api/habits
 * @desc    Get all habits for the logged-in user
 * @access  Private
 */
export const getHabits = async (req, res, next) => {
  try {
    const { includeArchived } = req.query;
    const query = { userId: req.user.id };

    if (includeArchived !== 'true') {
      query.archived = false;
    }

    const habits = await Habit.find(query).sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: habits.length,
      habits,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/habits
 * @desc    Create a new habit
 * @access  Private
 */
export const createHabit = async (req, res, next) => {
  try {
    const { name, icon, category } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Habit name is required' });
    }

    // Get highest current order
    const lastHabit = await Habit.findOne({ userId: req.user.id }).sort({ order: -1 });
    const order = lastHabit ? lastHabit.order + 1 : 0;

    const habit = await Habit.create({
      userId: req.user.id,
      name: name.trim(),
      icon: icon || '⚡',
      category: category || 'General',
      order,
    });

    res.status(201).json({
      success: true,
      habit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/habits/:id
 * @desc    Update habit details
 * @access  Private
 */
export const updateHabit = async (req, res, next) => {
  try {
    const { name, icon, category, active, archived, order } = req.body;
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });

    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    if (name !== undefined) habit.name = name.trim();
    if (icon !== undefined) habit.icon = icon;
    if (category !== undefined) habit.category = category;
    if (active !== undefined) habit.active = Boolean(active);
    if (archived !== undefined) habit.archived = Boolean(archived);
    if (order !== undefined) habit.order = Number(order);

    await habit.save();

    res.status(200).json({
      success: true,
      habit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/habits/:id
 * @desc    Delete habit and all its logs
 * @access  Private
 */
export const deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    // Cascade delete habit logs
    await HabitLog.deleteMany({ habitId: req.params.id, userId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Habit and associated logs deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};
