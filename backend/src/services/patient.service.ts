import pool  from '../config/db';

export const getPatientProfile = async (patientId: string): Promise<any> => {
  try {
    const result = await pool.query(
      `SELECT * FROM patients WHERE id = $1`,
      [patientId]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error getting patient profile:', error);
    throw error;
  }
};