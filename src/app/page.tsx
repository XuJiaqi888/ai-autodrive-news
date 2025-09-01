// @ts-nocheck
import SubscribeForm from "@/components/SubscribeForm";
import AskClient from "@/components/AskClient";
import { ensureSchema, selectRecentTop, selectLatestByCategory, selectFeaturedTop } from "@/lib/db";
import ReactMarkdown from "react-markdown";

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  // 确保首次访问时已迁移新增列（summary_short_zh 等）
  await ensureSchema();
  let top2 = await selectFeaturedTop(2);
  if (!top2?.length) {
    top2 = await selectRecentTop(72, 2);
  }
  const cat = (typeof searchParams?.cat === 'string' ? searchParams?.cat : 'all') || 'all';
  const allowed = new Set(['all','perception','planning','industry','research']);
  const category = allowed.has(String(cat)) ? String(cat) as any : 'all';
  const latest = await selectLatestByCategory(category, 30);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">AI Autodrive Researcher</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Powered by</span>
            <img src="/microsoft-logo.png" alt="Microsoft" width={108} height={24} className="opacity-70" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        {/* AI Agent Section - Now First */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs">🤖</span>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">AI 智能问答</h2>
            <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">Gemini Agent</span>
          </div>
          <p className="text-slate-600 mb-6">基于最新资讯和论文，为您解答智能驾驶相关问题</p>
          <AskClient />
        </section>

        {/* Subscribe Section */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs">📧</span>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">每日精选订阅</h2>
          </div>
          <p className="text-slate-600 mb-6">每天 9:00-10:00 自动推送最新智能驾驶/车载大模型资讯与论文精选</p>
          <SubscribeForm />
        </section>

        {/* Today's Top 2 */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs">⭐</span>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">今日精选 Top 2</h2>
          </div>
          <div className="grid gap-4">
            {top2.map((it) => (
              <div key={it.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                <a href={String(it.url)} target="_blank" className="text-lg font-medium text-slate-900 hover:text-blue-600 transition-colors">
                  {it.title}
                </a>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-slate-500 bg-white px-2 py-1 rounded border">{(it as any).source ?? ''}</span>
                  {(it as any).published_at && (
                    <span className="text-xs text-slate-400">
                      {new Date(String((it as any).published_at)).toLocaleString('zh-CN', { hour12: false })}
                    </span>
                  )}
                </div>
                {(((it as any).summary_zh) || (it as any).summary) && (
                  <div className="mt-3">
                    <ReactMarkdown className="prose prose-slate max-w-none text-sm">
                      {(it as any).summary_zh || (it as any).summary}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Latest News */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 bg-gradient-to-br from-slate-500 to-slate-700 rounded-md flex items-center justify-center">
              <span className="text-white text-xs">📰</span>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">最新资讯</h2>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              { key: 'all', label: '全部' },
              { key: 'perception', label: '感知' },
              { key: 'planning', label: '规划与控制' },
              { key: 'industry', label: '产业政策' },
              { key: 'research', label: '研究开源' },
            ].map(btn => (
              <a
                key={btn.key}
                href={`/?cat=${btn.key}`}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${((typeof searchParams?.cat==='string'?searchParams?.cat:'all')||'all')===btn.key ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
              >
                {btn.label}
              </a>
            ))}
          </div>
          <div className="space-y-4">
            {latest.map((it) => (
              <article key={it.id} className="pb-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 p-4 rounded-lg transition-colors">
                <a href={String(it.url)} target="_blank" className="text-lg font-medium text-slate-900 hover:text-blue-600 transition-colors block mb-2">
                  {it.title}
                </a>
                {(((it as any).summary_short_zh) || (it as any).summary_zh || (it as any).summary) && 
                  <div className="text-slate-700 text-sm leading-relaxed">
                    <ReactMarkdown className="prose prose-slate max-w-none line-clamp-2">
                      {(it as any).summary_short_zh || (it as any).summary_zh || (it as any).summary}
                    </ReactMarkdown>
                  </div>
                }
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {(it as any).source ?? ''}
                  </span>
                  {(it as any).published_at && (
                    <span className="text-xs text-slate-400">
                      {new Date(String((it as any).published_at)).toLocaleString('zh-CN', { hour12: false })}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} AI Autodrive Researcher - 智能驾驶前沿资讯平台</p>
        </div>
      </footer>
    </div>
  );
}
