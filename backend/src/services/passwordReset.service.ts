import crypto from 'crypto';
import pool from '../config/db';
import bcrypt from 'bcrypt';
import { sendCommunication } from '../config/email';

// Keep your existing function (for email-based reset)
export const generateResetToken = async (email: string): Promise<string | null> => {
  try {
    console.log('Checking user exists...');

    // Check if user exists and get their communication preferences
    const userResult = await pool.query(
      'SELECT id, email, phone_number, preferred_contact FROM patients WHERE email = $1',
      [email]
    );

    console.log('User result:', userResult.rows.length > 0 ? 'Exists' : 'Not found');

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists (security best practice)
      return null;
    }

    const user = userResult.rows[0];

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Delete any existing tokens for this email
    await pool.query(
      'DELETE FROM password_reset_tokens WHERE email = $1',
      [email]
    );

    // Insert new token
    const result = await pool.query(
      `INSERT INTO password_reset_tokens (email, token, expires_at) 
       VALUES ($1, $2, $3) RETURNING token`,
      [email, token, expiresAt]
    );

    // Send password reset communication based on user's preference
    await sendCommunication(
      user.email,
      user.phone_number,
      user.preferred_contact as 'email' | 'sms', // Type assertion for safety
      'password_reset',
      { token: token }
    );

    return result.rows[0].token;
  } catch (error) {
    console.error('Error generating reset token:', error);
    return null;
  }
};

// NEW: Generate reset token by phone number
export const generateResetTokenByPhone = async (phoneNumber: string): Promise<string | null> => {
  try {
    console.log('Checking user exists by phone...');

    // Format phone number to E.164 format
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
      console.error('Invalid phone number format:', phoneNumber);
      return null;
    }

    // Check if user exists and get their communication preferences
    const userResult = await pool.query(
      'SELECT id, email, phone_number, preferred_contact, first_name FROM patients WHERE phone_number = $1',
      [formattedPhone]
    );

    console.log('User result:', userResult.rows.length > 0 ? 'Exists' : 'Not found');

    if (userResult.rows.length === 0) {
      // Don't reveal if phone exists (security best practice)
      return null;
    }

    const user = userResult.rows[0];

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Delete any existing tokens for this email
    await pool.query(
      'DELETE FROM password_reset_tokens WHERE email = $1',
      [user.email]
    );

    // Insert new token
    const result = await pool.query(
      `INSERT INTO password_reset_tokens (email, token, expires_at) 
       VALUES ($1, $2, $3) RETURNING token`,
      [user.email, token, expiresAt]
    );

    // Send password reset communication based on user's preference
    await sendCommunication(
      user.email,
      user.phone_number,
      user.preferred_contact as 'email' | 'sms',
      'password_reset',
      { token: token }
    );

    return result.rows[0].token;
  } catch (error) {
    console.error('Error generating reset token by phone:', error);
    return null;
  }
};

// NEW: Generate reset token by identifier (email or phone)
export const generateResetTokenByIdentifier = async (identifier: string): Promise<string | null> => {
  // Determine if identifier is email or phone
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (emailRegex.test(identifier)) {
    // It's an email
    return await generateResetToken(identifier);
  } else {
    // It's likely a phone number
    return await generateResetTokenByPhone(identifier);
  }
};

// Phone number formatting helper
const formatPhoneNumber = (phoneNumber: string): string | null => {
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+233')) {
    return cleaned;
  }
  
  if (cleaned.startsWith('233')) {
    return '+' + cleaned;
  }
  
  if (cleaned.startsWith('0')) {
    cleaned = '+233' + cleaned.substring(1);
    return cleaned;
  }
  
  if (cleaned.length === 9 && /^[2-5]/.test(cleaned)) {
    return '+233' + cleaned;
  }
  
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  if (cleaned.length === 9) {
    return '+233' + cleaned;
  }
  
  return null;
};

export const validateResetToken = async (token: string): Promise<boolean> => {
  try {
    const result = await pool.query(
      `SELECT id, email, expires_at, used FROM password_reset_tokens 
       WHERE token = $1 AND used = false`,
      [token]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const resetToken = result.rows[0];
    const now = new Date();

    // Check if token is expired
    if (new Date(resetToken.expires_at) < now) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating reset token:', error);
    return false;
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
  try {
    // Validate token first
    const isValid = await validateResetToken(token);
    if (!isValid) {
      return false;
    }

    // Get token info
    const tokenResult = await pool.query(
      'SELECT email FROM password_reset_tokens WHERE token = $1',
      [token]
    );

    const email = tokenResult.rows[0].email;

    // Get user info for confirmation message
    const userResult = await pool.query(
      'SELECT id, email, phone_number, preferred_contact, first_name FROM patients WHERE email = $1',
      [email]
    );

    const user = userResult.rows[0];

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE patients SET password_hash = $1 WHERE email = $2',
      [hashedPassword, email]
    );

    // Mark token as used
    await pool.query(
      'UPDATE password_reset_tokens SET used = true WHERE token = $1',
      [token]
    );

    // Send password reset confirmation based on user's preference
    if (user) {
      await sendCommunication(
        user.email,
        user.phone_number,
        user.preferred_contact as 'email' | 'sms',
        'password_reset_confirmation',
        { firstName: user.first_name || 'User' }
      );
    }

    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
};