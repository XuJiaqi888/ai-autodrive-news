import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { summarizeToEnLong } from './translate';

export function createTransport() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  if (!user || !pass) throw new Error('EMAIL_USER/EMAIL_PASSWORD not set');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

function buildUnsubToken(email: string) {
  const secret = process.env.CRON_SECRET || 'secret';
  return crypto.createHmac('sha256', secret).update(email).digest('hex').slice(0, 24);
}

function htmlTemplate(lang: 'zh'|'en', items: Array<{ title: string; url: string; summary?: string; summaryZh?: string; summaryEn?: string }>, unsubUrl: string) {
  const title = lang === 'zh' ? '每日精选 · 智能驾驶与车载大模型' : 'Daily Digest · Autodrive & In-Car AI';
  const intro = lang === 'zh' ? '今天的两条精选' : "Today's top 2";
  const lines = items.map((it) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #eee;">
        <a href="${it.url}" style="font-size:16px;color:#0f172a;text-decoration:none;font-weight:600;">${it.title}</a>
        ${lang==='zh' && it.summaryZh ? `<p style=\"margin:6px 0 0;color:#334155;font-size:14px;line-height:1.7\">${it.summaryZh}</p>` : ''}
        ${lang==='en' && it.summaryEn ? `<p style=\"margin:6px 0 0;color:#334155;font-size:14px;line-height:1.7\">${it.summaryEn}</p>` : ''}
      </td>
    </tr>`).join('');
  return `
  <div style="background:#f8fafc;padding:24px 0;">
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:0 24px 12px;font-family:ui-sans-serif,system-ui,-apple-system">
      <tr><td style="padding:20px 0 8px;">
        <h1 style="margin:0;color:#0f172a;font-size:20px;">${title}</h1>
        <p style="margin:6px 0 0;color:#64748b;font-size:14px;">${intro}</p>
      </td></tr>
      ${lines}
      <tr><td style="padding:18px 0 12px;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0;">
        <p style="margin:0 0 6px;">© ${new Date().getFullYear()} AI Autodrive Researcher</p>
        <a href="${unsubUrl}" style="color:#64748b;">${lang==='zh'?'退订邮件':'Unsubscribe'}</a>
      </td></tr>
    </table>
  </div>`;
}

export async function sendDigest(to: string, lang: 'zh'|'en', items: Array<{ title: string; url: string; summary?: string; summary_zh?: string }>) {
  const transporter = createTransport();
  const subject = lang === 'zh' ? '每日精选 · 智能驾驶与车载大模型' : 'Daily Digest · Autodrive & In-Car AI';
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const token = buildUnsubToken(to);
  const unsub = site ? `${site}/api/unsubscribe?email=${encodeURIComponent(to)}&token=${token}` : '';
  // 仅处理将要发送的两条：生成英文 300-400 词摘要，并按需翻译/填充
  const prepared = await Promise.all(items.slice(0, 2).map(async (it) => {
    let summaryEn = await summarizeToEnLong(it.title, it.summary ?? '');
    if (summaryEn && summaryEn.length > 1200) summaryEn = summaryEn.slice(0, 1200);
    const summaryZh = it.summary_zh || (lang==='zh' ? undefined : undefined); // 由 cron 侧生成；此处若为空可回退英文
    return { ...it, summaryEn: summaryEn ?? it.summary, summaryZh: summaryZh ?? it.summary };
  }));
  const html = htmlTemplate(lang, prepared, unsub);
  await transporter.sendMail({
    from: process.env.EMAIL_USER!,
    to,
    subject,
    html,
  });
}


