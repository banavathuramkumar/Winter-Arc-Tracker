# ❄️ WINTER ARC TRACKER — Full-Stack MERN Application

> **"Build discipline. Track the grind. Become the version you want."**

Winter Arc Tracker is a personal discipline web application inspired by the physical Winter Arc habit and sleep tracking protocols.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, JavaScript (ES6+), Tailwind CSS, React Router v6, Axios, Recharts, Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express.js (ES Modules, v5), Mongoose, JWT, bcryptjs, Helmet, CORS, Express Rate Limit, Node Cron, Resend.
- **Database**: MongoDB Atlas Cloud (or local MongoDB).
- **Hosting**:
  - **Frontend**: [Netlify](https://www.netlify.com/)
  - **Backend**: [Render](https://render.com/)

---

## 🚀 Quick Start Guide (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas connection string)

### 2. Backend Setup
```bash
cd server
npm install
# Configure your server/.env file (see .env.example)
npm run seed     # (Optional) Seeds demo account: demo@winterarc.com / password123
npm run dev      # Starts backend server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 📱 Features

1. **Winter Arc Initiation & Onboarding (`/onboarding`)**:
   - Streamlined 3-step setup (Focus Areas, Precision Sleep Target, and Daily Check-in Time).
   - Pixel-perfect aligned sleep slider with precision stepper controls (`-` / `+`) and quick-select chips (`6h`–`9h`).

2. **Command Dashboard (`/dashboard`)**:
   - Live greeting, current date, active streak counter (current & longest).
   - Today's habit progress percentage with dynamic progress bar.
   - Interactive checklist saving habit completions to MongoDB in real time.
   - **❄️ Perfect Day** celebration banner and snowflake animations.
   - **Sleep Recovery Hub** showing today's sleep vs target window.
   - Monthly calendar with interactive status indicators (✓ Perfect, ◐ Partial, ○ None) and Day Detail modal.
   - Active Monthly Goals with 1-click progress increments (`+1`, `+5`, custom), inline editing (✏️), and deletion (🗑️).

3. **31-Day Habit Matrix (`/habits`)**:
   - Monthly 1–31 grid tracker with sticky habit names column for mobile & desktop.
   - Click any cell to toggle daily completion.
   - Add, edit, archive, and delete habits.

4. **Sleep Matrix & Recovery Graph (`/sleep`)**:
   - Dot Matrix tracking inspired by the paper template (4h to 10h).
   - Interactive Recharts line graph comparing daily sleep vs target.
   - Metrics: Average sleep, target goal, best sleep, lowest sleep, days logged.

5. **Monthly Goals (`/goals`)**:
   - Monthly quantifiable targets (e.g. 100 DSA problems, 3 books, 50 km).
   - Quick progress increments, dynamic completion percentage bar, edit, and delete actions.

6. **Insights & Analytics (`/insights`)**:
   - 30-day habit completion area chart.
   - Sleep duration vs target line chart.
   - Day-of-week weekly consistency bar chart.

7. **Automated Notifications & Reminders (`node-cron` & Resend)**:
   - Smart daily check-in sent at user's chosen local time if habits remain uncompleted.
   - Weekly discipline review sent on Sunday evenings.
   - Monthly Arc summary sent on the 1st of each month.
   - Live Email Preview modal & test dispatch in Settings.

8. **Settings & Customization (`/settings`)**:
   - Clean Dark Mode and Light Mode switcher.
   - Timezone configuration with India Standard Time (IST — Asia/Kolkata GMT+5:30) and global timezones.
   - Password update & secure in-app Account Deletion with confirmation.
   - **Export My Data**: 1-click JSON or CSV download.

---

## 🔒 Security & Architecture

- **Password Hashing**: `bcryptjs` with salt rounds = 10.
- **Stateless Authentication**: JWT Bearer tokens with 30-day persistence.
- **Rate Limiting**: `express-rate-limit` on authentication and API endpoints.
- **Security Headers**: `helmet` enabled.
- **Data Privacy**: Strict user-isolated queries.

---

## 🌐 Production Deployment

### 1. Frontend → Netlify
1. Connect repository on [Netlify](https://app.netlify.com/).
2. Base directory: `client` | Build command: `npm run build` | Publish directory: `dist`.
3. Add Environment Variable:
   - `VITE_API_URL` = `https://<your-render-backend-name>.onrender.com/api`
4. Netlify automatically utilizes `netlify.toml` and `client/public/_redirects` for seamless SPA routing without 404 errors.

### 2. Backend → Render
1. Create a Web Service on [Render](https://render.com/).
2. Root directory: `server` | Build command: `npm install` | Start command: `npm start`.
3. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `mongodb+srv://<user>:<password>@cluster.mongodb.net/winter-arc`
   - `JWT_SECRET` = `<your-jwt-secret>`
   - `JWT_EXPIRE` = `30d`
   - `CLIENT_URL` = `https://<your-netlify-app-name>.netlify.app`
   - `RESEND_API_KEY` = `re_<your-resend-key>`
   - `EMAIL_FROM` = `Winter Arc <onboarding@resend.dev>`
