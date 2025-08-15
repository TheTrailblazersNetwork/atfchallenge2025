import express, { Router } from 'express';
import { opdSignup, opdLogin, opdLogout, getOPDPatients, getOPDPatientById } from '../controllers/opd.controller';
import { authenticateToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

// OPD Authentication routes
router.post('/signup', opdSignup);
router.post('/login', opdLogin);
router.post('/logout', authenticateToken, opdLogout);

// OPD Patient management routes (protected)
router.get('/patients', authenticateToken, getOPDPatients);
router.get('/patients/:id', authenticateToken, getOPDPatientById);

export default router;
