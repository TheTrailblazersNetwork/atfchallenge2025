import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types/express';
interface CustomRequest extends Request {
    user?: JwtPayload;
    opdOperator?: JwtPayload;
}
export declare const authenticateToken: (req: CustomRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authenticateOPDOperator: (req: CustomRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
