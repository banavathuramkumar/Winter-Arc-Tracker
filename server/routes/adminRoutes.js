import express from 'express';
import { getEmailStats } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/email-stats', getEmailStats);

export default router;
