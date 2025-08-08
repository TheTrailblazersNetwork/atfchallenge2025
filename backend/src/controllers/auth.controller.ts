import { Request, Response } from 'express';
import { initiatePatientRegistration, finalizePatientRegistration, resendVerificationOTP, loginPatient } from '../services/auth.service';
import { getVerificationDataById, verifySingleChannelOtp, checker } from '../services/otp.service';

interface VerificationResponse {
  success: boolean;
  message: string;
  fullyVerified?: boolean;
  patient?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
}

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

export const verifyEmailOtp = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    const { id } = req.params;

    if (!id || !otp) {
      return res.status(400).json({ 
        success: false, 
        error: 'Verification ID and OTP are required.' 
      });
    }

    // First check if verification record exists
    const verificationRecord = await getVerificationDataById(id);
    if (!verificationRecord) {
      return res.status(404).json({
        success: false,
        error: 'Verification record not found or expired.'
      });
    }

    const result = await verifySingleChannelOtp(id, 'email', otp);
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: result.message 
      });
    }

    const checkResult = await checker(id);
    return res.status(200).json({
      success: true,
      message: result.message,
      fullyVerified: checkResult.fullyVerified,
      patient: checkResult.patient || null,
    });
  } catch (error: any) {
    console.error('Error in verifyEmailOtp:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred during email verification.'
    });
  }
};

export const verifySmsOtp = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    const { id } = req.params;

    if (!id || !otp) {
      return res.status(400).json({ 
        success: false, 
        error: 'Verification ID and OTP are required.' 
      });
    }

    const verificationRecord = await getVerificationDataById(id);
    if (!verificationRecord) {
      return res.status(404).json({
        success: false,
        error: 'Verification record not found or expired.'
      });
    }

    const result = await verifySingleChannelOtp(id, 'phone', otp);
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: result.message 
      });
    }

    const checkResult = await checker(id);
    return res.status(200).json({
      success: true,
      message: result.message,
      fullyVerified: checkResult.fullyVerified,
      patient: checkResult.patient || null,
    });
  } catch (error: any) {
    console.error('Error in verifySmsOtp:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred during SMS verification.'
    });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { channel = 'both' } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Verification ID is required'
      });
    }

    if (!['email', 'phone', 'both'].includes(channel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid channel specified'
      });
    }

    const result = await resendVerificationOTP(id, channel as 'email' | 'phone' | 'both');
    return res.status(200).json(result);

  } catch (error: any) {
    console.error('Error in resendOTP:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to resend verification code'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginPatient(req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in login:', error);
    return res.status(401).json({ 
      success: false, 
      error: error.message || 'Authentication failed' 
    });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const result = await initiatePatientRegistration(req.body);
    return res.status(201).json(result);
  } catch (error: any) {
    console.error('Error in signup:', error);
    return res.status(400).json({ 
      success: false, 
      error: error.message || 'Registration failed' 
    });
  }
};

export const logout = async (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};