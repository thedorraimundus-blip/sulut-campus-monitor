import React, { useEffect, useState } from 'react';
import {
  Newspaper, Calendar, CheckCircle2, GraduationCap, Globe,
  TrendingUp, ArrowRight, Radio, Sparkles, Building2, ExternalLink,
  Activity, Clock, RefreshCw, ChevronRight, ShieldCheck, Zap
} from 'lucide-react';
import { DashboardStats, Article, AnalyticsSummary } from '../types';
import { api } from '../services/api';
import { useWebSocket } from '../context/WebSocketContext';
import { useNavigate } from 'react-router-dom';
import { useModals } from '../context/ModalContext';
import { VolumeTrendChart } from '../components/analytics/VolumeTrendChart';
import { SentimentChart } from '../components/analytics/SentimentChart';
import { CoverageChart } from '../components/analytics/CoverageChart';
import { TrendingTopics } from '../components/analytics/TrendingTopics';
import { NewsCard } from '../components/news/NewsCard';

interface DashboardPageProps {
  onSelectArticle?: (article: Article) => void;
  onNavigateTab?: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onSelectArticle, onNavigateTab }) => {
  const navigate = useNavigate();
  const { openArticleModal } = useModals();

  const handleSelectArticle = onSelectArticle || openArticleModal;
  const handleNavigate = (path: string) => {
    if (onNavigateTab) {
      onNavigateTab(path.replace('/', ''));
    } else {
      navigate(path);
    }
  };

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { latestArticle, isConnected } = useWebSocket();

  const fetchDashboardData = async () => {
    try {
      const [statsData, articlesData, analyticsData, logsData] = await Promise.all([
        api.getDashboardStats(),
        api.getArticles({ limit: 6, is_relevant: true }),
        api.getAnalytics(7),
        api.getSystemLogs(6)
      ]);
      setStats(statsData);
      setRecentArticles(articlesData);
      setAnalytics(analyticsData);
      setActivityLogs(logsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update on incoming WebSocket news
  useEffect(() => {
    if (latestArticle) {
      fetchDashboardData();
    }
  }, [latestArticle]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Memuat SULUT CAMPUS MONITOR...</span>
        </div>
      </div>
    );
  }

  const sentimentData = analytics?.sentiment_distribution || [
    { name: 'Positif', value: 53, color: '#10b981', count: 684 },
    { name: 'Netral', value: 33, color: '#64748b', count: 428 },
    { name: 'Negatif', value: 14, color: '#ef4444', count: 132 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-600 via-sky-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-sky-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm tracking-wider uppercase">
              Intelligent Higher Education News Monitoring
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              100% Local AI
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight leading-snug">
            Pantau Perkembangan Perguruan Tinggi Sulawesi Utara dalam Satu Dashboard
          </h2>
          <p className="text-xs text-sky-100 mt-2 leading-relaxed opacity-90">
            Sistem otomatis memantau media lokal Sulut, mengekstraksi entitas perguruan tinggi, menilai polaritas sentimen, dan mendeteksi tren pendidikan tinggi secara lokal tanpa cloud API.
          </p>
        </div>

        <div className="z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavigate('/monitoring')}
            className="px-4 py-2.5 rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs shadow-md transition-all flex items-center gap-2 group"
          >
            <Radio className="w-4 h-4 text-sky-600 animate-pulse" />
            <span>Live Monitor Feed</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => handleNavigate('/analytics')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-sm transition-all flex items-center gap-1.5 border border-white/20"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Buka Analitik</span>
          </button>
        </div>

        {/* Subtle decorative background pattern */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* KPI Cards Row (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Berita */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-sky-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Total Berita
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Newspaper className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {(stats?.total_articles ?? 0).toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="text-slate-400 dark:text-slate-400 text-[11px]">Total artikel di database</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Berita Hari Ini */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Berita Hari Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {stats?.today_articles ?? stats?.articles_today ?? 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400 dark:text-slate-400 text-[11px]">Update 24 jam terakhir</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Perguruan Tinggi Terpantau */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-purple-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Perguruan Tinggi
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
              {stats?.monitored_universities ?? stats?.total_universities ?? 0}
            </div>
            <span className="text-slate-400 dark:text-slate-400 text-[11px] mt-1.5 block">
              UNSRAT, UNIMA, UNKLAB, dll.
            </span>
          </div>
        </div>

        {/* KPI 4: Sumber Media Aktif */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-sky-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Sumber Media Aktif
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {stats?.active_sources ?? 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400 dark:text-slate-400 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Auto-crawl setiap 5 menit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts (Volume Trend & Sentiment Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VolumeTrendChart
            data={analytics?.volume_trend || []}
            title="Tren Volume Pemberitaan Kampus Sulut"
            subtitle="Perbandingan berita ter-crawl harian dan berita relevan perguruan tinggi"
          />
        </div>
        <div className="lg:col-span-1">
          <SentimentChart
            data={sentimentData}
            title="Analisis Sentimen Berita"
            subtitle="Klasifikasi polaritas berbasis Lexicon NLP lokal"
          />
        </div>
      </div>

      {/* Row 3: Top Universities & Trending Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CoverageChart
            data={analytics?.share_of_voice || []}
            title="Top Perguruan Tinggi (Share of Voice)"
            subtitle="Peringkat frekuensi publikasi media terhadap perguruan tinggi di Sulut"
          />
        </div>
        <div className="lg:col-span-1 flex flex-col justify-between gap-4">
          <TrendingTopics
            topics={analytics?.trending_keywords || []}
            onTopicClick={(topic) => handleNavigate(`/berita?search=${encodeURIComponent(topic)}`)}
          />

          {/* Mini Realtime Health & Local AI status card */}
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Status Mesin Lokal
              </span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                ONLINE
              </span>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Model Versi:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">v1.0.1 (MultinomialNB)</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Ekstraksi Teks:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">PySastrawi Stemmer</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Kecepatan Ingest:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">~0.02s / artikel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Live News Feed & Aktivitas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Verified Campus Articles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-500" />
                <span>Berita Terkini Terverifikasi Kampus</span>
              </h3>
              <p className="text-xs text-slate-400">Hasil klasifikasi relevansi AI lokal terkini</p>
            </div>
            <button
              onClick={() => handleNavigate('/berita')}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Lihat Semua Berita</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentArticles.slice(0, 4).map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onSelect={(art) => handleSelectArticle(art)}
              />
            ))}
          </div>
        </div>

        {/* Right 1 Col: Aktivitas Terbaru (Audit Log / Event Feed) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Aktivitas Terbaru Sistem
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Audit Logs</span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {activityLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold font-mono text-sky-600 dark:text-sky-400 uppercase">
                        {log.module || log.component || 'SYSTEM'}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {new Date(log.timestamp || log.created_at || Date.now()).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-medium line-clamp-2 leading-relaxed text-[11px]">
                      {log.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
              <button
                onClick={() => handleNavigate('/logs')}
                className="w-full text-center text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center justify-center gap-1"
              >
                <span>Buka Seluruh System Logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
