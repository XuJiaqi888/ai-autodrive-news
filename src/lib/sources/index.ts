export const RSS_SOURCES: { url: string; kind: 'news'|'paper'; lang?: 'zh'|'en'; weight?: number }[] = [
  // 论文（arXiv RSS）
  { url: 'https://export.arxiv.org/rss/cs.AI', kind: 'paper', lang: 'en', weight: 1.0 },
  { url: 'https://export.arxiv.org/rss/cs.LG', kind: 'paper', lang: 'en', weight: 1.0 },
  { url: 'https://export.arxiv.org/rss/cs.CV', kind: 'paper', lang: 'en', weight: 1.0 },
  { url: 'https://export.arxiv.org/rss/cs.RO', kind: 'paper', lang: 'en', weight: 1.0 },
  { url: 'https://export.arxiv.org/rss/eess.SY', kind: 'paper', lang: 'en', weight: 0.8 },

  // 中文资讯
  { url: 'https://www.jiqizhixin.com/rss', kind: 'news', lang: 'zh', weight: 1.0 },
  { url: 'https://www.qbitai.com/feed', kind: 'news', lang: 'zh', weight: 0.9 },

  // 英文资讯
  { url: 'https://techcrunch.com/tag/artificial-intelligence/feed/', kind: 'news', lang: 'en', weight: 0.8 },
  // Automotive Dive（行业新闻）
  { url: 'https://www.automotivedive.com/feeds/news/', kind: 'news', lang: 'en', weight: 0.8 },
  // 常见科技媒体（AI 专题）
  { url: 'https://venturebeat.com/category/ai/feed/', kind: 'news', lang: 'en', weight: 0.8 },
  { url: 'https://www.theverge.com/ai-artificial-intelligence?output=rss', kind: 'news', lang: 'en', weight: 0.7 },
  { url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/', kind: 'news', lang: 'en', weight: 0.8 },
  { url: 'https://blog.google/technology/ai/rss/', kind: 'news', lang: 'en', weight: 0.6 },
  { url: 'https://blogs.nvidia.com/feed/', kind: 'news', lang: 'en', weight: 0.6 },
  { url: 'https://spectrum.ieee.org/artificial-intelligence/rss', kind: 'news', lang: 'en', weight: 0.7 },
  { url: 'https://www.wired.com/feed/rss', kind: 'news', lang: 'en', weight: 0.6 },
  { url: 'https://www.bloomberg.com/feeds/technology.rss', kind: 'news', lang: 'en', weight: 0.6 },
  { url: 'https://www.ft.com/technology?format=rss', kind: 'news', lang: 'en', weight: 0.6 },
  { url: 'https://www.cnbc.com/id/19854910/device/rss/rss.html', kind: 'news', lang: 'en', weight: 0.6 },
  
  // —— 新增：中文媒体（汽车/AI） ——
  { url: 'https://chedongxi.com/rss', kind: 'news', lang: 'zh', weight: 0.9 }, // 车东西
  { url: 'https://auto.gasgoo.com/rss', kind: 'news', lang: 'zh', weight: 0.9 }, // 盖世汽车
  { url: 'https://www.d1ev.com/rss', kind: 'news', lang: 'zh', weight: 0.8 }, // 第一电动网
  { url: 'https://www.ifanr.com/feed', kind: 'news', lang: 'zh', weight: 0.6 }, // 爱范儿
  { url: 'https://www.ifanr.com/category/intelligentcar/feed', kind: 'news', lang: 'zh', weight: 0.8 }, // 爱范儿董车会（智能车）
  { url: 'https://36kr.com/feed', kind: 'news', lang: 'zh', weight: 0.6 }, // 36氪
  { url: 'https://36kr.com/channel/automotive/rss', kind: 'news', lang: 'zh', weight: 0.7 }, // 36氪汽车频道
  { url: 'https://www.huxiu.com/rss/0.xml', kind: 'news', lang: 'zh', weight: 0.6 }, // 虎嗅
  { url: 'https://auto.ithome.com/rss', kind: 'news', lang: 'zh', weight: 0.6 }, // IT之家汽车
  { url: 'https://ai-bot.cn/rss', kind: 'news', lang: 'zh', weight: 0.5 }, // AI 工具集（AI日报）

  // —— 新增：英文媒体（汽车/电动车/自动驾驶/AI） ——
  // 汽车与电动车
  { url: 'https://www.autonews.com/rss', kind: 'news', lang: 'en', weight: 0.6 }, // Automotive News（汇总入口）
  { url: 'https://www.motortrend.com/rss', kind: 'news', lang: 'en', weight: 0.6 },
  { url: 'https://www.caranddriver.com/rss/all.xml', kind: 'news', lang: 'en', weight: 0.6 },
  { url: 'https://www.autoweek.com/rss', kind: 'news', lang: 'en', weight: 0.5 },
  { url: 'https://electrek.co/feed', kind: 'news', lang: 'en', weight: 0.8 },
  { url: 'https://insideevs.com/rss', kind: 'news', lang: 'en', weight: 0.7 },
  { url: 'https://www.greencarreports.com/rss', kind: 'news', lang: 'en', weight: 0.7 },
  { url: 'https://www.automotiveworld.com/feed', kind: 'news', lang: 'en', weight: 0.6 },
  // 自动驾驶/行业
  { url: 'https://www.autonomousvehicleinternational.com/rss', kind: 'news', lang: 'en', weight: 0.7 },
  // AI/大模型与研究机构博客
  { url: 'https://openai.com/news/rss.xml', kind: 'news', lang: 'en', weight: 0.6 },
  { url: 'https://ai.googleblog.com/feeds/posts/default', kind: 'news', lang: 'en', weight: 0.6 },
  { url: 'https://bair.berkeley.edu/blog/feed.xml', kind: 'news', lang: 'en', weight: 0.6 },
  { url: 'https://aibusiness.com/rss.xml', kind: 'news', lang: 'en', weight: 0.6 },
  { url: 'https://www.artificialintelligence-news.com/feed/', kind: 'news', lang: 'en', weight: 0.6 },
  { url: 'https://towardsdatascience.com/feed', kind: 'news', lang: 'en', weight: 0.5 },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', kind: 'news', lang: 'en', weight: 0.6 },
];

export const KEYWORDS = [
  'autonomous driving', 'self-driving', 'autopilot', 'ADAS', 'end-to-end driving', 'BEV', 'BEVFormer',
  'smart cockpit', 'in-cabin', '智能座舱', '车载大模型', '自动驾驶', '智驾', '泊车', 'L2', 'L3', 'L4',
  'Vision-Language', 'VLM', 'LLM', 'VLA', '多模态', '端到端', '驾驶', '道路',
];


