"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.validateResetToken = exports.generateResetTokenByIdentifier = exports.generateResetTokenByPhone = exports.generateResetToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const db_1 = __importDefault(require("../config/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const email_1 = require("../config/email");
// Keep your existing function (for email-based reset)
const generateResetToken = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Checking user exists...');
        // Check if user exists and get their communication preferences
        const userResult = yield db_1.default.query('SELECT id, email, phone_number, preferred_contact FROM patients WHERE email = $1', [email]);
        console.log('User result:', userResult.rows.length > 0 ? 'Exists' : 'Not found');
        if (userResult.rows.length === 0) {
            // Don't reveal if email exists (security best practice)
            return null;
        }
        const user = userResult.rows[0];
        // Generate secure token
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
        // Delete any existing tokens for this email
        yield db_1.default.query('DELETE FROM password_reset_tokens WHERE email = $1', [email]);
        // Insert new token
        const result = yield db_1.default.query(`INSERT INTO password_reset_tokens (email, token, expires_at) 
       VALUES ($1, $2, $3) RETURNING token`, [email, token, expiresAt]);
        // Send password reset communication based on user's preference
        yield (0, email_1.sendCommunication)(user.email, user.phone_number, user.preferred_contact, // Type assertion for safety
        'password_reset', { token: token });
        return result.rows[0].token;
    }
    catch (error) {
        console.error('Error generating reset token:', error);
        return null;
    }
});
exports.generateResetToken = generateResetToken;
// NEW: Generate reset token by phone number
const generateResetTokenByPhone = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Checking user exists by phone...');
        // Format phone number to E.164 format
        const formattedPhone = formatPhoneNumber(phoneNumber);
        if (!formattedPhone) {
            console.error('Invalid phone number format:', phoneNumber);
            return null;
        }
        // Check if user exists and get their communication preferences
        const userResult = yield db_1.default.query('SELECT id, email, phone_number, preferred_contact, first_name FROM patients WHERE phone_number = $1', [formattedPhone]);
        console.log('User result:', userResult.rows.length > 0 ? 'Exists' : 'Not found');
        if (userResult.rows.length === 0) {
            // Don't reveal if phone exists (security best practice)
            return null;
        }
        const user = userResult.rows[0];
        // Generate secure token
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
        // Delete any existing tokens for this email
        yield db_1.default.query('DELETE FROM password_reset_tokens WHERE email = $1', [user.email]);
        // Insert new token
        const result = yield db_1.default.query(`INSERT INTO password_reset_tokens (email, token, expires_at) 
       VALUES ($1, $2, $3) RETURNING token`, [user.email, token, expiresAt]);
        // Send password reset communication based on user's preference
        yield (0, email_1.sendCommunication)(user.email, user.phone_number, user.preferred_contact, 'password_reset', { token: token });
        return result.rows[0].token;
    }
    catch (error) {
        console.error('Error generating reset token by phone:', error);
        return null;
    }
});
exports.generateResetTokenByPhone = generateResetTokenByPhone;
// NEW: Generate reset token by identifier (email or phone)
const generateResetTokenByIdentifier = (identifier) => __awaiter(void 0, void 0, void 0, function* () {
    // Determine if identifier is email or phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(identifier)) {
        // It's an email
        return yield (0, exports.generateResetToken)(identifier);
    }
    else {
        // It's likely a phone number
        return yield (0, exports.generateResetTokenByPhone)(identifier);
    }
});
exports.generateResetTokenByIdentifier = generateResetTokenByIdentifier;
// Phone number formatting helper
const formatPhoneNumber = (phoneNumber) => {
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
const validateResetToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`SELECT id, email, expires_at, used FROM password_reset_tokens 
       WHERE token = $1 AND used = false`, [token]);
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
    }
    catch (error) {
        console.error('Error validating reset token:', error);
        return false;
    }
});
exports.validateResetToken = validateResetToken;
const resetPassword = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate token first
        const isValid = yield (0, exports.validateResetToken)(token);
        if (!isValid) {
            return false;
        }
        // Get token info
        const tokenResult = yield db_1.default.query('SELECT email FROM password_reset_tokens WHERE token = $1', [token]);
        const email = tokenResult.rows[0].email;
        // Get user info for confirmation message
        const userResult = yield db_1.default.query('SELECT id, email, phone_number, preferred_contact, first_name FROM patients WHERE email = $1', [email]);
        const user = userResult.rows[0];
        // Hash new password
        const saltRounds = 10;
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, saltRounds);
        // Update password
        yield db_1.default.query('UPDATE patients SET password_hash = $1 WHERE email = $2', [hashedPassword, email]);
        // Mark token as used
        yield db_1.default.query('UPDATE password_reset_tokens SET used = true WHERE token = $1', [token]);
        // Send password reset confirmation based on user's preference
        if (user) {
            yield (0, email_1.sendCommunication)(user.email, user.phone_number, user.preferred_contact, 'password_reset_confirmation', { firstName: user.first_name || 'User' });
        }
        return true;
    }
    catch (error) {
        console.error('Error resetting password:', error);
        return false;
    }
});
exports.resetPassword = resetPassword;
