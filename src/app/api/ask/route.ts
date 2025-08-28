import { NextRequest, NextResponse } from 'next/server';
import { askConcept, askConceptQuick } from '@/lib/agent';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { question, mode = 'research' } = (await req.json()) as { question?: string; mode?: 'quick' | 'research' };
    if (!question) return NextResponse.json({ error: 'question required' }, { status: 400 });
    
    const result = mode === 'quick' 
      ? await askConceptQuick(question)
      : await askConcept(question);
    
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


