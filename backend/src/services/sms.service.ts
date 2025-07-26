import axios from 'axios';

export const sendSMS = async (to: string, message: string): Promise<boolean> => {
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

    const response = await axios.post('https://txtconnect.net/dev/api/sms/send', body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TXTCONNECT_API_KEY}`,
      },
    });

    console.log('✅ SMS sent successfully via TXTConnect:', response.data);
    
    // Check if the response indicates success
    if (response.data && (response.data.status === 'success' || response.status === 200)) {
      return true;
    } else {
      console.warn('⚠️ TXTConnect API returned non-success status:', response.data);
      return false;
    }
    
  } catch (error: any) {
    console.error('❌ Error sending SMS via TXTConnect:', error.response?.data || error.message);
    return false;
  }
};

// Function to format phone numbers to E.164 format
const formatPhoneNumber = (phoneNumber: string): string | null => {
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

// Specific SMS templates for different use cases
export const sendPasswordResetSMS = async (phoneNumber: string, resetToken: string): Promise<boolean> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  const message = `Password Reset: Click to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`;
  
  return await sendSMS(phoneNumber, message);
};

export const sendWelcomeSMS = async (phoneNumber: string, firstName: string): Promise<boolean> => {
  const message = `Welcome ${firstName}!\n\nThank you for registering with our healthcare platform. Your health journey starts now!\n\nReply HELP for help.`;
  return await sendSMS(phoneNumber, message);
};

export const sendAppointmentReminderSMS = async (
  phoneNumber: string, 
  firstName: string, 
  appointmentDate: string,
  doctorName: string
): Promise<boolean> => {
  const message = `📅 Hi ${firstName},\n\nThis is a reminder for your appointment:\n\nDoctor: ${doctorName}\nDate: ${appointmentDate}\n\nPlease arrive 15 minutes early.\n\nReply YES to confirm.`;
  return await sendSMS(phoneNumber, message);
};