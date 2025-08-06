import { Request, Response } from 'express';
import { initiatePatientRegistration, finalizePatientRegistration, loginPatient } from '../services/auth.service';
import { getVerificationData, verifyOTP, markVerified, removeVerificationData } from '../services/otp.service';

export const initiateRegistration = async (req: Request, res: Response) => {
  try {
    const result = await initiatePatientRegistration(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    let errorMessage = error.message || 'Failed to initiate registration. Please try again.';
    if (error.code === '23505') {
      errorMessage = 'A user with this email or phone number already exists, or a verification is already in progress.';
    }
    res.status(400).json({ success: false, error: errorMessage });
  }
};

export const verifyOtps = async (req: Request, res: Response) => {
  try {
    const { email, emailOtp, phone, phoneOtp } = req.body as {
      email: string;
      emailOtp: string;
      phone: string;
      phoneOtp: string;
    };

    if (!email || !emailOtp || !phone || !phoneOtp) {
      return res.status(400).json({
        success: false,
        error: 'Email, email OTP, phone number, and phone OTP are all required.'
      });
    }

    const verificationRecord = await getVerificationData(email);
    if (!verificationRecord) {
      return res.status(404).json({
        success: false,
        error: 'No pending verification found for this email. The verification might have expired or already been completed.'
      });
    }

    const { id: verificationId, hashed_email_otp, hashed_phone_otp, user_data, email_verified, phone_verified, expires_at } = verificationRecord;
    if (new Date(expires_at) <= new Date()) {
      await removeVerificationData(verificationId);
      return res.status(400).json({
        success: false,
        error: 'Verification codes have expired. Please restart the registration process.'
      });
    }

    const isEmailOtpValid = await verifyOTP(emailOtp, hashed_email_otp);
    const isPhoneOtpValid = await verifyOTP(phoneOtp, hashed_phone_otp);

    let updatedEmailVerified = email_verified;
    let updatedPhoneVerified = phone_verified;

    if (isEmailOtpValid && !email_verified) {
      await markVerified(verificationId, 'email');
      updatedEmailVerified = true;
    } else if (!isEmailOtpValid && !email_verified) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email verification code.'
      });
    }

    if (isPhoneOtpValid && !phone_verified) {
      await markVerified(verificationId, 'phone');
      updatedPhoneVerified = true;
    } else if (!isPhoneOtpValid && !phone_verified) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone verification code.'
      });
    }

    const isNowFullyVerified = updatedEmailVerified && updatedPhoneVerified;

    if (isNowFullyVerified) {
      const finalResult = await finalizePatientRegistration(user_data);
      await removeVerificationData(verificationId);
      return res.status(200).json({
        success: true,
        message: finalResult.message || 'Registration successful!',
        patient: finalResult.patient
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verification processed. Awaiting full verification completion.'
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'An error occurred during OTP verification. Please try again.'
    });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const result = await initiatePatientRegistration(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginPatient(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};