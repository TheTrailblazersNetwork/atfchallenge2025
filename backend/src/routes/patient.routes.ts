import express, { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getPatientProfile } from '../services/patient.service';

const router: Router = express.Router();

// Protected route - requires authentication
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  const patientId = req.user?.id;
  if (typeof patientId !== 'string') {
    return res.status(400).json({ message: 'Invalid patient ID' });
  }
  const patientData = await getPatientProfile(patientId);

  if (!patientData) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }

  res.json({
    message: 'Patient profile accessed successfully',
    patient: {
      id: patientData.id,
      email: patientData.email,
      first_name: patientData.first_name,
      last_name: patientData.last_name,
      phone_number: patientData.phone_number,
      preferred_contact: patientData.preferred_contact,
      gender: patientData.gender,
      dob: patientData.dob,
    }
  });
});

// Get patient profile by ID
 // this endpoint should return all the patient profile data and the appointments data that are associated with that patient 
router.get('/master/:id', authenticateToken, (req: Request, res: Response) => {
  
  
    
  }
);

export default router;

