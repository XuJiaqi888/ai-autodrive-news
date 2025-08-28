import Parser from 'rss-parser';
import crypto from 'crypto';
import { KEYWORDS } from './sources';

export interface NormalizedItem {
  id: string;
  title: string;
  url: string;
  source?: string;
  summary?: string;
  lang?: 'zh'|'en';
  tags?: string[];
  published_at?: Date | null;
}

export async function fetchRssFeed(url: string) {
  const parser = new Parser({ timeout: 10000 });
  return parser.parseURL(url);
}

export interface RssItemLike {
  title?: string;
  link?: string;
  guid?: string;
  contentSnippet?: string;
  content?: string;
  summary?: string;
  isoDate?: string;
  pubDate?: string;
}

export function normalizeRssItem(item: RssItemLike, feedUrl: string, lang?: 'zh'|'en'): NormalizedItem | null {
  const title: string = item.title ?? '';
  const link: string = item.link ?? item.guid ?? '';
  if (!title || !link) return null;
  const summary: string = item.contentSnippet ?? item.content ?? item.summary ?? '';
  const published = item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : null;

  // 关键词过滤：标题或摘要中至少命中一个关键词
  const lower = `${title}\n${summary}`.toLowerCase();
  const hit = KEYWORDS.some(k => lower.includes(k.toLowerCase())) || /autonomous|自动驾驶|adas|smart cockpit|智能座舱|车载大模型/i.test(lower);
  if (!hit) return null;

  const id = crypto.createHash('sha256').update(link).digest('hex');
  return {
    id,
    title,
    url: link,
    source: feedUrl,
    summary,
    lang,
    tags: [],
    published_at: published,
  };
}


