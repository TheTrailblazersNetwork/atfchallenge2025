import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Generic validation middleware
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during validation'
      });
    }
  };
};

// Signup validation rules
export const signupValidation = [
  body('first_name')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters')
    .trim()
    .escape(),

  body('last_name')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters')
    .trim()
    .escape(),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('phone_number')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),

  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),

  body('dob')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Please provide a valid date of birth (YYYY-MM-DD)'),

  body('preferred_contact')
    .notEmpty()
    .withMessage('Preferred contact method is required')
    .isIn(['email', 'sms'])
    .withMessage('Preferred contact must be email or sms')
];

// Login validation rules
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Add Password Reset validation rules
export const forgotPasswordValidation = [
  body('identifier')
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

export const resetPasswordValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// Add these new validation arrays
export const appointmentValidation = [
  body('medical_description')
    .notEmpty()
    .withMessage('Medical description is required')
    .trim(),

  body('visiting_status')
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

  body('discharge_type')
    .optional()
    .isIn(['2weeks_post_discharge', '1week_early_review'])
    .withMessage('Invalid discharge type')
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