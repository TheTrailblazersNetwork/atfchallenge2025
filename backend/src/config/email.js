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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCommunication = exports.sendEmailVerificationOTP = exports.sendAppointmentRebookedEmail = exports.sendAppointmentApprovedEmail = exports.sendWelcomeEmail = exports.sendPasswordResetConfirmationEmail = exports.sendPasswordResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sms_service_1 = require("../services/sms.service");
const createTransporter = () => {
    if (process.env.NODE_ENV === 'development') {
        return {
            sendMail: (mailOptions) => __awaiter(void 0, void 0, void 0, function* () {
                console.log('📧 EMAIL WOULD BE SENT:');
                console.log('To:', mailOptions.to);
                console.log('Subject:', mailOptions.subject);
                console.log('Body:', mailOptions.html);
                console.log('---');
                return { messageId: 'mock-message-id' };
            })
        };
    }
    return nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};
const sendPasswordResetEmail = (email, resetToken) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
        to: email,
        subject: '🔐 Password Reset Request',
        html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(16px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);">
          <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 32px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255, 255, 255, 0.1); border-radius: 50%;"></div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: white; letter-spacing: -0.5px;">ATFHEALTH</h1>
            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; letter-spacing: 1px;"> PASSWORD RESET</p>
          </div>
          
          <div style="padding: 32px; background: rgba(255, 255, 255, 0.05);">
            <h2 style="margin-top: 0; font-size: 20px; color: white; font-weight: 600;">Hello User,</h2>
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
              We received a request to reset your password. Click below to securely update your credentials:
            </p>
            
            <a href="${resetUrl}"
               style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white;
                      text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;
                      font-size: 16px; margin: 16px 0; border: none; cursor: pointer; transition: all 0.3s ease;"
               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(139, 92, 246, 0.3)'"
               onmouseout="this.style.transform='none'; this.style.boxShadow='none'">
              RESET PASSWORD
            </a>
            
            <div style="border-left: 3px solid #8b5cf6; padding-left: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #a5b4fc; font-weight: 500;">This link expires in 60 minutes</p>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                If you didn't request this, please secure your account immediately.
              </p>
            </div>
            
            <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 32px;">
              Can't click the button? Copy this link:<br>
              <span style="word-break: break-all; color: #a5b4fc;">${resetUrl}</span>
            </p>
          </div>
          
          <div style="padding: 16px; text-align: center; background: rgba(0, 0, 0, 0.2);">
            <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 12px; letter-spacing: 0.5px;">
              © ${new Date().getFullYear()} ATFHEALTH | PASSWORD RESET
            </p>
          </div>
        </div>
      </div>
    `
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log('📧 Password reset email sent:', info.messageId);
        return true;
    }
    catch (error) {
        console.error('❌ Error sending email:', error);
        return false;
    }
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
// NEW: Password Reset Confirmation Email
const sendPasswordResetConfirmationEmail = (email, firstName) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = createTransporter();
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
        to: email,
        subject: '✅ Password Reset Successful',
        html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(16px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255, 255, 255, 0.1); border-radius: 50%;"></div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: white; letter-spacing: -0.5px;">ATFHEALTH</h1>
            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; letter-spacing: 1px;">PASSWORD RESET CONFIRMED</p>
          </div>
          
          <div style="padding: 32px; background: rgba(255, 255, 255, 0.05);">
            <h2 style="margin-top: 0; font-size: 20px; color: white; font-weight: 600;">Hello ${firstName},</h2>
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
              ✅ Your password has been successfully reset. You can now login to your account with your new password.
            </p>
            
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #34d399; font-weight: 500;">🔒 Your account is now secure</p>
            </div>
            
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
              If you did not request this password reset, please contact our support team immediately to secure your account.
            </p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login"
               style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white;
                      text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;
                      font-size: 16px; margin: 16px 0; border: none; cursor: pointer; transition: all 0.3s ease;"
               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(16, 185, 129, 0.3)'"
               onmouseout="this.style.transform='none'; this.style.boxShadow='none'">
              LOGIN NOW
            </a>
          </div>
          
          <div style="padding: 16px; text-align: center; background: rgba(0, 0, 0, 0.2);">
            <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 12px; letter-spacing: 0.5px;">
              © ${new Date().getFullYear()} ATFHEALTH | PASSWORD RESET CONFIRMATION
            </p>
          </div>
        </div>
      </div>
    `
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log('📧 Password reset confirmation email sent:', info.messageId);
        return true;
    }
    catch (error) {
        console.error('❌ Error sending password reset confirmation email:', error);
        return false;
    }
});
exports.sendPasswordResetConfirmationEmail = sendPasswordResetConfirmationEmail;
// NEW: Welcome Email Template (Optional, for consistency)
const sendWelcomeEmail = (email, firstName) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = createTransporter();
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
        to: email,
        subject: '👋 Welcome to Our Healthcare Platform',
        html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(16px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);">
          <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 32px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255, 255, 255, 0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -80px; left: -30px; width: 150px; height: 150px; background: rgba(255, 255, 255, 0.05); border-radius: 50%;"></div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: white; letter-spacing: -0.5px; position: relative;">WELCOME TO ATF<span style="color: #a5b4fc;">HEALTH</span></h1>
            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; letter-spacing: 1px;">YOUR APPOINTMENT BOOKING JOURNEY BEGINS</p>
          </div>
          
          <div style="padding: 32px; background: rgba(255, 255, 255, 0.05);">
            <h2 style="margin-top: 0; font-size: 24px; color: white; font-weight: 600; letter-spacing: -0.25px;">Hello ${firstName},</h2>
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
              Signup successful 🎉 Proceed to schedule your appointments.
            </p>
            
            <div style="border-left: 3px solid #8b5cf6; padding-left: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #a5b4fc; font-weight: 500; font-size: 18px;">Your Patient profile is now active</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login"
               style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white;
                      text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;
                      font-size: 16px; margin: 16px 0; border: none; cursor: pointer; transition: all 0.3s ease;"
               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(139, 92, 246, 0.3)'"
               onmouseout="this.style.transform='none'; this.style.boxShadow='none'">
              LOGIN HERE
            </a>
            
            <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin-top: 32px;">
              Our support network is available 24/7 to assist you
            </p>
          </div>
          
          <div style="padding: 16px; text-align: center; background: rgba(0, 0, 0, 0.2);">
            <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 12px; letter-spacing: 0.5px;">
              © ${new Date().getFullYear()} ATFHEALTH | KORLE-BU TEACHING HOSPITAL
            </p>
          </div>
        </div>
      </div>
    `
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log('📧 Welcome email sent:', info.messageId);
        return true;
    }
    catch (error) {
        console.error('❌ Error sending welcome email:', error);
        return false;
    }
});
exports.sendWelcomeEmail = sendWelcomeEmail;
// NEW: Appointment Approved Email Template
const sendAppointmentApprovedEmail = (email, firstName, priorityRank, severityScore) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = createTransporter();
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
        to: email,
        subject: '✅ Appointment Approved - ATFHEALTH',
        html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(16px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255, 255, 255, 0.1); border-radius: 50%;"></div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: white; letter-spacing: -0.5px;">ATFHEALTH</h1>
            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; letter-spacing: 1px;">APPOINTMENT APPROVED</p>
          </div>
          <div style="padding: 32px; background: rgba(255, 255, 255, 0.05);">
            <h2 style="margin-top: 0; font-size: 20px; color: white; font-weight: 600;">Hello ${firstName},</h2>
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
              ✅ Great news! Your appointment request has been <strong>approved</strong>.
            </p>
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #34d399; font-weight: 500;">Priority: ${priorityRank} | Severity: ${severityScore}</p>
            </div>
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
              Please check your dashboard or await further instructions regarding the scheduled date and time.
            </p>
             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/patients"
               style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white;
                      text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;
                      font-size: 16px; margin: 16px 0; border: none; cursor: pointer; transition: all 0.3s ease;"
               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(16, 185, 129, 0.3)'"
               onmouseout="this.style.transform='none'; this.style.boxShadow='none'">
              VIEW DASHBOARD
            </a>
          </div>
          <div style="padding: 16px; text-align: center; background: rgba(0, 0, 0, 0.2);">
            <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 12px; letter-spacing: 0.5px;">
              © ${new Date().getFullYear()} ATFHEALTH | APPOINTMENT NOTIFICATION
            </p>
          </div>
        </div>
      </div>
    `
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log('📧 Appointment approved email sent:', info.messageId);
        return true;
    }
    catch (error) {
        console.error('❌ Error sending appointment approved email:', error);
        return false;
    }
});
exports.sendAppointmentApprovedEmail = sendAppointmentApprovedEmail;
// NEW: Appointment Rebooked/Waitlisted Email Template
const sendAppointmentRebookedEmail = (email, firstName, priorityRank, severityScore) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = createTransporter();
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
        to: email,
        subject: '📋 Appointment Status Update - ATFHEALTH',
        html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(16px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255, 255, 255, 0.1); border-radius: 50%;"></div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: white; letter-spacing: -0.5px;">ATFHEALTH</h1>
            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; letter-spacing: 1px;">APPOINTMENT STATUS UPDATE</p>
          </div>
          <div style="padding: 32px; background: rgba(255, 255, 255, 0.05);">
            <h2 style="margin-top: 0; font-size: 20px; color: white; font-weight: 600;">Hello ${firstName},</h2>
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
              Your appointment request is currently on the waiting list.
            </p>
            <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #fcd34d; font-weight: 500;">Priority: ${priorityRank} | Severity: ${severityScore}</p>
            </div>
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
              We will notify you once a slot becomes available. Thank you for your patience.
            </p>
             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/patients"
               style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white;
                      text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;
                      font-size: 16px; margin: 16px 0; border: none; cursor: pointer; transition: all 0.3s ease;"
               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(245, 158, 11, 0.3)'"
               onmouseout="this.style.transform='none'; this.style.boxShadow='none'">
              VIEW DASHBOARD
            </a>
          </div>
          <div style="padding: 16px; text-align: center; background: rgba(0, 0, 0, 0.2);">
            <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 12px; letter-spacing: 0.5px;">
              © ${new Date().getFullYear()} ATFHEALTH | APPOINTMENT NOTIFICATION
            </p>
          </div>
        </div>
      </div>
     `
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log('📧 Appointment rebooked/waitlist email sent:', info.messageId);
        return true;
    }
    catch (error) {
        console.error('❌ Error sending appointment rebooked email:', error);
        return false;
    }
});
exports.sendAppointmentRebookedEmail = sendAppointmentRebookedEmail;
// NEW: Function to send Email Verification OTP
const sendEmailVerificationOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = createTransporter();
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
        to: email,
        subject: '🔐 Verify Your Email Address',
        html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(16px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);">
          <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 32px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255, 255, 255, 0.1); border-radius: 50%;"></div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: white; letter-spacing: -0.5px;">ATFHEALTH</h1>
            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; letter-spacing: 1px;">EMAIL VERIFICATION</p>
          </div>
          
          <div style="padding: 32px; background: rgba(255, 255, 255, 0.05);">
            <h2 style="margin-top: 0; font-size: 20px; color: white; font-weight: 600;">Hello,</h2>
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
              Please use the following code to verify your email address:
            </p>
            
            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
              <p style="margin: 0; color: #a5b4fc; font-weight: 700; font-size: 24px; letter-spacing: 8px;">${otp}</p>
            </div>
            
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
              This code expires in ${process.env.OTP_EXPIRY_MINUTES || '15'} minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
          
          <div style="padding: 16px; text-align: center; background: rgba(0, 0, 0, 0.2);">
            <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 12px; letter-spacing: 0.5px;">
              © ${new Date().getFullYear()} ATFHEALTH | EMAIL VERIFICATION
            </p>
          </div>
        </div>
      </div>
    `
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log('📧 Email verification OTP sent:', info.messageId);
        return true;
    }
    catch (error) {
        console.error('❌ Error sending email verification OTP:', error);
        return false;
    }
});
exports.sendEmailVerificationOTP = sendEmailVerificationOTP;
// Unified communication function - UPDATED TYPE DEFINITION AND CASES
const sendCommunication = (email, phoneNumber, preferredContact, 
// --- UPDATE THE TYPE DEFINITION HERE ---
type, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        switch (type) {
            case 'password_reset':
                if (preferredContact === 'email') {
                    return yield (0, exports.sendPasswordResetEmail)(email, data.token);
                }
                else {
                    return yield (0, sms_service_1.sendPasswordResetSMS)(phoneNumber, data.token);
                }
            case 'password_reset_confirmation':
                if (preferredContact === 'email') {
                    return yield (0, exports.sendPasswordResetConfirmationEmail)(email, data.firstName);
                }
                else {
                    return yield (0, sms_service_1.sendPasswordResetConfirmationSMS)(phoneNumber, data.firstName);
                }
            case 'email_verification':
                if (preferredContact === 'email') {
                    return yield (0, exports.sendEmailVerificationOTP)(email, data.otp);
                }
                else {
                    console.warn(`⚠️ Sending email OTP to ${email} for user preferring ${preferredContact}.`);
                    return yield (0, exports.sendEmailVerificationOTP)(email, data.otp);
                }
            case 'welcome':
                if (preferredContact === 'email') {
                    return yield (0, exports.sendWelcomeEmail)(email, data.firstName);
                }
                else {
                    return yield (0, sms_service_1.sendWelcomeSMS)(phoneNumber, data.firstName);
                }
            // --- NEW CASES ---
            case 'appointment_approved':
                if (preferredContact === 'email') {
                    return yield (0, exports.sendAppointmentApprovedEmail)(email, data.firstName, data.priorityRank, data.severityScore);
                }
                else {
                    // Send SMS for approved appointment
                    return yield (0, sms_service_1.sendAppointmentApprovedSMS)(phoneNumber, data.firstName, data.priorityRank, data.severityScore);
                }
            case 'appointment_rebooked':
                if (preferredContact === 'email') {
                    return yield (0, exports.sendAppointmentRebookedEmail)(email, data.firstName, data.priorityRank, data.severityScore);
                }
                else {
                    // Send SMS for rebooked appointment
                    return yield (0, sms_service_1.sendAppointmentRebookedSMS)(phoneNumber, data.firstName, data.priorityRank, data.severityScore);
                }
            // --- END NEW CASES ---
            case 'appointment_reminder':
                // Implementation for appointment reminders (existing placeholder)
                console.log(`[TODO] Implement appointment reminder for ${preferredContact}`);
                return true;
            default:
                console.error('Unknown communication type:', type);
                return false;
        }
    }
    catch (error) {
        console.error('Error in sendCommunication:', error);
        return false;
    }
});
exports.sendCommunication = sendCommunication;
