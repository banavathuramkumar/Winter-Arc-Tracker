import express from 'express';
import {
  getHabitLogs,
  toggleHabitLog,
} from '../controllers/habitLogController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getHabitLogs)
  .post(toggleHabitLog);

export default router;
