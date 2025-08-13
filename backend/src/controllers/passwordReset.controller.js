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
exports.resetUserPassword = exports.validateToken = exports.forgotPassword = void 0;
const passwordReset_service_1 = require("../services/passwordReset.service");
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        let token = null;
        if (emailRegex.test(identifier)) {
            console.log('📧 Processing email-based reset');
            token = yield (0, passwordReset_service_1.generateResetToken)(identifier);
        }
        else {
            console.log('📱 Processing phone-based reset for:', identifier);
            token = yield (0, passwordReset_service_1.generateResetTokenByPhone)(identifier);
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
    }
    catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.forgotPassword = forgotPassword;
const validateToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token is required'
            });
        }
        const isValid = yield (0, passwordReset_service_1.validateResetToken)(token);
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
    }
    catch (error) {
        console.error('Validate token error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.validateToken = validateToken;
const resetUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const success = yield (0, passwordReset_service_1.resetPassword)(token, password);
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
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.resetUserPassword = resetUserPassword;
