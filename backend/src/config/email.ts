import nodemailer from 'nodemailer';

const createTransporter = () => {
  // For development - console logging (we are using this mock-message-id for testing now, 
  // will substitute with real email service in the commented For production section)
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

  // For production - Gmail SMTP example
//   return nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS // Use App Password for Gmail
//     }
//   });
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const transporter: any = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
    to: email,
    subject: 'Password Reset Request',
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
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};