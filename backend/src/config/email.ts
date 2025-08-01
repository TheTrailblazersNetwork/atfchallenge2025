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
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

// NEW: Password Reset Confirmation Email
export const sendPasswordResetConfirmationEmail = async (email: string, firstName: string) => {
  const transporter: any = createTransporter();
  
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
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Password reset confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset confirmation email:', error);
    return false;
  }
};

// Unified communication function
export const sendCommunication = async (
  email: string,
  phoneNumber: string,
  preferredContact: 'email' | 'sms',
  type: 'password_reset' | 'welcome' | 'appointment_reminder' | 'password_reset_confirmation', // Added new type
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
        
      case 'password_reset_confirmation': 
        if (preferredContact === 'email') {
          return await sendPasswordResetConfirmationEmail(email, data.firstName);
        } else {
          // Call this function in sms.service.ts
          const { sendPasswordResetConfirmationSMS } = await import('../services/sms.service');
          return await sendPasswordResetConfirmationSMS(phoneNumber, data.firstName);
        }
        
      case 'welcome':
        if (preferredContact === 'email') {
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
                    <h2 style="margin-top: 0; font-size: 24px; color: white; font-weight: 600; letter-spacing: -0.25px;">Hello ${data.firstName},</h2>
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