import nodemailer from 'nodemailer';
import VerificationCode from '../models/VerificationCode';

// Create a transporter with better error handling
let transporter;

const createTransporter = () => {
  // Check if email configuration exists
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  
  if (!emailUser || !emailPassword || emailUser === 'your-email@gmail.com') {
    console.warn('Email configuration not found or using default values. Email functionality will be simulated.');
    return null;
  }

  try {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS instead of SSL
      auth: {
        user: emailUser,
        pass: emailPassword
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000, // 30 seconds
      socketTimeout: 60000, // 60 seconds
      debug: true, // Enable debug for troubleshooting
    });
  } catch (error) {
    console.error('Error creating email transporter:', error);
    return null;
  }
};

// Initialize transporter
transporter = createTransporter();

// Function to reinitialize transporter if needed
export const reinitializeTransporter = () => {
  console.log('Reinitializing email transporter...');
  transporter = createTransporter();
  return transporter !== null;
};

// Generate a random verification code
const generateRandomCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Simulate email sending for development
const simulateEmailSending = async (email, code) => {
  console.log('='.repeat(50));
  console.log('📧 EMAIL SIMULATION MODE');
  console.log('='.repeat(50));
  console.log(`To: ${email}`);
  console.log(`Subject: LyraTech - Email Verification`);
  console.log(`Verification Code: ${code}`);
  console.log('='.repeat(50));
  console.log('Please use the verification code above to complete registration.');
  console.log('='.repeat(50));
  return true;
};

// Generate and save verification code
export const generateVerificationCode = async (user) => {
  try {
    // Generate a random 6-digit code
    const code = generateRandomCode();
    
    // Delete any existing verification codes for this user
    await VerificationCode.deleteMany({ email: user.email });
    
    // Create a new verification code in the database
    await VerificationCode.create({
      email: user.email,
      code: code
    });
    
    // Send the verification email (or simulate)
    const emailSent = await sendVerificationEmail(user.email, code);
    
    if (!emailSent) {
      console.error('Failed to send verification email');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error generating verification code:', error);
    return false;
  }
};

// Send verification email
export const sendVerificationEmail = async (email, code) => {
  try {
    // If no transporter available, simulate email sending
    if (!transporter) {
      return await simulateEmailSending(email, code);
    }

    const mailOptions = {
      from: `LyraTech <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'LyraTech - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #14B8A6; margin: 0;">LyraTech</h1>
          </div>
          <h2 style="color: #2D3748; text-align: center;">Verify Your Email</h2>
          <p style="color: #4A5568; line-height: 1.6;">Thank you for registering with LyraTech. Please use the verification code below to complete your registration:</p>
          <div style="background-color: #EDF2F7; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #4A5568;">${code}</span>
          </div>
          <p style="color: #4A5568; line-height: 1.6;">This code will expire in 10 minutes. If you did not request this verification, please ignore this email.</p>
          <div style="text-align: center; margin-top: 30px; color: #A0AEC0; font-size: 12px;">
            <p>© ${new Date().getFullYear()} LyraTech. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    // Fallback to simulation if real email fails
    console.log('Falling back to email simulation...');
    return await simulateEmailSending(email, code);
  }
};

// Simulate password reset email sending for development
const simulatePasswordResetEmail = async (email, resetLink) => {
  console.log('='.repeat(60));
  console.log('📧 PASSWORD RESET EMAIL SIMULATION MODE');
  console.log('='.repeat(60));
  console.log(`To: ${email}`);
  console.log(`Subject: LyraTech - Password Reset Request`);
  console.log(`Reset Link: ${resetLink}`);
  console.log('='.repeat(60));
  console.log('Please click the link above to reset your password.');
  console.log('This link will expire in 1 hour.');
  console.log('='.repeat(60));
  return true;
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    // If no transporter available, simulate email sending
    if (!transporter) {
      return await simulatePasswordResetEmail(email, resetLink);
    }

    const mailOptions = {
      from: `LyraTech <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'LyraTech - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #14B8A6; margin: 0;">LyraTech</h1>
          </div>
          <h2 style="color: #2D3748; text-align: center;">Password Reset Request</h2>
          <p style="color: #4A5568; line-height: 1.6;">We received a request to reset your password for your LyraTech account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #14B8A6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #4A5568; line-height: 1.6;">Or copy and paste this link into your browser:</p>
          <p style="color: #14B8A6; word-break: break-all; background-color: #F7FAFC; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px;">${resetLink}</p>
          <p style="color: #4A5568; line-height: 1.6;"><strong>This link will expire in 1 hour.</strong> If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
          <div style="text-align: center; margin-top: 30px; color: #A0AEC0; font-size: 12px;">
            <p>© ${new Date().getFullYear()} LyraTech. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    
    // Try to reinitialize transporter and retry once
    console.log('Attempting to reinitialize email transporter...');
    if (reinitializeTransporter()) {
      try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent successfully to ${email} on retry`);
        return true;
      } catch (retryError) {
        console.error('Email sending failed on retry:', retryError);
      }
    }
    
    // Fallback to simulation if real email fails
    console.log('Falling back to email simulation...');
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    return await simulatePasswordResetEmail(email, resetLink);
  }
}; 