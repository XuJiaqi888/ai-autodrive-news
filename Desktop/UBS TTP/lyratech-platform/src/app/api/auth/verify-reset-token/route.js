import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import PasswordResetToken from '../../../../models/PasswordResetToken';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find valid token
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

    return NextResponse.json({
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { message: 'An error occurred while verifying the token' },
      { status: 500 }
    );
  }
} 