import axiosInstance from '@/lib/axiosInstance';

export interface QueueEntry {
  id: number;
  appointment_id: string;
  patient_id: string;
  queue_position: number;
  status: 'approved' | 'in_progress' | 'completed' | 'unavailable';
  completed_time: string | null;
  created_at: string;
  updated_at: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_gender: string;
  patient_age: number;
  medical_description: string;
  visiting_status: string;
  priority_rank: number;
  severity_score: number;
}

export interface QueueStats {
  total_patients: number;
  waiting_patients: number;
  in_progress_patients: number;
  completed_patients: number;
  unavailable_patients: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const queueService = {
  /**
   * Get the current queue for today
   */
  getCurrentQueue: async (): Promise<QueueEntry[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<QueueEntry[]>>('/queue');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching current queue:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch queue');
    }
  },

  /**
   * Get queue statistics
   */
  getQueueStats: async (): Promise<QueueStats> => {
    try {
      const response = await axiosInstance.get<ApiResponse<QueueStats>>('/queue/stats');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching queue stats:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch queue statistics');
    }
  },

  /**
   * Get the next patient in queue
   */
  getNextPatient: async (): Promise<QueueEntry | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<QueueEntry | null>>('/queue/next');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching next patient:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch next patient');
    }
  },

  /**
   * Get the current patient being served
   */
  getCurrentPatient: async (): Promise<QueueEntry | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<QueueEntry | null>>('/queue/current');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching current patient:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch current patient');
    }
  },

  /**
   * Call the next patient (move to in_progress)
   */
  callNextPatient: async (): Promise<QueueEntry> => {
    try {
      const response = await axiosInstance.post<ApiResponse<QueueEntry>>('/queue/call-next');
      return response.data.data;
    } catch (error: any) {
      console.error('Error calling next patient:', error);
      throw new Error(error.response?.data?.error || 'Failed to call next patient');
    }
  },

  /**
   * Update queue entry status
   */
  updateQueueEntryStatus: async (
    queueId: number, 
    status: 'approved' | 'in_progress' | 'completed' | 'unavailable'
  ): Promise<QueueEntry> => {
    try {
      const response = await axiosInstance.put<ApiResponse<QueueEntry>>(`/queue/${queueId}`, { status });
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating queue entry status:', error);
      throw new Error(error.response?.data?.error || 'Failed to update queue entry');
    }
  },

  /**
   * Mark current patient as completed
   */
  completeCurrentPatient: async (queueId: number): Promise<QueueEntry> => {
    return queueService.updateQueueEntryStatus(queueId, 'completed');
  },

  /**
   * Mark patient as unavailable
   */
  markPatientUnavailable: async (queueId: number): Promise<QueueEntry> => {
    return queueService.updateQueueEntryStatus(queueId, 'unavailable');
  }
};
