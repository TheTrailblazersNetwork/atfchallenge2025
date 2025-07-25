import express, { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Protected route - requires authentication
router.get('/profile', authenticateToken, (req: Request, res: Response) => {
  res.json({ 
    message: 'Patient profile accessed successfully',
    user: req.user // This will have id, email, etc.
  });
});

export default router;