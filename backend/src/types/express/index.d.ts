
interface JwtPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
  isOPDOperator?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      opdOperator?: JwtPayload;
    }
  }
}

export { JwtPayload };