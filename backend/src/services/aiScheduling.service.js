"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.simulateAIProcessing = exports.processAIResults = exports.sendBatchToAI = void 0;
const axios_1 = __importDefault(require("axios"));
const db_1 = __importDefault(require("../config/db"));
const appointment_service_1 = require("./appointment.service");
const queue_service_1 = require("./queue.service");
// --- Core Functions ---
const sendBatchToAI = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const aiApiUrl = ((_a = process.env.NEUROSURGERY_TRIAGE_API_URL) === null || _a === void 0 ? void 0 : _a.trim()) || 'https://atfchallenge2025.onrender.com';
    const endpoint = `${aiApiUrl}/sort`;
    try {
        console.log(`📤 Sending batch of ${payload.patients.length} appointments to Neurosurgery Triage AI at ${endpoint}...`);
        const response = yield axios_1.default.post(endpoint, payload.patients, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 90000
        });
        console.log('📥 Successfully received response from AI API.');
        if (!response.data || typeof response.data !== 'object' || !response.data.results) {
            const errorMsg = 'Invalid response structure received from AI API. Missing "results" object.';
            console.error(errorMsg);
            console.error('Response received:', JSON.stringify(response.data, null, 2));
            throw new Error(errorMsg);
        }
        return response.data;
    }
    catch (error) {
        console.error('❌ AI batch processing failed:');
        if (axios_1.default.isAxiosError(error)) {
            if (error.response) {
                console.error(`   Status: ${error.response.status}`);
                console.error(`   Status Text: ${error.response.statusText}`);
                console.error(`   Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
            }
            else if (error.request) {
                console.error('   No response received from AI API. Please check network connectivity or AI API status.');
                console.error(`   Request Details: ${JSON.stringify(error.request, null, 2)}`);
            }
            else {
                console.error(`   Error setting up request: ${error.message}`);
            }
        }
        else {
            console.error(`   Unexpected error: ${error.message}`);
        }
        throw new Error(`Failed to process appointment batch with AI: ${error.message || 'Unknown error'}`);
    }
});
exports.sendBatchToAI = sendBatchToAI;
const processAIResults = (aiResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('💾 Starting to process AI results and update database...');
        const formattedResults = Object.entries(aiResponse.results).map(([appointment_id, data]) => ({
            appointment_id,
            priority_rank: data.priority_rank,
            severity_score: data.severity_score,
            status: data.status.toLowerCase()
        }));
        if (formattedResults.length === 0) {
            console.warn('⚠️ No results to process in AI response.');
            return [];
        }
        console.log(`💾 Preparing to update ${formattedResults.length} appointments in the database...`);
        const updatedAppointments = yield (0, appointment_service_1.updateAppointmentsAfterAI)(formattedResults);
        console.log(`✅ Database update successful. Updated ${updatedAppointments.length} appointments.`);
        // --- CREATE QUEUE ENTRIES BEFORE NOTIFICATIONS ---
        console.log('📋 Creating queue entries for approved appointments...');
        try {
            yield (0, queue_service_1.createQueueFromApprovedAppointments)(formattedResults);
            console.log('✅ Queue creation successful.');
        }
        catch (queueError) {
            console.error('❌ Queue creation failed:', (queueError === null || queueError === void 0 ? void 0 : queueError.message) || queueError);
            // Don't throw here as notifications should still be sent
        }
        console.log('📧 Initiating patient notifications...');
        let notificationCount = 0;
        for (const appointment of updatedAppointments) {
            try {
                yield notifyPatientOfScheduling(appointment);
                notificationCount++;
            }
            catch (notifyError) {
                console.error(`❌ Failed to notify patient for appointment ${appointment.id || appointment.appointment_id}:`, (notifyError === null || notifyError === void 0 ? void 0 : notifyError.message) || notifyError);
            }
        }
        console.log(`📧 Patient notification process completed. Attempted notifications for ${notificationCount} appointments.`);
        return updatedAppointments;
    }
    catch (error) {
        console.error('❌ Critical error during AI result processing:', (error === null || error === void 0 ? void 0 : error.message) || error);
        throw error;
    }
});
exports.processAIResults = processAIResults;
// --- Helper Functions ---
const notifyPatientOfScheduling = (appointment) => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentId = appointment.id || appointment.appointment_id;
    if (!appointmentId) {
        console.error('❌ Cannot notify patient: Appointment ID is missing.');
        return;
    }
    try {
        const result = yield db_1.default.query(`SELECT
        p.email,
        p.phone_number,
        p.preferred_contact,
        p.first_name,
        a.priority_rank,
        a.severity_score,
        a.status
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.id = $1`, [appointmentId]);
        if (result.rows.length === 0) {
            console.warn(`⚠️ No patient data found for appointment ID: ${appointmentId}. Skipping notification.`);
            return;
        }
        const patientData = result.rows[0];
        console.log(`📧 Preparing notification for patient ${patientData.first_name} (${appointmentId}) with status '${patientData.status}'`);
        // Determine correct message type based on status
        let messageType;
        const messageData = {
            firstName: patientData.first_name,
            priorityRank: patientData.priority_rank,
            severityScore: patientData.severity_score,
            status: patientData.status
        };
        switch (patientData.status.toLowerCase()) {
            case 'approved':
                messageType = 'appointment_approved';
                break;
            case 'rebook':
                messageType = 'appointment_rebooked';
                break;
            default:
                console.warn(`Unsupported appointment status: ${patientData.status}`);
                return;
        }
        const { sendCommunication } = yield Promise.resolve().then(() => __importStar(require('../config/email')));
        const success = yield sendCommunication(patientData.email, patientData.phone_number, patientData.preferred_contact, messageType, messageData);
        if (success) {
            console.log(`📧 Successfully sent notification to ${patientData.first_name}`);
        }
        else {
            console.error(`❌ Failed to send notification to ${patientData.first_name}`);
        }
        // Simulation fallback
        let messagePreview = '';
        if (patientData.status === 'approved') {
            messagePreview = `Hello ${patientData.first_name}, your appointment has been approved. Check your dashboard for details.`;
        }
        else if (patientData.status === 'rebook') {
            messagePreview = `Hello ${patientData.first_name}, your appointment is on the waiting list.`;
        }
        console.log(`📧 [SIMULATED] Would send to ${patientData.preferred_contact}: "${messagePreview}"`);
    }
    catch (error) {
        console.error(`❌ Error during notification process for appointment ${appointmentId}:`, (error === null || error === void 0 ? void 0 : error.message) || error);
    }
});
// --- Simulation for Testing ---
const simulateAIProcessing = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`🧪 Simulating AI processing for ${payload.patients.length} appointments locally...`);
    const results = {};
    payload.patients.forEach((patient, index) => {
        let priority_rank = 4;
        let baseSeverity = 5;
        if (patient.medical_condition.toLowerCase().includes('emergency') ||
            patient.medical_condition.toLowerCase().includes('severe')) {
            baseSeverity = 9;
        }
        else if (patient.medical_condition.toLowerCase().includes('routine')) {
            baseSeverity = 3;
        }
        switch (patient.visiting_status) {
            case 'discharged_inpatient_2weeks':
            case 'discharged_inpatient_1week':
                priority_rank = 1;
                baseSeverity = Math.min(10, baseSeverity + 2);
                break;
            case 'internal_referral':
                priority_rank = 2;
                baseSeverity = Math.min(10, baseSeverity + 1);
                break;
            case 'external_referral':
                priority_rank = 3;
                break;
            case 'review_patient':
                priority_rank = 4;
                baseSeverity = Math.max(1, baseSeverity - 1);
                break;
            default:
                priority_rank = 5;
                baseSeverity = Math.max(1, baseSeverity - 2);
        }
        const severity_score = Math.min(10, Math.max(1, Math.round(baseSeverity + (Math.random() * 4) - 2)));
        const capacity = 170;
        const status = index < capacity ? 'APPROVED' : 'REBOOK';
        const today = new Date();
        const nextThursday = new Date(today);
        nextThursday.setDate(today.getDate() + ((4 - today.getDay() + 7) % 7 || 7));
        const scheduled_date = nextThursday.toISOString().split('T')[0];
        results[patient.appointment_id] = {
            priority_rank,
            severity_score,
            status,
            scheduled_date
        };
    });
    const sortedEntries = Object.entries(results).sort((a, b) => {
        const rankA = a[1].priority_rank;
        const rankB = b[1].priority_rank;
        return rankA !== rankB ? rankA - rankB : b[1].severity_score - a[1].severity_score;
    });
    const sortedResults = {};
    sortedEntries.forEach(([id, data]) => {
        sortedResults[id] = data;
    });
    console.log('🧪 AI simulation completed.');
    return { results: sortedResults };
});
exports.simulateAIProcessing = simulateAIProcessing;
