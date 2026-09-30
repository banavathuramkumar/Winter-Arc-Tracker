import mongoose from 'mongoose';

const sleepLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Canonical date formatted as YYYY-MM-DD representing the night/morning
    date: {
      type: String,
      required: true,
      index: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    duration: {
      type: Number,
      required: [true, 'Sleep duration is required'],
      min: [0, 'Duration cannot be negative'],
      max: [24, 'Duration cannot exceed 24 hours'],
    },
    quality: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [200, 'Notes cannot exceed 200 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// One sleep entry per user per date
sleepLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const SleepLog = mongoose.model('SleepLog', sleepLogSchema);
export default SleepLog;
