import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../lib/mongodb';
import Event from '../../../models/Event';
import { addDays, addWeeks, addMonths, addYears, isBefore } from 'date-fns';

// GET - 获取用户的日历事件
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
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const type = searchParams.get('type');

    let query = { userId };

    // 日期范围过滤
    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // 事件类型过滤
    if (type && type !== 'all') {
      query.type = type;
    }

    const events = await Event.find(query).sort({ startDate: 1 });

    // 处理重复事件
    const expandedEvents = [];
    for (const event of events) {
      if (event.isRecurring) {
        const recurringEvents = generateRecurringEvents(event, startDate, endDate);
        expandedEvents.push(...recurringEvents);
      } else {
        expandedEvents.push(event);
      }
    }

    return NextResponse.json({
      success: true,
      events: expandedEvents
    });
  } catch (error) {
    console.error('Calendar GET error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch events' 
    }, { status: 500 });
  }
}

// POST - 创建新的日历事件
export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      type,
      category,
      module,
      priority,
      location,
      isRecurring,
      recurrence,
      reminder,
      color
    } = body;

    // 验证必填字段
    if (!title || !startDate || !endDate || !startTime || !endTime) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // 验证时间逻辑
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    if (startDateTime >= endDateTime) {
      return NextResponse.json({
        success: false,
        message: 'End time must be after start time'
      }, { status: 400 });
    }

    const eventData = {
      userId,
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      type: type || 'personal',
      category: category || 'general',
      module,
      priority: priority || 'medium',
      location,
      isRecurring: isRecurring || false,
      recurrence: isRecurring ? recurrence : undefined,
      reminder: reminder || { enabled: false },
      color: color || getDefaultColorForType(type)
    };

    const event = new Event(eventData);
    await event.save();

    return NextResponse.json({
      success: true,
      event: event
    }, { status: 201 });
  } catch (error) {
    console.error('Calendar POST error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create event' 
    }, { status: 500 });
  }
}

// 生成重复事件的函数
function generateRecurringEvents(baseEvent, startDate, endDate) {
  const events = [];
  const { recurrence } = baseEvent;
  
  if (!recurrence || !startDate || !endDate) {
    return [baseEvent];
  }

  let currentDate = new Date(Math.max(new Date(baseEvent.startDate), new Date(startDate)));
  const endLimit = recurrence.endDate ? 
    new Date(Math.min(new Date(recurrence.endDate), new Date(endDate))) : 
    new Date(endDate);

  while (isBefore(currentDate, endLimit)) {
    // 创建重复事件实例
    const eventInstance = {
      ...baseEvent.toObject(),
      _id: `${baseEvent._id}_${currentDate.toISOString()}`,
      startDate: currentDate,
      endDate: new Date(currentDate.getTime() + (baseEvent.endDate - baseEvent.startDate))
    };

    events.push(eventInstance);

    // 计算下一个重复日期
    switch (recurrence.frequency) {
      case 'daily':
        currentDate = addDays(currentDate, recurrence.interval || 1);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, recurrence.interval || 1);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, recurrence.interval || 1);
        break;
      case 'yearly':
        currentDate = addYears(currentDate, recurrence.interval || 1);
        break;
      default:
        break;
    }
  }

  return events;
}

// 根据事件类型获取默认颜色
function getDefaultColorForType(type) {
  const colorMap = {
    learning: '#6EE7B7', // 浅绿色
    personal: '#93C5FD', // 浅蓝色
    work: '#FCD34D',     // 浅橙色
    deadline: '#FCA5A5', // 浅红色
    meeting: '#C4B5FD',  // 浅紫色
    other: '#D1D5DB'     // 浅灰色
  };
  return colorMap[type] || '#93C5FD';
} 