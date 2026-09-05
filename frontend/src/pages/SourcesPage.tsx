import React, { useEffect, useState } from 'react';
import {
  Globe, Plus, RefreshCw, Play, CheckCircle2, AlertTriangle,
  ExternalLink, X, Loader2, Clock, Activity, ShieldAlert,
  Power, Edit3, Rss, Sparkles, Check
} from 'lucide-react';
import { Source } from '../types';
import { api } from '../services/api';
import { Badge } from '../components/ui/Badge';

export const SourcesPage: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanningId, setScanningId] = useState<number | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [scanningAll, setScanningAll] = useState(false);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceRssUrl, setSourceRssUrl] = useState('');
  const [sourceInterval, setSourceInterval] = useState(15);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const fetchSources = async () => {
    try {
      const data = await api.getSources();
      setSources(data);
    } catch (err) {
      console.error('Error fetching sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleOpenAdd = () => {
    setEditingSource(null);
    setSourceName('');
    setSourceUrl('');
    setSourceRssUrl('');
    setSourceInterval(15);
    setTestResult(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Source) => {
    setEditingSource(s);
    setSourceName(s.name);
    setSourceUrl(s.base_url);
    setSourceRssUrl(s.rss_url || '');
    setSourceInterval(s.crawl_interval || 15);
    setTestResult(null);
    setIsModalOpen(true);
  };

  const handleToggleEnable = async (id: number) => {
    const target = sources.find((s) => s.id === id);
    if (!target) return;
    const nextActive = !target.is_active;

    // Optimistic UI update
    setSources((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            is_active: nextActive,
            status: nextActive ? 'ACTIVE' : 'PAUSED'
          };
        }
        return s;
      })
    );

    try {
      await fetch(`http://localhost:8000/api/sources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive })
      });
    } catch (e) {
      console.warn('Backend update failed, kept local state', e);
    }
  };

  const handleTestSourceRow = async (s: Source) => {
    setTestingId(s.id);
    try {
      const result = await api.testSource(s.base_url, s.rss_url);
      alert(`[Test ${s.name}]\n${result.message || 'Koneksi ke media online berhasil terhubung.'}`);
    } catch (e: any) {
      alert(`[Test Gagal]: ${e.message}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleScanSingle = async (id: number) => {
    setScanningId(id);
    try {
      await api.scanSource(id);
      await fetchSources();
    } catch (err) {
      console.error('Error scanning source:', err);
    } finally {
      setScanningId(null);
    }
  };

  const handleScanAll = async () => {
    setScanningAll(true);
    try {
      await api.scanAllSources();
      await fetchSources();
    } catch (err) {
      console.error('Error scanning all sources:', err);
    } finally {
      setScanningAll(false);
    }
  };

  const handleModalTest = async () => {
    if (!sourceUrl) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const result = await api.testSource(sourceUrl, sourceRssUrl || undefined);
      setTestResult(result);
      if (result.detected_rss && !sourceRssUrl) {
        setSourceRssUrl(result.detected_rss);
      }
    } catch (err: any) {
      setTestResult({ success: false, message: 'Gagal terhubung ke URL tersebut' });
    } finally {
      setTestLoading(false);
    }
  };

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName || !sourceUrl) return;

    if (editingSource) {
      // Update local state
      setSources((prev) =>
        prev.map((s) =>
          s.id === editingSource.id
            ? {
                ...s,
                name: sourceName,
                base_url: sourceUrl,
                rss_url: sourceRssUrl || undefined,
                crawl_interval: sourceInterval,
                source_type: sourceRssUrl ? 'rss' : 'html'
              }
            : s
        )
      );
    } else {
      // Create source
      try {
        await api.createSource({
          name: sourceName,
          base_url: sourceUrl,
          rss_url: sourceRssUrl || undefined,
          crawl_interval: sourceInterval,
          source_type: sourceRssUrl ? 'rss' : 'html'
        });
        await fetchSources();
      } catch (err) {
        console.error('Error saving source:', err);
      }
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sumber Media Online Sulawesi Utara
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Konfigurasi crawler lokal untuk portal berita, RSS feed, dan website resmi perguruan tinggi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleScanAll}
            disabled={scanningAll}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanningAll ? 'animate-spin text-sky-500' : ''}`} />
            <span>{scanningAll ? 'Memindai Semua...' : 'Pindai Semua'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Sumber Media</span>
          </button>
        </div>
      </div>

      {/* Media Sources Table */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Globe className="w-4 h-4 text-sky-500" />
            <span>Daftar {sources.length} Media Terdaftar</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Polling otomatis latar belakang</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Nama Media</th>
                <th className="py-3 px-3">Base URL</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Ketersediaan RSS</th>
                <th className="py-3 px-3 text-right">Pemeriksaan Terakhir</th>
                <th className="py-3 px-3 text-center">Jumlah Artikel</th>
                <th className="py-3 px-3 text-center">Interval</th>
                <th className="py-3 px-4 text-center">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sources.map((s) => {
                const isScanning = scanningId === s.id;
                const isTesting = testingId === s.id;
                const hasRss = Boolean(s.rss_url);

                return (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Media Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {s.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{s.name}</span>
                      </div>
                    </td>

                    {/* URL */}
                    <td className="py-3.5 px-3">
                      <a
                        href={s.base_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-sky-500 flex items-center gap-1 font-mono text-[11px] max-w-xs truncate"
                      >
                        <span className="truncate">{s.base_url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <Badge variant={s.is_active ? 'success' : 'neutral'} size="sm">
                        {s.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>

                    {/* RSS Availability */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          hasRss
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        <Rss className="w-3 h-3" />
                        <span>{hasRss ? 'RSS Ready' : 'HTML Scraper'}</span>
                      </span>
                    </td>

                    {/* Last Checked */}
                    <td className="py-3.5 px-3 text-right font-mono text-[11px] text-slate-400">
                      {s.last_crawled
                        ? new Date(s.last_crawled).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Baru saja'}
                    </td>

                    {/* Jumlah Artikel */}
                    <td className="py-3.5 px-3 text-center font-bold font-mono text-slate-900 dark:text-white">
                      {s.article_count || s.articles_count || 0}
                    </td>

                    {/* Interval */}
                    <td className="py-3.5 px-3 text-center font-mono text-slate-500 text-[11px]">
                      {s.crawl_interval} mnt
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Test Source Button */}
                        <button
                          onClick={() => handleTestSourceRow(s)}
                          disabled={isTesting}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                          title="Uji Koneksi Media"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-sky-500' : ''}`} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Sumber"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Enable/Disable Button */}
                        <button
                          onClick={() => handleToggleEnable(s.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            s.is_active
                              ? 'text-emerald-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                          title={s.is_active ? 'Nonaktifkan Media' : 'Aktifkan Media'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {/* Scan Now */}
                        <button
                          onClick={() => handleScanSingle(s.id)}
                          disabled={isScanning}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                          title="Pindai Berita Sekarang"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-sky-500' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Source Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {editingSource ? 'Edit Sumber Media' : 'Tambah Sumber Media Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Konfigurasi URL dan interval monitoring berita
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSource} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Media Online
                </label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="Contoh: Radar Manado, Manado Post, SulutPos"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Base URL Website
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://manadopost.jawapos.com"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleModalTest}
                    disabled={testLoading || !sourceUrl}
                    className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Test Source</span>
                  </button>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border flex flex-col gap-1 text-xs ${
                    testResult.success !== false
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{testResult.message || 'Koneksi ke media terverifikasi.'}</span>
                  </div>
                  {testResult.detected_rss && (
                    <div className="text-[11px] font-mono pl-6 text-emerald-700 dark:text-emerald-400">
                      RSS Terdeteksi: {testResult.detected_rss}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  RSS Feed URL (Opsional)
                </label>
                <input
                  type="url"
                  value={sourceRssUrl}
                  onChange={(e) => setSourceRssUrl(e.target.value)}
                  placeholder="https://manadopost.jawapos.com/feed"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Interval Monitoring
                </label>
                <select
                  value={sourceInterval}
                  onChange={(e) => setSourceInterval(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                >
                  <option value={5}>Setiap 5 Menit</option>
                  <option value={15}>Setiap 15 Menit (Disarankan)</option>
                  <option value={30}>Setiap 30 Menit</option>
                  <option value={60}>Setiap 1 Jam</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/30"
                >
                  Simpan Sumber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
