import { Request, Response } from 'express';
/**
 * Gets the current queue for today
 */
export declare const getCurrentQueueController: (req: Request, res: Response) => Promise<void>;
/**
 * Updates the status of a queue entry
 */
export declare const updateQueueEntryController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Gets queue statistics for today
 */
export declare const getQueueStatsController: (req: Request, res: Response) => Promise<void>;
/**
 * Gets the next patient in queue
 */
export declare const getNextPatientController: (req: Request, res: Response) => Promise<void>;
/**
 * Gets the current patient being served
 */
export declare const getCurrentPatientController: (req: Request, res: Response) => Promise<void>;
/**
 * Calls the next patient (moves first approved patient to in_progress)
 */
export declare const callNextPatientController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
