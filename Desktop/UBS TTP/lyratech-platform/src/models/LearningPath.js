import mongoose from 'mongoose';

const LearningPathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  selectedAreas: {
    technicalSkills: {
      type: Boolean,
      default: false
    },
    behavioralQuestions: {
      type: Boolean,
      default: false
    },
    practicalProjects: {
      type: Boolean,
      default: false
    }
  },
  progress: {
    technicalSkills: {
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 20 },
      modules: [{
        name: String,
        completed: { type: Boolean, default: false },
        completedAt: Date
      }]
    },
    behavioralQuestions: {
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 15 },
      modules: [{
        name: String,
        completed: { type: Boolean, default: false },
        completedAt: Date
      }]
    },
    practicalProjects: {
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 10 },
      modules: [{
        name: String,
        completed: { type: Boolean, default: false },
        completedAt: Date,
        projectUrl: String
      }]
    }
  },
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  currentLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  estimatedCompletionWeeks: {
    type: Number,
    default: 12
  },
  customGoals: [{
    title: String,
    description: String,
    targetDate: Date,
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
LearningPathSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastActiveDate = new Date();
  
  // Calculate overall progress based on selected areas
  let totalModules = 0;
  let completedModules = 0;
  
  if (this.selectedAreas.technicalSkills) {
    totalModules += this.progress.technicalSkills.total;
    completedModules += this.progress.technicalSkills.completed;
  }
  
  if (this.selectedAreas.behavioralQuestions) {
    totalModules += this.progress.behavioralQuestions.total;
    completedModules += this.progress.behavioralQuestions.completed;
  }
  
  if (this.selectedAreas.practicalProjects) {
    totalModules += this.progress.practicalProjects.total;
    completedModules += this.progress.practicalProjects.completed;
  }
  
  if (totalModules > 0) {
    this.overallProgress = Math.round((completedModules / totalModules) * 100);
  }
  
  // Update level based on progress
  if (this.overallProgress >= 80) {
    this.currentLevel = 'Expert';
  } else if (this.overallProgress >= 60) {
    this.currentLevel = 'Advanced';
  } else if (this.overallProgress >= 30) {
    this.currentLevel = 'Intermediate';
  } else {
    this.currentLevel = 'Beginner';
  }
  
  next();
});

export default mongoose.models.LearningPath || mongoose.model('LearningPath', LearningPathSchema); 