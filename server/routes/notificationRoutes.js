import express from 'express';
import {
  getPreferences,
  updatePreferences,
  sendTestEmail,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/preferences', getPreferences);
router.patch('/preferences', updatePreferences);
router.post('/test-email', sendTestEmail);

export default router;
