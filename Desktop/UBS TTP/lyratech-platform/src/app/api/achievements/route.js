import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectMongoDB from '../../../lib/mongodb';
import Achievement, { ACHIEVEMENTS_CONFIG } from '../../../models/Achievement';
import LearningPath from '../../../models/LearningPath';

// 计算学习连续天数
function calculateStreakDays(learningPath) {
  if (!learningPath || !learningPath.updatedAt) {
    return 0;
  }

  // 获取学习路径的所有活动记录
  const activities = [];
  
  // 检查创建日期
  if (learningPath.createdAt) {
    activities.push(new Date(learningPath.createdAt));
  }
  
  // 检查更新日期
  if (learningPath.updatedAt) {
    activities.push(new Date(learningPath.updatedAt));
  }
  
  // 简化的连续天数计算逻辑
  // 在实际应用中，这里应该基于用户的每日学习活动记录
  const today = new Date();
  const lastActivity = new Date(learningPath.updatedAt);
  
  // 计算最后活动与今天的天数差
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  // 如果用户有学习进度且最近有活动，计算连续天数
  const totalCompleted = 
    (learningPath.progress?.technicalSkills?.completed || 0) +
    (learningPath.progress?.behavioralQuestions?.completed || 0) +
    (learningPath.progress?.practicalProjects?.completed || 0);
  
  if (totalCompleted === 0) {
    return 0;
  }
  
  // 简化的连续天数逻辑：基于完成的模块数量和最近活动
  // 如果最后活动在今天或昨天，并且有学习进度
  if (daysDiff <= 1) {
    // 基于完成模块数量估算连续天数（每完成2个模块算1天）
    const estimatedDays = Math.min(Math.floor(totalCompleted / 2) + 1, 30); // 最多30天
    return estimatedDays;
  }
  
  return 0;
}

// 检查成就是否解锁
function checkAchievementUnlocked(achievementConfig, userStats) {
  const { requirement } = achievementConfig;
  
  switch (requirement.type) {
    case 'learning_path_created':
      return userStats.totalSkillAreasExplored > 0;
    case 'modules_completed':
      return userStats.totalModulesCompleted >= requirement.value;
    case 'skill_areas_explored':
      return userStats.totalSkillAreasExplored >= requirement.value;
    case 'overall_progress':
      return userStats.overallProgress >= requirement.value;
    case 'technical_skills_completed':
      return userStats.technicalSkillsCompleted >= requirement.value;
    case 'behavioral_questions_completed':
      return userStats.behavioralQuestionsCompleted >= requirement.value;
    case 'practical_projects_completed':
      return userStats.practicalProjectsCompleted >= requirement.value;
    case 'area_completion':
      // 检查是否有任何领域达到100%
      const techProgress = userStats.technicalSkillsCompleted >= 20 ? 100 : 0;
      const behavioralProgress = userStats.behavioralQuestionsCompleted >= 15 ? 100 : 0;
      const projectProgress = userStats.practicalProjectsCompleted >= 10 ? 100 : 0;
      return Math.max(techProgress, behavioralProgress, projectProgress) >= requirement.value;
    case 'streak_days':
      return userStats.streakDays >= requirement.value;
    case 'current_level':
      const levelOrder = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
      const userLevelIndex = levelOrder.indexOf(userStats.currentLevel);
      const requiredLevelIndex = levelOrder.indexOf(requirement.value);
      return userLevelIndex >= requiredLevelIndex;
    default:
      return false;
  }
}

// 从学习路径数据计算统计信息
function calculateStatsFromLearningPath(learningPath) {
  if (!learningPath) {
    return {
      totalModulesCompleted: 0,
      totalSkillAreasExplored: 0,
      overallProgress: 0,
      currentLevel: 'Beginner',
      technicalSkillsCompleted: 0,
      behavioralQuestionsCompleted: 0,
      practicalProjectsCompleted: 0,
      streakDays: 0
    };
  }

  const selectedAreas = learningPath.selectedAreas || {};
  const progress = learningPath.progress || {};
  
  const totalSkillAreasExplored = Object.values(selectedAreas).filter(Boolean).length;
  const totalModulesCompleted = 
    (progress.technicalSkills?.completed || 0) +
    (progress.behavioralQuestions?.completed || 0) +
    (progress.practicalProjects?.completed || 0);

  // 使用真实的连续天数计算
  const streakDays = calculateStreakDays(learningPath);

  return {
    totalModulesCompleted,
    totalSkillAreasExplored,
    overallProgress: learningPath.overallProgress || 0,
    currentLevel: learningPath.currentLevel || 'Beginner',
    technicalSkillsCompleted: progress.technicalSkills?.completed || 0,
    behavioralQuestionsCompleted: progress.behavioralQuestions?.completed || 0,
    practicalProjectsCompleted: progress.practicalProjects?.completed || 0,
    streakDays
  };
}

// GET - 获取用户成就
export async function GET(request) {
  try {
    await connectMongoDB();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = new mongoose.Types.ObjectId(decoded.id);

    console.log('Looking for user:', userId);

    // 获取用户的学习路径数据
    const learningPath = await LearningPath.findOne({ userId });
    console.log('Learning path found:', learningPath ? 'Yes' : 'No');
    
    // 从学习路径计算最新统计信息
    const currentStats = calculateStatsFromLearningPath(learningPath);
    console.log('Current stats:', currentStats);
    
    // 查找或创建用户成就记录
    let userAchievements = await Achievement.findOne({ userId });
    
    if (!userAchievements) {
      console.log('Creating new achievement record for user:', userId);
      userAchievements = new Achievement({
        userId: userId,
        unlockedAchievements: [],
        stats: currentStats
      });
    }

    // 每次都完全重新计算成就状态
    console.log('Recalculating all achievements...');
    
    // 清空当前解锁的成就，重新计算
    const previouslyUnlocked = userAchievements.unlockedAchievements.map(a => a.achievementId);
    userAchievements.unlockedAchievements = [];
    userAchievements.stats = currentStats;
    
    const newlyUnlocked = [];
    
    // 重新检查所有成就
    for (const [achievementId, config] of Object.entries(ACHIEVEMENTS_CONFIG)) {
      if (checkAchievementUnlocked(config, currentStats)) {
        const unlockDate = previouslyUnlocked.includes(achievementId) ? 
          // 如果之前已解锁，保持原解锁时间（从旧记录中查找）
          userAchievements.unlockedAchievements.find(a => a.achievementId === achievementId)?.unlockedAt || new Date() :
          new Date(); // 新解锁的使用当前时间
          
        userAchievements.unlockedAchievements.push({
          achievementId,
          unlockedAt: unlockDate,
          currentValue: getCurrentValue(config.requirement.type, currentStats),
          maxValue: config.requirement.value
        });
        
        // 只标记真正新解锁的成就
        if (!previouslyUnlocked.includes(achievementId)) {
          newlyUnlocked.push(achievementId);
          console.log('Newly unlocked achievement:', achievementId);
        }
      }
    }

    try {
      await userAchievements.save();
      console.log('Achievement record updated successfully');
    } catch (saveError) {
      console.error('Error saving achievements:', saveError);
      throw saveError;
    }

    // 准备返回数据
    const achievementsWithDetails = userAchievements.unlockedAchievements.map(unlocked => ({
      ...unlocked.toObject(),
      ...ACHIEVEMENTS_CONFIG[unlocked.achievementId]
    }));

    const lockedAchievements = Object.entries(ACHIEVEMENTS_CONFIG)
      .filter(([id]) => !userAchievements.unlockedAchievements.some(a => a.achievementId === id))
      .map(([id, config]) => ({
        ...config,
        locked: true,
        currentValue: getCurrentValue(config.requirement.type, currentStats),
        maxValue: config.requirement.value,
        progress: Math.min(100, (getCurrentValue(config.requirement.type, currentStats) / config.requirement.value) * 100)
      }));

    return NextResponse.json({
      success: true,
      data: {
        unlockedAchievements: achievementsWithDetails,
        lockedAchievements,
        stats: currentStats,
        newlyUnlocked,
        totalPoints: achievementsWithDetails.reduce((sum, ach) => sum + (ach.points || 0), 0)
      }
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

function getCurrentValue(requirementType, stats) {
  switch (requirementType) {
    case 'learning_path_created':
      return stats.totalSkillAreasExplored > 0 ? 1 : 0;
    case 'modules_completed':
      return stats.totalModulesCompleted;
    case 'skill_areas_explored':
      return stats.totalSkillAreasExplored;
    case 'overall_progress':
      return stats.overallProgress;
    case 'technical_skills_completed':
      return stats.technicalSkillsCompleted;
    case 'behavioral_questions_completed':
      return stats.behavioralQuestionsCompleted;
    case 'practical_projects_completed':
      return stats.practicalProjectsCompleted;
    case 'area_completion':
      // 返回最高完成度的领域进度
      const techProgress = (stats.technicalSkillsCompleted / 20) * 100;
      const behavioralProgress = (stats.behavioralQuestionsCompleted / 15) * 100;
      const projectProgress = (stats.practicalProjectsCompleted / 10) * 100;
      return Math.max(techProgress, behavioralProgress, projectProgress);
    case 'streak_days':
      return stats.streakDays;
    case 'current_level':
      const levelOrder = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
      return levelOrder.indexOf(stats.currentLevel) + 1;
    default:
      return 0;
  }
} 