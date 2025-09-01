import { GoogleGenerativeAI } from '@google/generative-ai';

const PRIMARY_MODEL = process.env.GEMINI_PRIMARY_MODEL || 'gemini-2.5-flash';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-1.5-flash-8b';

export async function summarizeToZh(title: string, summary?: string | null) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return null;
  const gen = new GoogleGenerativeAI(key);
  const prompt = `请用中文写一个不超过120字的要点摘要，面向普通技术读者：\n标题：${title}\n原文摘要：${summary ?? ''}`;
  try {
    const res = await gen.getGenerativeModel({ model: PRIMARY_MODEL }).generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return res.response.text().trim();
  } catch {
    const res = await gen.getGenerativeModel({ model: FALLBACK_MODEL }).generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return res.response.text().trim();
  }
}

export async function summarizeToEnLong(title: string, sourceSummary?: string | null) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return null;
  const gen = new GoogleGenerativeAI(key);
  const prompt = `Write a concise yet informative English summary of 300-400 words for a daily newsletter. Keep neutral journalistic tone, avoid marketing hype.\nTitle: ${title}\nOriginal abstract or snippet: ${sourceSummary ?? ''}`;
  try {
    const res = await gen.getGenerativeModel({ model: PRIMARY_MODEL }).generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return res.response.text().trim();
  } catch {
    const res = await gen.getGenerativeModel({ model: FALLBACK_MODEL }).generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return res.response.text().trim();
  }
}

export async function summarizeBatchToZhShort(items: Array<{ id: string; title: string; summary?: string | null }>) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return {} as Record<string, string>;
  const gen = new GoogleGenerativeAI(key);
  const head = `请为以下条目分别生成一句中文要点总结（不超过40字），以 JSON 数组返回，每项包含 id 和 short 字段，不要多余说明。`;
  const list = items.map((i, idx) => ({ id: i.id, title: i.title, summary: i.summary || '' }));
  const prompt = head + "\n" + JSON.stringify(list, null, 2);
  try {
    const res = await gen.getGenerativeModel({ model: PRIMARY_MODEL }).generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    const text = res.response.text().trim();
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const arr = JSON.parse(jsonStr) as Array<{ id: string; short: string }>;
    const map: Record<string, string> = {};
    for (const it of arr) { if (it?.id && it?.short) map[it.id] = it.short; }
    return map;
  } catch {
    try {
      const res2 = await gen.getGenerativeModel({ model: FALLBACK_MODEL }).generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
      const text2 = res2.response.text().trim();
      const jsonStr2 = text2.replace(/```json|```/g, '').trim();
      const arr2 = JSON.parse(jsonStr2) as Array<{ id: string; short: string }>;
      const map2: Record<string, string> = {};
      for (const it of arr2) { if (it?.id && it?.short) map2[it.id] = it.short; }
      return map2;
    } catch {
      return {} as Record<string, string>;
    }
  }
}


