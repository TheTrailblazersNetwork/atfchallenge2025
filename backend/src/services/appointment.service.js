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
exports.updateAppointmentsAfterAI = exports.getPendingAppointmentsForBatch = exports.cancelAppointment = exports.updateAppointment = exports.getAppointmentById = exports.getPatientAppointments = exports.createNewAppointment = void 0;
const db_1 = __importDefault(require("../config/db"));
const createNewAppointment = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patient_id, medical_description, visiting_status, discharge_type } = data;
        // Assuming AI will do this on Wednesday
        const result = yield db_1.default.query(`INSERT INTO appointments (
        patient_id, medical_description, visiting_status, discharge_type, status
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`, [patient_id, medical_description, visiting_status, discharge_type, 'pending']);
        return result.rows[0];
    }
    catch (error) {
        console.error('Error creating appointment:', error);
        throw error;
    }
});
exports.createNewAppointment = createNewAppointment;
const getPatientAppointments = (patientId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`SELECT * FROM appointments
       WHERE patient_id = $1
       ORDER BY created_at DESC`, [patientId]);
        return result.rows;
    }
    catch (error) {
        console.error('Error getting patient appointments:', error);
        throw error;
    }
});
exports.getPatientAppointments = getPatientAppointments;
const getAppointmentById = (id, patientId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`SELECT * FROM appointments
       WHERE id = $1 AND patient_id = $2`, [id, patientId]);
        return result.rows[0] || null;
    }
    catch (error) {
        console.error('Error getting appointment by ID:', error);
        throw error;
    }
});
exports.getAppointmentById = getAppointmentById;
const updateAppointment = (id, patientId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fields = [];
        const values = [];
        let index = 1;
        const allowedFields = [
            'medical_description',
            'visiting_status',
            'discharge_type'
        ];
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                fields.push(`${field} = $${index}`);
                values.push(updateData[field]);
                index++;
            }
        }
        if (fields.length === 0) {
            throw new Error('No valid fields to update');
        }
        values.push(id, patientId);
        const query = `
      UPDATE appointments
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${index} AND patient_id = $${index + 1}
      RETURNING *
    `;
        const result = yield db_1.default.query(query, values);
        return result.rows[0] || null;
    }
    catch (error) {
        console.error('Error updating appointment:', error);
        throw error;
    }
});
exports.updateAppointment = updateAppointment;
const cancelAppointment = (id, patientId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`UPDATE appointments
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND patient_id = $2 AND status = 'pending'
       RETURNING id`, [id, patientId]);
        return result.rows.length > 0;
    }
    catch (error) {
        console.error('Error cancelling appointment:', error);
        throw error;
    }
});
exports.cancelAppointment = cancelAppointment;
// NEW: Function to get all pending appointments for batch processing
const getPendingAppointmentsForBatch = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`
      SELECT
        a.id as appointment_id, -- Alias for clarity when sending to AI
        a.patient_id,
        a.medical_description as medical_condition, -- Alias to match AI API expectation
        a.visiting_status,
        a.discharge_type,
        p.first_name,
        p.last_name,
        p.gender,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.dob)) as age
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.status = 'pending'
      ORDER BY a.created_at ASC
    `);
        return result.rows;
    }
    catch (error) {
        console.error('Error getting pending appointments for batch:', error);
        throw error;
    }
});
exports.getPendingAppointmentsForBatch = getPendingAppointmentsForBatch;
// Function to update appointments after AI processing
const updateAppointmentsAfterAI = (aiResults) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query('BEGIN');
        console.log(`📥 Starting database transaction to update ${aiResults.length} appointments...`);
        const updatedAppointments = [];
        for (const result of aiResults) {
            // Ensure status is lowercase to match DB enum values
            const normalizedStatus = result.status.toLowerCase();
            const updateQuery = `
        UPDATE appointments
        SET
          priority_rank = $1,
          severity_score = $2,
          status = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *`;
            const updateValues = [
                result.priority_rank,
                result.severity_score,
                normalizedStatus,
                result.appointment_id
            ];
            const updateResult = yield client.query(updateQuery, updateValues);
            if (updateResult.rows.length > 0) {
                updatedAppointments.push(updateResult.rows[0]);
                console.log(`✅ Updated appointment ${result.appointment_id}: Priority=${result.priority_rank}, Severity=${result.severity_score}, Status=${normalizedStatus}`);
            }
            else {
                console.warn(`⚠️ No appointment found with ID ${result.appointment_id} for update.`);
            }
        }
        yield client.query('COMMIT');
        console.log(`✅ Database transaction committed. Successfully updated ${updatedAppointments.length} appointments.`);
        return updatedAppointments;
    }
    catch (error) {
        yield client.query('ROLLBACK');
        console.error('❌ Database transaction failed during AI result processing:', error);
        throw error;
    }
    finally {
        client.release();
    }
});
exports.updateAppointmentsAfterAI = updateAppointmentsAfterAI;
