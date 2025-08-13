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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.signup = exports.login = exports.getVerificationStatus = exports.resendOTP = exports.verifySmsOtp = exports.verifyEmailOtp = exports.initiateRegistration = void 0;
const auth_service_1 = require("../services/auth.service");
const otp_service_1 = require("../services/otp.service");
const initiateRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, auth_service_1.initiatePatientRegistration)(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        let errorMessage = error.message || 'Failed to initiate registration. Please try again.';
        if (error.code === '23505') {
            errorMessage = 'A user with this email or phone number already exists, or a verification is already in progress.';
        }
        res.status(400).json({ success: false, error: errorMessage });
    }
});
exports.initiateRegistration = initiateRegistration;
const verifyEmailOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const verificationRecord = yield (0, otp_service_1.getVerificationDataById)(id);
        if (!verificationRecord) {
            return res.status(404).json({
                success: false,
                error: 'Verification record not found or expired.'
            });
        }
        const result = yield (0, otp_service_1.verifySingleChannelOtp)(id, 'email', otp);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.message
            });
        }
        const checkResult = yield (0, otp_service_1.checker)(id);
        return res.status(200).json({
            success: true,
            message: result.message,
            fullyVerified: checkResult.fullyVerified,
            patient: checkResult.patient || null,
        });
    }
    catch (error) {
        console.error('Error in verifyEmailOtp:', error);
        return res.status(500).json({
            success: false,
            error: 'An error occurred during email verification.'
        });
    }
});
exports.verifyEmailOtp = verifyEmailOtp;
const verifySmsOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp } = req.body;
        const { id } = req.params;
        if (!id || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Verification ID and OTP are required.'
            });
        }
        const verificationRecord = yield (0, otp_service_1.getVerificationDataById)(id);
        if (!verificationRecord) {
            return res.status(404).json({
                success: false,
                error: 'Verification record not found or expired.'
            });
        }
        const result = yield (0, otp_service_1.verifySingleChannelOtp)(id, 'phone', otp);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.message
            });
        }
        const checkResult = yield (0, otp_service_1.checker)(id);
        return res.status(200).json({
            success: true,
            message: result.message,
            fullyVerified: checkResult.fullyVerified,
            patient: checkResult.patient || null,
        });
    }
    catch (error) {
        console.error('Error in verifySmsOtp:', error);
        return res.status(500).json({
            success: false,
            error: 'An error occurred during SMS verification.'
        });
    }
});
exports.verifySmsOtp = verifySmsOtp;
const resendOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield (0, auth_service_1.resendVerificationOTP)(id, channel);
        // If the service returns success: false (OTP not expired), return 400 status
        if (!result.success) {
            return res.status(400).json(result);
        }
        // If successful (OTP was expired and resent), return 200 status
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in resendOTP:', error);
        return res.status(400).json({
            success: false,
            error: error.message || 'Failed to resend verification code'
        });
    }
});
exports.resendOTP = resendOTP;
const getVerificationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'Verification ID is required' });
    }
    const verificationRecord = yield (0, otp_service_1.getVerificationDataById)(id);
    if (!verificationRecord) {
        return res.status(404).json({ error: 'Verification record not found' });
    }
    const verificationStatus = {
        email: verificationRecord.email_verified,
        phone: verificationRecord.phone_verified,
    };
    res.json(verificationStatus);
});
exports.getVerificationStatus = getVerificationStatus;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, auth_service_1.loginPatient)(req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in login:', error);
        return res.status(401).json({
            success: false,
            error: error.message || 'Authentication failed'
        });
    }
});
exports.login = login;
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, auth_service_1.initiatePatientRegistration)(req.body);
        return res.status(201).json(result);
    }
    catch (error) {
        console.error('Error in signup:', error);
        return res.status(400).json({
            success: false,
            error: error.message || 'Registration failed'
        });
    }
});
exports.signup = signup;
const logout = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});
exports.logout = logout;
