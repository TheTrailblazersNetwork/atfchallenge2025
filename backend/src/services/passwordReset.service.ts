import crypto from 'crypto';
import pool from '../config/db';
import bcrypt from 'bcrypt';

export const generateResetToken = async (email: string): Promise<string | null> => {
  try {
    //console to help debug
    console.log('Checking user exists...')

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, email FROM patients WHERE email = $1',
      [email]
    );

    //console to help debug
    console.log('User result:', userResult.rows.length > 0 ? 'Exists' : 'Not found');

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists (security best practice)
      return null;
    }

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

    return result.rows[0].token;
  } catch (error) {
    console.error('Error generating reset token:', error);
    return null;
  }
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

    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
};