import express from 'express';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
} from '../controllers/habitController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All habit routes require authentication

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.route('/:id')
  .patch(updateHabit)
  .delete(deleteHabit);

export default router;
