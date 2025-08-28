import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [{ rows: itemRows }, { rows: subRows }] = await Promise.all([
      sql`SELECT COUNT(*)::int AS c FROM items`,
      sql`SELECT COUNT(*)::int AS c FROM subscribers`,
    ]);
    return NextResponse.json({ items: itemRows[0]?.c ?? 0, subscribers: subRows[0]?.c ?? 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


