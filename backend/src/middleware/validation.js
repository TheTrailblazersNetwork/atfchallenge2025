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
exports.verifyOtpValidation = exports.initiateRegistrationValidation = exports.appointmentValidation = exports.resetPasswordValidation = exports.forgotPasswordValidation = exports.loginValidation = exports.signupValidation = exports.validate = void 0;
const express_validator_1 = require("express-validator");
// Generic validation middleware
const validate = (validations) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield Promise.all(validations.map(validation => validation.run(req)));
            const errors = (0, express_validator_1.validationResult)(req);
            if (errors.isEmpty()) {
                return next();
            }
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        catch (error) {
            console.error('Validation middleware error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error during validation'
            });
        }
    });
};
exports.validate = validate;
// Signup validation rules
exports.signupValidation = [
    (0, express_validator_1.body)('first_name')
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 2 })
        .withMessage('First name must be at least 2 characters')
        .trim()
        .escape(),
    (0, express_validator_1.body)('last_name')
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ min: 2 })
        .withMessage('Last name must be at least 2 characters')
        .trim()
        .escape(),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('phone_number')
        .notEmpty()
        .withMessage('Phone number is required')
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('gender')
        .notEmpty()
        .withMessage('Gender is required')
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),
    (0, express_validator_1.body)('dob')
        .notEmpty()
        .withMessage('Date of birth is required')
        .isISO8601()
        .withMessage('Please provide a valid date of birth (YYYY-MM-DD)'),
    (0, express_validator_1.body)('preferred_contact')
        .notEmpty()
        .withMessage('Preferred contact method is required')
        .isIn(['email', 'sms'])
        .withMessage('Preferred contact must be email or sms')
];
// Login validation rules
exports.loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
// Add Password Reset validation rules
exports.forgotPasswordValidation = [
    (0, express_validator_1.body)('identifier')
        .notEmpty()
        .withMessage('Email or phone number is required')
        .custom((value) => {
        // Check if it's a valid email OR a valid phone number
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\+233|0)?[2-5]\d{8}$/; // Ghana phone format
        if (!emailRegex.test(value) && !phoneRegex.test(value)) {
            throw new Error('Please provide a valid email or phone number');
        }
        return true;
    })
];
exports.resetPasswordValidation = [
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
];
// Add these new validation arrays
exports.appointmentValidation = [
    (0, express_validator_1.body)('medical_description')
        .notEmpty()
        .withMessage('Medical description is required')
        .trim(),
    (0, express_validator_1.body)('visiting_status')
        .notEmpty()
        .withMessage('Visiting status is required')
        .isIn([
        'discharged_inpatient_2weeks',
        'discharged_inpatient_1week',
        'external_referral',
        'internal_referral',
        'review_patient'
    ])
        .withMessage('Invalid visiting status'),
    (0, express_validator_1.body)('discharge_type')
        .optional()
        .isIn(['2weeks_post_discharge', '1week_early_review'])
        .withMessage('Invalid discharge type')
];
exports.initiateRegistrationValidation = exports.signupValidation;
exports.verifyOtpValidation = [
    (0, express_validator_1.body)('otp')
        .notEmpty()
        .withMessage('Verification code is required')
        .isLength({ min: 6, max: 6 })
        .withMessage('Verification code must be 6 digits')
        .matches(/^\d+$/)
        .withMessage('Verification code must be numeric'),
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Verification ID is required')
        .isUUID()
        .withMessage('Invalid verification ID format')
];
// export const scheduleValidation = [
//   body('appointment_date')
//     .notEmpty()
//     .withMessage('Appointment date is required')
//     .isISO8601()
//     .withMessage('Invalid date format'),
//   body('appointment_start_time')
//     .notEmpty()
//     .withMessage('Appointment start time is required')
//     .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
//     .withMessage('Invalid time format (HH:MM)'),
//   body('appointment_end_time')
//     .notEmpty()
//     .withMessage('Appointment end time is required')
//     .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
//     .withMessage('Invalid time format (HH:MM)'),
//   body('arrival_time')
//     .notEmpty()
//     .withMessage('Arrival time is required')
//     .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
//     .withMessage('Invalid time format (HH:MM)'),
//   body('day_before_visit')
//     .notEmpty()
//     .withMessage('Day before visit is required')
//     .isISO8601()
//     .withMessage('Invalid date format')
// ];
