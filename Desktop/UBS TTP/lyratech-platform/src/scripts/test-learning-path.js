// 学习路径API测试脚本
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// 尝试加载环境变量
try {
  require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
} catch (e) {
  console.log('📝 注意: 未找到.env.local文件，使用默认MongoDB连接');
}

// MongoDB连接
async function connectMongoDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lyratech';
    console.log('🔗 正在连接到:', MONGODB_URI.replace(/\/\/[^:]*:[^@]*@/, '//***:***@')); // 隐藏密码
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 建议:');
      console.error('  1. 检查MongoDB服务是否正在运行');
      console.error('  2. 如果使用MongoDB Atlas，请检查网络白名单');
      console.error('  3. 确认MONGODB_URI环境变量正确设置');
    }
    throw error;
  }
}

// 用户模型 - 简化版本用于测试
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// 学习路径模型
const learningPathSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  selectedAreas: {
    technicalSkills: { type: Boolean, default: false },
    behavioralQuestions: { type: Boolean, default: false },
    practicalProjects: { type: Boolean, default: false }
  },
  progress: {
    technicalSkills: {
      total: { type: Number, default: 20 },
      completed: { type: Number, default: 0 },
      modules: { type: [Boolean], default: () => new Array(20).fill(false) }
    },
    behavioralQuestions: {
      total: { type: Number, default: 15 },
      completed: { type: Number, default: 0 },
      modules: { type: [Boolean], default: () => new Array(15).fill(false) }
    },
    practicalProjects: {
      total: { type: Number, default: 10 },
      completed: { type: Number, default: 0 },
      modules: { type: [Boolean], default: () => new Array(10).fill(false) },
      projectUrls: { type: [String], default: () => new Array(10).fill('') }
    }
  },
  overallProgress: { type: Number, default: 0 },
  currentLevel: { type: String, default: 'Beginner' },
  goals: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const LearningPath = mongoose.models.LearningPath || mongoose.model('LearningPath', learningPathSchema);

// 测试用户数据
const testUser = {
  email: 'test@lyratech.com',
  password: 'test123',
  firstName: 'Test',
  lastName: 'User'
};

// 创建测试用户
async function createTestUser() {
  try {
    // 删除已存在的测试用户
    await User.deleteOne({ email: testUser.email });
    await LearningPath.deleteOne({ userId: { $exists: true } });
    
    // 创建新的测试用户
    const hashedPassword = await bcrypt.hash(testUser.password, 12);
    const user = new User({
      ...testUser,
      password: hashedPassword
    });
    
    await user.save();
    console.log('✅ 测试用户创建成功:', user._id);
    return user;
  } catch (error) {
    console.error('❌ 创建测试用户失败:', error);
    throw error;
  }
}

// 测试学习路径创建
async function testCreateLearningPath(userId) {
  try {
    const learningPath = new LearningPath({
      userId: userId,
      selectedAreas: {
        technicalSkills: true,
        behavioralQuestions: true,
        practicalProjects: false
      },
      goals: '提升技术技能和面试表现'
    });
    
    await learningPath.save();
    console.log('✅ 学习路径创建成功');
    console.log('   - 技术技能: ✓');
    console.log('   - 行为面试: ✓');
    console.log('   - 实践项目: ✗');
    console.log('   - 目标:', learningPath.goals);
    return learningPath;
  } catch (error) {
    console.error('❌ 创建学习路径失败:', error);
    throw error;
  }
}

// 测试进度更新
async function testUpdateProgress(userId) {
  try {
    const learningPath = await LearningPath.findOne({ userId });
    if (!learningPath) {
      throw new Error('学习路径不存在');
    }
    
    // 模拟完成一些技术技能模块
    learningPath.progress.technicalSkills.modules[0] = true; // JavaScript基础
    learningPath.progress.technicalSkills.modules[1] = true; // React基础
    learningPath.progress.technicalSkills.modules[2] = true; // Node.js
    learningPath.progress.technicalSkills.completed = 3;
    
    // 模拟完成一些行为面试模块
    learningPath.progress.behavioralQuestions.modules[0] = true; // 领导力
    learningPath.progress.behavioralQuestions.modules[1] = true; // 团队协作
    learningPath.progress.behavioralQuestions.completed = 2;
    
    // 计算总体进度
    const totalModules = 20 + 15; // 只计算选中的领域
    const completedModules = 3 + 2;
    learningPath.overallProgress = Math.round((completedModules / totalModules) * 100);
    
    // 更新等级
    if (learningPath.overallProgress >= 30) {
      learningPath.currentLevel = 'Intermediate';
    }
    
    learningPath.updatedAt = new Date();
    await learningPath.save();
    
    console.log('✅ 进度更新成功');
    console.log(`   - 技术技能进度: ${learningPath.progress.technicalSkills.completed}/20`);
    console.log(`   - 行为面试进度: ${learningPath.progress.behavioralQuestions.completed}/15`);
    console.log(`   - 总体进度: ${learningPath.overallProgress}%`);
    console.log(`   - 当前等级: ${learningPath.currentLevel}`);
    
    return learningPath;
  } catch (error) {
    console.error('❌ 更新进度失败:', error);
    throw error;
  }
}

// 测试数据查询
async function testQueryLearningPath(userId) {
  try {
    const learningPath = await LearningPath.findOne({ userId }).populate('userId', 'firstName lastName email');
    
    if (!learningPath) {
      console.log('❌ 未找到学习路径');
      return null;
    }
    
    console.log('✅ 学习路径查询成功');
    console.log('   用户信息:', learningPath.userId.firstName, learningPath.userId.lastName);
    console.log('   选择的学习领域:');
    Object.entries(learningPath.selectedAreas).forEach(([area, selected]) => {
      if (selected) {
        const areaNames = {
          technicalSkills: '技术技能',
          behavioralQuestions: '行为面试',
          practicalProjects: '实践项目'
        };
        console.log(`     - ${areaNames[area]}: ✓`);
      }
    });
    
    return learningPath;
  } catch (error) {
    console.error('❌ 查询学习路径失败:', error);
    throw error;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始学习路径功能测试...\n');
  
  try {
    // 1. 连接数据库
    console.log('1️⃣ 连接数据库...');
    await connectMongoDB();
    console.log('');
    
    // 2. 创建测试用户
    console.log('2️⃣ 创建测试用户...');
    const user = await createTestUser();
    console.log('');
    
    // 3. 创建学习路径
    console.log('3️⃣ 创建学习路径...');
    await testCreateLearningPath(user._id);
    console.log('');
    
    // 4. 更新学习进度
    console.log('4️⃣ 更新学习进度...');
    await testUpdateProgress(user._id);
    console.log('');
    
    // 5. 查询学习路径
    console.log('5️⃣ 查询学习路径...');
    await testQueryLearningPath(user._id);
    console.log('');
    
    console.log('🎉 所有测试完成！学习路径功能正常工作。');
    
  } catch (error) {
    console.error('💥 测试失败:', error.message);
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('📝 数据库连接已关闭');
  }
}

// 运行测试
if (require.main === module) {
  runTests();
}

module.exports = { runTests }; 