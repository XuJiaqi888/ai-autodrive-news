"use client";
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

type Mode = 'quick' | 'research';

export default function AskClient() {
  const [q, setQ] = useState('端到端自动驾驶是什么？');
  const [a, setA] = useState<string>('');
  const [refs, setRefs] = useState<Array<{ title?: string; url?: string; source?: string | null }>>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('research');

  async function onAsk() {
    setLoading(true);
    setA('');
    setRefs([]);
    try {
      const res = await fetch('/api/ask', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ question: q, mode }) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || '调用失败');
      setA(data.text || '');
      setRefs((data.references || []).slice(0, 8));
    } catch (e: unknown) {
      setA(e instanceof Error ? e.message : '调用失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 模式选择 */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => setMode('quick')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'quick' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ⚡ 快速回答
        </button>
        <button
          onClick={() => setMode('research')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'research' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🔬 深度研究
        </button>
      </div>

      <div className="flex gap-3">
        <input 
          className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400 text-slate-900" 
          value={q} 
          onChange={(e) => setQ(e.target.value)} 
          placeholder={mode === 'quick' ? '快速了解一个概念...' : '深入研究智能驾驶技术...'} 
          onKeyDown={(e) => e.key === 'Enter' && !loading && onAsk()}
        />
        <button 
          onClick={onAsk} 
          disabled={loading || !q.trim()} 
          className={`px-6 py-3 text-white rounded-lg font-medium min-w-[100px] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            mode === 'quick' 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          }`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {mode === 'quick' ? '快速思考' : '深度研究'}
            </div>
          ) : (mode === 'quick' ? '快速回答' : '深度研究')}
        </button>
      </div>
      
      {a && (
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center">
              <span className="text-white text-xs">✨</span>
            </div>
            <span className="font-medium text-slate-900">AI 回答</span>
          </div>
          <div className="prose prose-slate prose-lg max-w-none 
            [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:pb-2 [&>h2]:border-b-2 [&>h2]:border-slate-200
            [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-slate-800 [&>h3]:mt-6 [&>h3]:mb-3
            [&>p]:text-base [&>p]:leading-relaxed [&>p]:text-slate-700 [&>p]:my-4
            [&>strong]:font-semibold [&>strong]:text-slate-900
            [&>ul]:my-4 [&>ul]:pl-6 [&>ol]:my-4 [&>ol]:pl-6
            [&>ul>li]:text-base [&>ul>li]:leading-relaxed [&>ul>li]:text-slate-700 [&>ul>li]:my-2
            [&>ol>li]:text-base [&>ol>li]:leading-relaxed [&>ol>li]:text-slate-700 [&>ol>li]:my-2
            [&>blockquote]:border-l-4 [&>blockquote]:border-slate-300 [&>blockquote]:pl-4 [&>blockquote]:my-6 [&>blockquote]:text-slate-600 [&>blockquote]:italic
            [&_a]:text-blue-600 [&_a]:font-medium [&_a]:no-underline hover:[&_a]:underline hover:[&_a]:text-blue-800">
            <ReactMarkdown>{a}</ReactMarkdown>
          </div>
        </div>
      )}
      
      {/* 移除下方站内引用列表区块，主回答内已包含引用 */}
    </div>
  );
}


