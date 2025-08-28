import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, insertOrUpdateItem, listSubscribers, selectTopForDate, selectRecentTop, updateSummaryZh, selectRecentNewsTop, clearFeatured, setFeatured } from '@/lib/db';
import { RSS_SOURCES } from '@/lib/sources';
import { fetchRssFeed, normalizeRssItem } from '@/lib/normalize';
import { sendDigest } from '@/lib/email';
import { searchGithubRepos } from '@/lib/github';
import { summarizeToZh } from '@/lib/translate';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // 优先允许 Vercel Cron，或本地/手动带 key 调用
    const cronHeader = req.headers.get('x-vercel-cron');
    if (!cronHeader) {
      const url = new URL(req.url);
      const key = url.searchParams.get('key');
      if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
    }

    await ensureSchema();

    // 1) 拉取与入库（按源并发）
    const batches = await Promise.allSettled<number>(
      RSS_SOURCES.map(async (src): Promise<number> => {
        const feed = await fetchRssFeed(src.url);
        const normalized = (feed.items || [])
          .map((it) => normalizeRssItem(it as any, src.url, src.lang))
          .filter(Boolean);
        for (const n of normalized as { id: string; title: string; url: string; source?: string; summary?: string; lang?: 'zh'|'en'; tags?: string[]; published_at?: Date | null }[]) {
          await insertOrUpdateItem(n);
        }
        return normalized?.length || 0;
      })
    );

    // 额外抓取 GitHub 仓库（热门、近期活跃）
    const gh = await searchGithubRepos('autonomous driving OR ADAS OR smart cockpit OR in-cabin', 5);
    for (const r of gh) {
      // 不写入当前时间，保持发布为空（null），前端将不显示时间
      await insertOrUpdateItem({ id: r.html_url, title: r.full_name, url: r.html_url, source: 'github', summary: r.description ?? '', lang: 'en' });
    }

    // 2) 当日 Top 2 用于邮件（生成中文摘要）
    const today = new Date();
    let top2 = await selectRecentNewsTop(48, 2);
    if (top2.length < 2) {
      const add = await selectRecentTop(48, 2);
      top2 = add.filter((i) => !(i.source && i.source.toLowerCase().includes('github'))).slice(0, 2);
    }
    // 控制摘要生成调用次数，避免配额超限（仅对缺失中文摘要的条目生成）
    for (const it of top2) {
      if (!(it as any).summary_zh) {
        try {
          const zh = await summarizeToZh(String(it.title), (it as any).summary ?? '');
          if (zh) await updateSummaryZh(String(it.id), zh);
          // 同步写回内存对象，确保后续邮件使用到中文摘要
          (it as any).summary_zh = zh;
        } catch {}
      }
    }

    // 3) 标记当日精选（用于页面展示 Top2）
    try {
      await clearFeatured();
      await setFeatured(top2.map((i) => String(i.id)));
    } catch {}

    // 4) 邮件推送
    const subs = await listSubscribers();
    const zhSubs = subs.filter((s) => s.lang === 'zh');
    const enSubs = subs.filter((s) => s.lang === 'en');

    const picks = (top2.length ? top2 : []).map((it) => ({ title: it.title as string, url: it.url as string, summary: ((it as any).summary_zh ?? (it as any).summary) ?? '' }));

    const mailJobs = [
      ...zhSubs.map((s) => sendDigest(s.email, 'zh', picks).then(() => ({ ok: true })).catch(() => ({ ok: false }))),
      ...enSubs.map((s) => sendDigest(s.email, 'en', picks).then(() => ({ ok: true })).catch(() => ({ ok: false }))),
    ];
    const results = await Promise.allSettled(mailJobs);
    const mailedOk = results.filter((r) => r.status === 'fulfilled' && (r as any).value.ok).length;

    return NextResponse.json({ ok: true, pulled: batches.length, mailed: mailedOk, featured: top2.map(i => i.id) });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


