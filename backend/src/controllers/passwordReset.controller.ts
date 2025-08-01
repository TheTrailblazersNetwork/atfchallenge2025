import { Request, Response } from 'express';
import {
  generateResetToken,
  generateResetTokenByPhone,
  validateResetToken,
  resetPassword
} from '../services/passwordReset.service';

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: 'Email or phone number is required'
      });
    }

    console.log('📥 Password reset request for:', identifier);

    // Determine if identifier is email or phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    let token: string | null = null;
    
    if (emailRegex.test(identifier)) {
      console.log('📧 Processing email-based reset');
      token = await generateResetToken(identifier);
    } else {
      console.log('📱 Processing phone-based reset for:', identifier);
      token = await generateResetTokenByPhone(identifier);
    }

    // Consider it successful if we got a token back
    const success = token !== null;
    console.log('✅ Password reset process completed, success:', success);

    res.status(200).json({
      success: success,
      message: success
        ? 'Password reset link has been sent'
        : 'If an account exists, a password reset link has been sent'
    });
  } catch (error: any) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    const isValid = await validateResetToken(token);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error: any) {
    console.error('Validate token error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Token and password are required'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    const success = await resetPassword(token, password);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token',
        message: 'Password reset failed'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: null
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};