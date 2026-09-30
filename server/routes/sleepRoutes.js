import express from 'express';
import {
  getSleepLogs,
  logSleep,
  updateSleep,
  deleteSleep,
} from '../controllers/sleepController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSleepLogs)
  .post(logSleep);

router.route('/:id')
  .patch(updateSleep)
  .delete(deleteSleep);

export default router;
