import { Request, Response } from 'express';
import { 
  generateResetToken,  // This is your existing function
  validateResetToken, 
  resetPassword 
} from '../services/passwordReset.service';

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body; // This could be email or phone

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: 'Email or phone number is required'
      });
    }

    // For now, just use email-based reset (your existing function)
    // Later you can implement phone-based reset
    const token = await generateResetToken(identifier);
    
    // Always return success to prevent user enumeration
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