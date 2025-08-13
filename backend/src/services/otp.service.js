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
exports.cleanupExpiredVerifications = exports.checker = exports.verifySingleChannelOtp = exports.getVerificationDataById = exports.getVerificationDataByIdRaw = exports.sendOtpsToUser = exports.removeVerificationData = exports.isFullyVerified = exports.markVerified = exports.verifyOTP = exports.getVerificationDataForLogin = exports.getVerificationData = exports.storeVerificationData = exports.hashOTP = exports.generateOTP = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = __importDefault(require("../config/db"));
const email_1 = require("../config/email");
const sms_service_1 = require("./sms.service");
const auth_service_1 = require("./auth.service");
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '15', 10);
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || '6', 10);
const generateOTP = (length = OTP_LENGTH) => {
    if (length <= 0 || length > 10)
        length = 6;
    const buffer = crypto_1.default.randomBytes(length);
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += (buffer[i] % 10).toString();
    }
    return otp;
};
exports.generateOTP = generateOTP;
const hashOTP = (otp) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.hash(otp, 10);
});
exports.hashOTP = hashOTP;
const storeVerificationData = (email, phoneNumber, hashedEmailOtp, hashedPhoneOtp, userData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const query = `
    INSERT INTO user_verifications (
      email, phone_number, hashed_email_otp, hashed_phone_otp, user_data, expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;
    const values = [email, phoneNumber, hashedEmailOtp, hashedPhoneOtp, JSON.stringify(userData), expiresAt];
    try {
        const result = yield db_1.default.query(query, values);
        return result.rows[0].id;
    }
    catch (error) {
        if (error.code === '23505') {
            if ((_a = error.detail) === null || _a === void 0 ? void 0 : _a.includes('email')) {
                throw new Error('An OTP verification is already in progress for this email address.');
            }
            else if ((_b = error.detail) === null || _b === void 0 ? void 0 : _b.includes('phone_number')) {
                throw new Error('An OTP verification is already in progress for this phone number.');
            }
        }
        throw new Error('Failed to initiate verification process. Please try again.');
    }
});
exports.storeVerificationData = storeVerificationData;
const getVerificationData = (identifier) => __awaiter(void 0, void 0, void 0, function* () {
    const isEmail = identifier.includes('@');
    console.log(`getVerificationData called with identifier: ${identifier}, isEmail: ${isEmail}`);
    let query;
    if (isEmail) {
        query = `
      SELECT id, email, phone_number, hashed_email_otp, hashed_phone_otp, user_data, email_verified, phone_verified, expires_at
      FROM user_verifications
      WHERE email = $1 AND expires_at > NOW()
    `;
    }
    else {
        query = `
      SELECT id, email, phone_number, hashed_email_otp, hashed_phone_otp, user_data, email_verified, phone_verified, expires_at
      FROM user_verifications
      WHERE phone_number = $1 AND expires_at > NOW()
    `;
    }
    try {
        console.log(`Executing query: ${query.replace(/\s+/g, ' ').trim()}`);
        const result = yield db_1.default.query(query, [identifier]);
        console.log(`Query returned ${result.rows.length} rows`);
        if (result.rows.length > 0) {
            console.log(`Found verification record:`, {
                id: result.rows[0].id,
                email: result.rows[0].email,
                expires_at: result.rows[0].expires_at,
                user_data_exists: !!result.rows[0].user_data
            });
        }
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    catch (error) {
        console.error('Error in getVerificationData:', error);
        return null;
    }
});
exports.getVerificationData = getVerificationData;
// Get verification data for login (ignores expiration)
const getVerificationDataForLogin = (identifier) => __awaiter(void 0, void 0, void 0, function* () {
    const isEmail = identifier.includes('@');
    console.log(`getVerificationDataForLogin called with identifier: ${identifier}, isEmail: ${isEmail}`);
    let query;
    if (isEmail) {
        query = `
      SELECT id, email, phone_number, hashed_email_otp, hashed_phone_otp, user_data, email_verified, phone_verified, expires_at
      FROM user_verifications
      WHERE email = $1
    `;
    }
    else {
        query = `
      SELECT id, email, phone_number, hashed_email_otp, hashed_phone_otp, user_data, email_verified, phone_verified, expires_at
      FROM user_verifications
      WHERE phone_number = $1
    `;
    }
    try {
        console.log(`Executing login query: ${query.replace(/\s+/g, ' ').trim()}`);
        const result = yield db_1.default.query(query, [identifier]);
        console.log(`Login query returned ${result.rows.length} rows`);
        if (result.rows.length > 0) {
            console.log(`Found verification record for login:`, {
                id: result.rows[0].id,
                email: result.rows[0].email,
                expires_at: result.rows[0].expires_at,
                user_data_exists: !!result.rows[0].user_data,
                isExpired: new Date(result.rows[0].expires_at) <= new Date()
            });
        }
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    catch (error) {
        console.error('Error in getVerificationDataForLogin:', error);
        return null;
    }
});
exports.getVerificationDataForLogin = getVerificationDataForLogin;
const verifyOTP = (submittedOtp, storedHashedOtp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield bcrypt_1.default.compare(submittedOtp, storedHashedOtp);
    }
    catch (_a) {
        return false;
    }
});
exports.verifyOTP = verifyOTP;
const markVerified = (verificationId, type) => __awaiter(void 0, void 0, void 0, function* () {
    const field = type === 'email' ? 'email_verified' : 'phone_verified';
    const query = `UPDATE user_verifications SET ${field} = TRUE WHERE id = $1`;
    yield db_1.default.query(query, [verificationId]);
    return true;
});
exports.markVerified = markVerified;
const isFullyVerified = (verificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT email_verified, phone_verified
    FROM user_verifications
    WHERE id = $1
  `;
    const result = yield db_1.default.query(query, [verificationId]);
    if (result.rows.length > 0) {
        const record = result.rows[0];
        return record.email_verified === true && record.phone_verified === true;
    }
    return false;
});
exports.isFullyVerified = isFullyVerified;
const removeVerificationData = (verificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'DELETE FROM user_verifications WHERE id = $1';
    try {
        yield db_1.default.query(query, [verificationId]);
        return true;
    }
    catch (_a) {
        return false;
    }
});
exports.removeVerificationData = removeVerificationData;
const sendOtpsToUser = (email, phoneNumber, emailOtp, phoneOtp) => __awaiter(void 0, void 0, void 0, function* () {
    let emailSent = false;
    let smsSent = false;
    // Only send email if emailOtp is provided
    if (emailOtp && emailOtp.trim() !== '') {
        console.log(`Sending email OTP to ${email}`);
        emailSent = yield (0, email_1.sendCommunication)(email, phoneNumber, 'email', 'email_verification', { otp: emailOtp });
    }
    else {
        console.log(`No email OTP to send (emailOtp is empty)`);
    }
    // Only send SMS if phoneOtp is provided
    if (phoneOtp && phoneOtp.trim() !== '') {
        console.log(`Sending SMS OTP to ${phoneNumber}`);
        const smsMessage = `Your verification code is: ${phoneOtp}\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.`;
        smsSent = yield (0, sms_service_1.sendSMS)(phoneNumber, smsMessage);
    }
    else {
        console.log(`No SMS OTP to send (phoneOtp is empty)`);
    }
    return !!(emailSent || smsSent);
});
exports.sendOtpsToUser = sendOtpsToUser;
// Get verification data without expiration check
const getVerificationDataByIdRaw = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, email, phone_number, hashed_email_otp, hashed_phone_otp, 
           user_data, email_verified, phone_verified, expires_at
    FROM user_verifications
    WHERE id = $1
  `;
    try {
        const result = yield db_1.default.query(query, [id]);
        if (result.rows.length === 0) {
            console.log(`No verification record found for ID: ${id}`);
            return null;
        }
        return result.rows[0];
    }
    catch (error) {
        console.error('Error in getVerificationDataByIdRaw:', error);
        return null;
    }
});
exports.getVerificationDataByIdRaw = getVerificationDataByIdRaw;
const getVerificationDataById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, email, phone_number, hashed_email_otp, hashed_phone_otp, 
           user_data, email_verified, phone_verified, expires_at
    FROM user_verifications
    WHERE id = $1
  `;
    try {
        const result = yield db_1.default.query(query, [id]);
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
    }
    catch (error) {
        console.error('Error in getVerificationDataById:', error);
        return null;
    }
});
exports.getVerificationDataById = getVerificationDataById;
const verifySingleChannelOtp = (verificationId, channel, submittedOtp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const verification = yield (0, exports.getVerificationDataById)(verificationId);
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
        const isValid = yield (0, exports.verifyOTP)(submittedOtp, hashedOtp);
        if (!isValid) {
            return {
                success: false,
                message: 'Invalid verification code.'
            };
        }
        // Mark as verified
        yield (0, exports.markVerified)(verificationId, channel);
        return {
            success: true,
            message: `${channel === 'email' ? 'Email' : 'Phone number'} verified successfully.`
        };
    }
    catch (error) {
        console.error('Error in verifySingleChannelOtp:', error);
        return {
            success: false,
            message: 'An error occurred during verification.'
        };
    }
});
exports.verifySingleChannelOtp = verifySingleChannelOtp;
const checker = (verificationId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const verification = yield (0, exports.getVerificationDataById)(verificationId);
        if (!verification) {
            return { fullyVerified: false };
        }
        if (verification.email_verified && verification.phone_verified) {
            // Both channels verified, create patient account
            const userData = typeof verification.user_data === 'string'
                ? JSON.parse(verification.user_data)
                : verification.user_data;
            const finalizedPatient = yield (0, auth_service_1.finalizePatientRegistration)(userData);
            yield (0, exports.removeVerificationData)(verificationId);
            return {
                fullyVerified: true,
                patient: finalizedPatient.patient
            };
        }
        return {
            fullyVerified: false
        };
    }
    catch (error) {
        console.error('Error in checker:', error);
        return { fullyVerified: false };
    }
});
exports.checker = checker;
const cleanupExpiredVerifications = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const query = 'DELETE FROM user_verifications WHERE expires_at <= NOW()';
    const result = yield db_1.default.query(query);
    return (_a = result.rowCount) !== null && _a !== void 0 ? _a : 0;
});
exports.cleanupExpiredVerifications = cleanupExpiredVerifications;
