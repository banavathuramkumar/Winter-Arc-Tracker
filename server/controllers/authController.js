import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import SleepLog from '../models/SleepLog.js';
import Goal from '../models/Goal.js';
import { sendPasswordReset } from '../services/emailService.js';

// Generate JWT helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'winter_arc_secret_jwt_2026_key', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, timezone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      timezone: timezone || 'UTC',
      onboarded: false,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        sleepGoal: user.sleepGoal,
        focusAreas: user.focusAreas,
        onboarded: user.onboarded,
        themePreference: user.themePreference,
        notificationSettings: user.notificationSettings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        sleepGoal: user.sleepGoal,
        focusAreas: user.focusAreas,
        onboarded: user.onboarded,
        themePreference: user.themePreference,
        notificationSettings: user.notificationSettings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Log out user (stateless JWT client clears token)
 * @access  Public
 */
export const logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user details
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        sleepGoal: user.sleepGoal,
        focusAreas: user.focusAreas,
        onboarded: user.onboarded,
        themePreference: user.themePreference,
        notificationSettings: user.notificationSettings,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Forgot Password - generate reset token and email
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return 200 to prevent user enumeration attacks
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been dispatched.',
      });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    await sendPasswordReset({ user, resetUrl });

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using valid token
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const authToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      token: authToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/auth/profile
 * @desc    Update user profile & onboarding data
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, timezone, sleepGoal, focusAreas, onboarded, themePreference } = req.body;

    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name.trim();
    if (timezone !== undefined) fieldsToUpdate.timezone = timezone;
    if (sleepGoal !== undefined) fieldsToUpdate.sleepGoal = Number(sleepGoal);
    if (focusAreas !== undefined) fieldsToUpdate.focusAreas = focusAreas;
    if (onboarded !== undefined) fieldsToUpdate.onboarded = Boolean(onboarded);
    if (themePreference !== undefined) fieldsToUpdate.themePreference = themePreference;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        sleepGoal: user.sleepGoal,
        focusAreas: user.focusAreas,
        onboarded: user.onboarded,
        themePreference: user.themePreference,
        notificationSettings: user.notificationSettings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/auth/delete-account
 * @desc    Permanently delete account and all user data
 * @access  Private
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Delete all linked records in MongoDB
    await Habit.deleteMany({ userId });
    await HabitLog.deleteMany({ userId });
    await SleepLog.deleteMany({ userId });
    await Goal.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Your Winter Arc account and all associated data have been permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/export-data
 * @desc    Export all user data in JSON format
 * @access  Private
 */
export const exportData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const habits = await Habit.find({ userId });
    const habitLogs = await HabitLog.find({ userId });
    const sleepLogs = await SleepLog.find({ userId });
    const goals = await Goal.find({ userId });

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        sleepGoal: user.sleepGoal,
        notificationSettings: user.notificationSettings,
        createdAt: user.createdAt,
      },
      habits,
      habitLogs,
      sleepLogs,
      goals,
    };

    res.status(200).json({
      success: true,
      data: exportPayload,
    });
  } catch (error) {
    next(error);
  }
};
