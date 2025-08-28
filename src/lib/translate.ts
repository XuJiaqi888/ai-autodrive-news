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


