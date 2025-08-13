import express, { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticateOPDOperator } from '../middleware/authMiddleware';
import {
  getCurrentQueueController,
  updateQueueEntryController,
  getQueueStatsController,
  getNextPatientController,
  getCurrentPatientController,
  callNextPatientController
} from '../controllers/queue.controller';

const router: Router = express.Router();

// Apply OPD operator authentication to all queue routes
router.use(authenticateOPDOperator);

// Get current queue for today
router.get('/', getCurrentQueueController);

// Get queue statistics
router.get('/stats', getQueueStatsController);

// Get next patient in queue
router.get('/next', getNextPatientController);

// Get current patient being served
router.get('/current', getCurrentPatientController);

// Call next patient (move to in_progress)
router.post('/call-next', callNextPatientController);

// Update queue entry status
router.put('/:id', [
  param('id').isInt().withMessage('Queue ID must be a valid integer'),
  body('status').isIn(['approved', 'in_progress', 'completed', 'unavailable'])
    .withMessage('Status must be one of: approved, in_progress, completed, unavailable')
], updateQueueEntryController);

export default router;
