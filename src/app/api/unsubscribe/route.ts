import { NextRequest, NextResponse } from 'next/server';
import { removeSubscriber } from '@/lib/db';
import crypto from 'crypto';

export const runtime = 'nodejs';

function verify(email: string, token: string) {
  const secret = process.env.CRON_SECRET || 'secret';
  const sig = crypto.createHmac('sha256', secret).update(email).digest('hex').slice(0, 24);
  return sig === token;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email') ?? '';
    const token = url.searchParams.get('token') ?? '';
    if (!email || !token || !verify(email, token)) {
      return NextResponse.json({ error: 'invalid link' }, { status: 400 });
    }
    await removeSubscriber(email);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


