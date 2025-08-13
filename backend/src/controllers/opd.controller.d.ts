import { Request, Response } from 'express';
export declare const opdSignup: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const opdLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const opdLogout: (req: Request, res: Response) => Promise<void>;
export declare const getOPDPatients: (req: Request, res: Response) => Promise<void>;
export declare const getOPDPatientById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
