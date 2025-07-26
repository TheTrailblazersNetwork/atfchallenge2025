import nodemailer from 'nodemailer';
import { sendSMS, sendPasswordResetSMS, sendWelcomeSMS } from '../services/sms.service';

const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      sendMail: async (mailOptions: any) => {
        console.log('📧 EMAIL WOULD BE SENT:');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Body:', mailOptions.html);
        console.log('---');
        return { messageId: 'mock-message-id' };
      }
    };
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const transporter: any = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
    to: email,
    subject: '🔐 Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          If the button doesn't work, copy this link to your browser:<br>
          ${resetUrl}
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

// Unified communication function
export const sendCommunication = async (
  email: string,
  phoneNumber: string,
  preferredContact: 'email' | 'sms',
  type: 'password_reset' | 'welcome' | 'appointment_reminder',
  data: { [key: string]: any } 
): Promise<boolean> => {
  
  try {
    switch (type) {
      case 'password_reset':
        if (preferredContact === 'email') {
          return await sendPasswordResetEmail(email, data.token);
        } else {
          return await sendPasswordResetSMS(phoneNumber, data.token);
        }
        
      case 'welcome':
        if (preferredContact === 'email') {
          const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
            to: email,
            subject: '👋 Welcome to Our Healthcare Platform',
            html: `
              <div style="font-family: Arial, sans-serif;">
                <h2>Welcome ${data.firstName}!</h2>
                <p>Thank you for registering with our healthcare platform.</p>
                <p>Your account has been created successfully.</p>
                <p>Procced to schedule your medical appointments, feel free to contact us.</p>
              </div>
            `
          };
          
          const transporter: any = createTransporter();
          await transporter.sendMail(mailOptions);
          return true;
        } else {
          return await sendWelcomeSMS(phoneNumber, data.firstName);
        }
        
      case 'appointment_reminder':
        // Implementation for appointment reminders
        return true;
        
      default:
        console.error('Unknown communication type:', type);
        return false;
    }
  } catch (error) {
    console.error('Error in sendCommunication:', error);
    return false;
  }
};