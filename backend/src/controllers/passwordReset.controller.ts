import { Request, Response } from 'express';
import { generateResetToken, validateResetToken, resetPassword } from '../services/passwordReset.service';
import { sendPasswordResetEmail } from '../config/email';

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Generate reset token
    const token = await generateResetToken(email);
    
    if (token) {
      // Send email (in development, this logs to console)
      const emailSent = await sendPasswordResetEmail(email, token);
      
      if (!emailSent) {
        console.warn('Failed to send password reset email');
      }
    }

    // Always return success to prevent email enumeration
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
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
        error: 'Invalid or expired token'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};