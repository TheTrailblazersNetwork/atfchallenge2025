import pool  from '../config/db';

export const getPatientProfile = async (id: string): Promise<any> => {
  try {
    const result = await pool.query(
      `SELECT * FROM patients WHERE id = $1`,
      [id]
    );

    const patientData = result.rows[0];

    // Exclude password_hash from the response
    delete patientData.password_hash;

    return patientData;
  } catch (error) {
    console.error('Error getting patient profile:', error);
    throw error;
  }
};