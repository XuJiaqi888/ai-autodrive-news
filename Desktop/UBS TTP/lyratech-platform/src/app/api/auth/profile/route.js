import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';

// Helper function to verify JWT token
const verifyToken = (request) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
  } catch (error) {
    return null;
  }
};

// GET - Fetch user profile
export async function GET(request) {
  try {
    await dbConnect();
    
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Format birthday for frontend
    const userProfile = {
      ...user.toObject(),
      birthday: user.birthday ? user.birthday.toISOString().split('T')[0] : ''
    };

    return NextResponse.json(
      { 
        success: true,
        user: userProfile
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request) {
  try {
    await dbConnect();
    
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { 
      firstName, 
      lastName, 
      school, 
      major, 
      graduationYear, 
      birthday, 
      gender, 
      avatar,
      careerStage
    } = await request.json();

    // Find and update user
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (school !== undefined) user.school = school;
    if (major !== undefined) user.major = major;
    if (graduationYear !== undefined) user.graduationYear = graduationYear;
    if (birthday !== undefined) user.birthday = birthday ? new Date(birthday) : null;
    if (gender !== undefined) user.gender = gender;
    if (avatar !== undefined) user.avatar = avatar;
    if (careerStage !== undefined) user.careerStage = careerStage;

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(decoded.id).select('-password');
    const userProfile = {
      ...updatedUser.toObject(),
      birthday: updatedUser.birthday ? updatedUser.birthday.toISOString().split('T')[0] : ''
    };

    return NextResponse.json(
      { 
        success: true,
        message: 'Profile updated successfully',
        user: userProfile
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
} 