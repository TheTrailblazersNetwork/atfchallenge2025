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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOPDPatientById = exports.getOPDPatients = exports.opdLogout = exports.opdLogin = exports.opdSignup = void 0;
const opd_service_1 = require("../services/opd.service");
const opdSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { full_name, email, phone_number, password } = req.body;
        // Basic validation
        if (!full_name || !email || !phone_number || !password) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required: full_name, email, phone_number, password'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid email address'
            });
        }
        // Phone validation (10 digits starting with 0)
        const phoneRegex = /^0[0-9]{9}$/;
        if (!phoneRegex.test(phone_number.replace(/\s/g, ''))) {
            return res.status(400).json({
                success: false,
                error: 'Phone number must be 10 digits starting with 0 (e.g., 0534155475)'
            });
        }
        const operator = yield (0, opd_service_1.createOPDOperator)({
            full_name,
            email,
            phone_number,
            password
        });
        res.status(201).json({
            success: true,
            message: 'OPD operator account created successfully',
            operator
        });
    }
    catch (error) {
        console.error('OPD signup error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create OPD operator account'
        });
    }
});
exports.opdSignup = opdSignup;
const opdLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
        const result = yield (0, opd_service_1.loginOPDOperator)({ email, password });
        // Set HTTP-only cookie for the token
        res.cookie('opdToken', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        res.json({
            success: true,
            message: 'Login successful',
            operator: result.operator,
            token: result.token
        });
    }
    catch (error) {
        console.error('OPD login error:', error);
        res.status(401).json({
            success: false,
            error: error.message || 'Invalid credentials'
        });
    }
});
exports.opdLogin = opdLogin;
const opdLogout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Clear the HTTP-only cookie
        res.clearCookie('opdToken');
        res.json({
            success: true,
            message: 'Logout successful'
        });
    }
    catch (error) {
        console.error('OPD logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to logout'
        });
    }
});
exports.opdLogout = opdLogout;
// Patient management endpoints for OPD
const getOPDPatients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q } = req.query;
        let patients;
        if (q && typeof q === 'string') {
            patients = yield (0, opd_service_1.searchPatients)(q);
        }
        else {
            patients = yield (0, opd_service_1.getAllPatients)();
        }
        res.json({
            success: true,
            patients,
            total: patients.length
        });
    }
    catch (error) {
        console.error('Error getting OPD patients:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch patients'
        });
    }
});
exports.getOPDPatients = getOPDPatients;
const getOPDPatientById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Patient ID is required'
            });
        }
        const patient = yield (0, opd_service_1.getPatientById)(id);
        res.json({
            success: true,
            patient
        });
    }
    catch (error) {
        console.error('Error getting OPD patient by ID:', error);
        const statusCode = error.message === 'Patient not found' ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'Failed to fetch patient'
        });
    }
});
exports.getOPDPatientById = getOPDPatientById;
