import pool from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key'; // Added fallback

// Define interfaces for better type safety
interface PatientData {
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  phone_number: string;
  email: string;
  password: string;
  preferred_contact: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface PatientResult {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  // Add other fields as needed
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

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
  const result = await pool.query(
    `INSERT INTO patients (
      first_name, last_name, gender, dob, phone_number, email, password_hash, preferred_contact
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, first_name, last_name`,
    [first_name, last_name, gender, dob, phone_number, email, hashedPassword, preferred_contact]
  );

  return { message: 'Signup successful', patient: result.rows[0] };
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

  // Ensure JWT_SECRET is defined
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email }, 
    JWT_SECRET, 
    {
      expiresIn: '1h', // Token expiration time
    }
  );

  return { message: 'Login successful', token, user: { id: user.id, email: user.email } };
}; 