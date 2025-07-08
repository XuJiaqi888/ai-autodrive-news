import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import PendingUser from '../../../../models/PendingUser';
import VerificationCode from '../../../../models/VerificationCode';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, code } = await request.json();

    // Find pending user first
    const pendingUser = await PendingUser.findOne({ email });
    
    if (!pendingUser) {
      // Check if user is already verified
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser.isVerified) {
        return NextResponse.json(
          { success: false, message: 'User already verified and registered' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: 'User not found or registration expired' },
        { status: 404 }
      );
    }

    // Find verification code
    const verificationCode = await VerificationCode.findOne({
      email: email,
      code: code
    });
    
    if (!verificationCode) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Create verified user from pending user data
    const user = await User.create({
      firstName: pendingUser.firstName,
      lastName: pendingUser.lastName,
      email: pendingUser.email,
      password: pendingUser.password, // Already hashed in PendingUser
      careerStage: pendingUser.careerStage,
      isVerified: true
    });

    // Delete pending user and verification code
    await PendingUser.deleteOne({ email });
    await VerificationCode.deleteOne({ _id: verificationCode._id });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      { 
        success: true, 
        message: 'Email verification successful',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          careerStage: user.careerStage
        },
        token
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
} 