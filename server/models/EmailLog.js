import mongoose from 'mongoose';

/**
 * Stores a record for every email dispatch attempt made by the system.
 * Allows admin to see delivery stats, provider breakdown, and per-user history.
 */
const emailLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for system-level or anonymous sends
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['daily_reminder', 'weekly_summary', 'monthly_summary', 'password_reset', 'test'],
      default: 'daily_reminder',
    },
    subject: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      enum: ['brevo', 'resend', 'gmail', 'mock', 'unknown'],
      default: 'unknown',
    },
    sentLive: {
      type: Boolean,
      default: false,
    },
    success: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },
    messageId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt = when the send was attempted
  }
);

// Index for fast queries by date, user, type
emailLogSchema.index({ createdAt: -1 });
emailLogSchema.index({ userId: 1, createdAt: -1 });
emailLogSchema.index({ type: 1, sentLive: 1 });

const EmailLog = mongoose.model('EmailLog', emailLogSchema);
export default EmailLog;
