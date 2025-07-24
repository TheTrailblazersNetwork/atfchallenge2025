import express, { Router } from 'express';
import { signup, login } from '../controllers/auth.controller';

const router: Router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/login', login);

export default router;