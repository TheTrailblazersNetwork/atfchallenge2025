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
exports.getCurrentPatientBeingServed = exports.getNextPatientInQueue = exports.getQueueStats = exports.updateQueueEntryStatus = exports.getCurrentQueue = exports.createQueueFromApprovedAppointments = void 0;
const db_1 = __importDefault(require("../config/db"));
/**
 * Creates queue entries for approved appointments in the order provided by AI
 * This is called after AI processing and before notifications
 */
const createQueueFromApprovedAppointments = (approvedResults) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query('BEGIN');
        // Clear any existing queue entries for today (in case of re-processing)
        const today = new Date().toISOString().split('T')[0];
        yield client.query(`
      DELETE FROM opd_queue 
      WHERE DATE(created_at) = $1
    `, [today]);
        console.log('🗑️ Cleared existing queue entries for today');
        // Filter only approved appointments and create queue entries
        const approvedAppointments = approvedResults.filter(result => result.status === 'approved');
        if (approvedAppointments.length === 0) {
            console.log('📭 No approved appointments to queue');
            yield client.query('COMMIT');
            return [];
        }
        console.log(`📝 Creating queue for ${approvedAppointments.length} approved appointments...`);
        const queueEntries = [];
        // Create queue entries in the order provided by AI (already sorted by priority)
        for (let i = 0; i < approvedAppointments.length; i++) {
            const appointment = approvedAppointments[i];
            // Get patient_id for the appointment
            const appointmentResult = yield client.query('SELECT patient_id FROM appointments WHERE id = $1', [appointment.appointment_id]);
            if (appointmentResult.rows.length === 0) {
                console.warn(`⚠️ Appointment ${appointment.appointment_id} not found, skipping queue entry`);
                continue;
            }
            const patient_id = appointmentResult.rows[0].patient_id;
            const queue_position = i + 1; // Queue positions start from 1
            const queueResult = yield client.query(`
        INSERT INTO opd_queue (appointment_id, patient_id, queue_position, status, created_at, updated_at)
        VALUES ($1, $2, $3, 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `, [appointment.appointment_id, patient_id, queue_position]);
            queueEntries.push(queueResult.rows[0]);
            console.log(`✅ Queued appointment ${appointment.appointment_id} at position ${queue_position}`);
        }
        yield client.query('COMMIT');
        console.log(`🎉 Successfully created queue with ${queueEntries.length} entries`);
        return queueEntries;
    }
    catch (error) {
        yield client.query('ROLLBACK');
        console.error('❌ Error creating queue:', error);
        throw error;
    }
    finally {
        client.release();
    }
});
exports.createQueueFromApprovedAppointments = createQueueFromApprovedAppointments;
/**
 * Gets the current queue with patient and appointment information
 */
const getCurrentQueue = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`
      SELECT 
        q.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.gender as patient_gender,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.dob)) as patient_age,
        a.medical_description,
        a.visiting_status,
        a.priority_rank,
        a.severity_score
      FROM opd_queue q
      JOIN appointments a ON q.appointment_id = a.id
      JOIN patients p ON q.patient_id = p.id
      WHERE DATE(q.created_at) = CURRENT_DATE
      ORDER BY q.queue_position ASC
    `);
        return result.rows;
    }
    catch (error) {
        console.error('Error fetching current queue:', error);
        throw error;
    }
});
exports.getCurrentQueue = getCurrentQueue;
/**
 * Updates the status of a queue entry
 */
const updateQueueEntryStatus = (queueId, status) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateData = { status, updated_at: 'CURRENT_TIMESTAMP' };
        // If marking as completed, set completed_time
        if (status === 'completed') {
            updateData.completed_time = 'CURRENT_TIMESTAMP';
        }
        const result = yield db_1.default.query(`
      UPDATE opd_queue 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      ${status === 'completed' ? ', completed_time = CURRENT_TIMESTAMP' : ''}
      WHERE id = $2
      RETURNING *
    `, [status, queueId]);
        return result.rows[0] || null;
    }
    catch (error) {
        console.error('Error updating queue entry status:', error);
        throw error;
    }
});
exports.updateQueueEntryStatus = updateQueueEntryStatus;
/**
 * Gets queue statistics for the current day
 */
const getQueueStats = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`
      SELECT 
        COUNT(*) as total_patients,
        COUNT(*) FILTER (WHERE status = 'approved') as waiting_patients,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_patients,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_patients,
        COUNT(*) FILTER (WHERE status = 'unavailable') as unavailable_patients
      FROM opd_queue 
      WHERE DATE(created_at) = CURRENT_DATE
    `);
        return result.rows[0];
    }
    catch (error) {
        console.error('Error fetching queue stats:', error);
        throw error;
    }
});
exports.getQueueStats = getQueueStats;
/**
 * Gets the next patient in queue (first approved patient)
 */
const getNextPatientInQueue = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`
      SELECT 
        q.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.gender as patient_gender,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.dob)) as patient_age,
        a.medical_description,
        a.visiting_status,
        a.priority_rank,
        a.severity_score
      FROM opd_queue q
      JOIN appointments a ON q.appointment_id = a.id
      JOIN patients p ON q.patient_id = p.id
      WHERE DATE(q.created_at) = CURRENT_DATE 
        AND q.status = 'approved'
      ORDER BY q.queue_position ASC
      LIMIT 1
    `);
        return result.rows[0] || null;
    }
    catch (error) {
        console.error('Error fetching next patient in queue:', error);
        throw error;
    }
});
exports.getNextPatientInQueue = getNextPatientInQueue;
/**
 * Gets the current patient being served (in_progress status)
 */
const getCurrentPatientBeingServed = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`
      SELECT 
        q.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.gender as patient_gender,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.dob)) as patient_age,
        a.medical_description,
        a.visiting_status,
        a.priority_rank,
        a.severity_score
      FROM opd_queue q
      JOIN appointments a ON q.appointment_id = a.id
      JOIN patients p ON q.patient_id = p.id
      WHERE DATE(q.created_at) = CURRENT_DATE 
        AND q.status = 'in_progress'
      ORDER BY q.queue_position ASC
      LIMIT 1
    `);
        return result.rows[0] || null;
    }
    catch (error) {
        console.error('Error fetching current patient being served:', error);
        throw error;
    }
});
exports.getCurrentPatientBeingServed = getCurrentPatientBeingServed;
