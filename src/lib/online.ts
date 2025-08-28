import Parser from 'rss-parser';

type CacheEntry<T> = { expiresAt: number; data: T };

const memoryCache: Map<string, CacheEntry<any>> = new Map();

function getCache<T>(key: string): T | null {
  const hit = memoryCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return hit.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number) {
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export interface OnlineItem {
  id: string;
  title: string;
  url: string;
  source?: string;
  summary?: string;
  published_at?: Date | null;
}

export async function searchGoogleNews(query: string, hours = 24, limit = 8, cacheMinutes = 15): Promise<OnlineItem[]> {
  const canonicalQ = query.trim().replace(/\s+/g, '+');
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(canonicalQ)}+when:${hours}h&hl=en-US&gl=US&ceid=US:en`;
  const cacheKey = `gnews:${hours}:${limit}:${canonicalQ}`;
  const cached = getCache<OnlineItem[]>(cacheKey);
  if (cached) return cached;

  const parser = new Parser({ timeout: 10000 });
  const feed = await parser.parseURL(url);
  const items: OnlineItem[] = (feed.items || []).slice(0, limit).map((it) => ({
    id: it.link || it.guid || it.title || Math.random().toString(36).slice(2),
    title: it.title || '',
    url: (it.link || '').replace(/^\./, ''),
    source: 'google-news',
    summary: it.contentSnippet || it.content || it.summary || '',
    published_at: it.isoDate ? new Date(it.isoDate) : it.pubDate ? new Date(it.pubDate) : null,
  })).filter((i) => i.title && i.url);

  setCache(cacheKey, items, cacheMinutes * 60 * 1000);
  return items;
}

export async function searchArxiv(query: string, days = 7, limit = 6, cacheMinutes = 30): Promise<OnlineItem[]> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const dateRange = `${start.toISOString().slice(0, 10)}+TO+${end.toISOString().slice(0, 10)}`;
  const q = `search_query=all:${encodeURIComponent(query)}+AND+submittedDate:[${dateRange}]&sortBy=submittedDate&sortOrder=descending&max_results=${limit}`;
  const url = `https://export.arxiv.org/api/query?${q}`;
  const cacheKey = `arxiv:${days}:${limit}:${query}`;
  const cached = getCache<OnlineItem[]>(cacheKey);
  if (cached) return cached;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const xml = await res.text();
  // 非严格解析：简单提取 <entry><title>, <id>, <summary>, <published>
  const entries = xml.split('<entry>').slice(1).map((chunk) => {
    const title = (chunk.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim() || '';
    const link = (chunk.match(/<id>([\s\S]*?)<\/id>/) || [])[1]?.trim() || '';
    const summary = (chunk.match(/<summary>([\s\S]*?)<\/summary>/) || [])[1]?.trim() || '';
    const published = (chunk.match(/<published>([\s\S]*?)<\/published>/) || [])[1]?.trim() || '';
    return { title, link, summary, published };
  });
  const items: OnlineItem[] = entries.slice(0, limit).map((e) => ({
    id: e.link || e.title,
    title: e.title,
    url: e.link,
    source: 'arxiv',
    summary: e.summary,
    published_at: e.published ? new Date(e.published) : null,
  })).filter((i) => i.title && i.url);

  setCache(cacheKey, items, cacheMinutes * 60 * 1000);
  return items;
}



