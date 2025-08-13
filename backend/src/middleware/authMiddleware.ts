import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/express'; // Import from types

interface CustomRequest extends Request {
  user?: JwtPayload;
  opdOperator?: JwtPayload;
}

export const authenticateToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    
    req.user = decoded as JwtPayload;
    next();
  });
};

export const authenticateOPDOperator = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    
    const payload = decoded as JwtPayload;
    
    // Check if this is an OPD operator token
    if (!payload.isOPDOperator) {
      return res.status(403).json({ message: 'Access denied. OPD operator access required.' });
    }
    
    req.opdOperator = payload;
    next();
  });
};