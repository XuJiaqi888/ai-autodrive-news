import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  unlockedAchievements: [{
    achievementId: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    currentValue: Number,
    maxValue: Number
  }],
  stats: {
    totalModulesCompleted: {
      type: Number,
      default: 0
    },
    totalSkillAreasExplored: {
      type: Number,
      default: 0
    },
    overallProgress: {
      type: Number,
      default: 0
    },
    currentLevel: {
      type: String,
      default: 'Beginner'
    },
    totalProjectsCompleted: {
      type: Number,
      default: 0
    },
    behavioralQuestionsCompleted: {
      type: Number,
      default: 0
    },
    technicalSkillsCompleted: {
      type: Number,
      default: 0
    },
    practicalProjectsCompleted: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    lastActiveDate: Date
  }
}, {
  timestamps: true
});

// 定义所有可用的成就
export const ACHIEVEMENTS_CONFIG = {
  'first_steps': {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Create your first learning path',
    icon: '🚀',
    category: 'getting_started',
    requirement: { type: 'learning_path_created', value: 1 },
    points: 10,
    rarity: 'common'
  },
  'early_bird': {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete your first module',
    icon: '🌅',
    category: 'progress',
    requirement: { type: 'modules_completed', value: 1 },
    points: 15,
    rarity: 'common'
  },
  'multi_skilled': {
    id: 'multi_skilled',
    title: 'Multi-Skilled',
    description: 'Select learning paths in all 3 areas',
    icon: '🎯',
    category: 'exploration',
    requirement: { type: 'skill_areas_explored', value: 3 },
    points: 25,
    rarity: 'uncommon'
  },
  'halfway_hero': {
    id: 'halfway_hero',
    title: 'Halfway Hero',
    description: 'Reach 50% overall progress',
    icon: '🏆',
    category: 'progress',
    requirement: { type: 'overall_progress', value: 50 },
    points: 30,
    rarity: 'uncommon'
  },
  'tech_warrior': {
    id: 'tech_warrior',
    title: 'Tech Warrior',
    description: 'Complete 10 technical skill modules',
    icon: '⚔️',
    category: 'technical',
    requirement: { type: 'technical_skills_completed', value: 10 },
    points: 40,
    rarity: 'rare'
  },
  'communication_master': {
    id: 'communication_master',
    title: 'Communication Master',
    description: 'Complete 10 behavioral interview modules',
    icon: '🗣️',
    category: 'behavioral',
    requirement: { type: 'behavioral_questions_completed', value: 10 },
    points: 40,
    rarity: 'rare'
  },
  'project_builder': {
    id: 'project_builder',
    title: 'Project Builder',
    description: 'Complete 5 practical projects',
    icon: '🏗️',
    category: 'practical',
    requirement: { type: 'practical_projects_completed', value: 5 },
    points: 50,
    rarity: 'rare'
  },
  'perfectionist': {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Reach 100% completion in any area',
    icon: '💎',
    category: 'mastery',
    requirement: { type: 'area_completion', value: 100 },
    points: 60,
    rarity: 'epic'
  },
  'learning_legend': {
    id: 'learning_legend',
    title: 'Learning Legend',
    description: 'Complete 50 total modules',
    icon: '👑',
    category: 'mastery',
    requirement: { type: 'modules_completed', value: 50 },
    points: 75,
    rarity: 'epic'
  },
  'streak_warrior': {
    id: 'streak_warrior',
    title: 'Streak Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    category: 'consistency',
    requirement: { type: 'streak_days', value: 7 },
    points: 35,
    rarity: 'uncommon'
  },
  'expert_level': {
    id: 'expert_level',
    title: 'Expert Level',
    description: 'Reach Expert level',
    icon: '🎓',
    category: 'mastery',
    requirement: { type: 'current_level', value: 'Expert' },
    points: 100,
    rarity: 'legendary'
  },
  'grand_master': {
    id: 'grand_master',
    title: 'Grand Master',
    description: 'Achieve 100% overall completion',
    icon: '🌟',
    category: 'mastery',
    requirement: { type: 'overall_progress', value: 100 },
    points: 150,
    rarity: 'legendary'
  }
};

export default mongoose.models.Achievement || mongoose.model('Achievement', AchievementSchema); 