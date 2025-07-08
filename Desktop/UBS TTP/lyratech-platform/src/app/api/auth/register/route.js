import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import PendingUser from '../../../../models/PendingUser';
import { generateVerificationCode } from '../../../../lib/mail';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { firstName, lastName, email, password, careerStage } = await request.json();

    // Check if user already exists (verified user)
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if there's already a pending user with this email
    const pendingUserExists = await PendingUser.findOne({ email });
    
    if (pendingUserExists) {
      // Delete the existing pending user and create a new one
      await PendingUser.deleteOne({ email });
    }

    // Create pending user (not verified yet)
    const pendingUser = await PendingUser.create({
      firstName,
      lastName,
      email,
      password,
      careerStage
    });

    // Generate and send verification code
    await generateVerificationCode({ email: pendingUser.email });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Registration initiated. Please check your email for verification.',
        email: pendingUser.email
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
} 