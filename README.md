# ❄️ WINTER ARC TRACKER — Full-Stack MERN Application

> **"Build discipline. Track the grind. Become the version you want."**

Winter Arc Tracker is a premium personal discipline web application inspired by the classic physical Winter Arc habit and sleep tracking protocols.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, JavaScript (ES6+), Tailwind CSS, React Router v6, Axios, Recharts, Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express.js (ES Modules), Mongoose, JWT, bcryptjs, Helmet, CORS, Express Rate Limit, Node Cron, Resend.
- **Database**: MongoDB (Atlas or local).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas connection string)

### 2. Backend Setup
```bash
cd server
npm install
# Configure your .env file
npm run seed     # (Optional) Seeds demo account: demo@winterarc.com / password123
npm run dev      # Starts server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 📱 Features

1. **Dashboard (`/dashboard`)**:
   - Live greeting, current date, and active streak counter (current & longest).
   - Today's habit progress percentage with dynamic progress bar.
   - Interactive checklist saving habit completions to MongoDB in real time.
   - **❄ Perfect Day** celebration banner and snowflake animations.
   - **Winter Arc Score (0–100)**: Habits (50%), Sleep Consistency (25%), Goals (25%).
   - Monthly calendar with interactive status indicators (✓ Perfect, ◐ Partial, ○ None).

2. **Habit Matrix (`/habits`)**:
   - Monthly 1–31 grid tracker with sticky habit names column for mobile & desktop.
   - Click any cell to toggle daily completion.
   - Add, edit, archive, and delete habits.

3. **Sleep Matrix & Graph (`/sleep`)**:
   - Dot Matrix tracking inspired by the paper template (4h to 10h).
   - Interactive Recharts line graph comparing daily sleep vs sleep goal.
   - Metrics: Average sleep, goal, best sleep, lowest sleep, days logged.

4. **Monthly Goals (`/goals`)**:
   - Monthly quantifiable targets (e.g. 100 DSA problems, 3 books, 50 km).
   - Quick progress increments (+1, +5, custom amount), progress bar, edit and delete.

5. **Insights & Analytics (`/insights`)**:
   - 30-day habit completion area chart.
   - Sleep duration vs target line chart.
   - Day-of-week weekly consistency bar chart.

6. **Email Notifications & Scheduling (`node-cron` & Resend)**:
   - Smart daily check-in sent at user's chosen local time if habits remain uncompleted.
   - Weekly discipline review sent on Sunday evenings.
   - Monthly Arc summary sent on the 1st of each month.

7. **Settings & Data Sovereignty (`/settings`)**:
   - Theme toggle (Dark Mode, Light Mode, System).
   - Timezone configuration.
   - **Export My Data**: 1-click JSON or CSV download.
   - Permanent account deletion with cascade cleanup.

---

## 🔒 Security & Best Practices

- Password hashing using `bcryptjs` (salt rounds: 10).
- Stateless JWT authentication with Bearer token header authorization.
- Rate limiting on authentication and API routes with `express-rate-limit`.
- Security headers enabled with `helmet`.
- Strict user-isolated queries ensuring data privacy.

---

## 🌐 Deployment

### Frontend → Vercel
1. Set root directory to `client`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Environment variable: `VITE_API_URL=https://your-render-api.onrender.com/api`.

### Backend → Render
1. Set root directory to `server`.
2. Build command: `npm install`.
3. Start command: `node server.js`.
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `RESEND_API_KEY`, `EMAIL_FROM`.
