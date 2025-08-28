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
];

export const KEYWORDS = [
  'autonomous driving', 'self-driving', 'autopilot', 'ADAS', 'end-to-end driving', 'BEV', 'BEVFormer',
  'smart cockpit', 'in-cabin', '智能座舱', '车载大模型', '自动驾驶', '智驾', '泊车', 'L2', 'L3',
  'Vision-Language', 'VLM', 'LLM', '多模态', '端到端', '驾驶', '道路',
];


