import { OPDOperatorCreateInput, OPDOperatorLoginInput, OPDOperatorResponse } from '../models/OPDOperator';
export declare const createOPDOperator: (operatorData: OPDOperatorCreateInput) => Promise<OPDOperatorResponse>;
export declare const loginOPDOperator: (loginData: OPDOperatorLoginInput) => Promise<{
    operator: OPDOperatorResponse;
    token: string;
}>;
export declare const getOPDOperatorById: (id: number) => Promise<OPDOperatorResponse>;
export declare const getAllPatients: () => Promise<any[]>;
export declare const searchPatients: (query: string) => Promise<any[]>;
export declare const getPatientById: (id: string) => Promise<any>;
