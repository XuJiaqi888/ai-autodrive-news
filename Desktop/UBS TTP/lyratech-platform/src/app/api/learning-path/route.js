import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import LearningPath from '../../../models/LearningPath';
import jwt from 'jsonwebtoken';

// 获取用户的学习路径
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

    let learningPath = await LearningPath.findOne({ userId: decoded.id });
    
    // 如果用户还没有学习路径，创建默认的
    if (!learningPath) {
      learningPath = await LearningPath.create({
        userId: decoded.id,
        selectedAreas: {
          technicalSkills: false,
          behavioralQuestions: false,
          practicalProjects: false
        }
      });
    }

    return NextResponse.json(
      { 
        success: true, 
        learningPath: learningPath
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get learning path error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// 创建或更新学习路径
export async function POST(request) {
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
    const { selectedAreas, customGoals } = await request.json();

    // 验证至少选择两个领域
    const selectedCount = Object.values(selectedAreas).filter(Boolean).length;
    if (selectedCount < 2) {
      return NextResponse.json(
        { success: false, message: 'Please select at least two learning areas' },
        { status: 400 }
      );
    }

    // 初始化默认模块
    const defaultModules = {
      technicalSkills: [
        'JavaScript Fundamentals',
        'React Basics',
        'Node.js Introduction',
        'Database Design',
        'API Development',
        'Testing Fundamentals',
        'Version Control (Git)',
        'Cloud Computing Basics',
        'Security Best Practices',
        'Performance Optimization',
        'Data Structures',
        'Algorithms',
        'System Design',
        'DevOps Fundamentals',
        'Microservices',
        'Machine Learning Basics',
        'Mobile Development',
        'Frontend Frameworks',
        'Backend Architecture',
        'Project Management Tools'
      ],
      behavioralQuestions: [
        'Leadership Scenarios',
        'Team Collaboration',
        'Problem Solving',
        'Communication Skills',
        'Conflict Resolution',
        'Time Management',
        'Adaptability',
        'Decision Making',
        'Customer Focus',
        'Innovation Thinking',
        'Stress Management',
        'Goal Setting',
        'Feedback Reception',
        'Cultural Awareness',
        'Ethical Dilemmas'
      ],
      practicalProjects: [
        'Personal Portfolio Website',
        'Task Management App',
        'E-commerce Platform',
        'Data Visualization Dashboard',
        'Mobile App Development',
        'API Integration Project',
        'Database Management System',
        'Machine Learning Model',
        'Cloud Deployment Project',
        'Open Source Contribution'
      ]
    };

    const progress = {
      technicalSkills: {
        completed: 0,
        total: selectedAreas.technicalSkills ? 20 : 0,
        modules: selectedAreas.technicalSkills ? 
          defaultModules.technicalSkills.map(name => ({ name, completed: false })) : []
      },
      behavioralQuestions: {
        completed: 0,
        total: selectedAreas.behavioralQuestions ? 15 : 0,
        modules: selectedAreas.behavioralQuestions ? 
          defaultModules.behavioralQuestions.map(name => ({ name, completed: false })) : []
      },
      practicalProjects: {
        completed: 0,
        total: selectedAreas.practicalProjects ? 10 : 0,
        modules: selectedAreas.practicalProjects ? 
          defaultModules.practicalProjects.map(name => ({ name, completed: false, projectUrl: '' })) : []
      }
    };

    // 查找现有的学习路径或创建新的
    let learningPath = await LearningPath.findOne({ userId: decoded.id });
    
    if (learningPath) {
      // 更新现有的学习路径
      learningPath.selectedAreas = selectedAreas;
      learningPath.progress = progress;
      if (customGoals) {
        learningPath.customGoals = customGoals;
      }
      await learningPath.save();
    } else {
      // 创建新的学习路径
      learningPath = await LearningPath.create({
        userId: decoded.id,
        selectedAreas,
        progress,
        customGoals: customGoals || []
      });
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Learning path created successfully!',
        learningPath: learningPath
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Create learning path error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// 更新模块完成状态
export async function PUT(request) {
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
    const { area, moduleIndex, completed, projectUrl } = await request.json();

    const learningPath = await LearningPath.findOne({ userId: decoded.id });
    
    if (!learningPath) {
      return NextResponse.json(
        { success: false, message: 'Learning path not found' },
        { status: 404 }
      );
    }

    // 更新指定模块的完成状态
    if (learningPath.progress[area] && learningPath.progress[area].modules[moduleIndex]) {
      const module = learningPath.progress[area].modules[moduleIndex];
      const wasCompleted = module.completed;
      
      module.completed = completed;
      if (completed) {
        module.completedAt = new Date();
        if (projectUrl && area === 'practicalProjects') {
          module.projectUrl = projectUrl;
        }
      } else {
        module.completedAt = undefined;
        if (area === 'practicalProjects') {
          module.projectUrl = '';
        }
      }
      
      // 更新完成计数
      if (completed && !wasCompleted) {
        learningPath.progress[area].completed += 1;
      } else if (!completed && wasCompleted) {
        learningPath.progress[area].completed -= 1;
      }
      
      // 计算总体进度
      const selectedAreas = learningPath.selectedAreas;
      let totalModules = 0;
      let completedModules = 0;
      
      if (selectedAreas.technicalSkills) {
        totalModules += learningPath.progress.technicalSkills.total;
        completedModules += learningPath.progress.technicalSkills.completed;
      }
      if (selectedAreas.behavioralQuestions) {
        totalModules += learningPath.progress.behavioralQuestions.total;
        completedModules += learningPath.progress.behavioralQuestions.completed;
      }
      if (selectedAreas.practicalProjects) {
        totalModules += learningPath.progress.practicalProjects.total;
        completedModules += learningPath.progress.practicalProjects.completed;
      }
      
      learningPath.overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
      
      // 更新用户等级
      if (learningPath.overallProgress >= 80) {
        learningPath.currentLevel = 'Expert';
      } else if (learningPath.overallProgress >= 60) {
        learningPath.currentLevel = 'Advanced';
      } else if (learningPath.overallProgress >= 30) {
        learningPath.currentLevel = 'Intermediate';
      } else {
        learningPath.currentLevel = 'Beginner';
      }
      
      // 明确更新updatedAt字段，确保连续天数计算准确
      learningPath.updatedAt = new Date();
      
      await learningPath.save();
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Progress updated successfully!',
        learningPath: learningPath
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update learning path error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
} 