import { sql } from '@vercel/postgres';

export async function ensureSchema() {
  // items: 新闻/论文/仓库统一条目表
  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      source TEXT,
      summary TEXT,
      summary_zh TEXT,
      lang TEXT,
      tags TEXT[],
      published_at TIMESTAMPTZ,
      score DOUBLE PRECISION DEFAULT 0,
      citation_count INTEGER,
      star_count INTEGER,
      is_featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // 向后兼容：为旧表补加 summary_zh 列
  await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS summary_zh TEXT`;

  // FTS 生成列与索引（幂等）
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='items' AND column_name='tsv'
      ) THEN
        ALTER TABLE items
        ADD COLUMN tsv tsvector GENERATED ALWAYS AS (
          setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(summary, '')), 'B') ||
          setweight(to_tsvector('simple', coalesce(source, '')), 'C')
        ) STORED;
      END IF;
    END$$;
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_items_tsv ON items USING GIN (tsv)`;

  // subscribers: 订阅者
  await sql`
    CREATE TABLE IF NOT EXISTS subscribers (
      email TEXT PRIMARY KEY,
      lang TEXT CHECK (lang IN ('zh','en')) NOT NULL DEFAULT 'en',
      confirmed BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // sent_logs: 发送日志
  await sql`
    CREATE TABLE IF NOT EXISTS sent_logs (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      date DATE NOT NULL,
      items JSONB NOT NULL,
      lang TEXT CHECK (lang IN ('zh','en')) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // 简单 FTS 支持：trigram/tsvector（若不可用则退化为 ILIKE）
  // 注意：Neon/Vercel Postgres 默认未开启 pg_trgm 扩展，这里不直接启用扩展。
}

export interface ItemRow {
  id: string;
  title: string;
  url: string;
  source: string | null;
  summary: string | null;
  lang: string | null;
  tags: string[] | null;
  published_at: Date | null;
  score: number | null;
  citation_count: number | null;
  star_count: number | null;
  is_featured: boolean | null;
  created_at: Date | null;
}

export async function insertOrUpdateItem(record: {
  id: string;
  title: string;
  url: string;
  source?: string;
  summary?: string;
  lang?: string;
  tags?: string[];
  published_at?: string | Date | null;
}) {
  const publishedAtIso = record.published_at
    ? new Date(record.published_at).toISOString()
    : null;
  await sql`
    INSERT INTO items (id, title, url, source, summary, lang, tags, published_at)
    VALUES (${record.id}, ${record.title}, ${record.url}, ${record.source ?? null}, ${record.summary ?? null}, ${record.lang ?? null}, ${null}, ${publishedAtIso})
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      url = EXCLUDED.url,
      source = EXCLUDED.source,
      summary = EXCLUDED.summary,
      lang = EXCLUDED.lang,
      tags = EXCLUDED.tags,
      published_at = EXCLUDED.published_at
  `;
}

export async function upsertSubscriber(email: string, lang: 'zh'|'en') {
  await sql`
    INSERT INTO subscribers (email, lang, confirmed)
    VALUES (${email}, ${lang}, ${true})
    ON CONFLICT (email) DO UPDATE SET lang = EXCLUDED.lang, confirmed = TRUE
  `;
}

export async function removeSubscriber(email: string) {
  await sql`DELETE FROM subscribers WHERE email = ${email}`;
}

export async function listSubscribers() {
  const { rows } = await sql`SELECT email, lang FROM subscribers WHERE confirmed = TRUE`;
  return rows as { email: string; lang: 'zh'|'en' }[];
}

export async function selectTopForDate(targetDate: Date, limit = 2) {
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999);

  const startIso = start.toISOString();
  const endIso = end.toISOString();
  const { rows } = await sql`
    SELECT * FROM items
    WHERE published_at BETWEEN ${startIso} AND ${endIso}
    ORDER BY score DESC NULLS LAST, published_at DESC NULLS LAST
    LIMIT ${limit}
  `;
  return rows as ItemRow[];
}

export async function searchItemsFTS(query: string, limit = 8) {
  // 使用 plainto_tsquery 简化用户查询
  const { rows } = await sql`
    WITH q AS (
      SELECT plainto_tsquery('simple', ${query}) AS tsq
    )
    SELECT i.id, i.title, i.url, i.source, i.summary, i.lang, i.published_at, i.citation_count, i.star_count, i.score,
           ts_rank(i.tsv, q.tsq) AS rank
    FROM items i, q
    WHERE i.tsv @@ q.tsq
    ORDER BY COALESCE(i.score, 0) DESC, rank DESC, i.published_at DESC NULLS LAST
    LIMIT ${limit}
  `;
  return rows as ItemRow[];
}

export async function upsertScore(itemId: string, score: number) {
  await sql`UPDATE items SET score = ${score} WHERE id = ${itemId}`;
}

export async function selectRecentTop(hours = 72, limit = 2) {
  const now = new Date();
  const start = new Date(now.getTime() - hours * 60 * 60 * 1000);
  const startIso = start.toISOString();
  const { rows } = await sql`
    SELECT * FROM items
    WHERE published_at IS NULL OR published_at >= ${startIso}
    ORDER BY score DESC NULLS LAST, published_at DESC NULLS LAST
    LIMIT ${limit}
  `;
  return rows as ItemRow[];
}

export async function selectLatest(limit = 20) {
  const { rows } = await sql`
    SELECT id, title, url, source, summary, lang, published_at, score
    FROM items
    ORDER BY published_at DESC NULLS LAST, created_at DESC
    LIMIT ${limit}
  `;
  return rows as (Pick<ItemRow, 'id'|'title'|'url'|'source'|'summary'|'lang'|'published_at'|'score'> & { summary_zh?: string | null })[];
}

export async function updateSummaryZh(id: string, summaryZh: string) {
  // 运行时兜底：若列不存在则补加
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='items' AND column_name='summary_zh'
      ) THEN
        ALTER TABLE items ADD COLUMN summary_zh TEXT;
      END IF;
    END$$;
  `;
  await sql`UPDATE items SET summary_zh = ${summaryZh} WHERE id = ${id}`;
}

export async function selectRecentNewsTop(hours = 48, limit = 2) {
  const now = new Date();
  const start = new Date(now.getTime() - hours * 60 * 60 * 1000);
  const startIso = start.toISOString();
  const { rows } = await sql`
    SELECT * FROM items
    WHERE (published_at IS NULL OR published_at >= ${startIso})
      AND (source IS NULL OR source NOT ILIKE '%github%')
    ORDER BY published_at DESC NULLS LAST, score DESC NULLS LAST
    LIMIT ${limit}
  `;
  return rows as ItemRow[];
}

export async function clearFeatured() {
  await sql`UPDATE items SET is_featured = FALSE WHERE is_featured = TRUE`;
}

export async function setFeatured(ids: string[]) {
  if (!ids.length) return;
  const idArray = sql.array(ids, 'text');
  await sql`UPDATE items SET is_featured = TRUE WHERE id = ANY(${idArray})`;
}

export async function selectFeaturedTop(limit = 2) {
  const { rows } = await sql`
    SELECT * FROM items
    WHERE is_featured = TRUE
    ORDER BY published_at DESC NULLS LAST, created_at DESC
    LIMIT ${limit}
  `;
  return rows as ItemRow[];
}


