import express, { Router } from 'express';
import { signup, login,logout, initiateRegistration, verifyOtps } from '../controllers/auth.controller';
import { signupValidation, loginValidation, validate, initiateRegistrationValidation, verifyOtpValidation } from '../middleware/validation';
import { authenticateToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Auth routes with validation
router.post('/signup', validate(signupValidation), signup);
router.post('/login', validate(loginValidation), login);
// New route for initiating patient registration
router.post('/register', validate(initiateRegistrationValidation), initiateRegistration);
router.post('/verify-otp', validate(verifyOtpValidation), verifyOtps);

// Protected route (authentication required)
router.post('/logout', authenticateToken, logout);
export default router;