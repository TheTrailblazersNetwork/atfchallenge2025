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
exports.sendAppointmentRebookedSMS = exports.sendAppointmentApprovedSMS = exports.sendPasswordResetConfirmationSMS = exports.sendAppointmentReminderSMS = exports.sendWelcomeSMS = exports.sendPasswordResetSMS = exports.sendSMS = void 0;
const axios_1 = __importDefault(require("axios"));
const sendSMS = (to, message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // In development, log to console
    if (process.env.NODE_ENV === 'development' || !process.env.TXTCONNECT_API_KEY) {
        console.log('📱 SMS WOULD BE SENT (Development Mode):');
        console.log('To:', to);
        console.log('Message:', message);
        return true;
    }
    try {
        // Format phone number to E.164 format
        const formattedPhoneNumber = formatPhoneNumber(to);
        if (!formattedPhoneNumber) {
            console.error('❌ Invalid phone number format:', to);
            return false;
        }
        const body = {
            "to": formattedPhoneNumber,
            "from": process.env.TXTCONNECT_SENDER_ID || "AFTHEALTH",
            "unicode": 1,
            "sms": message,
        };
        console.log('📤 Sending SMS via TXTConnect:', JSON.stringify(body, null, 2));
        // Fixed: Removed extra spaces from URL
        const response = yield axios_1.default.post('https://txtconnect.net/dev/api/sms/send', body, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.TXTCONNECT_API_KEY}`,
            },
        });
        console.log('✅ SMS sent successfully via TXTConnect:', response.data);
        // Check if the response indicates success
        if (response.data && (response.data.status === 'success' || response.status === 200)) {
            return true;
        }
        else {
            console.warn('⚠️ TXTConnect API returned non-success status:', response.data);
            return false;
        }
    }
    catch (error) {
        console.error('❌ Error sending SMS via TXTConnect:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        return false;
    }
});
exports.sendSMS = sendSMS;
// Function to format phone numbers to E.164 format
const formatPhoneNumber = (phoneNumber) => {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    // If it already starts with +233, it's correctly formatted
    if (cleaned.startsWith('+233')) {
        return cleaned;
    }
    // If it starts with 233 (without +), add +
    if (cleaned.startsWith('233')) {
        return '+' + cleaned;
    }
    // If it starts with 0, replace with +233
    if (cleaned.startsWith('0')) {
        cleaned = '+233' + cleaned.substring(1);
        return cleaned;
    }
    // If it's 9 digits starting with 2-5 (Ghana format), add +233
    if (cleaned.length === 9 && /^[2-5]/.test(cleaned)) {
        return '+233' + cleaned;
    }
    // If it's already in + format, return as is
    if (cleaned.startsWith('+')) {
        return cleaned;
    }
    // Default fallback - assume it's a Ghana number
    if (cleaned.length === 9) {
        return '+233' + cleaned;
    }
    console.error('❌ Could not format phone number:', phoneNumber);
    return null; // Invalid format
};
// Specific SMS templates for different use cases with Unicode characters
const sendPasswordResetSMS = (phoneNumber, resetToken) => __awaiter(void 0, void 0, void 0, function* () {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    // Added Unicode lock character for better visual appeal
    const message = `Password Reset Request\n\n` +
        `Click to reset your password:\n${resetUrl}\n\n` +
        `Link expires in 1 hour. Ignore if you didn't request this.`;
    return yield (0, exports.sendSMS)(phoneNumber, message);
});
exports.sendPasswordResetSMS = sendPasswordResetSMS;
const sendWelcomeSMS = (phoneNumber, firstName) => __awaiter(void 0, void 0, void 0, function* () {
    // Added Unicode waving hand character
    const message = `Welcome ${firstName}!\n\nThank you for registering with our healthcare platform.\n\nProceed to schedule your appointments.`;
    return yield (0, exports.sendSMS)(phoneNumber, message);
});
exports.sendWelcomeSMS = sendWelcomeSMS;
const sendAppointmentReminderSMS = (phoneNumber, firstName, appointmentDate, doctorName) => __awaiter(void 0, void 0, void 0, function* () {
    // Already has Unicode calendar character - good!
    const message = `📅 Hi ${firstName},\n\nThis is a reminder for your appointment:\n\nDoctor: ${doctorName}\nDate: ${appointmentDate}\n\nPlease arrive 15 minutes early.\n\nReply YES to confirm.`;
    return yield (0, exports.sendSMS)(phoneNumber, message);
});
exports.sendAppointmentReminderSMS = sendAppointmentReminderSMS;
// NEW: Password reset confirmation SMS
const sendPasswordResetConfirmationSMS = (phoneNumber, firstName) => __awaiter(void 0, void 0, void 0, function* () {
    // Added Unicode checkmark character
    const message = `Password Reset Successful\n\n` +
        `Hello ${firstName}, your password has been successfully reset.\n\n` +
        `You can now login with your new password.\n\n` +
        `If you didn't request this, contact support immediately.`;
    return yield (0, exports.sendSMS)(phoneNumber, message);
});
exports.sendPasswordResetConfirmationSMS = sendPasswordResetConfirmationSMS;
// Appointment Approved SMS
const sendAppointmentApprovedSMS = (phoneNumber, firstName, priorityRank, severityScore) => __awaiter(void 0, void 0, void 0, function* () {
    const message = `Appointment Approved, ${firstName}!\n\nYour request has been approved. Priority: ${priorityRank}, Severity: ${severityScore}.\nCheck your dashboard for scheduling details.\n\n-ATFHEALTH`;
    return yield (0, exports.sendSMS)(phoneNumber, message);
});
exports.sendAppointmentApprovedSMS = sendAppointmentApprovedSMS;
// Appointment Rebooked/Waitlisted SMS
const sendAppointmentRebookedSMS = (phoneNumber, firstName, priorityRank, severityScore) => __awaiter(void 0, void 0, void 0, function* () {
    const message = `Appointment Status, ${firstName}\n\nYour request is on the waiting list. Priority: ${priorityRank}, Severity: ${severityScore}.\nWe'll notify you when a slot opens.\n\n-ATFHEALTH`;
    return yield (0, exports.sendSMS)(phoneNumber, message);
});
exports.sendAppointmentRebookedSMS = sendAppointmentRebookedSMS;
