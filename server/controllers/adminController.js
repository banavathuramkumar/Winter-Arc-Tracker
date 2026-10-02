import EmailLog from '../models/EmailLog.js';
import User from '../models/User.js';

/**
 * @route   GET /api/admin/email-stats
 * @desc    Get email delivery stats (only accessible to admin — banavathuramkumar@gmail.com)
 * @access  Private + Admin only
 */
export const getEmailStats = async (req, res, next) => {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'banavathuramkumar@gmail.com';
    if (req.user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOf7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const startOf30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // --- Overview counts ---
    const [totalSent, totalDelivered, totalFailed, sentToday, sentLast7, sentLast30] = await Promise.all([
      EmailLog.countDocuments(),
      EmailLog.countDocuments({ sentLive: true }),
      EmailLog.countDocuments({ sentLive: false }),
      EmailLog.countDocuments({ createdAt: { $gte: startOfToday } }),
      EmailLog.countDocuments({ createdAt: { $gte: startOf7Days } }),
      EmailLog.countDocuments({ createdAt: { $gte: startOf30Days } }),
    ]);

    // --- Breakdown by email type ---
    const byType = await EmailLog.aggregate([
      { $group: { _id: '$type', total: { $sum: 1 }, delivered: { $sum: { $cond: ['$sentLive', 1, 0] } } } },
      { $sort: { total: -1 } },
    ]);

    // --- Breakdown by provider ---
    const byProvider = await EmailLog.aggregate([
      { $group: { _id: '$provider', total: { $sum: 1 }, delivered: { $sum: { $cond: ['$sentLive', 1, 0] } } } },
      { $sort: { total: -1 } },
    ]);

    // --- Unique users who received at least 1 live email ---
    const uniqueUsersDelivered = await EmailLog.distinct('userId', { sentLive: true, userId: { $ne: null } });

    // --- Total registered users with reminders enabled ---
    const totalUsersWithReminders = await User.countDocuments({
      'notificationSettings.dailyReminder': true,
      onboarded: true,
    });

    // --- Recent 20 email logs ---
    const recentLogs = await EmailLog.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'name email')
      .lean();

    // --- Per-day delivery count (last 7 days) ---
    const dailyTrend = await EmailLog.aggregate([
      { $match: { createdAt: { $gte: startOf7Days }, sentLive: true } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        overview: {
          totalSent,
          totalDelivered,
          totalFailed,
          deliveryRate: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0,
          sentToday,
          sentLast7Days: sentLast7,
          sentLast30Days: sentLast30,
          uniqueUsersReached: uniqueUsersDelivered.length,
          totalUsersWithReminders,
        },
        byType,
        byProvider,
        dailyTrend,
        recentLogs: recentLogs.map((log) => ({
          id: log._id,
          user: log.userId ? { name: log.userId.name, email: log.userId.email } : { name: 'Unknown', email: log.recipientEmail },
          recipientEmail: log.recipientEmail,
          type: log.type,
          provider: log.provider,
          sentLive: log.sentLive,
          subject: log.subject,
          error: log.error,
          sentAt: log.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
