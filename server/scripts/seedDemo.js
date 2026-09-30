import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import SleepLog from '../models/SleepLog.js';
import Goal from '../models/Goal.js';
import { getLocalDateString } from '../services/streakService.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/winter-arc';
    console.log(`[Seed] Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    const demoEmail = 'demo@winterarc.com';

    // Remove existing demo user if present
    const existingUser = await User.findOne({ email: demoEmail });
    if (existingUser) {
      console.log('[Seed] Cleaning up existing demo data...');
      await Habit.deleteMany({ userId: existingUser._id });
      await HabitLog.deleteMany({ userId: existingUser._id });
      await SleepLog.deleteMany({ userId: existingUser._id });
      await Goal.deleteMany({ userId: existingUser._id });
      await User.findByIdAndDelete(existingUser._id);
    }

    // Create demo user
    console.log('[Seed] Creating demo user...');
    const demoUser = await User.create({
      name: 'Demo Warrior',
      email: demoEmail,
      password: 'password123',
      timezone: 'Asia/Kolkata',
      sleepGoal: 8,
      focusAreas: ['Coding', 'Fitness', 'Study', 'Reading'],
      onboarded: true,
      notificationSettings: {
        dailyReminder: true,
        reminderTime: '21:00',
        weeklySummary: true,
        monthlySummary: true,
      },
    });

    // Create habits
    console.log('[Seed] Creating standard habits...');
    const habitsData = [
      { name: 'Study / Deep Work', icon: '📚', category: 'Study', order: 0 },
      { name: 'Coding & Projects', icon: '💻', category: 'Coding', order: 1 },
      { name: 'DSA Practice', icon: '🧠', category: 'Coding', order: 2 },
      { name: 'Reading 20 Pages', icon: '📖', category: 'Reading', order: 3 },
      { name: 'Workout / Gym', icon: '🏃', category: 'Fitness', order: 4 },
      { name: 'Meditation & Focus', icon: '🧘', category: 'Mindset', order: 5 },
      { name: 'Drink 3L Water', icon: '💧', category: 'Health', order: 6 },
    ];

    const habits = [];
    for (const h of habitsData) {
      const habit = await Habit.create({
        userId: demoUser._id,
        ...h,
        active: true,
      });
      habits.push(habit);
    }

    // Create 14 days of realistic historical habit logs and sleep logs
    console.log('[Seed] Generating 14-day history for habits and sleep...');
    const now = new Date();
    const currentMonth = getLocalDateString(now, demoUser.timezone).substring(0, 7);

    for (let i = 13; i >= 0; i--) {
      const dayDate = new Date();
      dayDate.setDate(now.getDate() - i);
      const dateStr = getLocalDateString(dayDate, demoUser.timezone);

      // Log habits (create realistic streak of ~12 days)
      const isCompleteDay = i !== 13 && i !== 7; // days when most or all completed
      for (const habit of habits) {
        // High completion chance
        const isCompleted = isCompleteDay || Math.random() > 0.25;
        if (isCompleted) {
          await HabitLog.create({
            userId: demoUser._id,
            habitId: habit._id,
            date: dateStr,
            completed: true,
          });
        }
      }

      // Log sleep (between 6.5 and 9 hours)
      const sleepHours = [7, 7.5, 8, 8.5, 6.5, 8, 7.5, 9, 8, 7.5, 8, 8.5, 7.5, 8][i % 14];
      await SleepLog.create({
        userId: demoUser._id,
        date: dateStr,
        duration: sleepHours,
        quality: sleepHours >= 8 ? 5 : 4,
        notes: sleepHours >= 8 ? 'Great deep sleep' : 'Solid recovery',
      });
    }

    // Create Goals
    console.log('[Seed] Creating monthly goals...');
    await Goal.create([
      {
        userId: demoUser._id,
        title: 'Solve DSA LeetCode Problems',
        description: 'Complete NeetCode 150 roadmap for placement preparation',
        target: 100,
        progress: 68,
        unit: 'problems',
        month: currentMonth,
        completed: false,
      },
      {
        userId: demoUser._id,
        title: 'Finish 3 Books',
        description: 'Deep Work, Atomic Habits, Can\'t Hurt Me',
        target: 3,
        progress: 2,
        unit: 'books',
        month: currentMonth,
        completed: false,
      },
      {
        userId: demoUser._id,
        title: 'Morning Gym Sessions',
        description: 'Hit the weight room 5 days a week',
        target: 22,
        progress: 18,
        unit: 'sessions',
        month: currentMonth,
        completed: false,
      },
      {
        userId: demoUser._id,
        title: 'Run Distance Target',
        description: 'Weekly cardio runs',
        target: 50,
        progress: 50,
        unit: 'km',
        month: currentMonth,
        completed: true,
      },
    ]);

    console.log('\n=========================================');
    console.log('✅ Demo data seeded successfully!');
    console.log(`Demo Account Credentials:`);
    console.log(`Email:    ${demoEmail}`);
    console.log(`Password: password123`);
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
