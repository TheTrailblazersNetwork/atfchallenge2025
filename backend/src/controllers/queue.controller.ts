import { Request, Response } from 'express';
import { 
  getCurrentQueue,
  updateQueueEntryStatus,
  getQueueStats,
  getNextPatientInQueue,
  getCurrentPatientBeingServed
} from '../services/queue.service';

/**
 * Gets the current queue for today
 */
export const getCurrentQueueController = async (req: Request, res: Response) => {
  try {
    const queue = await getCurrentQueue();
    
    res.status(200).json({
      success: true,
      message: 'Queue retrieved successfully',
      data: queue
    });
  } catch (error: any) {
    console.error('Get current queue error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve queue'
    });
  }
};

/**
 * Updates the status of a queue entry
 */
export const updateQueueEntryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['approved', 'in_progress', 'completed', 'unavailable'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: approved, in_progress, completed, unavailable'
      });
    }

    const updatedEntry = await updateQueueEntryStatus(parseInt(id), status);

    if (!updatedEntry) {
      return res.status(404).json({
        success: false,
        error: 'Queue entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Queue entry updated successfully',
      data: updatedEntry
    });
  } catch (error: any) {
    console.error('Update queue entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update queue entry'
    });
  }
};

/**
 * Gets queue statistics for today
 */
export const getQueueStatsController = async (req: Request, res: Response) => {
  try {
    const stats = await getQueueStats();
    
    res.status(200).json({
      success: true,
      message: 'Queue statistics retrieved successfully',
      data: stats
    });
  } catch (error: any) {
    console.error('Get queue stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve queue statistics'
    });
  }
};

/**
 * Gets the next patient in queue
 */
export const getNextPatientController = async (req: Request, res: Response) => {
  try {
    const nextPatient = await getNextPatientInQueue();
    
    res.status(200).json({
      success: true,
      message: nextPatient ? 'Next patient retrieved successfully' : 'No patients waiting in queue',
      data: nextPatient
    });
  } catch (error: any) {
    console.error('Get next patient error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve next patient'
    });
  }
};

/**
 * Gets the current patient being served
 */
export const getCurrentPatientController = async (req: Request, res: Response) => {
  try {
    const currentPatient = await getCurrentPatientBeingServed();
    
    res.status(200).json({
      success: true,
      message: currentPatient ? 'Current patient retrieved successfully' : 'No patient currently being served',
      data: currentPatient
    });
  } catch (error: any) {
    console.error('Get current patient error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve current patient'
    });
  }
};

/**
 * Calls the next patient (moves first approved patient to in_progress)
 */
export const callNextPatientController = async (req: Request, res: Response) => {
  try {
    // First check if there's already a patient in progress
    const currentPatient = await getCurrentPatientBeingServed();
    if (currentPatient) {
      return res.status(400).json({
        success: false,
        error: 'A patient is already being served. Please complete the current patient first.'
      });
    }

    // Get the next patient in queue
    const nextPatient = await getNextPatientInQueue();
    if (!nextPatient) {
      return res.status(404).json({
        success: false,
        error: 'No patients waiting in queue'
      });
    }

    // Update the patient status to in_progress
    const updatedEntry = await updateQueueEntryStatus(nextPatient.id, 'in_progress');

    res.status(200).json({
      success: true,
      message: 'Next patient called successfully',
      data: updatedEntry
    });
  } catch (error: any) {
    console.error('Call next patient error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to call next patient'
    });
  }
};
