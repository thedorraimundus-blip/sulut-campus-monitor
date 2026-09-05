import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Bell, AlertTriangle, CheckCircle2, ShieldAlert, Check,
  Plus, Info, X, ArrowUpRight, CheckCheck,
  Globe, Link2, Loader2, Sparkles, ExternalLink, BarChart2
} from 'lucide-react';
import { AlertItem, AlertRule } from '../types';
import { alertsApi } from '../services/api/alertsApi';
import { mockAlertRules } from '../mocks/alerts';
import { apiPost } from '../services/api/apiClient';

interface OutletCtx {
  refreshAlertCount: () => void;
}

type AlertStatus = 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO' | 'UNREAD';

interface UrlAnalysisResult {
  url: string;
  title: string;
  excerpt: string;
  is_relevant: boolean;
  relevance_score: number;
  universities: string[];
  categories: string[];
  sentiment: { label: string; positive: number; neutral: number; negative: number };
  summary: string;
  word_count: number;
  saved_to_db: boolean;
}

export const AlertsPage: React.FC = () => {
  const { refreshAlertCount } = useOutletContext<OutletCtx>();

  const [alertList, setAlertList] = useState<AlertItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [statusFilter, setStatusFilter] = useState<AlertStatus>('UNREAD');
  const [loading, setLoading] = useState(true);

  // URL Analyzer panel
  const [urlInput, setUrlInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [urlResult, setUrlResult] = useState<UrlAnalysisResult | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Alert Rule Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleUniv, setRuleUniv] = useState('UNSRAT');
  const [ruleKeyword, setRuleKeyword] = useState('');
  const [ruleSentiment, setRuleSentiment] = useState('Negative');

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await alertsApi.getAlerts(false);
      setAlertList(data ?? []);
      setDismissedIds(new Set()); // reset dismissed on refresh
    } catch (err) {
      console.error('Alerts fetch error:', err);
      setAlertList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    setRules(mockAlertRules);
  }, [fetchAlerts]);

  // Mark single alert as read → REMOVE from visible list immediately
  const handleMarkRead = async (id: number) => {
    // Instantly hide from UI (optimistic update)
    setDismissedIds((prev) => new Set([...prev, id]));
    await alertsApi.markAsRead(id);
    refreshAlertCount();
  };

  // Mark ALL as read → clear the entire list immediately
  const handleMarkAllRead = async () => {
    // Instantly dismiss all
    const allIds = new Set(alertList.map((a) => a.id));
    setDismissedIds(allIds);
    await alertsApi.markAllAsRead();
    refreshAlertCount();
  };

  // URL Analyzer
  const handleAnalyzeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setAnalyzing(true);
    setUrlResult(null);
    setUrlError(null);
    setSaveSuccess(false);

    try {
      const result = await apiPost<UrlAnalysisResult>('/articles/analyze-url', {
        url: urlInput.trim(),
        save_to_db: false,
      });
      setUrlResult(result);
    } catch (err: any) {
      const msg = err?.message || 'Gagal menganalisis URL. Periksa format URL dan coba lagi.';
      setUrlError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToDb = async () => {
    if (!urlInput.trim()) return;
    setAnalyzing(true);
    try {
      await apiPost('/articles/analyze-url', {
        url: urlInput.trim(),
        save_to_db: true,
      });
      setSaveSuccess(true);
    } catch {
      setUrlError('Gagal menyimpan artikel ke database.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) return;
    const newRule: AlertRule = {
      id: rules.length + 1,
      name: ruleName,
      condition: `Kampus = ${ruleUniv} & Keyword = '${ruleKeyword}'`,
      university: ruleUniv,
      keyword: ruleKeyword,
      sentiment: ruleSentiment as 'Positive' | 'Negative',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      trigger_count: 0
    };
    setRules([newRule, ...rules]);
    setIsRuleModalOpen(false);
    setRuleName('');
    setRuleKeyword('');
  };

  // Visible alerts = not dismissed
  const visibleAlerts = useMemo(() =>
    alertList.filter((a) => !dismissedIds.has(a.id)),
    [alertList, dismissedIds]
  );

  const filteredAlerts = useMemo(() => {
    return visibleAlerts.filter((a) => {
      if (statusFilter === 'UNREAD') return !a.is_read;
      if (statusFilter === 'CRITICAL') return a.severity === 'CRITICAL';
      if (statusFilter === 'WARNING') return a.severity === 'WARNING';
      if (statusFilter === 'INFO') return a.severity === 'INFO';
      return true;
    });
  }, [visibleAlerts, statusFilter]);

  const unreadCount = visibleAlerts.filter((a) => !a.is_read).length;

  const sentimentColor = (label: string) => {
    if (label === 'Positive') return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400';
    if (label === 'Negative') return 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400';
    return 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300';
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-rose-500" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Alerts & Deteksi Isu
            </h2>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {unreadCount} baru
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Peringatan dini otomatis + Analisis URL berita secara langsung dengan AI lokal
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-600 hover:border-emerald-400 font-bold text-xs transition-all shadow-sm"
            >
              <CheckCheck className="w-4 h-4 text-emerald-500" />
              <span>Selesaikan Semua ({unreadCount})</span>
            </button>
          )}
          <button
            onClick={() => setIsRuleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Alert Rule</span>
          </button>
        </div>
      </div>

      {/* ── URL ANALYZER ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 border border-sky-200 dark:border-sky-900/60 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white">AI URL Analyzer</h3>
            <p className="text-[11px] text-slate-500">Paste link berita apa saja → AI langsung baca & analisis isinya</p>
          </div>
        </div>

        <form onSubmit={handleAnalyzeUrl} className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setUrlResult(null); setUrlError(null); }}
              placeholder="https://tribunnews.com/artikel-berita-kampus..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0f172a] border border-sky-200 dark:border-sky-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 placeholder:text-slate-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={analyzing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition-all disabled:opacity-60 shrink-0"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{analyzing ? 'Menganalisis...' : 'Analisis AI'}</span>
          </button>
        </form>

        {urlError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            <span>{urlError}</span>
          </div>
        )}

        {urlResult && (
          <div className="mt-4 bg-white dark:bg-[#0f172a] rounded-xl border border-sky-200 dark:border-sky-900/60 overflow-hidden animate-fadeIn">
            {/* Result Header */}
            <div className={`px-4 py-3 flex items-center justify-between gap-3 ${urlResult.is_relevant ? 'bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-900/40' : 'bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${urlResult.is_relevant ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                  {urlResult.is_relevant ? '✓ RELEVAN KAMPUS' : '✗ TIDAK RELEVAN'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sentimentColor(urlResult.sentiment.label)}`}>
                  {urlResult.sentiment.label === 'Positive' ? '😊 Positif' : urlResult.sentiment.label === 'Negative' ? '😟 Negatif' : '😐 Netral'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Relevansi: {urlResult.relevance_score}% | {urlResult.word_count} kata</span>
              </div>
              <a href={urlResult.url} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-800 shrink-0">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="p-4 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{urlResult.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{urlResult.excerpt}</p>

              {urlResult.summary && (
                <div className="bg-sky-50 dark:bg-sky-950/30 rounded-lg p-3 border border-sky-100 dark:border-sky-900/40">
                  <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-1">Ringkasan AI</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{urlResult.summary}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {urlResult.universities.map((u) => (
                  <span key={u} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">{u}</span>
                ))}
                {urlResult.categories.map((c) => (
                  <span key={c} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">{c}</span>
                ))}
              </div>

              {/* Sentiment bars */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { label: 'Positif', value: urlResult.sentiment.positive, color: 'bg-emerald-500' },
                  { label: 'Netral', value: urlResult.sentiment.neutral, color: 'bg-slate-400' },
                  { label: 'Negatif', value: urlResult.sentiment.negative, color: 'bg-rose-500' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-0.5">
                      <span>{s.label}</span>
                      <span>{Math.round(s.value * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${Math.round(s.value * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {urlResult.is_relevant && !saveSuccess && (
                <button
                  onClick={handleSaveToDb}
                  disabled={analyzing}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Simpan ke Database Berita
                </button>
              )}
              {saveSuccess && (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Berhasil disimpan ke database!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto">
          {([
            { id: 'UNREAD', label: `Belum Dibaca${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
            { id: 'ALL', label: 'Semua' },
            { id: 'CRITICAL', label: 'Critical' },
            { id: 'WARNING', label: 'Warning' },
            { id: 'INFO', label: 'Info' },
          ] as { id: AlertStatus; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 pr-2">
          {loading ? 'Memuat...' : `${filteredAlerts.length} peringatan`}
        </span>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Memuat peringatan...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {statusFilter === 'UNREAD' ? '✅ Semua Sudah Ditandai Selesai' : 'Tidak Ada Peringatan'}
            </h3>
            <p className="text-xs text-slate-400">
              {statusFilter === 'UNREAD'
                ? 'Tidak ada notifikasi yang belum dibaca saat ini.'
                : 'Media perguruan tinggi Sulawesi Utara terpantau kondusif.'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((a) => {
            const isCrit = a.severity === 'CRITICAL';
            const isWarn = a.severity === 'WARNING';

            return (
              <div
                key={a.id}
                className={`group p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md ${
                  !a.is_read && isCrit
                    ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                    : !a.is_read && isWarn
                    ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
                    : 'bg-white dark:bg-[#0f172a]/90 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isCrit ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : isWarn ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                  }`}>
                    {isCrit ? <ShieldAlert className="w-5 h-5" /> : isWarn ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        isCrit ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : isWarn ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      }`}>
                        {a.severity}
                      </span>
                      {!a.is_read && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />}
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{a.title}</h4>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{a.message}</p>

                    <div className="flex items-center gap-2.5 flex-wrap pt-1 text-[11px]">
                      {a.source_name && (
                        <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Globe className="w-3 h-3 text-sky-500" />
                          {a.source_name}
                        </span>
                      )}
                      <span className="text-slate-400 font-mono">
                        {new Date(a.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })} •{' '}
                        {new Date(a.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {a.article_url && (
                        <a
                          href={a.article_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 hover:underline ml-auto"
                        >
                          <span>Buka Artikel</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {!a.is_read && (
                  <button
                    onClick={() => handleMarkRead(a.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-all shrink-0 self-end sm:self-center group-hover:scale-105"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Selesai</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Rule Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Tambah Aturan Alert</h3>
              </div>
              <button onClick={() => setIsRuleModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Aturan</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="Monitoring Isu UKT Unsrat"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Perguruan Tinggi</label>
                <select value={ruleUniv} onChange={(e) => setRuleUniv(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40">
                  <option value="UNSRAT">UNSRAT</option>
                  <option value="UNIMA">UNIMA</option>
                  <option value="UNKLAB">UNKLAB</option>
                  <option value="Polimdo">Polimdo</option>
                  <option value="De La Salle">De La Salle</option>
                  <option value="Semua Kampus">Semua Kampus</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kata Kunci (opsional)</label>
                <input type="text" value={ruleKeyword} onChange={(e) => setRuleKeyword(e.target.value)}
                  placeholder="ukt, demo, korupsi, sanksi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sentimen</label>
                <select value={ruleSentiment} onChange={(e) => setRuleSentiment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40">
                  <option value="Negative">Hanya Negatif</option>
                  <option value="Positive">Hanya Positif</option>
                  <option value="All">Semua Sentimen</option>
                </select>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold">
                  Batal
                </button>
                <button type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/30">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
