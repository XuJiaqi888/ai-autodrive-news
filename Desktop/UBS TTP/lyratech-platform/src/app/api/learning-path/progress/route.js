import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import LearningPath from '../../../../models/LearningPath';
import jwt from 'jsonwebtoken';

// 获取用户学习路径的进度摘要
export async function GET(request) {
  try {
    await dbConnect();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No valid token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

    const learningPath = await LearningPath.findOne({ userId: decoded.id });
    
    if (!learningPath) {
      return NextResponse.json(
        { 
          success: true, 
          hasLearningPath: false,
          progress: null
        },
        { status: 200 }
      );
    }

    // 简化的进度数据，只包含dashboard需要的信息
    const progressSummary = {
      hasLearningPath: true,
      selectedAreas: learningPath.selectedAreas,
      overallProgress: learningPath.overallProgress,
      currentLevel: learningPath.currentLevel,
      progress: {
        technicalSkills: {
          completed: learningPath.progress.technicalSkills.completed,
          total: learningPath.progress.technicalSkills.total
        },
        behavioralQuestions: {
          completed: learningPath.progress.behavioralQuestions.completed,
          total: learningPath.progress.behavioralQuestions.total
        },
        practicalProjects: {
          completed: learningPath.progress.practicalProjects.completed,
          total: learningPath.progress.practicalProjects.total
        }
      },
      lastActiveDate: learningPath.lastActiveDate
    };

    return NextResponse.json(
      { 
        success: true, 
        progress: progressSummary
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get learning path progress error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
} 