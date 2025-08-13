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
exports.cancelAppointmentController = exports.updateAppointmentController = exports.getAppointmentByIdController = exports.getPatientAppointmentsController = exports.createAppointment = void 0;
const appointment_service_1 = require("../services/appointment.service");
const createAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { medical_description, visiting_status, discharge_type } = req.body;
        const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // From auth middleware
        if (!patientId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Patient ID not found'
            });
        }
        // Validation
        if (!medical_description || !visiting_status) {
            return res.status(400).json({
                success: false,
                error: 'Medical description and visiting status are required'
            });
        }
        const appointment = yield (0, appointment_service_1.createNewAppointment)({
            patient_id: patientId,
            medical_description,
            visiting_status,
            discharge_type
        });
        res.status(201).json({
            success: true,
            message: 'Appointment created successfully. Scheduling will be processed on Wednesday.',
            data: appointment
        });
    }
    catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create appointment'
        });
    }
});
exports.createAppointment = createAppointment;
const getPatientAppointmentsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!patientId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Patient ID not found'
            });
        }
        const appointments = yield (0, appointment_service_1.getPatientAppointments)(patientId);
        res.status(200).json({
            success: true,
            message: 'Appointments retrieved successfully',
            data: appointments
        });
    }
    catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve appointments'
        });
    }
});
exports.getPatientAppointmentsController = getPatientAppointmentsController;
const getAppointmentByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!patientId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Patient ID not found'
            });
        }
        const appointment = yield (0, appointment_service_1.getAppointmentById)(id, patientId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Appointment retrieved successfully',
            data: appointment
        });
    }
    catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve appointment'
        });
    }
});
exports.getAppointmentByIdController = getAppointmentByIdController;
const updateAppointmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const updateData = req.body;
        const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!patientId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Patient ID not found'
            });
        }
        const appointment = yield (0, appointment_service_1.updateAppointment)(id, patientId, updateData);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found or unauthorized'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Appointment updated successfully. Changes will be considered in Wednesday scheduling.',
            data: appointment
        });
    }
    catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update appointment'
        });
    }
});
exports.updateAppointmentController = updateAppointmentController;
// REMOVED: updateAppointmentScheduleController - not needed for batch processing
const cancelAppointmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!patientId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Patient ID not found'
            });
        }
        const result = yield (0, appointment_service_1.cancelAppointment)(id, patientId);
        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found or unauthorized'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully'
        });
    }
    catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel appointment'
        });
    }
});
exports.cancelAppointmentController = cancelAppointmentController;
