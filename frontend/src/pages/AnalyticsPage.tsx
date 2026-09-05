import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Tag, Globe, Sparkles, Calendar, Layers } from 'lucide-react';
import { AnalyticsSummary } from '../types';
import { api } from '../services/api';
import { TrendingTopics } from '../components/analytics/TrendingTopics';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [timeFilter, setTimeFilter] = useState<'today' | '7d' | '30d' | 'custom'>('7d');
  const [customStart, setCustomStart] = useState('2026-08-01');
  const [customEnd, setCustomEnd] = useState('2026-09-05');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const days = timeFilter === 'today' ? 1 : timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 60;
        const data = await api.getAnalytics(days);
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeFilter]);

  if (loading || !analytics) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sentimentData = analytics.sentiment_distribution || [
    { name: 'Positif', value: 53, color: '#10b981', count: 684 },
    { name: 'Netral', value: 33, color: '#64748b', count: 428 },
    { name: 'Negatif', value: 14, color: '#ef4444', count: 132 },
  ];

  const sourceColors = ['#0ea5e9', '#38bdf8', '#0284c7', '#6366f1', '#8b5cf6', '#a855f7'];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Analitik & Tren Media Perguruan Tinggi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visualisasi agregat tren volume, sentimen, performa media, dan topik perguruan tinggi Sulut
          </p>
        </div>

        {/* Time Filters: Today, 7 Days, 30 Days, Custom */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            {(
              [
                { id: 'today', label: 'Hari Ini' },
                { id: '7d', label: '7 Hari' },
                { id: '30d', label: '30 Hari' },
                { id: 'custom', label: 'Kustom' }
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeFilter(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeFilter === t.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {timeFilter === 'custom' && (
            <div className="flex items-center gap-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl text-xs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Chart 1: News Volume Trend (Area Chart) */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              <span>Tren Volume Berita Harian (News Volume)</span>
            </h3>
            <p className="text-xs text-slate-400">Total artikel yang dirayapi vs berita relevan perguruan tinggi</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Relevan Kampus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-700" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Total Crawled</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.volume_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="relColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="totColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-700">
                        <p className="font-bold text-slate-300">{label}</p>
                        <p className="text-sky-400 font-mono mt-1 font-semibold">
                          Relevan: {payload[0]?.value} berita
                        </p>
                        <p className="text-slate-400 font-mono text-[11px]">
                          Total: {payload[1]?.value} berita
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="relevant" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#relColor)" />
              <Area type="monotone" dataKey="total" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#totColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: News by University & Sentiment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* News by University */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-500" />
                <span>Pemberitaan per Perguruan Tinggi (News by University)</span>
              </h3>
              <p className="text-xs text-slate-400">Peringkat frekuensi liputan kampus di Sulut</p>
            </div>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.share_of_voice}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  width={75}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-700">
                          <p className="font-bold">{d.full_name || d.name}</p>
                          <p className="text-sky-400 font-mono mt-1">{d.count} artikel dipublikasi</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Distribusi Sentimen (Sentiment)</span>
            </h3>
            <p className="text-xs text-slate-400">Hasil klasifikasi leksikon lokal bahasa Indonesia</p>
          </div>

          <div className="h-52 w-full my-2 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie
                  data={sentimentData}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total</span>
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                {analytics.total_articles}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {sentimentData.map((item) => (
              <div key={item.name} className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white pl-4 mt-0.5">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: News by Category & Media Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* News by Category */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-500" />
                <span>Distribusi Kategori Topik (News by Category)</span>
              </h3>
              <p className="text-xs text-slate-400">10 topik terpopuler hasil klasifikasi AI</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.category_distribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={10}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Media Performance */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-500" />
                <span>Performa Sumber Media (Media Performance)</span>
              </h3>
              <p className="text-xs text-slate-400">Jumlah berita kampus yang diproduksi per media online</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.source_distribution}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {analytics.source_distribution.map((_, index) => (
                    <Cell key={`source-cell-${index}`} fill={sourceColors[index % sourceColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Trending Topics Cloud */}
      <TrendingTopics topics={analytics.trending_keywords || []} />
    </div>
  );
};
