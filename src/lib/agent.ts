import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchItemsFTS } from './db';
import { searchGithubRepos } from './github';
import { fetchRssFeed, normalizeRssItem } from './normalize';
import { RSS_SOURCES } from './sources';
import { searchGoogleNews, searchArxiv } from './online';

const PRIMARY_MODEL = process.env.GEMINI_PRIMARY_MODEL || 'gemini-2.5-flash';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-1.5-flash-8b';

async function generateSafe(genAI: GoogleGenerativeAI, modelName: string, text: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: modelName });
  const res = await model.generateContent({ contents: [{ role: 'user', parts: [{ text }] }] });
  return res.response.text();
}

// 子问题分解和智能检索
async function decomposeAndSearch(question: string, genAI: any) {
  // 使用LLM分解复杂问题为2-3个子查询
  const decomposePrompt = `将以下复杂问题分解为2-3个具体的搜索查询，每个查询一行，用于搜索相关技术资料：

问题：${question}

要求：
1. 提取核心技术概念
2. 分解为可搜索的具体方面
3. 每行一个查询词/短语，适合Google News或学术搜索
4. 包含英文技术术语

示例格式：
end-to-end autonomous driving
BEV transformer architecture
self-driving planning`;

  let subQueries: string[] = [];
  try {
    const result = await generateSafe(genAI, 'gemini-1.5-flash-8b', decomposePrompt);
    subQueries = result.split('\n').map(q => q.trim()).filter(q => q && !q.startsWith('问题') && !q.startsWith('要求'));
  } catch {
    // 降级：使用简单关键词提取
    subQueries = [
      question.replace(/[？?]/g, '').slice(0, 50),
      'autonomous driving',
      'self-driving technology'
    ];
  }

  console.log(`[Agent] Sub-queries:`, subQueries);

  // 为每个子查询并行搜索
  const searchResults = await Promise.allSettled(
    subQueries.slice(0, 3).map(async (query) => {
      const [gnews, arxiv] = await Promise.all([
        searchGoogleNews(query, 48, 4, 20).catch(() => []),
        searchArxiv(query, 14, 3, 40).catch(() => [])
      ]);
      return { query, results: [...gnews, ...arxiv] };
    })
  );

  const allResults = searchResults
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .flatMap(r => r.value.results);

  console.log(`[Agent] Total search results from sub-queries:`, allResults.length);
  return allResults;
}

export async function askConcept(question: string) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY not set');
  const genAI = new GoogleGenerativeAI(key);

  // 智能子问题分解搜索 + 站内检索 + GitHub补充
  const [dbHits, ghHits, freshNews, smartSearchResults] = await Promise.all([
    searchItemsFTS(question, 6),
    searchGithubRepos(question + ' OR autonomous driving OR ADAS', 3),
    (async () => {
      try {
        const newsFeeds = RSS_SOURCES.filter(s => s.kind === 'news').slice(0, 3);
        const results = await Promise.allSettled(newsFeeds.map(async (s) => {
          const feed = await fetchRssFeed(s.url);
          return (feed.items || []).map((it) => normalizeRssItem(it as any, s.url, s.lang)).filter(Boolean).slice(0, 2);
        }));
        return results.flatMap((r) => r.status === 'fulfilled' ? (r.value as any[]) : []).slice(0, 4);
      } catch { return []; }
    })(),
    decomposeAndSearch(question, genAI), // 新的智能搜索
  ]);
  
  const ghAsItems = ghHits.map((r) => ({ id: r.html_url, title: r.full_name, url: r.html_url, source: 'github' as const }));
  const candidates = [...smartSearchResults, ...freshNews, ...dbHits, ...ghAsItems].slice(0, 16);
  
  // 调试信息（生产环境可移除）
  console.log(`[Agent Debug] Question: "${question}"`);
  console.log(`[Agent Debug] Sources found - Smart Search: ${smartSearchResults.length}, Fresh RSS: ${freshNews.length}, DB: ${dbHits.length}, GitHub: ${ghAsItems.length}`);
  console.log(`[Agent Debug] Total candidates: ${candidates.length}`);
  // 启发式重排（无 LLM 调用）：时间衰减 + 来源权重 + 关键词匹配 + 类型惩罚
  const now = Date.now();
  const kw = (question || '').toLowerCase();
  const boost = (text?: string | null) => {
    const t = (text || '').toLowerCase();
    let s = 0;
    ['autonomous','end-to-end','自动驾驶','adas','智能座舱','车载大模型','bev','planning','perception','LLM','VLM'].forEach(k => { if (t.includes(k.toLowerCase())) s += 1; });
    if (kw && t.includes(kw)) s += 2;
    return s;
  };
  const srcWeight = (src?: string | null) => {
    const s = (src || '').toLowerCase();
    if (s.includes('automotivedive')) return 1.6;
    if (s.includes('techcrunch') || s.includes('theverge') || s.includes('technologyreview')) return 1.3;
    if (s.includes('arxiv')) return 1.2;
    if (s.includes('github')) return 0.6;
    return 1.0;
  };
  const scored = candidates.map((c) => {
    const ageHours = c.published_at ? (now - new Date(c.published_at as any).getTime())/3600000 : 9999;
    const recency = Math.max(0, 48 - Math.min(ageHours, 48)) / 48; // 0~1
    const score = recency * 1.5 + boost(c.title) * 0.8 + boost(c.summary) * 0.6 + srcWeight(c.source);
    return { ...c, _score: score };
  }).sort((a, b) => (b._score ?? 0) - (a._score ?? 0));
  const top = scored.slice(0, 6);

  console.log(`[Agent Debug] Top 6 sources:`, top.map(c => `${c.source}: ${c.title?.slice(0, 50)}...`));

  // 确保有足够的高质量资料
  const qualityRefs = top.filter(c => c.title && c.title.length > 10 && c.source);
  if (qualityRefs.length < 2) {
    console.log(`[Agent Warning] Insufficient quality references: ${qualityRefs.length}/6`);
  }

  const refs = top.map((c, i: number) => `${i + 1}. ${c.title ?? ''} [${c.source ?? ''}] ${c.url ?? ''}`).join('\n');

  // 格式化引用为markdown链接
  const formattedRefs = refs.split('\n').map((ref, i) => {
    const match = ref.match(/^\d+\.\s*(.*?)\s*\[(.*?)\]\s*(.*)$/);
    if (match) {
      const [, title, source, url] = match;
      return `${i + 1}. [${title.trim()}](${url.trim()}) - ${source.trim()}`;
    }
    return ref;
  }).filter(ref => ref.trim()).join('\n');

  const prompt = `你是AI与自动驾驶领域的资深专家。我为你的问题进行了智能搜索，获取了以下最新资料：

**重要说明**：已使用子问题分解技术从Google News、arXiv等多个渠道检索相关资料，请充分利用这些信息。

## 核心概念
基于检索资料，用2-3句简洁阐述概念的本质与核心思想。

## 关键特点
基于资料分析：
- **技术原理**：根据资料描述的底层技术机制  
- **优势**：资料中提到的核心优势
- **应用场景**：资料显示的应用领域
- **发展现状**：参考资料反映的最新进展与趋势

## 参考资料
${formattedRefs || '检索中遇到问题，可能网络资源暂时不可用'}

**回答要求**：
1. 每个要点都要明确引用对应的资料编号 [1][2]等，产生具体翔实的分析
2. 优先使用Google News、arXiv等最新资料（source显示为google-news或arxiv）
3. 如果资料不足，结合你的专业知识补充，但要明确标注

**用户问题**：${question}

请基于上述智能检索的资料进行专业深度分析。`;

  let text = '';
  try {
    text = await generateSafe(genAI, PRIMARY_MODEL, prompt);
  } catch (e: any) {
    text = await generateSafe(genAI, FALLBACK_MODEL, prompt);
  }
  return { text, references: candidates } as { text: string; references: Array<{ id: string; title: string; url: string; source: string | null }> };
}

export async function askConceptQuick(question: string) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY not set');
  const genAI = new GoogleGenerativeAI(key);

  // 快速模式：仅检索站内数据和少量在线资源
  const [dbHits, gnews] = await Promise.all([
    searchItemsFTS(question, 3),
    searchGoogleNews(question, 12, 3, 10).catch(() => []), // 更少更快
  ]);
  
  const candidates = [...gnews, ...dbHits].slice(0, 6);
  console.log(`[Agent Quick Debug] Question: "${question}", Total candidates: ${candidates.length}`);

  // 简化重排：仅按时间和关键词匹配
  const kw = (question || '').toLowerCase();
  const quickScore = (c: any) => {
    const titleMatch = (c.title || '').toLowerCase().includes(kw) ? 2 : 0;
    const recency = c.published_at ? Math.max(0, 2 - (Date.now() - new Date(c.published_at as any).getTime())/86400000) : 0;
    return titleMatch + recency;
  };
  
  const top = candidates.sort((a, b) => quickScore(b) - quickScore(a)).slice(0, 3);
  
  // 快速回答prompt：简洁直接
  const prompt = `作为AI+自动驾驶专家，请用**2-3段话简洁回答**以下问题，语言通俗易懂， 回复迅速：

${question}

要求：直接回答核心要点，无需复杂格式，保持专业但易懂。`;

  let text = '';
  try {
    text = await generateSafe(genAI, PRIMARY_MODEL, prompt);
  } catch (e: any) {
    text = await generateSafe(genAI, FALLBACK_MODEL, prompt);
  }
  
  return { text, references: candidates } as { text: string; references: Array<{ id: string; title: string; url: string; source: string | null }> };
}


