import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { initCronJobs } from './jobs/cronScheduler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import habitLogRoutes from './routes/habitLogRoutes.js';
import sleepRoutes from './routes/sleepRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import insightsRoutes from './routes/insightsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Initialize Express App
const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: true, // Dynamically reflect request origin for full CORS & credentials support
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general API Rate Limiter
app.use('/api', apiLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'Winter Arc Tracker API',
    timestamp: new Date().toISOString(),
  });
});

// Root entry point check
app.get('/', (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return next();
  }
  res.status(200).json({
    status: 'online',
    message: 'Winter Arc Tracker API is running',
  });
});

// Helper to mount routes with and without /api prefix
const mountAppRoutes = (prefix = '') => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/habits`, habitRoutes);
  app.use(`${prefix}/habit-logs`, habitLogRoutes);
  app.use(`${prefix}/sleep`, sleepRoutes);
  app.use(`${prefix}/goals`, goalRoutes);
  app.use(`${prefix}/dashboard`, dashboardRoutes);
  app.use(`${prefix}/insights`, insightsRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
};

// Mount both for universal compatibility
mountAppRoutes('/api');
mountAppRoutes('');

// Production Static Serving (Full-stack Monolith or fallback)
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.resolve(__dirname, '../client/dist');
  app.use(express.static(clientDistPath));

  // Catch-all handler for SPA in Express 5
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ success: false, message: `API route not found: ${req.originalUrl}` });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
      if (err) {
        // If client/dist is not deployed on the same server, return API alive message
        res.status(200).json({
          status: 'online',
          app: 'Winter Arc Tracker API',
          message: 'Backend API service is running. Connect frontend to /api endpoints.',
        });
      }
    });
  });
} else {
  // 404 Route Handler in development
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
  });
}

// Centralized Error Handling Middleware
app.use(errorHandler);

// Initialize scheduled background jobs
initCronJobs();

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[Server] Winter Arc Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]:', err.message);
});

export default app;
