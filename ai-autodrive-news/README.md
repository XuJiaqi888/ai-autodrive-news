# 🚗 AI Autodrive Researcher

基于 Vercel + Gemini 的智能自动驾驶研究平台，提供最新AI、车载大模型、智能驾驶领域的资讯聚合与智能问答。

![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/google%20gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white)

## 🌟 核心特性

### 📰 智能资讯聚合
- **多源数据采集**：整合 arXiv、机器之心、量子位、TechCrunch、Automotive Dive 等30+权威源
- **日定时更新**：每日9:00自动抓取最新资讯、论文、GitHub项目
- **智能筛选**：基于AI+自动驾驶关键词的精准过滤
- **去重排序**：URL去重 + 时间权重排序

### 🤖 双模式AI Agent
- **⚡ 快速回答**：秒级响应，简洁明了的概念解释
- **🔬 深度研究**：基于实时多源检索的学术级分析
- **📚 强制引用**：每个要点都标注资料来源 [1][2]
- **🌐 实时搜索**：Google News + arXiv + 行业RSS的智能融合

### 📧 智能邮件订阅
- **🎯 每日Top2**：AI筛选的最有价值资讯推送
- **🌍 双语支持**：中英文订阅，自动翻译摘要
- **💌 精美模板**：HTML卡片式邮件，300-400词深度摘要
- **🔗 一键退订**：HMAC签名保护的安全退订

## 🛠️ 技术架构

### 前端技术栈
```typescript
Next.js 14 (App Router)
TypeScript
Tailwind CSS
React Markdown
Vercel部署
```

### 后端服务
```typescript
Vercel Serverless Functions
Vercel Postgres (Neon)
Vercel Cron Jobs
```

### AI & 数据处理
```typescript
Google Gemini 2.5 Flash + 1.5 Flash-8b (自动fallback)
PostgreSQL FTS (全文搜索)
RSS Parser
GitHub REST API
arXiv API
Google News RSS
```

### 核心组件

#### 🔍 多源检索系统
```typescript
// 子问题分解 + 并行搜索
const sources = await Promise.all([
  searchItemsFTS(query),           // 站内FTS
  searchGoogleNews(subQueries),    // 实时新闻
  searchArxiv(subQueries),         // 学术论文
  searchGithubRepos(query),        // 开源项目
  fetchRssFeed(industrySources)    // 行业资讯
]);
```

#### 🏆 启发式重排算法
```typescript
const score = 
  timeDecay * 0.3 +           // 时间衰减
  sourceWeight * 0.3 +        // 来源权重
  keywordBoost * 0.2 +        // 关键词匹配
  ftsRank * 0.2;              // FTS排名
```

#### 📊 每日ETL流程
```typescript
1. 多源RSS采集 → 2. 关键词过滤 → 3. URL去重 
→ 4. Postgres存储 → 5. Top2筛选 → 6. Gemini摘要 
→ 7. 邮件推送
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Vercel账户
- Gmail邮箱(开启2FA + App Password)
- Google Gemini API Key

### 本地开发
```bash
# 克隆项目
git clone https://github.com/XuJiaqi888/ai-autodrive-news.git
cd ai-autodrive-news

# 安装依赖
npm install

# 环境变量配置
cp .env.example .env.local
# 填入必要的API密钥

# 启动开发服务器
npm run dev
```

### 环境变量配置
```bash
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# 数据库 (Vercel Postgres)
POSTGRES_URL=your_postgres_connection_string

# 邮件服务 (Gmail)
E

## 📋 API接口

### 🤖 AI问答接口
```typescript
POST /api/ask
{
  "question": "BEVFormer架构原理",
  "mode": "research" | "quick"
}
```

### 📧 订阅管理
```typescript
// 订阅
POST /api/subscribe
{
  "email": "user@example.com",
  "language": "zh" | "en"
}

// 退订
GET /api/unsubscribe?email=user@example.com&token=signed_token
```

### ⏰ 定时任务
```typescript
// 每日数据更新 (UTC 01:00 = 北京 09:00)
GET /api/cron/daily?key=your_cron_secret
```

## 📊 数据源覆盖

### 🎓 学术论文
- arXiv (cs.AI, cs.LG, cs.CV, cs.RO, eess.SY)
- 实时arXiv API搜索

### 📰 新闻媒体
- **中文**：机器之心、量子位
- **英文**：TechCrunch AI, The Verge AI, MIT Tech Review, Wired
- **行业**：Automotive Dive, Bloomberg Tech, Financial Times

### 💻 开源项目
- GitHub trending repositories
- 关键词定向搜索

### 🔍 实时搜索
- Google News RSS (48小时内)
- arXiv API (14天内)

## 🎯 核心算法

### 智能子问题分解
```typescript
// 复杂问题 → 多个精准搜索查询
"端到端自动驾驶最新进展" 
→ ["end-to-end autonomous driving 2024", 
   "E2E self-driving neural networks", 
   "autonomous vehicle perception fusion"]
```

### 多层缓存策略
```typescript
// 减少API调用，提升响应速度
Google News: 10分钟缓存
arXiv API: 30分钟缓存
GitHub API: 40分钟缓存
```

### 质量验证机制
```typescript
// 确保回答质量
const qualityRefs = references.filter(ref => 
  ref.title?.length > 10 && 
  ref.source && 
  ref.relevanceScore > 0.6
);
```

## 📈 性能指标

- **响应时间**：快速模式 <3s，研究模式 <10s
- **数据更新**：每日自动，30+源同步
- **邮件送达**：99%+ 成功率，HTML富文本
- **搜索精度**：FTS + 语义检索双重保障

## 🛡️ 安全特性

- **CRON保护**：密钥验证防止恶意触发
- **退订安全**：HMAC签名防止伪造
- **API限流**：Gemini配额智能管理
- **数据隐私**：最小化收集，安全存储

## 🗺️ 路线图

- [ ] **多语言支持**：日语、韩语订阅
- [ ] **移动端优化**：PWA应用
- [ ] **个性化推荐**：基于用户兴趣标签
- [ ] **API开放**：第三方集成接口
- [ ] **实时推送**：WebSocket消息通知

## 🤝 贡献指南

欢迎提交 Issues 和 Pull Requests！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Vercel](https://vercel.com) - 云端部署平台
- [Google Gemini](https://ai.google.dev) - AI模型支持
- [Automotive Dive](https://www.automotivedive.com) - 行业资讯源
- [arXiv](https://arxiv.org) - 学术论文数据库

---

🔗 **在线访问**: [ai-autodrive-researcher.vercel.app](https://ai-autodrive-researcher.vercel.app)

📧 **联系邮箱**: joyce888@connect.hku.hk

⭐ 如果这个项目对您有帮助，请给个 Star 支持！
