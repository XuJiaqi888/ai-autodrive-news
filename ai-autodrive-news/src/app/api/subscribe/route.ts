import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, upsertSubscriber } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const { email, lang } = (await req.json()) as { email?: string; lang?: 'zh'|'en' };
    if (!email || !lang || (lang !== 'zh' && lang !== 'en')) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    await upsertSubscriber(email, lang);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


