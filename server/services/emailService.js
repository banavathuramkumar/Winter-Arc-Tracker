import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Helper to get Nodemailer Gmail Transporter
const getGmailTransporter = () => {
  const user = (process.env.GMAIL_USER || process.env.SMTP_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '').trim().replace(/\s+/g, '');
  if (user && pass) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
    });
  }
  return null;
};

// Helper to get Resend Client
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() : '';
  if (apiKey && apiKey.length > 5) {
    return new Resend(apiKey);
  }
  return null;
};

/**
 * Universal dispatcher that automatically chooses Gmail SMTP or Resend
 */
const dispatchEmail = async ({ to, subject, html }) => {
  const gmailTransporter = getGmailTransporter();
  const resendClient = getResendClient();

  // 1. Try Gmail SMTP first (no custom domain needed, sends to ANY user for free)
  if (gmailTransporter) {
    try {
      const gmailUser = (process.env.GMAIL_USER || process.env.SMTP_USER).trim();
      const fromAddress = `"Winter Arc" <${gmailUser}>`;
      
      const info = await gmailTransporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
      });

      console.log(`[Email via Gmail SMTP] Delivered to ${to} (MessageId: ${info.messageId})`);
      return { success: true, sentLive: true, provider: 'gmail', messageId: info.messageId };
    } catch (error) {
      console.error(`[Gmail SMTP Error] Failed delivering to ${to}:`, error.message);
      return { success: false, sentLive: false, provider: 'gmail', error: error.message };
    }
  }

  // 2. Fallback to Resend API
  if (resendClient) {
    try {
      const response = await resendClient.emails.send({
        from: process.env.EMAIL_FROM || 'Winter Arc <onboarding@resend.dev>',
        to,
        subject,
        html,
      });

      if (response.error) {
        console.error(`[Resend API Error]:`, response.error);
        return {
          success: false,
          sentLive: false,
          provider: 'resend',
          error: response.error.message || JSON.stringify(response.error),
        };
      }

      console.log(`[Email via Resend] Delivered to ${to} (ID: ${response.data?.id})`);
      return { success: true, sentLive: true, provider: 'resend', id: response.data?.id };
    } catch (error) {
      console.error(`[Resend Error] Failed delivering to ${to}:`, error.message);
      return { success: false, sentLive: false, provider: 'resend', error: error.message };
    }
  }

  // 3. Fallback: Mock / Development Mode
  console.log(`[Email Mock] ${subject} generated for ${to}`);
  return { success: true, sentLive: false, provider: 'mock' };
};

const getEmailTemplate = (title, contentHtml) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #090d16;
      color: #f1f5f9;
      margin: 0;
      padding: 24px;
    }
    .card {
      max-width: 540px;
      margin: 0 auto;
      background-color: #111827;
      border: 1px solid #1f293d;
      border-radius: 12px;
      padding: 32px 28px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      background-color: rgba(56, 189, 248, 0.12);
      color: #38bdf8;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 12px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #94a3b8;
      margin: 12px 0;
    }
    .stat-box {
      background-color: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: #cbd5e1;
    }
    .stat-value {
      font-weight: 600;
      color: #38bdf8;
    }
    .button {
      display: inline-block;
      background-color: #38bdf8;
      color: #090d16 !important;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 24px;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">❄️ Winter Arc</div>
    ${contentHtml}
    <div class="footer">
      Winter Arc Tracker • Build discipline. Track the grind.
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Send smart daily reminder
 */
export const sendDailyReminder = async ({ user, completedCount, totalActive, sleepLogged, streak }) => {
  const clientUrl = process.env.CLIENT_URL || 'https://your-winter-arc-tracker.netlify.app';
  const remaining = totalActive - completedCount;

  let messageContent = '';
  let subject = '❄️ Your Winter Arc check-in';

  if (remaining === 0 && sleepLogged) {
    subject = '❄️ Perfect Day Achieved! — Winter Arc';
    messageContent = `
      <h1>❄️ Perfect Day Achieved!</h1>
      <p>Hey ${user.name},</p>
      <p>Outstanding work today! You completed all <strong>${totalActive}</strong> of your habits and logged your sleep.</p>
      <div class="stat-box">
        <div class="stat-row"><span>Today's Progress</span><span class="stat-value">100% (${completedCount}/${totalActive})</span></div>
        <div class="stat-row"><span>Current Streak</span><span class="stat-value">🔥 ${streak} days</span></div>
        <div class="stat-row"><span>Sleep Status</span><span class="stat-value">✓ Logged</span></div>
      </div>
      <p>Keep showing up tomorrow.</p>
      <a href="${clientUrl}/dashboard" class="button">Open Winter Arc</a>
    `;
  } else {
    let reminders = [];
    if (remaining > 0) {
      reminders.push(`You still have <strong>${remaining}</strong> habit${remaining > 1 ? 's' : ''} remaining today.`);
    }
    if (!sleepLogged) {
      reminders.push(`You haven't logged your sleep yet.`);
    }

    messageContent = `
      <h1>❄️ Your Winter Arc check-in</h1>
      <p>Hey ${user.name},</p>
      <p>Your Winter Arc check-in is waiting.</p>
      <div class="stat-box">
        <div class="stat-row"><span>Today's progress</span><span class="stat-value">${completedCount} / ${totalActive} habits completed</span></div>
        <div class="stat-row"><span>Current streak</span><span class="stat-value">🔥 ${streak} days</span></div>
        <div class="stat-row"><span>Sleep</span><span class="stat-value">${sleepLogged ? '✓ Logged' : '○ Not logged'}</span></div>
      </div>
      <p>${reminders.join(' ')} Finish before the day ends.</p>
      <a href="${clientUrl}/dashboard" class="button">Open Winter Arc</a>
      <p style="margin-top: 16px; font-style: italic;">Keep showing up.</p>
    `;
  }

  const html = getEmailTemplate('Your Winter Arc Check-in', messageContent);
  const result = await dispatchEmail({ to: user.email, subject, html });

  return {
    success: true,
    sentLive: result.sentLive,
    provider: result.provider,
    error: result.error,
    preview: {
      to: user.email,
      subject,
      remaining,
      streak,
      html,
    },
  };
};

/**
 * Send weekly summary
 */
export const sendWeeklySummary = async ({ user, stats }) => {
  const clientUrl = process.env.CLIENT_URL || 'https://your-winter-arc-tracker.netlify.app';
  const { habitCompletionPct, averageSleepHours, currentStreak, longestStreak, goalsCount, score } = stats;

  const messageContent = `
    <h1>❄️ Your Winter Arc — Weekly Review</h1>
    <p>Hey ${user.name},</p>
    <p>Here is your discipline summary for the past 7 days:</p>
    <div class="stat-box">
      <div class="stat-row"><span>Winter Arc Score</span><span class="stat-value"><strong>${score} / 100</strong></span></div>
      <div class="stat-row"><span>Habit Completion</span><span class="stat-value">${habitCompletionPct}%</span></div>
      <div class="stat-row"><span>Average Sleep</span><span class="stat-value">${averageSleepHours}h</span></div>
      <div class="stat-row"><span>Current Streak</span><span class="stat-value">🔥 ${currentStreak} days</span></div>
      <div class="stat-row"><span>Longest Streak</span><span class="stat-value">🏆 ${longestStreak} days</span></div>
      <div class="stat-row"><span>Goals Active</span><span class="stat-value">${goalsCount}</span></div>
    </div>
    <p>Consistency is built day by day. Let's make next week even stronger.</p>
    <a href="${clientUrl}/insights" class="button">View Full Insights</a>
  `;

  const html = getEmailTemplate('Your Winter Arc — Weekly Review', messageContent);
  return await dispatchEmail({ to: user.email, subject: '❄️ Your Winter Arc — Weekly Review', html });
};

/**
 * Send monthly summary
 */
export const sendMonthlySummary = async ({ user, stats }) => {
  const clientUrl = process.env.CLIENT_URL || 'https://your-winter-arc-tracker.netlify.app';
  const { monthName, score, perfectDaysCount, totalHabitsDone, avgSleep } = stats;

  const messageContent = `
    <h1>❄️ Monthly Arc Summary — ${monthName}</h1>
    <p>Hey ${user.name},</p>
    <p>Another month of relentless discipline is in the books.</p>
    <div class="stat-box">
      <div class="stat-row"><span>Final Winter Arc Score</span><span class="stat-value"><strong>${score} / 100</strong></span></div>
      <div class="stat-row"><span>Perfect Days</span><span class="stat-value">❄️ ${perfectDaysCount}</span></div>
      <div class="stat-row"><span>Total Habits Checked</span><span class="stat-value">✓ ${totalHabitsDone}</span></div>
      <div class="stat-row"><span>Average Sleep</span><span class="stat-value">${avgSleep}h</span></div>
    </div>
    <p>Your Winter Arc continues. Set your new monthly goals now.</p>
    <a href="${clientUrl}/goals" class="button">Set Next Month's Goals</a>
  `;

  const html = getEmailTemplate(`Monthly Summary — ${monthName}`, messageContent);
  return await dispatchEmail({ to: user.email, subject: `❄️ Your Winter Arc — ${monthName} Summary`, html });
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async ({ user, resetUrl }) => {
  const messageContent = `
    <h1>Password Reset Request</h1>
    <p>Hey ${user.name},</p>
    <p>You requested to reset your password for your Winter Arc Tracker account.</p>
    <p>Please click the button below to set a new password. This link is valid for 1 hour.</p>
    <a href="${resetUrl}" class="button">Reset My Password</a>
    <p style="margin-top: 20px; font-size: 13px; color: #64748b;">If you did not request this, you can safely ignore this email.</p>
  `;

  const html = getEmailTemplate('Reset Your Password', messageContent);
  return await dispatchEmail({ to: user.email, subject: '🔒 Reset your Winter Arc password', html });
};
