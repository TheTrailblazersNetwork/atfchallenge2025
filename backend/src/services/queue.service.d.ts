interface QueueEntry {
    id: number;
    appointment_id: string;
    patient_id: string;
    queue_position: number;
    status: 'approved' | 'in_progress' | 'completed' | 'unavailable';
    completed_time: string | null;
    created_at: string;
    updated_at: string;
}
interface QueueEntryWithPatientInfo extends QueueEntry {
    patient_first_name: string;
    patient_last_name: string;
    patient_gender: string;
    patient_age: number;
    medical_description: string;
    visiting_status: string;
    priority_rank: number;
    severity_score: number;
}
/**
 * Creates queue entries for approved appointments in the order provided by AI
 * This is called after AI processing and before notifications
 */
export declare const createQueueFromApprovedAppointments: (approvedResults: Array<{
    appointment_id: string;
    priority_rank: number;
    severity_score: number;
    status: "approved" | "rebook";
}>) => Promise<QueueEntry[]>;
/**
 * Gets the current queue with patient and appointment information
 */
export declare const getCurrentQueue: () => Promise<QueueEntryWithPatientInfo[]>;
/**
 * Updates the status of a queue entry
 */
export declare const updateQueueEntryStatus: (queueId: number, status: "approved" | "in_progress" | "completed" | "unavailable") => Promise<QueueEntry | null>;
/**
 * Gets queue statistics for the current day
 */
export declare const getQueueStats: () => Promise<any>;
/**
 * Gets the next patient in queue (first approved patient)
 */
export declare const getNextPatientInQueue: () => Promise<QueueEntryWithPatientInfo | null>;
/**
 * Gets the current patient being served (in_progress status)
 */
export declare const getCurrentPatientBeingServed: () => Promise<QueueEntryWithPatientInfo | null>;
export {};
