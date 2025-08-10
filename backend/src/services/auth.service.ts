import pool from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendCommunication } from '../config/email';
import { getPatientProfile } from './patient.service';
import { getPatientAppointments } from './appointment.service';
import { generateOTP, hashOTP, storeVerificationData, sendOtpsToUser, getVerificationData, getVerificationDataById, getVerificationDataByIdRaw, getVerificationDataForLogin } from './otp.service';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Interfaces
interface PatientData {
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  email: string;
  phone_number: string;
  preferred_contact: 'email' | 'sms';
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface PatientResult {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  preferred_contact: 'email' | 'sms';
}

interface InitiatePatientRegistrationInput extends PatientData {}

interface InitiatePatientRegistrationResult {
  success: boolean;
  message: string;
  requiresVerification: boolean;
  verificationId?: string;
}

interface FinalizePatientRegistrationResult {
  success: boolean;
  message: string;
  patient: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface PendingVerificationResult {
  success: false;
  pendingVerification: true;
  userData: {
    verificationId: string;
    email: string;
    phone_number: string;
    email_verified: boolean;
    phone_verified: boolean;
    expires_at: string;
  };
}

interface ResendOTPResult {
  success: boolean;
  message: string;
  verificationId: string;
  expiresAt: string;
}

type LoginPatientResult =
  | {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
  };
  master?: {
    profile: any;
    appointments: any;
  };
}
  | PendingVerificationResult;

// Service Functions
export const loginPatient = async (
  data: LoginData
): Promise<LoginPatientResult> => {
  const { email, password } = data;

  console.log(`Login attempt for email: ${email}`);

  // 1. Check patients table
  const result = await pool.query(
    `SELECT id, email, password_hash, first_name, last_name FROM patients WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (user) {
    console.log(`User found in patients table: ${user.email}`);
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new Error('Invalid credentials');

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Get patient profile and appointments
    const patientProfile = await getPatientProfile(user.id);
    const appointments = await getPatientAppointments(user.id);

    return {
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email },
      master: {
        profile: patientProfile,
        appointments: appointments
      }
    };
  }

  console.log(`User not found in patients table, checking verification table...`);

  // 2. Check verification table (ignoring expiration for login)
  const verification = await getVerificationDataForLogin(email);
  if (verification) {
    console.log(`User found in verification table: ${verification.email}, expires_at: ${verification.expires_at}`);
    console.log(`User data structure:`, verification.user_data);
    
    // Check if verification has expired
    const isExpired = new Date(verification.expires_at) <= new Date();
    
    // Validate password for users in verification
    const userData = verification.user_data;
    if (userData && userData.password_hash) {
      const match = await bcrypt.compare(password, userData.password_hash);
      if (!match) {
        console.log(`Password mismatch for user in verification table`);
        throw new Error('Invalid credentials');
      }
      
      console.log(`Password valid for user in verification table, checking expiration status`);
      
      if (isExpired) {
        console.log(`Verification has expired, automatically resending OTPs`);
        
        // Determine which channels need resending based on verification status
        let channelToResend: 'email' | 'phone' | 'both';
        
        if (!verification.email_verified && !verification.phone_verified) {
          // Both are unverified, resend both
          channelToResend = 'both';
          console.log(`Both email and phone are unverified, resending both OTPs`);
        } else if (!verification.email_verified) {
          // Only email is unverified
          channelToResend = 'email';
          console.log(`Only email is unverified, resending email OTP only`);
        } else if (!verification.phone_verified) {
          // Only phone is unverified
          channelToResend = 'phone';
          console.log(`Only phone is unverified, resending SMS OTP only`);
        } else {
          // Both are verified - this shouldn't happen but handle gracefully
          console.log(`Both channels are already verified, no need to resend`);
          throw new Error('Your account verification is complete. Please try logging in again.');
        }
        
        // Automatically resend OTPs for expired verification
        try {
          const resendResult = await resendVerificationOTP(verification.id, channelToResend);
          console.log(`OTPs resent successfully for ${channelToResend}:`, resendResult);
          
          // Return pending verification status with updated expiration time
          return {
            success: false,
            pendingVerification: true,
            userData: {
              verificationId: verification.id,
              email: verification.email,
              phone_number: verification.phone_number,
              email_verified: verification.email_verified,
              phone_verified: verification.phone_verified,
              expires_at: resendResult.expiresAt,
            }
          };
        } catch (resendError: any) {
          console.error(`Failed to resend OTPs:`, resendError);
          throw new Error('Your verification session has expired and we could not resend the codes. Please register again.');
        }
      }
      
      console.log(`Verification is still valid, returning pending verification status`);
      
      // Password is correct and not expired, return pending verification status
      return {
        success: false,
        pendingVerification: true,
        userData: {
          verificationId: verification.id,
          email: verification.email,
          phone_number: verification.phone_number,
          email_verified: verification.email_verified,
          phone_verified: verification.phone_verified,
          expires_at: verification.expires_at,
        }
      };
    } else {
      console.log(`No password hash found in user_data for verification record`);
    }
  } else {
    console.log(`User not found in verification table either`);
  }

  // 3. Not found in either table
  console.log(`User not found in any table: ${email}`);
  throw new Error('User not found');
};

export const initiatePatientRegistration = async (
  data: InitiatePatientRegistrationInput
): Promise<InitiatePatientRegistrationResult> => {
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
    const existingUserCheck = await pool.query(
      `SELECT id FROM patients WHERE email = $1 OR phone_number = $2`,
      [email, phone_number]
    );
    if (existingUserCheck.rows.length > 0) {
      throw new Error('A user with this email or phone number already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const emailOtp = generateOTP();
    const phoneOtp = generateOTP();
    const hashedEmailOtp = await hashOTP(emailOtp);
    const hashedPhoneOtp = await hashOTP(phoneOtp);

    const userDataToStore = {
      first_name,
      last_name,
      gender,
      dob,
      phone_number,
      email,
      password_hash: hashedPassword,
      preferred_contact,
    };

    const verificationId: string = await storeVerificationData(
      email,
      phone_number,
      hashedEmailOtp,
      hashedPhoneOtp,
      userDataToStore
    );

    await sendOtpsToUser(email, phone_number, emailOtp, phoneOtp);

    return {
      success: true,
      message: 'Verification codes sent to your email and phone number. Please verify to complete registration.',
      requiresVerification: true,
      verificationId: verificationId,
    };
  } catch (error: any) {
    console.error('Error in initiatePatientRegistration:', error);
    throw error;
  }
};

interface FinalizePatientRegistrationResult {
  success: boolean;
  message: string;
  patient: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export const finalizePatientRegistration = async (
  verifiedUserData: any
): Promise<FinalizePatientRegistrationResult> => {
  const {
    first_name,
    last_name,
    gender,
    dob,
    phone_number,
    email,
    password_hash,
    preferred_contact,
  } = verifiedUserData;

  try {
    const result = await pool.query(
      `INSERT INTO patients (
        first_name, last_name, gender, dob, phone_number, email, password_hash, preferred_contact
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, first_name, last_name, phone_number, preferred_contact`,
      [first_name, last_name, gender, dob, phone_number, email, password_hash, preferred_contact]
    );

    const patient = result.rows[0];

    await sendCommunication(
      patient.email,
      patient.phone_number,
      patient.preferred_contact,
      'welcome',
      { firstName: patient.first_name }
    );

    return {
      success: true,
      message: 'Registration successful!',
      patient: {
        id: patient.id,
        email: patient.email,
        first_name: patient.first_name,
        last_name: patient.last_name,
      },
    };
  } catch (error) {
    console.error('Error in finalizePatientRegistration:', error);
    throw error;
  }
};

export const resendVerificationOTP = async (
  verificationId: string,
  channel: 'email' | 'phone' | 'both'
): Promise<ResendOTPResult> => {
  try {
    console.log(`Attempting to resend OTP for verification ID: ${verificationId}`);

    // First check if verification record exists (without expiration filter)
    const verification = await getVerificationDataByIdRaw(verificationId);
    console.log(`Verification record found:, ${verification}`);

    if (!verification) {
      throw new Error(`Verification record not found for ID: ${verificationId}`);
    }

    // Check if the OTP has expired
    const isExpired = new Date(verification.expires_at) <= new Date();
    
    if (!isExpired) {
      // OTP is still valid, return message with expiration time
      return {
        success: false,
        message: `OTP is still valid and has not expired yet. Please use the current OTP or wait until it expires.`,
        verificationId,
        expiresAt: verification.expires_at,
      };
    }

    // OTP has expired, proceed to resend
    console.log(`OTP has expired, proceeding to resend new codes for channel: ${channel}`);
    
    // Determine which channels need OTPs based on the requested channel and verification status
    let emailOtp = '';
    let phoneOtp = '';

    // Only generate OTP for requested channels that are also unverified
    if ((channel === 'email' || channel === 'both') && !verification.email_verified) {
      emailOtp = generateOTP();
      console.log(`Generating email OTP because channel includes email and email is unverified`);
    }
    if ((channel === 'phone' || channel === 'both') && !verification.phone_verified) {
      phoneOtp = generateOTP();
      console.log(`Generating phone OTP because channel includes phone and phone is unverified`);
    }

    // Additional check: if specific channel requested but already verified, throw error
    if (channel === 'email' && verification.email_verified) {
      throw new Error('Email is already verified. No OTP sent.');
    }
    if (channel === 'phone' && verification.phone_verified) {
      throw new Error('Phone number is already verified. No OTP sent.');
    }

    if (!emailOtp && !phoneOtp) {
      throw new Error('All requested channels are already verified. No OTP sent.');
    }

    console.log(`Will send - Email OTP: ${emailOtp ? 'YES' : 'NO'}, Phone OTP: ${phoneOtp ? 'YES' : 'NO'}`);

    // Update verification record with new OTPs and extended expiration
    const query = `
      UPDATE user_verifications 
      SET 
        hashed_email_otp = CASE WHEN $1 <> '' THEN $2 ELSE hashed_email_otp END,
        hashed_phone_otp = CASE WHEN $3 <> '' THEN $4 ELSE hashed_phone_otp END,
        expires_at = NOW() + INTERVAL '15 minutes'
      WHERE id = $5
      RETURNING id, expires_at
    `;

    const hashedEmailOtp = emailOtp ? await hashOTP(emailOtp) : verification.hashed_email_otp;
    const hashedPhoneOtp = phoneOtp ? await hashOTP(phoneOtp) : verification.hashed_phone_otp;

    const result = await pool.query(query, [
      emailOtp,
      hashedEmailOtp,
      phoneOtp,
      hashedPhoneOtp,
      verificationId
    ]);

    if (result.rows.length === 0) {
      throw new Error('Failed to update verification record');
    }

    // Send new OTPs only for the channels that were generated
    if (emailOtp || phoneOtp) {
      console.log(`Sending OTPs - Email: ${emailOtp || 'not sending'}, Phone: ${phoneOtp || 'not sending'}`);
      await sendOtpsToUser(
        verification.email,
        verification.phone_number,
        emailOtp || '',
        phoneOtp || ''
      );
    }

    return {
      success: true,
      message: `New verification code${(emailOtp && phoneOtp) ? 's' : ''} sent successfully`,
      verificationId,
      expiresAt: result.rows[0].expires_at,
    };

  } catch (error: any) {
    console.error('Error in resendVerificationOTP:', error);
    throw error;
  }
};