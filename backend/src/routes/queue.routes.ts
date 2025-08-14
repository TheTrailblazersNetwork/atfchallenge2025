import express, { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticateOPDOperator } from '../middleware/authMiddleware';
import {
  getCurrentQueueController,
  updateQueueEntryController,
  getQueueStatsController,
  getNextPatientController,
  getCurrentPatientController,
  callNextPatientController,
  markPatientCompletedController
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

// Mark patient as completed (updates both queue and appointment)
router.post('/:id/complete', [
  param('id').isInt().withMessage('Queue ID must be a valid integer')
], markPatientCompletedController);

// Update queue entry status
router.put('/:id', [
  param('id').isInt().withMessage('Queue ID must be a valid integer'),
  body('status').isIn(['approved', 'in_progress', 'completed', 'unavailable'])
    .withMessage('Status must be one of: approved, in_progress, completed, unavailable')
], updateQueueEntryController);

export default router;
