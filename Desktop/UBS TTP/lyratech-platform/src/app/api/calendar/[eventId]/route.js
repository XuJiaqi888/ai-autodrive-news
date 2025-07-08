import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/mongodb';
import Event from '../../../../models/Event';

// PUT - 更新事件
export async function PUT(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    await connectDB();

    const { eventId } = await params;
    const body = await request.json();

    // 查找事件并验证所有权
    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      return NextResponse.json({
        success: false,
        message: 'Event not found or access denied'
      }, { status: 404 });
    }

    // 验证时间逻辑
    if (body.startDate && body.endDate && body.startTime && body.endTime) {
      const startDateTime = new Date(`${body.startDate}T${body.startTime}`);
      const endDateTime = new Date(`${body.endDate}T${body.endTime}`);
      
      if (startDateTime >= endDateTime) {
        return NextResponse.json({
          success: false,
          message: 'End time must be after start time'
        }, { status: 400 });
      }
    }

    // 更新事件
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : event.startDate,
        endDate: body.endDate ? new Date(body.endDate) : event.endDate,
        updatedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      event: updatedEvent
    });
  } catch (error) {
    console.error('Calendar PUT error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update event' 
    }, { status: 500 });
  }
}

// DELETE - 删除事件
export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    await connectDB();

    const { eventId } = await params;

    // 查找并删除事件
    const deletedEvent = await Event.findOneAndDelete({ _id: eventId, userId });
    if (!deletedEvent) {
      return NextResponse.json({
        success: false,
        message: 'Event not found or access denied'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Calendar DELETE error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete event' 
    }, { status: 500 });
  }
}

// GET - 获取单个事件详情
export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    await connectDB();

    const { eventId } = await params;

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      return NextResponse.json({
        success: false,
        message: 'Event not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      event: event
    });
  } catch (error) {
    console.error('Calendar GET error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch event' 
    }, { status: 500 });
  }
} 