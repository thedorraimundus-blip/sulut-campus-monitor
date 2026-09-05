import React, { useState } from 'react';
import { X, Globe, Rss, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { sourcesApi } from '../../services/api/sourcesApi';
import { Button } from '../ui/Button';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSourceAdded: () => void;
}

export const AddSourceModal: React.FC<AddSourceModalProps> = ({
  isOpen,
  onClose,
  onSourceAdded
}) => {
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [rssUrl, setRssUrl] = useState('');
  const [crawlInterval, setCrawlInterval] = useState(15);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    detected_rss?: string;
    sample_count?: number;
    message?: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!baseUrl) {
      setError('Masukkan URL media terlebih dahulu.');
      return;
    }
    setError(null);
    setTesting(true);
    setTestResult(null);

    try {
      const res = await sourcesApi.testSource(baseUrl, rssUrl || undefined);
      setTestResult(res);
      if (res.detected_rss && !rssUrl) {
        setRssUrl(res.detected_rss);
      }
    } catch (e: any) {
      setError(e.message || 'Gagal menguji sumber');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !baseUrl) {
      setError('Nama media dan Base URL wajib diisi');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await sourcesApi.addSource({
        name,
        base_url: baseUrl,
        rss_url: rssUrl || undefined,
        crawl_interval: crawlInterval,
        source_type: rssUrl ? 'RSS Feed' : 'Web Scraper'
      });
      onSourceAdded();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan sumber baru');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Tambah Sumber Media Baru
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pemeriksaan otomatis RSS & kompatibilitas crawler
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Media Online
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Radar Manado, Bolmong Post"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Base URL Website
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://radarmanado.id"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                required
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !baseUrl}
                className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold flex items-center gap-1.5 transition-colors"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Uji URL</span>
              </button>
            </div>
          </div>

          {/* Test Result Box */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{testResult.message || 'Koneksi ke sumber berhasil diverifikasi.'}</span>
              </div>
              {testResult.detected_rss && (
                <div className="text-[11px] font-mono pl-6 text-emerald-700 dark:text-emerald-400">
                  RSS Terdeteksi: {testResult.detected_rss}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              URL RSS Feed (Opsional / Terdeteksi Otomatis)
            </label>
            <input
              type="url"
              value={rssUrl}
              onChange={(e) => setRssUrl(e.target.value)}
              placeholder="https://radarmanado.id/feed"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Interval Crawl Rutin
            </label>
            <select
              value={crawlInterval}
              onChange={(e) => setCrawlInterval(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <option value={15}>Setiap 15 Menit (Disarankan)</option>
              <option value={30}>Setiap 30 Menit</option>
              <option value={60}>Setiap 1 Jam</option>
              <option value={120}>Setiap 2 Jam</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <Button variant="ghost" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Sumber'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
