import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/mongodb';
import Event from '../../../../models/Event';

// GET - 获取用户最近的事件
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');

    // 获取从今天开始的最近事件
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recentEvents = await Event.find({
      userId,
      startDate: { $gte: today }
    })
    .sort({ startDate: 1, startTime: 1 })
    .limit(limit);

    return NextResponse.json({
      success: true,
      events: recentEvents
    });
  } catch (error) {
    console.error('Recent events GET error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch recent events' 
    }, { status: 500 });
  }
} 