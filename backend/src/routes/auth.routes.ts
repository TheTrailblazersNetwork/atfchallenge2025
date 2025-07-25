import express, { Router } from 'express';
import { signup, login,logout } from '../controllers/auth.controller';
import { signupValidation, loginValidation, validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Auth routes with validation
router.post('/signup', validate(signupValidation), signup);
router.post('/login', validate(loginValidation), login);

// Protected route (authentication required)
router.post('/logout', authenticateToken, logout);
export default router;