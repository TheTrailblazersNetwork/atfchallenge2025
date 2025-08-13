export interface OPDOperator {
    id: number;
    full_name: string;
    email: string;
    phone_number: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}
export interface OPDOperatorCreateInput {
    full_name: string;
    email: string;
    phone_number: string;
    password: string;
}
export interface OPDOperatorLoginInput {
    email: string;
    password: string;
}
export interface OPDOperatorResponse {
    id: number;
    full_name: string;
    email: string;
    phone_number: string;
    created_at: Date;
    updated_at: Date;
}
