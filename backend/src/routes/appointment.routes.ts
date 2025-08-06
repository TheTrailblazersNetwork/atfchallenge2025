// src/routes/appointment.routes.ts
import express, { Router } from 'express';
import { 
  createAppointment,
  getPatientAppointmentsController,
  getAppointmentByIdController,
  updateAppointmentController,
  cancelAppointmentController
} from '../controllers/appointment.controller';
import { authenticateToken } from '../middleware/authMiddleware';
import { body, param } from 'express-validator';
//import { validate } from '../middleware/validation';

// --- Temporary route for manual testing of batch scheduling ---
import { runBatchScheduling } from '../jobs/batchScheduling.job'; 
// This route allows us to manually trigger the batch scheduling job for testing purposes.
// will be removed or disabled in production.

const router: Router = express.Router();

// All appointment routes require authentication
router.use(authenticateToken);

// --- TEMPORARY ROUTE FOR TESTING ---
router.post('/test-run-batch', authenticateToken, async (req, res) => {
  try {
    console.log("🧪 [MANUAL TRIGGER] Batch scheduling manually triggered via test endpoint.");
    await runBatchScheduling(); // Calls the main job function
    res.status(200).json({ success: true, message: 'Batch scheduling test run completed. Check server logs for details.' });
  } catch (error) {
    console.error("🧪 [MANUAL TRIGGER] Error during manual batch run:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: 'Manual batch run failed', details: errorMessage });
  }
});
// --- END TEMPORARY ROUTE ---

// Create new appointment
router.post('/', [
  body('medical_description').notEmpty().withMessage('Medical description is required'),
  body('visiting_status').notEmpty().withMessage('Visiting status is required')
    .isIn([
      'discharged_inpatient_2weeks',
      'discharged_inpatient_1week', 
      'external_referral',
      'internal_referral',
      'review_patient'
    ])
],  createAppointment);

// Get all appointments for logged-in patient
router.get('/', getPatientAppointmentsController);

// Get specific appointment by ID
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid appointment ID')
],  getAppointmentByIdController);

// Update appointment (limited fields)
router.put('/:id', [
  param('id').isUUID().withMessage('Invalid appointment ID'),
  body('medical_description').optional().notEmpty().withMessage('Medical description cannot be empty')
], updateAppointmentController);


// Cancel appointment
router.delete('/:id', [
  param('id').isUUID().withMessage('Invalid appointment ID')
],  cancelAppointmentController);

export default router;