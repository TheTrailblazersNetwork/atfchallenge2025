import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../config/db';
import { sendCommunication } from '../config/email';
import { sendSMS } from './sms.service';

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '15', 10);
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || '6', 10);

export interface VerificationRecord {
  id: string;
  email: string;
  phone_number: string;
  hashed_email_otp: string;
  hashed_phone_otp: string;
  user_data: any;
  email_verified: boolean;
  phone_verified: boolean;
  expires_at: string;
}

export const generateOTP = (length: number = OTP_LENGTH): string => {
  if (length <= 0 || length > 10) length = 6;
  const buffer = crypto.randomBytes(length);
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += (buffer[i] % 10).toString();
  }
  return otp;
};

export const hashOTP = async (otp: string): Promise<string> => {
  return await bcrypt.hash(otp, 10);
};

export const storeVerificationData = async (
  email: string,
  phoneNumber: string,
  hashedEmailOtp: string,
  hashedPhoneOtp: string,
  userData: any
): Promise<string> => {
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  const query = `
    INSERT INTO user_verifications (
      email, phone_number, hashed_email_otp, hashed_phone_otp, user_data, expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;
  const values = [email, phoneNumber, hashedEmailOtp, hashedPhoneOtp, JSON.stringify(userData), expiresAt];
  try {
    const result = await pool.query(query, values);
    return result.rows[0].id;
  } catch (error: any) {
    if (error.code === '23505') {
      if (error.detail?.includes('email')) {
        throw new Error('An OTP verification is already in progress for this email address.');
      } else if (error.detail?.includes('phone_number')) {
        throw new Error('An OTP verification is already in progress for this phone number.');
      }
    }
    throw new Error('Failed to initiate verification process. Please try again.');
  }
};

export const getVerificationData = async (identifier: string): Promise<VerificationRecord | null> => {
  const isEmail = identifier.includes('@');
  const field = isEmail ? 'email' : 'phone_number';
  const query = `
    SELECT id, email, phone_number, hashed_email_otp, hashed_phone_otp, user_data, email_verified, phone_verified, expires_at
    FROM user_verifications
    WHERE ${field} = $1 AND expires_at > NOW()
  `;
  const result = await pool.query(query, [identifier]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const verifyOTP = async (submittedOtp: string, storedHashedOtp: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(submittedOtp, storedHashedOtp);
  } catch {
    return false;
  }
};

export const markVerified = async (verificationId: string, type: 'email' | 'phone'): Promise<boolean> => {
  const field = type === 'email' ? 'email_verified' : 'phone_verified';
  const query = `UPDATE user_verifications SET ${field} = TRUE WHERE id = $1`;
  await pool.query(query, [verificationId]);
  return true;
};

export const isFullyVerified = async (verificationId: string): Promise<boolean> => {
  const query = `
    SELECT email_verified, phone_verified
    FROM user_verifications
    WHERE id = $1
  `;
  const result = await pool.query(query, [verificationId]);
  if (result.rows.length > 0) {
    const record = result.rows[0];
    return record.email_verified === true && record.phone_verified === true;
  }
  return false;
};

export const removeVerificationData = async (verificationId: string): Promise<boolean> => {
  const query = 'DELETE FROM user_verifications WHERE id = $1';
  try {
    await pool.query(query, [verificationId]);
    return true;
  } catch {
    return false;
  }
};

export const sendOtpsToUser = async (
  email: string,
  phoneNumber: string,
  emailOtp: string,
  phoneOtp: string
): Promise<boolean> => {
  const emailSent = await sendCommunication(
    email,
    phoneNumber,
    'email',
    'email_verification',
    { otp: emailOtp }
  );
  const smsMessage = `Your verification code is: ${phoneOtp}\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.`;
  const smsSent = await sendSMS(phoneNumber, smsMessage);
  return !!(emailSent || smsSent);
};

export const cleanupExpiredVerifications = async (): Promise<number> => {
  const query = 'DELETE FROM user_verifications WHERE expires_at <= NOW()';
  const result = await pool.query(query);
  return result.rowCount ?? 0;
};