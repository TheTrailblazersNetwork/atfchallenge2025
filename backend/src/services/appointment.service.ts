import pool from '../config/db';

interface CreateAppointmentData {
  patient_id: string;
  medical_description: string; 
  visiting_status: string;
  discharge_type?: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  medical_description: string;
  visiting_status: string;
  discharge_type: string | null;
  priority_rank: number | null;
  severity_score: number | null;
  status: string; 
  created_at: string;
  updated_at: string;
}

export const createNewAppointment = async (data: CreateAppointmentData): Promise<Appointment> => {
  try {
    const { patient_id, medical_description, visiting_status, discharge_type } = data;

    // Assuming AI will do this on Wednesday
    const result = await pool.query(
      `INSERT INTO appointments (
        patient_id, medical_description, visiting_status, discharge_type, status
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [patient_id, medical_description, visiting_status, discharge_type, 'pending']
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const getPatientAppointments = async (patientId: string): Promise<Appointment[]> => {
  try {
    const result = await pool.query(
      `SELECT * FROM appointments
       WHERE patient_id = $1
       ORDER BY created_at DESC`,
      [patientId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting patient appointments:', error);
    throw error;
  }
};

export const getAppointmentById = async (id: string, patientId: string): Promise<Appointment | null> => {
  try {
    const result = await pool.query(
      `SELECT * FROM appointments
       WHERE id = $1 AND patient_id = $2`,
      [id, patientId]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting appointment by ID:', error);
    throw error;
  }
};

export const updateAppointment = async (
  id: string,
  patientId: string,
  updateData: Partial<Appointment>
): Promise<Appointment | null> => {
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
      if (updateData[field as keyof Appointment] !== undefined) {
        fields.push(`${field} = $${index}`);
        values.push(updateData[field as keyof Appointment]);
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

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

export const cancelAppointment = async (id: string, patientId: string): Promise<boolean> => {
  try {
    const result = await pool.query(
      `UPDATE appointments
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND patient_id = $2 AND status = 'pending'
       RETURNING id`,
      [id, patientId]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

// NEW: Function to get all pending appointments for batch processing
export const getPendingAppointmentsForBatch = async () => {
  try {
    const result = await pool.query(`
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
  } catch (error) {
    console.error('Error getting pending appointments for batch:', error);
    throw error;
  }
};

// Function to update appointments after AI processing
export const updateAppointmentsAfterAI = async (
  aiResults: Array<{
    appointment_id: string;
    priority_rank: number;
    severity_score: number;
    status: 'approved' | 'pending' | 'rebook'; 
    // scheduled_date?: string; --- Uncommented will add this
  }>
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log(`📥 Starting database transaction to update ${aiResults.length} appointments...`);

    const updatedAppointments = [];

    for (const result of aiResults) {
      // Ensure status is lowercase to match DB enum values
      const normalizedStatus = result.status.toLowerCase() as 'approved' | 'pending' | 'rebook';

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

      const updateResult = await client.query(updateQuery, updateValues);

      if (updateResult.rows.length > 0) {
        updatedAppointments.push(updateResult.rows[0]);
        console.log(`✅ Updated appointment ${result.appointment_id}: Priority=${result.priority_rank}, Severity=${result.severity_score}, Status=${normalizedStatus}`);
      } else {
        console.warn(`⚠️ No appointment found with ID ${result.appointment_id} for update.`);
      }
    }

    await client.query('COMMIT');
    console.log(`✅ Database transaction committed. Successfully updated ${updatedAppointments.length} appointments.`);
    return updatedAppointments;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Database transaction failed during AI result processing:', error);
    throw error;
  } finally {
    client.release();
  }
};
