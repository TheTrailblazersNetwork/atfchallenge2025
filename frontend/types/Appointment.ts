export interface AppointmentCardType {
  id: string;
  patient_id: string;
  medical_description: string;
  visiting_status: string;
  discharge_type?: string | null;
  priority_rank?: number | null;
  severity_score?: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentData {
  medical_description: string;
  visiting_status: string;
  discharge_type?: string;
}

export interface AppointmentResponse {
  success: boolean;
  message: string;
  data: AppointmentCardType | AppointmentCardType[];
}