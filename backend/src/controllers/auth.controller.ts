import { Request, Response } from 'express';
import { registerPatient, loginPatient } from '../services/auth.service';

export const signup = async (req: Request, res: Response) => {
  try {
    const result = await registerPatient(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginPatient(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};
