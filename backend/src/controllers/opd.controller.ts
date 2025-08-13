import { Request, Response } from 'express';
import { createOPDOperator, loginOPDOperator, getAllPatients, searchPatients, getPatientById } from '../services/opd.service';

export const opdSignup = async (req: Request, res: Response) => {
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

    const operator = await createOPDOperator({
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
  } catch (error: any) {
    console.error('OPD signup error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create OPD operator account'
    });
  }
};

export const opdLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await loginOPDOperator({ email, password });

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
  } catch (error: any) {
    console.error('OPD login error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Invalid credentials'
    });
  }
};

export const opdLogout = async (req: Request, res: Response) => {
  try {
    // Clear the HTTP-only cookie
    res.clearCookie('opdToken');
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error: any) {
    console.error('OPD logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout'
    });
  }
};

// Patient management endpoints for OPD
export const getOPDPatients = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    let patients;
    if (q && typeof q === 'string') {
      patients = await searchPatients(q);
    } else {
      patients = await getAllPatients();
    }

    res.json({
      success: true,
      patients,
      total: patients.length
    });
  } catch (error: any) {
    console.error('Error getting OPD patients:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch patients'
    });
  }
};

export const getOPDPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID is required'
      });
    }

    const patient = await getPatientById(id);

    res.json({
      success: true,
      patient
    });
  } catch (error: any) {
    console.error('Error getting OPD patient by ID:', error);
    const statusCode = error.message === 'Patient not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to fetch patient'
    });
  }
};
