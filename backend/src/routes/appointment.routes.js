"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/appointment.routes.ts
const express_1 = __importDefault(require("express"));
const appointment_controller_1 = require("../controllers/appointment.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const express_validator_1 = require("express-validator");
//import { validate } from '../middleware/validation';
// --- Temporary route for manual testing of batch scheduling ---
const batchScheduling_job_1 = require("../jobs/batchScheduling.job");
// This route allows us to manually trigger the batch scheduling job for testing purposes.
// will be removed or disabled in production.
const router = express_1.default.Router();
// All appointment routes require authentication
router.use(authMiddleware_1.authenticateToken);
// --- TEMPORARY ROUTE FOR TESTING ---
router.post('/test-run-batch', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🧪 [MANUAL TRIGGER] Batch scheduling manually triggered via test endpoint.");
        yield (0, batchScheduling_job_1.runBatchScheduling)(); // Calls the main job function
        res.status(200).json({ success: true, message: 'Batch scheduling test run completed. Check server logs for details.' });
    }
    catch (error) {
        console.error("🧪 [MANUAL TRIGGER] Error during manual batch run:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, error: 'Manual batch run failed', details: errorMessage });
    }
}));
// --- END TEMPORARY ROUTE ---
// Create new appointment
router.post('/', [
    (0, express_validator_1.body)('medical_description').notEmpty().withMessage('Medical description is required'),
    (0, express_validator_1.body)('visiting_status').notEmpty().withMessage('Visiting status is required')
        .isIn([
        'discharged_inpatient_2weeks',
        'discharged_inpatient_1week',
        'external_referral',
        'internal_referral',
        'review_patient'
    ])
], appointment_controller_1.createAppointment);
// Get all appointments for logged-in patient
router.get('/', appointment_controller_1.getPatientAppointmentsController);
// Get specific appointment by ID
router.get('/:id', [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid appointment ID')
], appointment_controller_1.getAppointmentByIdController);
// Update appointment (limited fields)
router.put('/:id', [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid appointment ID'),
    (0, express_validator_1.body)('medical_description').optional().notEmpty().withMessage('Medical description cannot be empty')
], appointment_controller_1.updateAppointmentController);
// Cancel appointment
router.delete('/:id', [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid appointment ID')
], appointment_controller_1.cancelAppointmentController);
exports.default = router;
