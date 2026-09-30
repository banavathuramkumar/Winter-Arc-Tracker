import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a habit name'],
      trim: true,
      maxlength: [80, 'Habit name cannot exceed 80 characters'],
    },
    icon: {
      type: String,
      default: '⚡',
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries by user and active status
habitSchema.index({ userId: 1, active: 1, archived: 1 });

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
