import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import PendingUser from '../../../../models/PendingUser';
import { generateVerificationCode } from '../../../../lib/mail';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email } = await request.json();

    // Check if user is already verified
    const verifiedUser = await User.findOne({ email });
    
    if (verifiedUser && verifiedUser.isVerified) {
      return NextResponse.json(
        { success: false, message: 'User already verified' },
        { status: 400 }
      );
    }

    // Find pending user
    const pendingUser = await PendingUser.findOne({ email });
    
    if (!pendingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found or registration expired' },
        { status: 404 }
      );
    }

    // Generate and send new verification code
    await generateVerificationCode({ email: pendingUser.email });

    return NextResponse.json(
      { 
        success: true, 
        message: 'New verification code sent to your email'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to resend verification code' },
      { status: 500 }
    );
  }
} 