"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientById = exports.searchPatients = exports.getAllPatients = exports.getOPDOperatorById = exports.loginOPDOperator = exports.createOPDOperator = void 0;
const db_1 = __importDefault(require("../config/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'opd-secret-key';
const SALT_ROUNDS = 10;
const createOPDOperator = (operatorData) => __awaiter(void 0, void 0, void 0, function* () {
    const { full_name, email, phone_number, password } = operatorData;
    try {
        // Check if user already exists
        const existingUser = yield db_1.default.query('SELECT id FROM opd_operators WHERE email = $1 OR phone_number = $2', [email, phone_number]);
        if (existingUser.rows.length > 0) {
            throw new Error('An operator with this email or phone number already exists');
        }
        // Hash password
        const password_hash = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
        // Insert new operator
        const result = yield db_1.default.query(`INSERT INTO opd_operators (full_name, email, phone_number, password_hash, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING id, full_name, email, phone_number, created_at, updated_at`, [full_name, email, phone_number, password_hash]);
        return result.rows[0];
    }
    catch (error) {
        console.error('Error creating OPD operator:', error);
        if (error.code === '23505') {
            throw new Error('An operator with this email or phone number already exists');
        }
        throw error;
    }
});
exports.createOPDOperator = createOPDOperator;
const loginOPDOperator = (loginData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = loginData;
    try {
        // Get operator by email
        const result = yield db_1.default.query('SELECT * FROM opd_operators WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            throw new Error('Invalid email or password');
        }
        const operator = result.rows[0];
        // Verify password
        const isPasswordValid = yield bcrypt_1.default.compare(password, operator.password_hash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            id: operator.id,
            email: operator.email,
            type: 'opd_operator',
            full_name: operator.full_name,
            isOPDOperator: true
        }, JWT_SECRET, { expiresIn: '24h' });
        // Return operator data without password hash
        const { password_hash } = operator, operatorResponse = __rest(operator, ["password_hash"]);
        return {
            operator: operatorResponse,
            token
        };
    }
    catch (error) {
        console.error('Error logging in OPD operator:', error);
        throw error;
    }
});
exports.loginOPDOperator = loginOPDOperator;
const getOPDOperatorById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query('SELECT id, full_name, email, phone_number, created_at, updated_at FROM opd_operators WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            throw new Error('OPD operator not found');
        }
        return result.rows[0];
    }
    catch (error) {
        console.error('Error getting OPD operator:', error);
        throw error;
    }
});
exports.getOPDOperatorById = getOPDOperatorById;
const getAllPatients = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`SELECT id, first_name, last_name, email, phone_number, dob as date_of_birth, 
              gender, preferred_contact, created_at,
              'active' as status
       FROM patients 
       ORDER BY created_at DESC`);
        return result.rows;
    }
    catch (error) {
        console.error('Error getting all patients:', error);
        throw error;
    }
});
exports.getAllPatients = getAllPatients;
const searchPatients = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = `%${query}%`;
        const result = yield db_1.default.query(`SELECT id, first_name, last_name, email, phone_number, dob as date_of_birth, 
              gender, preferred_contact, created_at,
              'active' as status
       FROM patients 
       WHERE first_name ILIKE $1 
          OR last_name ILIKE $1 
          OR email ILIKE $1 
          OR phone_number ILIKE $1
       ORDER BY created_at DESC`, [searchQuery]);
        return result.rows;
    }
    catch (error) {
        console.error('Error searching patients:', error);
        throw error;
    }
});
exports.searchPatients = searchPatients;
const getPatientById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`SELECT id, first_name, last_name, email, phone_number, dob as date_of_birth, 
              gender, preferred_contact, created_at,
              'active' as status
       FROM patients 
       WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            throw new Error('Patient not found');
        }
        return result.rows[0];
    }
    catch (error) {
        console.error('Error getting patient by ID:', error);
        throw error;
    }
});
exports.getPatientById = getPatientById;
