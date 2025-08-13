"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authMiddleware_1 = require("../middleware/authMiddleware");
const queue_controller_1 = require("../controllers/queue.controller");
const router = express_1.default.Router();
// Apply OPD operator authentication to all queue routes
router.use(authMiddleware_1.authenticateOPDOperator);
// Get current queue for today
router.get('/', queue_controller_1.getCurrentQueueController);
// Get queue statistics
router.get('/stats', queue_controller_1.getQueueStatsController);
// Get next patient in queue
router.get('/next', queue_controller_1.getNextPatientController);
// Get current patient being served
router.get('/current', queue_controller_1.getCurrentPatientController);
// Call next patient (move to in_progress)
router.post('/call-next', queue_controller_1.callNextPatientController);
// Update queue entry status
router.put('/:id', [
    (0, express_validator_1.param)('id').isInt().withMessage('Queue ID must be a valid integer'),
    (0, express_validator_1.body)('status').isIn(['approved', 'in_progress', 'completed', 'unavailable'])
        .withMessage('Status must be one of: approved, in_progress, completed, unavailable')
], queue_controller_1.updateQueueEntryController);
exports.default = router;
