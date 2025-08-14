import { Request, Response } from 'express';
import { 
  createNewAppointment,
  getPatientAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment
} from '../services/appointment.service';

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { medical_description, visiting_status, discharge_type } = req.body;
    const patientId = req.user?.id; // From auth middleware

    if (!patientId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Patient ID not found'
      });
    }

    // Validation
    if (!medical_description || !visiting_status) {
      return res.status(400).json({
        success: false,
        error: 'Medical description and visiting status are required'
      });
    }

    // Check for existing pending appointment
    const existingAppointments = await getPatientAppointments(patientId);
    const pendingAppointment = existingAppointments.find(
      appointment => appointment.status === 'pending'
    );

    if (pendingAppointment) {
      return res.status(400).json({
        success: false,
        error: 'Pending appointment already exists'
      });
    }

    const appointment = await createNewAppointment({
      patient_id: patientId,
      medical_description,
      visiting_status,
      discharge_type
    });

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully. Scheduling will be processed on Wednesday.',
      data: appointment
    });
  } catch (error: any) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create appointment'
    });
  }
};

export const getPatientAppointmentsController = async (req: Request, res: Response) => {
  try {
    const patientId = req.user?.id;

    if (!patientId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Patient ID not found'
      });
    }

    const appointments = await getPatientAppointments(patientId);

    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: appointments
    });
  } catch (error: any) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve appointments'
    });
  }
};

export const getAppointmentByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patientId = req.user?.id;

    if (!patientId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Patient ID not found'
      });
    }

    const appointment = await getAppointmentById(id, patientId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment retrieved successfully',
      data: appointment
    });
  } catch (error: any) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve appointment'
    });
  }
};

export const updateAppointmentController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const patientId = req.user?.id;

    if (!patientId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Patient ID not found'
      });
    }

    const appointment = await updateAppointment(id, patientId, updateData);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully. Changes will be considered in Wednesday scheduling.',
      data: appointment
    });
  } catch (error: any) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment'
    });
  }
};

// REMOVED: updateAppointmentScheduleController - not needed for batch processing

export const cancelAppointmentController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patientId = req.user?.id;

    if (!patientId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Patient ID not found'
      });
    }

    const result = await cancelAppointment(id, patientId);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error: any) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel appointment'
    });
  }
};