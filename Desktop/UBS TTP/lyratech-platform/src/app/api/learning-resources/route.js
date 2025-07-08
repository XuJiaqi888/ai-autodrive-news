import { NextResponse } from 'next/server';
import { LEARNING_RESOURCES, ADDITIONAL_RESOURCES, getResourcesForModule } from '../../../data/learningResources';

// GET 获取学习资源
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');
    const module = searchParams.get('module');

    if (area && module) {
      // 获取特定模块的资源
      const resources = getResourcesForModule(area, module);
      
      if (resources.primary.length === 0 && resources.video.length === 0) {
        return NextResponse.json({ 
          success: false, 
          message: 'No resources found for this module' 
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          moduleName: module,
          area: area,
          resources: resources
        }
      });
    } else if (area) {
      // 获取特定领域的所有资源
      const areaResources = LEARNING_RESOURCES[area];
      
      if (!areaResources) {
        return NextResponse.json({ 
          success: false, 
          message: 'Area not found' 
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          area: area,
          modules: areaResources
        }
      });
    } else {
      // 获取所有资源概览
      return NextResponse.json({
        success: true,
        data: {
          learningResources: LEARNING_RESOURCES,
          additionalResources: ADDITIONAL_RESOURCES
        }
      });
    }
  } catch (error) {
    console.error('Learning resources error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST 获取个性化资源推荐
export async function POST(request) {
  try {
    const body = await request.json();
    const { userLevel, interests, currentModule } = body;

    // 这里可以根据用户级别和兴趣提供个性化推荐
    // 暂时返回基础推荐
    const recommendations = {
      beginner: {
        priority: ['JavaScript Fundamentals', 'React Basics', 'Version Control (Git)'],
        additionalResources: ADDITIONAL_RESOURCES.careerDevelopment
      },
      intermediate: {
        priority: ['API Development', 'Database Design', 'Testing Fundamentals'],
        additionalResources: ADDITIONAL_RESOURCES.interviewPrep
      },
      advanced: {
        priority: ['System Design', 'Microservices', 'Machine Learning Basics'],
        additionalResources: ADDITIONAL_RESOURCES.womenInTech
      }
    };

    const level = userLevel?.toLowerCase() || 'beginner';
    const userRecommendations = recommendations[level] || recommendations.beginner;

    return NextResponse.json({
      success: true,
      data: {
        recommendations: userRecommendations,
        personalizedTips: getPersonalizedTips(level, interests)
      }
    });
  } catch (error) {
    console.error('Learning recommendations error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

function getPersonalizedTips(level, interests) {
  const tips = {
    beginner: [
      "从JavaScript基础开始，这是Web开发的核心",
      "建立一个GitHub账号来展示你的项目",
      "加入女性科技社区获得支持和指导",
      "每天至少花1-2小时学习编程"
    ],
    intermediate: [
      "专注于构建实际项目来巩固技能",
      "开始学习测试驱动开发(TDD)",
      "参与开源项目贡献代码",
      "准备技术面试和系统设计问题"
    ],
    advanced: [
      "学习系统设计和架构模式",
      "探索机器学习和AI技术",
      "成为技术社区的导师",
      "考虑技术领导力发展"
    ]
  };

  return tips[level] || tips.beginner;
} 