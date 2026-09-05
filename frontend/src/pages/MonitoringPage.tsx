import React, { useEffect, useState, useMemo } from 'react';
import {
  Activity, Radio, CheckCircle2, Clock, Play, RefreshCw,
  Server, Cpu, Database, Wifi, ShieldCheck, AlertCircle,
  Search, Filter, Building2, Tag, ExternalLink, X, SlidersHorizontal
} from 'lucide-react';
import { Article, CrawlLogItem, University } from '../types';
import { api } from '../services/api';
import { useWebSocket } from '../context/WebSocketContext';
import { useModals } from '../context/ModalContext';
import { Badge } from '../components/ui/Badge';

interface MonitoringPageProps {
  onSelectArticle?: (article: Article) => void;
}

export const MonitoringPage: React.FC<MonitoringPageProps> = ({ onSelectArticle }) => {
  const { openArticleModal } = useModals();
  const handleSelectArticle = onSelectArticle || openArticleModal;

  const [status, setStatus] = useState<any>(null);
  const [crawlLogs, setCrawlLogs] = useState<CrawlLogItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedUniv, setSelectedUniv] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState('');

  const { isConnected, latestArticle } = useWebSocket();

  const categories = [
    "Pendidikan", "Prestasi", "Mahasiswa", "Penelitian", "Kegiatan", "Kerja Sama",
    "Rektor", "Dosen", "Beasiswa", "Penerimaan Mahasiswa", "Akademik",
    "Infrastruktur", "Teknologi", "Organisasi", "Alumni", "Kebijakan",
    "Konflik", "Hukum", "Lainnya"
  ];

  const fetchMonitoringData = async () => {
    try {
      const [statusData, logsData, articlesData, univsData] = await Promise.all([
        api.getMonitoringStatus(),
        api.getCrawlLogs(15),
        api.getArticles({ limit: 40 }),
        api.getUniversities()
      ]);
      setStatus(statusData);
      setCrawlLogs(logsData);
      setArticles(articlesData);
      setUniversities(univsData);
    } catch (err) {
      console.error('Error fetching monitoring data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  // Polling interval if autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMonitoringData();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Prepend live incoming article from WebSocket
  useEffect(() => {
    if (latestArticle) {
      setArticles((prev) => [latestArticle, ...prev.slice(0, 39)]);
    }
  }, [latestArticle]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchMonitoringData();
  };

  // Filtered stream
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesSource = art.source_name.toLowerCase().includes(q);
        const matchesContent = art.summary?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSource && !matchesContent) return false;
      }

      if (selectedUniv) {
        const hasUniv = art.universities.some(
          (u) => u.university_id === Number(selectedUniv) || u.short_name === selectedUniv
        );
        if (!hasUniv) return false;
      }

      if (selectedCategory) {
        const hasCat = art.categories.some(
          (c) => c.category_name.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (!hasCat) return false;
      }

      if (selectedSentiment && (art.sentiment?.sentiment || 'Neutral') !== selectedSentiment) {
        return false;
      }

      return true;
    });
  }, [articles, search, selectedUniv, selectedCategory, selectedSentiment]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Live Monitor Berita Kampus
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aliran berita real-time dari media lokal Sulawesi Utara dengan analisis NLP instan
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none bg-white dark:bg-[#0f172a] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <span>Auto Refresh (10s)</span>
          </label>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold text-xs hover:bg-sky-100 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Memperbarui...' : 'Segarkan'}</span>
          </button>
        </div>
      </div>

      {/* Monitoring Infrastructure Status Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Server className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Crawler Engine</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
              {status?.scheduler_running !== false ? 'Berjalan Rutin' : 'Paused'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
            <Wifi className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Live Stream</span>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 block truncate">
              {isConnected ? 'WebSocket Terhubung' : 'Local Stream Mode'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">NLP Processing</span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block truncate">
              Local (0 Cloud LLM)
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Artikel Hari Ini</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
              {articles.length} Terverifikasi
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul berita, topik, atau kata kunci kampus..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sentiment Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-full md:w-auto overflow-x-auto">
            {[
              { id: '', label: 'Semua' },
              { id: 'Positive', label: 'Positif' },
              { id: 'Neutral', label: 'Netral' },
              { id: 'Negative', label: 'Negatif' }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSentiment(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSentiment === s.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="w-full sm:w-64">
            <select
              value={selectedUniv}
              onChange={(e) => setSelectedUniv(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <option value="">Semua Perguruan Tinggi (15 Kampus)</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id.toString()}>
                  {u.short_name} — {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <option value="">Semua Kategori (19 Topik)</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {(search || selectedUniv || selectedCategory || selectedSentiment) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedUniv('');
                setSelectedCategory('');
                setSelectedSentiment('');
              }}
              className="text-xs text-rose-500 hover:underline font-semibold ml-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column View: Articles Feed + Crawler Logs Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Articles Stream */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Menampilkan {filteredArticles.length} berita terbaru
            </span>
            <span className="font-mono text-[11px]">Diurutkan berdasarkan waktu publikasi</span>
          </div>

          <div className="space-y-3">
            {filteredArticles.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-[#0f172a]/90 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                Tidak ada berita yang cocok dengan kriteria filter yang dipilih.
              </div>
            ) : (
              filteredArticles.map((art) => {
                const sentimentName = art.sentiment?.sentiment || 'Neutral';
                const sentimentVariant =
                  sentimentName === 'Positive'
                    ? 'success'
                    : sentimentName === 'Negative'
                    ? 'danger'
                    : 'neutral';

                const relevancePct = Math.round(art.relevance_score * 100);

                return (
                  <div
                    key={art.id}
                    onClick={() => handleSelectArticle(art)}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 bg-white dark:bg-[#0f172a]/90 hover:shadow-md transition-all cursor-pointer group space-y-2.5"
                  >
                    {/* Item Top: Media & Time */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                          {art.source_name}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(art.published_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="text-slate-400 text-[11px] hidden sm:inline">
                          ({new Date(art.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            relevancePct >= 80
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800'
                          }`}
                        >
                          Rel {relevancePct}%
                        </span>
                        <Badge variant={sentimentVariant} size="sm">
                          {sentimentName}
                        </Badge>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                      {art.title}
                    </h3>

                    {/* Summary */}
                    {art.summary && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {art.summary}
                      </p>
                    )}

                    {/* Footer Entities */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        {art.universities.map((u) => (
                          <span
                            key={u.university_id}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400"
                          >
                            <Building2 className="w-3 h-3" />
                            <span>{u.short_name || u.university_name}</span>
                          </span>
                        ))}
                        {art.categories.map((c) => (
                          <span
                            key={c.category_id}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            <span>{c.category_name}</span>
                          </span>
                        ))}
                      </div>

                      <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 group-hover:underline">
                        Inspeksi AI →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Live Crawler Operations Log */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Crawler Activity Logs
                </h3>
              </div>
              <span className="font-mono text-[10px] text-slate-400">Live polling</span>
            </div>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {crawlLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {log.source_name}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {new Date(log.created_at || log.crawled_at || Date.now()).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{log.articles_found} artikel ditemukan</span>
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {log.response_time_ms || 320}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
