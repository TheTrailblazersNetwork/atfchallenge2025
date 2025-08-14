import pool from '../config/db';

interface QueueEntry {
  id: number;
  appointment_id: string;
  patient_id: string;
  queue_position: number;
  status: 'approved' | 'in_progress' | 'completed' | 'unavailable';
  completed_time: string | null;
  created_at: string;
  updated_at: string;
}

interface QueueEntryWithPatientInfo extends QueueEntry {
  patient_first_name: string;
  patient_last_name: string;
  patient_gender: string;
  patient_age: number;
  medical_description: string;
  visiting_status: string;
  priority_rank: number;
  severity_score: number;
}

interface CreateQueueData {
  appointment_id: string;
  patient_id: string;
  queue_position: number;
}

/**
 * Creates queue entries for approved appointments in the order provided by AI
 * This is called after AI processing and before notifications
 */
export const createQueueFromApprovedAppointments = async (approvedResults: Array<{
  appointment_id: string;
  priority_rank: number;
  severity_score: number;
  status: 'approved' | 'rebook';
}>): Promise<QueueEntry[]> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Clear any existing queue entries for today (in case of re-processing)
    const today = new Date().toISOString().split('T')[0];
    await client.query(`
      DELETE FROM opd_queue 
      WHERE DATE(created_at) = $1
    `, [today]);
    
    console.log('🗑️ Cleared existing queue entries for today');

    // Filter only approved appointments and create queue entries
    const approvedAppointments = approvedResults.filter(result => result.status === 'approved');
    
    if (approvedAppointments.length === 0) {
      console.log('📭 No approved appointments to queue');
      await client.query('COMMIT');
      return [];
    }

    console.log(`📝 Creating queue for ${approvedAppointments.length} approved appointments...`);

    const queueEntries: QueueEntry[] = [];

    // Create queue entries in the order provided by AI (already sorted by priority)
    for (let i = 0; i < approvedAppointments.length; i++) {
      const appointment = approvedAppointments[i];
      
      // Get patient_id for the appointment
      const appointmentResult = await client.query(
        'SELECT patient_id FROM appointments WHERE id = $1',
        [appointment.appointment_id]
      );

      if (appointmentResult.rows.length === 0) {
        console.warn(`⚠️ Appointment ${appointment.appointment_id} not found, skipping queue entry`);
        continue;
      }

      const patient_id = appointmentResult.rows[0].patient_id;
      const queue_position = i + 1; // Queue positions start from 1

      const queueResult = await client.query(`
        INSERT INTO opd_queue (appointment_id, patient_id, queue_position, status, created_at, updated_at)
        VALUES ($1, $2, $3, 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `, [appointment.appointment_id, patient_id, queue_position]);

      queueEntries.push(queueResult.rows[0]);
      
      console.log(`✅ Queued appointment ${appointment.appointment_id} at position ${queue_position}`);
    }

    await client.query('COMMIT');
    console.log(`🎉 Successfully created queue with ${queueEntries.length} entries`);
    
    return queueEntries;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating queue:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Gets the current queue with patient and appointment information
 */
export const getCurrentQueue = async (): Promise<QueueEntryWithPatientInfo[]> => {
  try {
    const result = await pool.query(`
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
  } catch (error) {
    console.error('Error fetching current queue:', error);
    throw error;
  }
};

/**
 * Updates the status of a queue entry
 */
export const updateQueueEntryStatus = async (
  queueId: number, 
  status: 'approved' | 'in_progress' | 'completed' | 'unavailable'
): Promise<QueueEntry | null> => {
  try {
    const updateData: any = { status, updated_at: 'CURRENT_TIMESTAMP' };
    
    // If marking as completed, set completed_time
    if (status === 'completed') {
      updateData.completed_time = 'CURRENT_TIMESTAMP';
    }

    const result = await pool.query(`
      UPDATE opd_queue 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      ${status === 'completed' ? ', completed_time = CURRENT_TIMESTAMP' : ''}
      WHERE id = $2
      RETURNING *
    `, [status, queueId]);

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating queue entry status:', error);
    throw error;
  }
};

/**
 * Gets queue statistics for the current day
 */
export const getQueueStats = async () => {
  try {
    const result = await pool.query(`
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
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    throw error;
  }
};

/**
 * Gets the next patient in queue (first approved patient)
 */
export const getNextPatientInQueue = async (): Promise<QueueEntryWithPatientInfo | null> => {
  try {
    const result = await pool.query(`
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
  } catch (error) {
    console.error('Error fetching next patient in queue:', error);
    throw error;
  }
};

/**
 * Gets the current patient being served (in_progress status)
 */
export const getCurrentPatientBeingServed = async (): Promise<QueueEntryWithPatientInfo | null> => {
  try {
    const result = await pool.query(`
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
  } catch (error) {
    console.error('Error fetching current patient being served:', error);
    throw error;
  }
};
