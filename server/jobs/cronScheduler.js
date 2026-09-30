import cron from 'node-cron';
import { runDailyReminderCheck } from './dailyReminderJob.js';
import { runWeeklySummaryCheck } from './weeklySummaryJob.js';
import { runMonthlySummaryCheck } from './monthlySummaryJob.js';

/**
 * Initializes all node-cron background jobs.
 */
export const initCronJobs = () => {
  console.log('[Cron] Initializing scheduled background jobs...');

  // Run daily check every 30 minutes to capture user-specific reminder hours
  cron.schedule('*/30 * * * *', async () => {
    await runDailyReminderCheck();
  });

  // Run weekly summary check every Sunday at 20:00 (8:00 PM) UTC
  cron.schedule('0 20 * * 0', async () => {
    await runWeeklySummaryCheck();
  });

  // Run monthly summary check on the 1st of every month at 06:00 UTC
  cron.schedule('0 6 1 * *', async () => {
    await runMonthlySummaryCheck();
  });

  console.log('[Cron] Background jobs scheduled successfully.');
};
