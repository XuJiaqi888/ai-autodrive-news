import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import PasswordResetToken from '../../../../models/PasswordResetToken';
import { sendPasswordResetEmail } from '../../../../lib/mail';

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return success for security reasons (don't reveal if email exists)
    // But only send email if user actually exists
    if (user) {
      // Generate secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Delete any existing reset tokens for this email
      await PasswordResetToken.deleteMany({ email: email.toLowerCase() });
      
      // Create new reset token
      await PasswordResetToken.create({
        email: email.toLowerCase(),
        token: resetToken,
        expires: new Date(Date.now() + 3600000) // 1 hour from now
      });

      // Send password reset email
      const emailSent = await sendPasswordResetEmail(email, resetToken);
      
      if (!emailSent) {
        console.error('Failed to send password reset email');
        return NextResponse.json(
          { message: 'Failed to send reset email. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Always return success message for security
    return NextResponse.json({
      message: 'If an account with that email exists, we have sent a password reset link.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 