import Goal from '../models/Goal.js';

/**
 * @route   GET /api/goals
 * @desc    Get monthly goals for user
 * @access  Private
 */
export const getGoals = async (req, res, next) => {
  try {
    const { month } = req.query;
    const query = { userId: req.user.id };

    if (month) {
      query.month = month;
    }

    const goals = await Goal.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      goals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/goals
 * @desc    Create a new goal
 * @access  Private
 */
export const createGoal = async (req, res, next) => {
  try {
    const { title, description, target, progress, unit, month } = req.body;

    if (!title || !target || !month) {
      return res.status(400).json({ success: false, message: 'Title, target value, and month are required' });
    }

    const goal = await Goal.create({
      userId: req.user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      target: Number(target),
      progress: progress ? Number(progress) : 0,
      unit: unit ? unit.trim() : 'count',
      month,
      completed: Number(progress || 0) >= Number(target),
    });

    res.status(201).json({
      success: true,
      goal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/goals/:id
 * @desc    Update goal or log progress
 * @access  Private
 */
export const updateGoal = async (req, res, next) => {
  try {
    const { title, description, target, progress, unit, completed, addProgress } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    if (title !== undefined) goal.title = title.trim();
    if (description !== undefined) goal.description = description.trim();
    if (target !== undefined) goal.target = Number(target);
    if (unit !== undefined) goal.unit = unit.trim();

    if (addProgress !== undefined) {
      goal.progress = Math.max(0, goal.progress + Number(addProgress));
    } else if (progress !== undefined) {
      goal.progress = Math.max(0, Number(progress));
    }

    if (completed !== undefined) {
      goal.completed = Boolean(completed);
    } else {
      goal.completed = goal.progress >= goal.target;
    }

    await goal.save();

    res.status(200).json({
      success: true,
      goal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete a goal
 * @access  Private
 */
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};
