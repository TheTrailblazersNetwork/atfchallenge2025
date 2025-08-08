import express, { Router } from 'express';
import { signup, login,logout, initiateRegistration, verifyEmailOtp, verifySmsOtp, resendOTP } from '../controllers/auth.controller';
import { signupValidation, loginValidation, validate, initiateRegistrationValidation, verifyOtpValidation } from '../middleware/validation';
import { authenticateToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Auth routes with validation
router.post('/signup', validate(signupValidation), signup);
router.post('/login', validate(loginValidation), login);

// Registration and verification routes
router.post('/register', validate(initiateRegistrationValidation), initiateRegistration);

// New separate verification endpoints for email and SMS
router.post('/verify/email/:id', validate(verifyOtpValidation), verifyEmailOtp);
router.post('/verify/sms/:id', validate(verifyOtpValidation), verifySmsOtp);
// Resend OTP endpoint
router.post('/verify/resend/:id',resendOTP);

// Protected route (authentication required)
router.post('/logout', authenticateToken, logout);
export default router;