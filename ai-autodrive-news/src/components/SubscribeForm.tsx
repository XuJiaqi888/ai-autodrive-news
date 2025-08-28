"use client";
import { useState } from 'react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [lang, setLang] = useState<'zh'|'en'>('zh');
  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'error'>('idle');
  const [msg, setMsg] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || '订阅失败');
      setStatus('ok');
      setMsg('订阅成功！');
      setEmail('');
    } catch (e: unknown) {
      setStatus('error');
      setMsg(e instanceof Error ? e.message : '订阅失败');
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex gap-3 flex-wrap items-center">
        <input
          type="email"
          placeholder="输入您的邮箱地址"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-[280px] px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400 text-slate-900"
          required
        />
        <select 
          value={lang} 
          onChange={(e) => setLang(e.target.value as 'zh'|'en')} 
          className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 bg-white"
        >
          <option value="zh">🇨🇳 中文</option>
          <option value="en">🇺🇸 English</option>
        </select>
        <button 
          type="submit" 
          disabled={status==='loading' || !email.trim()} 
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium min-w-[140px]"
        >
          {status==='loading' ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              订阅中...
            </div>
          ) : '订阅每日精选'}
        </button>
      </form>
      
      {msg && (
        <div className={`p-3 rounded-lg text-sm ${
          status === 'ok' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {status === 'ok' ? '✅' : '❌'}
            </span>
            {msg}
          </div>
        </div>
      )}
    </div>
  );
}


