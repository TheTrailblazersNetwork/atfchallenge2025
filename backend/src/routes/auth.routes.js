"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const validation_1 = require("../middleware/validation");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Auth routes with validation
router.post('/signup', (0, validation_1.validate)(validation_1.signupValidation), auth_controller_1.signup);
router.post('/login', (0, validation_1.validate)(validation_1.loginValidation), auth_controller_1.login);
// Registration and verification routes
router.post('/register', (0, validation_1.validate)(validation_1.initiateRegistrationValidation), auth_controller_1.initiateRegistration);
// New separate verification endpoints for email and SMS
router.post('/verify/email/:id', (0, validation_1.validate)(validation_1.verifyOtpValidation), auth_controller_1.verifyEmailOtp);
router.post('/verify/sms/:id', (0, validation_1.validate)(validation_1.verifyOtpValidation), auth_controller_1.verifySmsOtp);
// Resend OTP endpoint
router.post('/verify/resend/:id', auth_controller_1.resendOTP);
router.get('/verify/status/:id', auth_controller_1.getVerificationStatus);
// Protected route (authentication required)
router.post('/logout', authMiddleware_1.authenticateToken, auth_controller_1.logout);
exports.default = router;
