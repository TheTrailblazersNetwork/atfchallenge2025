import express, { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getPatientProfile } from '../services/patient.service';
import { getPatientAppointments } from '../services/appointment.service';

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

 // Route to get patient profile and appointments
router.get('/master/:id', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [patientProfile, appointments] = await Promise.all([
      getPatientProfile(id),
      getPatientAppointments(id),
    ]);

    if (!patientProfile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json({
      message: 'Patient profile and appointments retrieved successfully',
      patient: patientProfile,
      appointments: appointments
    });
  } catch (error) {
    console.error('Error fetching master patient data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
});

export default router;