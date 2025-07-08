import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import PasswordResetToken from '../../../../models/PasswordResetToken';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find and validate token
    const resetToken = await PasswordResetToken.findOne({
      token,
      used: false,
      expires: { $gt: new Date() }
    });

    if (!resetToken) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: resetToken.email });
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      updatedAt: new Date()
    });

    // Mark token as used
    await PasswordResetToken.findByIdAndUpdate(resetToken._id, {
      used: true
    });

    return NextResponse.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
} 