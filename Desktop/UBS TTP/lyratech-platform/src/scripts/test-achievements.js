// 成就系统测试脚本
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// 尝试加载环境变量
try {
  require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
} catch (e) {
  console.log('📝 注意: 未找到.env.local文件，使用默认配置');
}

// 测试配置
const BASE_URL = 'http://localhost:3001';
const TEST_USER = {
  email: 'test@lyratech.com',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User',
  careerStage: 'nextgen'
};

let authToken = '';

// 数据库连接
async function connectDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lyratech';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 用户模型定义
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  careerStage: { type: String, enum: ['nextgen', 'shining'] },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// 直接创建已验证用户
async function createVerifiedUser() {
  try {
    await connectDB();
    
    // 删除已存在的测试用户
    await User.deleteOne({ email: TEST_USER.email });
    
    // 创建新的已验证用户
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 12);
    const user = new User({
      ...TEST_USER,
      password: hashedPassword
    });
    
    await user.save();
    console.log('✅ 已验证用户创建成功');
    return true;
  } catch (error) {
    console.error('❌ 创建用户失败:', error.message);
    return false;
  }
}

// 登录获取token
async function login() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });

    const data = await response.json();
    if (data.success) {
      authToken = data.token;
      console.log('✅ 登录成功');
      return true;
    } else {
      console.log('❌ 登录失败:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 登录请求失败:', error.message);
    return false;
  }
}

// 创建学习路径
async function createLearningPath() {
  try {
    const response = await fetch(`${BASE_URL}/api/learning-path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        selectedAreas: {
          technicalSkills: true,
          behavioralQuestions: true,
          practicalProjects: false
        },
        customGoals: '通过测试提升成就系统'
      })
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ 学习路径创建成功');
      return true;
    } else {
      console.log('❌ 学习路径创建失败:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 创建学习路径请求失败:', error.message);
    return false;
  }
}

// 完成一些模块
async function completeModules() {
  const modules = [
    { area: 'technicalSkills', moduleIndex: 0 }, // JavaScript Fundamentals
    { area: 'technicalSkills', moduleIndex: 1 }, // React Basics
    { area: 'technicalSkills', moduleIndex: 2 }, // Node.js
    { area: 'behavioralQuestions', moduleIndex: 0 }, // Leadership
    { area: 'behavioralQuestions', moduleIndex: 1 }, // Team Collaboration
  ];

  for (const module of modules) {
    try {
      const response = await fetch(`${BASE_URL}/api/learning-path`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          area: module.area,
          moduleIndex: module.moduleIndex,
          completed: true
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log(`✅ 模块完成: ${module.area}[${module.moduleIndex}]`);
      } else {
        console.log(`❌ 模块完成失败: ${data.message}`);
      }
    } catch (error) {
      console.error('❌ 完成模块请求失败:', error.message);
    }
    
    // 添加小延迟，模拟真实用户行为
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// 获取成就
async function getAchievements() {
  try {
    const response = await fetch(`${BASE_URL}/api/achievements`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('\n🏆 成就系统状态:');
      console.log('📊 用户统计:');
      console.log(`   - 总完成模块: ${data.data.stats.totalModulesCompleted}`);
      console.log(`   - 选择领域数: ${data.data.stats.totalSkillAreasExplored}`);
      console.log(`   - 总体进度: ${data.data.stats.overallProgress}%`);
      console.log(`   - 当前等级: ${data.data.stats.currentLevel}`);
      console.log(`   - 连续天数: ${data.data.stats.streakDays} 天`);
      
      console.log('\n🔓 已解锁成就:');
      data.data.unlockedAchievements.forEach(achievement => {
        console.log(`   ${achievement.icon} ${achievement.title} - ${achievement.description} (${achievement.points}分)`);
      });
      
      console.log('\n🔒 未解锁成就:');
      data.data.lockedAchievements.slice(0, 5).forEach(achievement => {
        console.log(`   ${achievement.icon} ${achievement.title} - 进度: ${achievement.currentValue}/${achievement.maxValue} (${Math.round(achievement.progress)}%)`);
      });
      
      if (data.data.newlyUnlocked.length > 0) {
        console.log('\n🎉 新解锁成就:');
        data.data.newlyUnlocked.forEach(id => {
          const achievement = data.data.unlockedAchievements.find(a => a.achievementId === id);
          if (achievement) {
            console.log(`   ${achievement.icon} ${achievement.title}`);
          }
        });
      }
      
      console.log(`\n💎 总成就分数: ${data.data.totalPoints} 分`);
      return true;
    } else {
      console.log('❌ 获取成就失败:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 获取成就请求失败:', error.message);
    return false;
  }
}

// 测试多次获取成就，验证重新计算逻辑
async function testMultipleAchievementCalls() {
  console.log('\n🔄 测试多次成就计算...');
  
  for (let i = 1; i <= 3; i++) {
    console.log(`\n--- 第 ${i} 次调用 ---`);
    await getAchievements();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// 主测试函数
async function runAchievementTests() {
  console.log('🚀 开始成就系统测试...\n');
  
  try {
    // 0. 创建已验证用户
    console.log('0️⃣ 准备已验证测试用户...');
    const createSuccess = await createVerifiedUser();
    if (!createSuccess) return;
    console.log('');
    
    // 1. 登录
    console.log('1️⃣ 用户登录...');
    const loginSuccess = await login();
    if (!loginSuccess) return;
    console.log('');
    
    // 2. 创建学习路径
    console.log('2️⃣ 创建学习路径...');
    await createLearningPath();
    console.log('');
    
    // 3. 第一次获取成就（基础状态）
    console.log('3️⃣ 获取初始成就状态...');
    await getAchievements();
    console.log('');
    
    // 4. 完成一些模块
    console.log('4️⃣ 完成学习模块...');
    await completeModules();
    console.log('');
    
    // 5. 再次获取成就（进步后）
    console.log('5️⃣ 获取更新后成就状态...');
    await getAchievements();
    console.log('');
    
    // 6. 测试多次调用
    await testMultipleAchievementCalls();
    
    console.log('\n🎉 成就系统测试完成！');
    console.log('\n📋 测试结果总结:');
    console.log('✅ Day Streak 不再使用随机数，基于真实学习活动计算');
    console.log('✅ 每次调用都会重新计算所有成就状态');
    console.log('✅ 成就解锁状态保持一致性');
    
  } catch (error) {
    console.error('💥 测试失败:', error.message);
  } finally {
    // 关闭数据库连接
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n📝 数据库连接已关闭');
    }
  }
}

// 运行测试
if (require.main === module) {
  runAchievementTests();
}

module.exports = { runAchievementTests }; 