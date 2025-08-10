import axiosInstance from "@/lib/axiosInstance";
import system_api from "@/app/data/api";
import { CreateAppointmentData, AppointmentCardType, AppointmentResponse } from "@/types/Appointment";

// Create a new appointment
export const createAppointment = async (appointmentData: CreateAppointmentData): Promise<AppointmentResponse> => {
  try {
    const response = await axiosInstance.post(system_api.appointments.create, appointmentData);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'Failed to create appointment');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Get all appointments for the logged-in patient
export const getPatientAppointments = async (): Promise<AppointmentCardType[]> => {
  try {
    const response = await axiosInstance.get(system_api.appointments.getAll);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch appointments');
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'Failed to fetch appointments');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Get a specific appointment by ID
export const getAppointmentById = async (appointmentId: string): Promise<AppointmentCardType> => {
  try {
    const response = await axiosInstance.get(`${system_api.appointments.getById}${appointmentId}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch appointment');
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'Failed to fetch appointment');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Update an appointment
export const updateAppointment = async (
  appointmentId: string, 
  updateData: Partial<CreateAppointmentData>
): Promise<AppointmentCardType> => {
  try {
    const response = await axiosInstance.put(`${system_api.appointments.update}${appointmentId}`, updateData);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update appointment');
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'Failed to update appointment');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Cancel an appointment
export const cancelAppointment = async (appointmentId: string): Promise<void> => {
  try {
    const response = await axiosInstance.delete(`${system_api.appointments.cancel}${appointmentId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to cancel appointment');
    }
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'Failed to cancel appointment');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Test batch scheduling (development only)
export const triggerBatchScheduling = async (): Promise<void> => {
  try {
    const response = await axiosInstance.post(system_api.appointments.testBatch);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to trigger batch scheduling');
    }
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'Failed to trigger batch scheduling');
    }
    throw new Error('Network error. Please try again.');
  }
};
