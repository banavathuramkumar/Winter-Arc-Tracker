import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Hidden by default on queries
    },
    timezone: {
      type: String,
      default: 'UTC',
      trim: true,
    },
    sleepGoal: {
      type: Number,
      default: 8,
      min: [4, 'Sleep goal must be at least 4 hours'],
      max: [14, 'Sleep goal cannot exceed 14 hours'],
    },
    focusAreas: {
      type: [String],
      default: [],
    },
    onboarded: {
      type: Boolean,
      default: false,
    },
    themePreference: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    notificationSettings: {
      dailyReminder: {
        type: Boolean,
        default: true,
      },
      reminderTime: {
        type: String,
        default: '21:00', // 9:00 PM format HH:mm
      },
      weeklySummary: {
        type: Boolean,
        default: true,
      },
      monthlySummary: {
        type: Boolean,
        default: true,
      },
    },
    lastReminderSentDate: {
      type: String,
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
