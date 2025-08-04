import cron from 'node-cron';
import { getPendingAppointmentsForBatch } from '../services/appointment.service';
import { sendBatchToAI, processAIResults, simulateAIProcessing } from '../services/aiScheduling.service';

// --- Configuration ---
// Run every Wednesday at 12:01 PM
// Cron format: 'Minute Hour DayOfMonth Month DayOfWeek'
const SCHEDULE = '1 12 * * 3'; // 12:01 PM every Wednesday

// here the main function is executed by the CRON job to perform batch scheduling.
 // It fetches pending appointments, sends them to the AI, and processes the results.
 
const runBatchScheduling = async () => {
  console.log('🚀 [CRON JOB] Starting weekly batch appointment scheduling...');

  try {
    // --- 1. Fetch Pending Appointments ---
    console.log('🔍 [STEP 1/4] Fetching pending appointments from database...');
    const pendingAppointmentsData = await getPendingAppointmentsForBatch();

    if (!pendingAppointmentsData || pendingAppointmentsData.length === 0) {
      console.log('📭 [RESULT] No pending appointments found for scheduling.');
      return;
    }
    console.log(`📦 [RESULT] Successfully fetched ${pendingAppointmentsData.length} pending appointments.`);

    // --- 2. Format Data for AI ---
    console.log('🔄 [STEP 2/4] Formatting data for AI processing...');
    // The getPendingAppointmentsForBatch already fetches the fields correctly
    // Map the array to the structure expected by the AI API
    const aiPayload = {
      patients: pendingAppointmentsData.map(app => ({
        appointment_id: app.appointment_id, // fetched from a.id in the service
        age: parseInt(app.age, 10), // Ensure it's a number
        gender: app.gender,
        visiting_status: app.visiting_status,
        medical_condition: app.medical_condition // fetched from a.medical_description
        // registration_time will be added here if the AI API requires it
      }))
    };
    console.log(`✅ [RESULT] Data formatted for AI. Payload contains ${aiPayload.patients.length} patients.`);
    // Optional: Log a sample for debugging (first one)
    // console.log('📋 [DEBUG] Sample AI Payload (1st patient):', JSON.stringify(aiPayload.patients[0], null, 2));

    // --- 3. Send to AI for Processing ---
    console.log('🤖 [STEP 3/4] Sending data to Neurosurgery Triage AI API...');
    // --- IMPORTANT: Choose between real AI or simulation ---
    let aiResults;
    const USE_SIMULATION = process.env.USE_AI_SIMULATION === 'true'; // Set in .env for testing

    if (USE_SIMULATION) {
        console.log('🧪 [SIMULATION MODE] Using local AI simulation instead of calling the real API.');
        aiResults = await simulateAIProcessing(aiPayload);
    } else {
        console.log('🌐 [LIVE MODE] Calling the real Neurosurgery Triage AI API.');
        aiResults = await sendBatchToAI(aiPayload);
    }
    console.log('📨 [RESULT] Successfully received processed results from AI.');

    // --- 4. Process AI Results & Update Database ---
    console.log('💾 [STEP 4/4] Processing AI results and updating database...');
    await processAIResults(aiResults);
    console.log('✅ [RESULT] Database updated and patient notifications initiated.');

    console.log('🎉 [CRON JOB] Batch scheduling cycle completed successfully.');
  } catch (error: any) {
    console.error('❌ [CRON JOB] Batch scheduling cycle failed unexpectedly!');
    console.error('❌ [ERROR DETAILS] ', error?.message || error);

    // TODO: Implement robust admin alerting mechanism
    // Example: Send an email/SMS to admins, log to a monitoring service, etc.
    try {
        // Simple placeholder for alerting
        console.error('🚨 [ADMIN ALERT] A critical error occurred in the batch scheduling job. Manual intervention might be required.');
        // Example alerting logic (pseudo-code):
        // await sendAlertToAdmins(`Batch Scheduling Job Failed: ${error.message}`);
    } catch (alertError: any) {
        console.error('❌ [ALERTING] Failed to send admin alert:', alertError?.message || alertError);
    }
  }
};

// --- Schedule the Job ---
console.log(`⏰ [INIT] Batch scheduling job initialized.`);
console.log(`⏰ [SCHEDULE] Configured to run cron schedule: '${SCHEDULE}' (Every Wednesday at 12:01 PM).`);
// Schedule the job using node-cron
const job = cron.schedule(SCHEDULE, runBatchScheduling);

// Optional: Export the job instance and the run function for potential manual triggering or testing
export { job, runBatchScheduling };
console.log(`✅ [INIT] Batch scheduling job is now active.`);