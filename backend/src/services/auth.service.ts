import pool from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendCommunication } from '../config/email'; // Add this import

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Define interfaces for better type safety
interface PatientData {
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  email: string;
  phone_number: string;
  preferred_contact: 'email' | 'sms'; //  more specific
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface PatientResult {
  id: string; // Changed to string  using UUID
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  preferred_contact: 'email' | 'sms';
}

export const registerPatient = async (data: PatientData) => {
  const {
    first_name,
    last_name,
    gender,
    dob,
    phone_number,
    email,
    password,
    preferred_contact,
  } = data;

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const result = await pool.query(
      `INSERT INTO patients (
        first_name, last_name, gender, dob, phone_number, email, password_hash, preferred_contact
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, first_name, last_name, phone_number, preferred_contact`,
      [first_name, last_name, gender, dob, phone_number, email, hashedPassword, preferred_contact]
    );

    const patient = result.rows[0];

    // Send welcome communication based on user's preference
    await sendCommunication(
      patient.email,
      patient.phone_number,
      patient.preferred_contact,
      'welcome',
      { firstName: patient.first_name }
    );

    return { 
      message: 'Signup successful', 
      patient: {
        id: patient.id,
        email: patient.email,
        first_name: patient.first_name,
        last_name: patient.last_name
      }
    };
  } catch (error) {
    console.error('Error in registerPatient:', error);
    throw error;
  }
};

export const loginPatient = async (data: LoginData) => {
  const { email, password } = data;

  const result = await pool.query(
    `SELECT id, email, password_hash, first_name, last_name FROM patients WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (!user) throw new Error('User not found');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error('Invalid credentials');

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email }, 
    JWT_SECRET, 
    {
      expiresIn: '1h',
    }
  );

  return { 
    message: 'Login successful', 
    token, 
    user: { id: user.id, email: user.email } 
  };
};