const fs = require('fs');
const path = require('path');

// 定义环境变量内容
const envContent = `# Email Configuration
EMAIL_USER=lyratech.platform@gmail.com
EMAIL_PASSWORD=snhd ainz rjce tldz

# MongoDB Configuration
MONGODB_PASSWORD=w4o0UJl7J07vdKgf

# JWT Secret (用于生成和验证令牌)
JWT_SECRET=8f7e6d5c4b3a2910aabbccddeeffgghh

# 其他可选配置
NODE_ENV=development
`;

// 定义文件路径 - 项目根目录
const rootDir = path.resolve(__dirname, '../..');
const envPath = path.join(rootDir, '.env.local');

// 写入文件
fs.writeFileSync(envPath, envContent);

console.log(`环境变量文件已更新: ${envPath}`);
console.log('MongoDB密码已设置!'); 