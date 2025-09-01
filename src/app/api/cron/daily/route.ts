import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, insertOrUpdateItem, listSubscribers, selectTopForDate, selectRecentTop, updateSummaryZh, selectRecentNewsTop, clearFeatured, setFeatured, selectLatestForShort, updateShortSummaryZh, updateTags } from '@/lib/db';
import { RSS_SOURCES } from '@/lib/sources';
import { fetchRssFeed, normalizeRssItem } from '@/lib/normalize';
import { sendDigest } from '@/lib/email';
import { searchGithubRepos } from '@/lib/github';
import { summarizeToZh, summarizeBatchToZhShort } from '@/lib/translate';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // 允许 Vercel Cron（兼容多种可能的 Header/UA），否则要求 key
    const cronHeader = req.headers.get('x-vercel-cron') || req.headers.get('x-vercel-scheduled');
    const ua = req.headers.get('user-agent') || '';
    const vercelHint = ua.toLowerCase().includes('vercel') || ua.toLowerCase().includes('cron') ||
      req.headers.has('x-vercel-id') || req.headers.has('x-vercel-deployment-url');
    if (!cronHeader && !vercelHint) {
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

    // 3) 批量为最近30条生成短摘要（缺失者）
    try {
      const latestForShort = await selectLatestForShort(30);
      const need = latestForShort.filter((x) => !x.summary_short_zh);
      if (need.length) {
        const map = await summarizeBatchToZhShort(need.map(x => ({ id: x.id, title: x.title, summary: x.summary_zh || x.summary })));
        for (const n of need) {
          const s = map[n.id];
          if (s) await updateShortSummaryZh(n.id, s);
        }
      }

      // 规则标签：为缺少 tags 的最近30条打上主类标签（轻量规则）
      const classify = (title: string, summary?: string | null): string[] => {
        const t = `${title}\n${summary || ''}`.toLowerCase();
        const tags: string[] = [];
        const hit = (re: RegExp) => re.test(t);
        // perception
        if (hit(/\bcv\b|computer vision|视觉|object detection|segmentation|bev|lidar|激光雷达|radar|毫米波|sensor fusion|传感器融合|multimodal|vlm|vision-language/i)) {
          tags.push('perception');
        }
        // planning
        if (hit(/path planning|motion planning|行为预测|behavior prediction|控制算法|control|mpc|端到端|e2e\b/i)) {
          tags.push('planning');
        }
        // industry
        if (hit(/投融资|融资|并购|ipo|量产|交付|落地|robotaxi|法规|监管|许可|标准|召回|公司|发布会|市场/i)) {
          tags.push('industry');
        }
        // research
        if (hit(/arxiv|paper|preprint|cvpr|iccv|icra|neurips|dataset|benchmark|github|开源|论文|学术|会议/i)) {
          tags.push('research');
        }
        return Array.from(new Set(tags));
      };

      for (const x of latestForShort) {
        if (!x.tags || x.tags.length === 0) {
          const tg = classify(x.title, x.summary_zh || x.summary);
          if (tg.length) await updateTags(x.id, tg);
        }
      }
    } catch {}

    // 4) 标记当日精选（用于页面展示 Top2）
    try {
      await clearFeatured();
      await setFeatured(top2.map((i) => String(i.id)));
    } catch {}

    // 5) 邮件推送
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


