import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // 格式: "14:30"
    required: true
  },
  endTime: {
    type: String, // 格式: "16:00"
    required: true
  },
  type: {
    type: String,
    enum: ['learning', 'personal', 'work', 'deadline', 'meeting', 'other'],
    default: 'personal'
  },
  category: {
    type: String,
    enum: ['technicalSkills', 'behavioralQuestions', 'practicalProjects', 'general'],
    default: 'general'
  },
  module: {
    type: String, // 关联的学习模块名称
    trim: true
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  completed: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrence: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1 // 每1周/月重复
    },
    endDate: {
      type: Date
    },
    daysOfWeek: [{
      type: Number, // 0-6 (Sunday-Saturday)
      min: 0,
      max: 6
    }]
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    method: {
      type: String,
      enum: ['email', 'notification'],
      default: 'email'
    },
    minutesBefore: {
      type: Number,
      default: 30 // 提前30分钟提醒
    }
  },
  color: {
    type: String,
    default: '#3B82F6' // 默认蓝色
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

// 在保存前更新updatedAt
eventSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 索引优化
eventSchema.index({ userId: 1, startDate: 1 });
eventSchema.index({ userId: 1, type: 1 });
eventSchema.index({ userId: 1, completed: 1 });

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event; 