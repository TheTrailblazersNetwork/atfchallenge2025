import axios from 'axios';
import pool from '../config/db';
import { updateAppointmentsAfterAI } from './appointment.service';
import { createQueueFromApprovedAppointments } from './queue.service';

//  type definitions
type CommunicationType = 
  | 'password_reset'
  | 'welcome'
  | 'appointment_reminder'
  | 'password_reset_confirmation'
  | 'appointment_approved'
  | 'appointment_rebooked';

type PreferredContact = 'email' | 'sms';

interface CommunicationData {
  firstName: string;
  priorityRank?: number;
  severityScore?: number;
  status?: string;
}

// --- Interfaces matching the AI API contract ---
interface AIPayloadPatient {
  appointment_id: string;
  age: number;
  gender: string;
  visiting_status: string;
  medical_condition: string;
}

interface AIPayload {
  patients: AIPayloadPatient[];
}

interface AIPatientResult {
  priority_rank: number;
  severity_score: number;
  status: 'APPROVED' | 'REBOOK';
  scheduled_date?: string;
}

interface AIReturn {
  results: {
    [appointment_id: string]: AIPatientResult;
  };
}

// --- Core Functions ---
export const sendBatchToAI = async (payload: AIPayload): Promise<AIReturn> => {
  const aiApiUrl = process.env.NEUROSURGERY_TRIAGE_API_URL?.trim() || 'https://atfchallenge2025.onrender.com';
  const endpoint = `${aiApiUrl}/sort`;

  try {
    console.log(`📤 Sending batch of ${payload.patients.length} appointments to Neurosurgery Triage AI at ${endpoint}...`);

    const response = await axios.post<AIReturn>(
      endpoint,
      payload.patients,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 90000
      }
    );

    console.log('📥 Successfully received response from AI API.');

    if (!response.data || typeof response.data !== 'object' || !response.data.results) {
      const errorMsg = 'Invalid response structure received from AI API. Missing "results" object.';
      console.error(errorMsg);
      console.error('Response received:', JSON.stringify(response.data, null, 2));
      throw new Error(errorMsg);
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ AI batch processing failed:');
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Status Text: ${error.response.statusText}`);
        console.error(`   Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.request) {
        console.error('   No response received from AI API. Please check network connectivity or AI API status.');
        console.error(`   Request Details: ${JSON.stringify(error.request, null, 2)}`);
      } else {
        console.error(`   Error setting up request: ${error.message}`);
      }
    } else {
      console.error(`   Unexpected error: ${error.message}`);
    }
    throw new Error(`Failed to process appointment batch with AI: ${error.message || 'Unknown error'}`);
  }
};

export const processAIResults = async (aiResponse: AIReturn) => {
  try {
    console.log('💾 Starting to process AI results and update database...');

    const formattedResults = Object.entries(aiResponse.results).map(([appointment_id, data]) => ({
      appointment_id,
      priority_rank: data.priority_rank,
      severity_score: data.severity_score,
      status: data.status.toLowerCase() as 'approved' | 'rebook'
    }));

    if (formattedResults.length === 0) {
      console.warn('⚠️ No results to process in AI response.');
      return [];
    }

    console.log(`💾 Preparing to update ${formattedResults.length} appointments in the database...`);
    const updatedAppointments = await updateAppointmentsAfterAI(formattedResults);

    console.log(`✅ Database update successful. Updated ${updatedAppointments.length} appointments.`);

    // --- CREATE QUEUE ENTRIES BEFORE NOTIFICATIONS ---
    console.log('📋 Creating queue entries for approved appointments...');
    try {
      await createQueueFromApprovedAppointments(formattedResults);
      console.log('✅ Queue creation successful.');
    } catch (queueError: any) {
      console.error('❌ Queue creation failed:', queueError?.message || queueError);
      // Don't throw here as notifications should still be sent
    }

    console.log('📧 Initiating patient notifications...');
    let notificationCount = 0;
    for (const appointment of updatedAppointments) {
      try {
        await notifyPatientOfScheduling(appointment);
        notificationCount++;
      } catch (notifyError: any) {
        console.error(`❌ Failed to notify patient for appointment ${appointment.id || appointment.appointment_id}:`, notifyError?.message || notifyError);
      }
    }
    console.log(`📧 Patient notification process completed. Attempted notifications for ${notificationCount} appointments.`);

    return updatedAppointments;
  } catch (error: any) {
    console.error('❌ Critical error during AI result processing:', error?.message || error);
    throw error;
  }
};

// --- Helper Functions ---
const notifyPatientOfScheduling = async (appointment: any) => {
  const appointmentId = appointment.id || appointment.appointment_id;
  if (!appointmentId) {
    console.error('❌ Cannot notify patient: Appointment ID is missing.');
    return;
  }

  try {
    const result = await pool.query(
      `SELECT
        p.email,
        p.phone_number,
        p.preferred_contact,
        p.first_name,
        a.priority_rank,
        a.severity_score,
        a.status
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.id = $1`,
      [appointmentId]
    );

    if (result.rows.length === 0) {
      console.warn(`⚠️ No patient data found for appointment ID: ${appointmentId}. Skipping notification.`);
      return;
    }

    const patientData = result.rows[0];
    console.log(`📧 Preparing notification for patient ${patientData.first_name} (${appointmentId}) with status '${patientData.status}'`);

    // Determine correct message type based on status
    let messageType: CommunicationType;
    const messageData: CommunicationData = {
      firstName: patientData.first_name,
      priorityRank: patientData.priority_rank,
      severityScore: patientData.severity_score,
      status: patientData.status
    };

    switch (patientData.status.toLowerCase()) {
      case 'approved':
        messageType = 'appointment_approved';
        break;
      case 'rebook':
        messageType = 'appointment_rebooked';
        break;
      default:
        console.warn(`Unsupported appointment status: ${patientData.status}`);
        return;
    }

    const { sendCommunication } = await import('../config/email');
    const success = await sendCommunication(
      patientData.email,
      patientData.phone_number,
      patientData.preferred_contact as PreferredContact,
      messageType,
      messageData
    );

    if (success) {
      console.log(`📧 Successfully sent notification to ${patientData.first_name}`);
    } else {
      console.error(`❌ Failed to send notification to ${patientData.first_name}`);
    }

    // Simulation fallback
    let messagePreview = '';
    if (patientData.status === 'approved') {
      messagePreview = `Hello ${patientData.first_name}, your appointment has been approved. Check your dashboard for details.`;
    } else if (patientData.status === 'rebook') {
      messagePreview = `Hello ${patientData.first_name}, your appointment is on the waiting list.`;
    }
    console.log(`📧 [SIMULATED] Would send to ${patientData.preferred_contact}: "${messagePreview}"`);
    
  } catch (error: any) {
    console.error(`❌ Error during notification process for appointment ${appointmentId}:`, error?.message || error);
  }
};

// --- Simulation for Testing ---
export const simulateAIProcessing = async (payload: AIPayload): Promise<AIReturn> => {
  console.log(`🧪 Simulating AI processing for ${payload.patients.length} appointments locally...`);
  const results: { [key: string]: AIPatientResult } = {};

  payload.patients.forEach((patient, index) => {
    let priority_rank = 4;
    let baseSeverity = 5;
    
    if (patient.medical_condition.toLowerCase().includes('emergency') || 
        patient.medical_condition.toLowerCase().includes('severe')) {
      baseSeverity = 9;
    } else if (patient.medical_condition.toLowerCase().includes('routine')) {
      baseSeverity = 3;
    }

    switch(patient.visiting_status) {
      case 'discharged_inpatient_2weeks':
      case 'discharged_inpatient_1week':
        priority_rank = 1;
        baseSeverity = Math.min(10, baseSeverity + 2);
        break;
      case 'internal_referral':
        priority_rank = 2;
        baseSeverity = Math.min(10, baseSeverity + 1);
        break;
      case 'external_referral':
        priority_rank = 3;
        break;
      case 'review_patient':
        priority_rank = 4;
        baseSeverity = Math.max(1, baseSeverity - 1);
        break;
      default:
        priority_rank = 5;
        baseSeverity = Math.max(1, baseSeverity - 2);
    }

    const severity_score = Math.min(10, Math.max(1, Math.round(baseSeverity + (Math.random() * 4) - 2)));
    const capacity = 170;
    const status: 'APPROVED' | 'REBOOK' = index < capacity ? 'APPROVED' : 'REBOOK';

    const today = new Date();
    const nextThursday = new Date(today);
    nextThursday.setDate(today.getDate() + ((4 - today.getDay() + 7) % 7 || 7));
    const scheduled_date = nextThursday.toISOString().split('T')[0];

    results[patient.appointment_id] = {
      priority_rank,
      severity_score,
      status,
      scheduled_date
    };
  });

  const sortedEntries = Object.entries(results).sort((a, b) => {
    const rankA = a[1].priority_rank;
    const rankB = b[1].priority_rank;
    return rankA !== rankB ? rankA - rankB : b[1].severity_score - a[1].severity_score;
  });

  const sortedResults: { [key: string]: AIPatientResult } = {};
  sortedEntries.forEach(([id, data]) => {
    sortedResults[id] = data;
  });

  console.log('🧪 AI simulation completed.');
  return { results: sortedResults };
};