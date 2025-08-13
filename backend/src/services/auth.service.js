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
exports.resendVerificationOTP = exports.finalizePatientRegistration = exports.initiatePatientRegistration = exports.loginPatient = void 0;
const db_1 = __importDefault(require("../config/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = require("../config/email");
const patient_service_1 = require("./patient.service");
const appointment_service_1 = require("./appointment.service");
const otp_service_1 = require("./otp.service");
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
// Service Functions
const loginPatient = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = data;
    console.log(`Login attempt for email: ${email}`);
    // 1. Check patients table
    const result = yield db_1.default.query(`SELECT id, email, password_hash, first_name, last_name FROM patients WHERE email = $1`, [email]);
    const user = result.rows[0];
    if (user) {
        console.log(`User found in patients table: ${user.email}`);
        const match = yield bcrypt_1.default.compare(password, user.password_hash);
        if (!match)
            throw new Error('Invalid credentials');
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        // Get patient profile and appointments
        const patientProfile = yield (0, patient_service_1.getPatientProfile)(user.id);
        const appointments = yield (0, appointment_service_1.getPatientAppointments)(user.id);
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
    const verification = yield (0, otp_service_1.getVerificationDataForLogin)(email);
    if (verification) {
        console.log(`User found in verification table: ${verification.email}, expires_at: ${verification.expires_at}`);
        console.log(`User data structure:`, verification.user_data);
        // Check if verification has expired
        const isExpired = new Date(verification.expires_at) <= new Date();
        // Validate password for users in verification
        const userData = verification.user_data;
        if (userData && userData.password_hash) {
            const match = yield bcrypt_1.default.compare(password, userData.password_hash);
            if (!match) {
                console.log(`Password mismatch for user in verification table`);
                throw new Error('Invalid credentials');
            }
            console.log(`Password valid for user in verification table, checking expiration status`);
            if (isExpired) {
                console.log(`Verification has expired, automatically resending OTPs`);
                // Determine which channels need resending based on verification status
                let channelToResend;
                if (!verification.email_verified && !verification.phone_verified) {
                    // Both are unverified, resend both
                    channelToResend = 'both';
                    console.log(`Both email and phone are unverified, resending both OTPs`);
                }
                else if (!verification.email_verified) {
                    // Only email is unverified
                    channelToResend = 'email';
                    console.log(`Only email is unverified, resending email OTP only`);
                }
                else if (!verification.phone_verified) {
                    // Only phone is unverified
                    channelToResend = 'phone';
                    console.log(`Only phone is unverified, resending SMS OTP only`);
                }
                else {
                    // Both are verified - this shouldn't happen but handle gracefully
                    console.log(`Both channels are already verified, no need to resend`);
                    throw new Error('Your account verification is complete. Please try logging in again.');
                }
                // Automatically resend OTPs for expired verification
                try {
                    const resendResult = yield (0, exports.resendVerificationOTP)(verification.id, channelToResend);
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
                }
                catch (resendError) {
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
        }
        else {
            console.log(`No password hash found in user_data for verification record`);
        }
    }
    else {
        console.log(`User not found in verification table either`);
    }
    // 3. Not found in either table
    console.log(`User not found in any table: ${email}`);
    throw new Error('User not found');
});
exports.loginPatient = loginPatient;
const initiatePatientRegistration = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { first_name, last_name, gender, dob, phone_number, email, password, preferred_contact, } = data;
    try {
        const existingUserCheck = yield db_1.default.query(`SELECT id FROM patients WHERE email = $1 OR phone_number = $2`, [email, phone_number]);
        if (existingUserCheck.rows.length > 0) {
            throw new Error('A user with this email or phone number already exists.');
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
        const emailOtp = (0, otp_service_1.generateOTP)();
        const phoneOtp = (0, otp_service_1.generateOTP)();
        const hashedEmailOtp = yield (0, otp_service_1.hashOTP)(emailOtp);
        const hashedPhoneOtp = yield (0, otp_service_1.hashOTP)(phoneOtp);
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
        const verificationId = yield (0, otp_service_1.storeVerificationData)(email, phone_number, hashedEmailOtp, hashedPhoneOtp, userDataToStore);
        yield (0, otp_service_1.sendOtpsToUser)(email, phone_number, emailOtp, phoneOtp);
        return {
            success: true,
            message: 'Verification codes sent to your email and phone number. Please verify to complete registration.',
            requiresVerification: true,
            verificationId: verificationId,
        };
    }
    catch (error) {
        console.error('Error in initiatePatientRegistration:', error);
        throw error;
    }
});
exports.initiatePatientRegistration = initiatePatientRegistration;
const finalizePatientRegistration = (verifiedUserData) => __awaiter(void 0, void 0, void 0, function* () {
    const { first_name, last_name, gender, dob, phone_number, email, password_hash, preferred_contact, } = verifiedUserData;
    try {
        const result = yield db_1.default.query(`INSERT INTO patients (
        first_name, last_name, gender, dob, phone_number, email, password_hash, preferred_contact
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, first_name, last_name, phone_number, preferred_contact`, [first_name, last_name, gender, dob, phone_number, email, password_hash, preferred_contact]);
        const patient = result.rows[0];
        yield (0, email_1.sendCommunication)(patient.email, patient.phone_number, patient.preferred_contact, 'welcome', { firstName: patient.first_name });
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
    }
    catch (error) {
        console.error('Error in finalizePatientRegistration:', error);
        throw error;
    }
});
exports.finalizePatientRegistration = finalizePatientRegistration;
const resendVerificationOTP = (verificationId, channel) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`Attempting to resend OTP for verification ID: ${verificationId}`);
        // First check if verification record exists (without expiration filter)
        const verification = yield (0, otp_service_1.getVerificationDataByIdRaw)(verificationId);
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
            emailOtp = (0, otp_service_1.generateOTP)();
            console.log(`Generating email OTP because channel includes email and email is unverified`);
        }
        if ((channel === 'phone' || channel === 'both') && !verification.phone_verified) {
            phoneOtp = (0, otp_service_1.generateOTP)();
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
        const hashedEmailOtp = emailOtp ? yield (0, otp_service_1.hashOTP)(emailOtp) : verification.hashed_email_otp;
        const hashedPhoneOtp = phoneOtp ? yield (0, otp_service_1.hashOTP)(phoneOtp) : verification.hashed_phone_otp;
        const result = yield db_1.default.query(query, [
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
            yield (0, otp_service_1.sendOtpsToUser)(verification.email, verification.phone_number, emailOtp || '', phoneOtp || '');
        }
        return {
            success: true,
            message: `New verification code${(emailOtp && phoneOtp) ? 's' : ''} sent successfully`,
            verificationId,
            expiresAt: result.rows[0].expires_at,
        };
    }
    catch (error) {
        console.error('Error in resendVerificationOTP:', error);
        throw error;
    }
});
exports.resendVerificationOTP = resendVerificationOTP;
