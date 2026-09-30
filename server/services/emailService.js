import { Resend } from 'resend';

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() : '';
  if (apiKey && apiKey.length > 5) {
    return new Resend(apiKey);
  }
  return null;
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
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const remaining = totalActive - completedCount;

  // Smart check: If all completed and sleep logged, send congratulations instead of reminder
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
  const resendClient = getResendClient();

  try {
    let sentLive = false;
    let apiError = null;

    if (resendClient) {
      const response = await resendClient.emails.send({
        from: process.env.EMAIL_FROM || 'Winter Arc <onboarding@resend.dev>',
        to: user.email,
        subject,
        html,
      });

      if (response.error) {
        console.error(`[Email Error from Resend API]:`, response.error);
        apiError = response.error.message || JSON.stringify(response.error);
      } else {
        sentLive = true;
        console.log(`[Email] Daily reminder sent successfully via Resend to ${user.email} (ID: ${response.data?.id})`);
      }
    } else {
      console.log(`[Email Mock] Daily reminder generated for ${user.email}: ${remaining} habits remaining, streak ${streak}`);
    }

    return {
      success: true,
      sentLive,
      error: apiError,
      preview: {
        to: user.email,
        subject,
        remaining,
        streak,
        html,
      },
    };
  } catch (error) {
    console.error(`[Email Error] Failed sending daily reminder to ${user.email}:`, error.message);
    return {
      success: true,
      sentLive: false,
      error: error.message,
      preview: {
        to: user.email,
        subject,
        remaining,
        streak,
        html,
      },
    };
  }
};

/**
 * Send weekly summary
 */
export const sendWeeklySummary = async ({ user, stats }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
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
  const resendClient = getResendClient();

  try {
    if (resendClient) {
      await resendClient.emails.send({
        from: process.env.EMAIL_FROM || 'Winter Arc <onboarding@resend.dev>',
        to: user.email,
        subject: '❄️ Your Winter Arc — Weekly Review',
        html,
      });
      console.log(`[Email] Weekly summary sent to ${user.email}`);
    } else {
      console.log(`[Email Mock] Weekly summary would be sent to ${user.email}: score ${score}`);
    }
    return { success: true };
  } catch (error) {
    console.error(`[Email Error] Failed sending weekly summary to ${user.email}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send monthly summary
 */
export const sendMonthlySummary = async ({ user, stats }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
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
  const resendClient = getResendClient();

  try {
    if (resendClient) {
      await resendClient.emails.send({
        from: process.env.EMAIL_FROM || 'Winter Arc <onboarding@resend.dev>',
        to: user.email,
        subject: `❄️ Your Winter Arc — ${monthName} Summary`,
        html,
      });
      console.log(`[Email] Monthly summary sent to ${user.email}`);
    } else {
      console.log(`[Email Mock] Monthly summary would be sent to ${user.email}`);
    }
    return { success: true };
  } catch (error) {
    console.error(`[Email Error] Failed sending monthly summary to ${user.email}:`, error.message);
    return { success: false, error: error.message };
  }
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
  const resendClient = getResendClient();

  try {
    if (resendClient) {
      await resendClient.emails.send({
        from: process.env.EMAIL_FROM || 'Winter Arc <onboarding@resend.dev>',
        to: user.email,
        subject: '🔒 Reset your Winter Arc password',
        html,
      });
      console.log(`[Email] Password reset sent to ${user.email}`);
    } else {
      console.log(`[Email Mock] Password reset link for ${user.email}: ${resetUrl}`);
    }
    return { success: true };
  } catch (error) {
    console.error(`[Email Error] Failed sending reset email:`, error.message);
    return { success: false, error: error.message };
  }
};
