import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../config/db';
import { sendCommunication } from '../config/email';
import { sendSMS } from './sms.service';
import { finalizePatientRegistration } from './auth.service';

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

interface VerificationResult {
  success: boolean;
  message: string;
}

interface CheckerResult {
  fullyVerified: boolean;
  patient?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
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

export const getVerificationDataById = async (id: string): Promise<VerificationRecord | null> => {
  const query = `
    SELECT id, email, phone_number, hashed_email_otp, hashed_phone_otp, 
           user_data, email_verified, phone_verified, expires_at
    FROM user_verifications
    WHERE id = $1 AND expires_at > NOW()
  `;
  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      console.log(`No verification record found for ID: ${id}`);
      return null;
    }

    // Then check if it's expired
    const verification = result.rows[0];
    const isExpired = new Date(verification.expires_at) <= new Date();
    
    if (isExpired) {
      console.log(`Verification record expired at ${verification.expires_at}`);
      return null;
    }

    return verification;
  } catch (error) {
    console.error('Error in getVerificationDataById:', error);
    return null;
  }
};

export const verifySingleChannelOtp = async (
  verificationId: string,
  channel: 'email' | 'phone',
  submittedOtp: string
): Promise<VerificationResult> => {
  try {
    const verification = await getVerificationDataById(verificationId);
    if (!verification) {
      return {
        success: false,
        message: 'Invalid or expired verification session.'
      };
    }

    // Check if already verified
    if (channel === 'email' && verification.email_verified) {
      return {
        success: false,
        message: 'Email has already been verified.'
      };
    }
    if (channel === 'phone' && verification.phone_verified) {
      return {
        success: false,
        message: 'Phone number has already been verified.'
      };
    }

    // Compare OTP
    const hashedOtp = channel === 'email' 
      ? verification.hashed_email_otp 
      : verification.hashed_phone_otp;
    
    const isValid = await verifyOTP(submittedOtp, hashedOtp);
    if (!isValid) {
      return {
        success: false,
        message: 'Invalid verification code.'
      };
    }

    // Mark as verified
    await markVerified(verificationId, channel);

    return {
      success: true,
      message: `${channel === 'email' ? 'Email' : 'Phone number'} verified successfully.`
    };
  } catch (error) {
    console.error('Error in verifySingleChannelOtp:', error);
    return {
      success: false,
      message: 'An error occurred during verification.'
    };
  }
};

export const checker = async (verificationId: string): Promise<CheckerResult> => {
  try {
    const verification = await getVerificationDataById(verificationId);
    if (!verification) {
      return { fullyVerified: false };
    }

    if (verification.email_verified && verification.phone_verified) {
      // Both channels verified, create patient account
      const userData = typeof verification.user_data === 'string' 
        ? JSON.parse(verification.user_data)
        : verification.user_data;

      const finalizedPatient = await finalizePatientRegistration(userData);
      await removeVerificationData(verificationId);

      return {
        fullyVerified: true,
        patient: finalizedPatient.patient
      };
    }

    return { 
      fullyVerified: false 
    };
  } catch (error) {
    console.error('Error in checker:', error);
    return { fullyVerified: false };
  }
};

export const cleanupExpiredVerifications = async (): Promise<number> => {
  const query = 'DELETE FROM user_verifications WHERE expires_at <= NOW()';
  const result = await pool.query(query);
  return result.rowCount ?? 0;
};