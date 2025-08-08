import express, { Router } from 'express';
import { 
  forgotPassword, 
  validateToken, 
  resetUserPassword 
} from '../controllers/passwordReset.controller';
import { param } from 'express-validator';
import { validate, forgotPasswordValidation, resetPasswordValidation } from '../middleware/validation';

const router: Router = express.Router();

// Flexible password reset - accepts email or phone
router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);

// Validate reset token
router.get('/reset-password/:token', [
  param('token').notEmpty().withMessage('Token is required')
],  validateToken);

// Reset password with token
router.post('/reset-password/:token', [
  param('token').notEmpty().withMessage('Token is required')
], validate(resetPasswordValidation), resetUserPassword);

export default router;