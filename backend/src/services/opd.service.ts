import pool from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OPDOperatorCreateInput, OPDOperatorLoginInput, OPDOperatorResponse } from '../models/OPDOperator';

const JWT_SECRET = process.env.JWT_SECRET || 'opd-secret-key';
const SALT_ROUNDS = 10;

export const createOPDOperator = async (operatorData: OPDOperatorCreateInput): Promise<OPDOperatorResponse> => {
  const { full_name, email, phone_number, password } = operatorData;

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM opd_operators WHERE email = $1 OR phone_number = $2',
      [email, phone_number]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('An operator with this email or phone number already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new operator
    const result = await pool.query(
      `INSERT INTO opd_operators (full_name, email, phone_number, password_hash, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING id, full_name, email, phone_number, created_at, updated_at`,
      [full_name, email, phone_number, password_hash]
    );

    return result.rows[0];
  } catch (error: any) {
    console.error('Error creating OPD operator:', error);
    if (error.code === '23505') {
      throw new Error('An operator with this email or phone number already exists');
    }
    throw error;
  }
};

export const loginOPDOperator = async (loginData: OPDOperatorLoginInput): Promise<{ operator: OPDOperatorResponse; token: string }> => {
  const { email, password } = loginData;

  try {
    // Get operator by email
    const result = await pool.query(
      'SELECT * FROM opd_operators WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const operator = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, operator.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: operator.id, 
        email: operator.email, 
        type: 'opd_operator',
        full_name: operator.full_name,
        isOPDOperator: true
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return operator data without password hash
    const { password_hash, ...operatorResponse } = operator;

    return {
      operator: operatorResponse,
      token
    };
  } catch (error: any) {
    console.error('Error logging in OPD operator:', error);
    throw error;
  }
};

export const getOPDOperatorById = async (id: number): Promise<OPDOperatorResponse> => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, phone_number, created_at, updated_at FROM opd_operators WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('OPD operator not found');
    }

    return result.rows[0];
  } catch (error: any) {
    console.error('Error getting OPD operator:', error);
    throw error;
  }
};

export const getAllPatients = async (): Promise<any[]> => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone_number, dob as date_of_birth, 
              gender, preferred_contact, created_at,
              'active' as status
       FROM patients 
       ORDER BY created_at DESC`
    );

    return result.rows;
  } catch (error: any) {
    console.error('Error getting all patients:', error);
    throw error;
  }
};

export const searchPatients = async (query: string): Promise<any[]> => {
  try {
    const searchQuery = `%${query}%`;
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone_number, dob as date_of_birth, 
              gender, preferred_contact, created_at,
              'active' as status
       FROM patients 
       WHERE first_name ILIKE $1 
          OR last_name ILIKE $1 
          OR email ILIKE $1 
          OR phone_number ILIKE $1
       ORDER BY created_at DESC`,
      [searchQuery]
    );

    return result.rows;
  } catch (error: any) {
    console.error('Error searching patients:', error);
    throw error;
  }
};

export const getPatientById = async (id: string): Promise<any> => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone_number, dob as date_of_birth, 
              gender, preferred_contact, created_at,
              'active' as status
       FROM patients 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Patient not found');
    }

    return result.rows[0];
  } catch (error: any) {
    console.error('Error getting patient by ID:', error);
    throw error;
  }
};
