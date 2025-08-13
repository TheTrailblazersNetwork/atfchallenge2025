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
Object.defineProperty(exports, "__esModule", { value: true });
exports.callNextPatientController = exports.getCurrentPatientController = exports.getNextPatientController = exports.getQueueStatsController = exports.updateQueueEntryController = exports.getCurrentQueueController = void 0;
const queue_service_1 = require("../services/queue.service");
/**
 * Gets the current queue for today
 */
const getCurrentQueueController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const queue = yield (0, queue_service_1.getCurrentQueue)();
        res.status(200).json({
            success: true,
            message: 'Queue retrieved successfully',
            data: queue
        });
    }
    catch (error) {
        console.error('Get current queue error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve queue'
        });
    }
});
exports.getCurrentQueueController = getCurrentQueueController;
/**
 * Updates the status of a queue entry
 */
const updateQueueEntryController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // Validate status
        const validStatuses = ['approved', 'in_progress', 'completed', 'unavailable'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be one of: approved, in_progress, completed, unavailable'
            });
        }
        const updatedEntry = yield (0, queue_service_1.updateQueueEntryStatus)(parseInt(id), status);
        if (!updatedEntry) {
            return res.status(404).json({
                success: false,
                error: 'Queue entry not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Queue entry updated successfully',
            data: updatedEntry
        });
    }
    catch (error) {
        console.error('Update queue entry error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update queue entry'
        });
    }
});
exports.updateQueueEntryController = updateQueueEntryController;
/**
 * Gets queue statistics for today
 */
const getQueueStatsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield (0, queue_service_1.getQueueStats)();
        res.status(200).json({
            success: true,
            message: 'Queue statistics retrieved successfully',
            data: stats
        });
    }
    catch (error) {
        console.error('Get queue stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve queue statistics'
        });
    }
});
exports.getQueueStatsController = getQueueStatsController;
/**
 * Gets the next patient in queue
 */
const getNextPatientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nextPatient = yield (0, queue_service_1.getNextPatientInQueue)();
        res.status(200).json({
            success: true,
            message: nextPatient ? 'Next patient retrieved successfully' : 'No patients waiting in queue',
            data: nextPatient
        });
    }
    catch (error) {
        console.error('Get next patient error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve next patient'
        });
    }
});
exports.getNextPatientController = getNextPatientController;
/**
 * Gets the current patient being served
 */
const getCurrentPatientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentPatient = yield (0, queue_service_1.getCurrentPatientBeingServed)();
        res.status(200).json({
            success: true,
            message: currentPatient ? 'Current patient retrieved successfully' : 'No patient currently being served',
            data: currentPatient
        });
    }
    catch (error) {
        console.error('Get current patient error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve current patient'
        });
    }
});
exports.getCurrentPatientController = getCurrentPatientController;
/**
 * Calls the next patient (moves first approved patient to in_progress)
 */
const callNextPatientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First check if there's already a patient in progress
        const currentPatient = yield (0, queue_service_1.getCurrentPatientBeingServed)();
        if (currentPatient) {
            return res.status(400).json({
                success: false,
                error: 'A patient is already being served. Please complete the current patient first.'
            });
        }
        // Get the next patient in queue
        const nextPatient = yield (0, queue_service_1.getNextPatientInQueue)();
        if (!nextPatient) {
            return res.status(404).json({
                success: false,
                error: 'No patients waiting in queue'
            });
        }
        // Update the patient status to in_progress
        const updatedEntry = yield (0, queue_service_1.updateQueueEntryStatus)(nextPatient.id, 'in_progress');
        res.status(200).json({
            success: true,
            message: 'Next patient called successfully',
            data: updatedEntry
        });
    }
    catch (error) {
        console.error('Call next patient error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to call next patient'
        });
    }
});
exports.callNextPatientController = callNextPatientController;
