import React, { useState } from 'react';
import {
  Settings, Clock, Database, Shield, Server, Check, Save,
  Palette, Bell, Cpu, Sliders, Moon, Sun, RefreshCw, HardDrive,
  CheckCircle2, Laptop
} from 'lucide-react';

type SettingsSection = 'general' | 'monitoring' | 'appearance' | 'notifications' | 'data' | 'ai' | 'system';

export const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');

  // General Settings
  const [appName, setAppName] = useState('SULUT CAMPUS MONITOR');
  const [tagline, setTagline] = useState('Pantau Perkembangan Perguruan Tinggi Sulawesi Utara dalam Satu Dashboard');
  const [region, setRegion] = useState('Sulawesi Utara (Manado, Minahasa, Tomohon, Kotamobagu)');

  // Monitoring Settings
  const [crawlInterval, setCrawlInterval] = useState('15');
  const [autoRefreshFeed, setAutoRefreshFeed] = useState(true);
  const [userAgent, setUserAgent] = useState('SulutCampusMonitorBot/2.1 (+https://scm.sulut.ac.id/bot)');

  // Appearance Settings
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>('dark');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  // Notifications Settings
  const [enableBrowserNotifs, setEnableBrowserNotifs] = useState(true);
  const [crisisAlertSound, setCrisisAlertSound] = useState(false);
  const [alertSeverityThreshold, setAlertSeverityThreshold] = useState('WARNING');

  // Data Retention Settings
  const [retentionDays, setRetentionDays] = useState('180');
  const [autoCleanLogs, setAutoCleanLogs] = useState(true);

  // AI Engine Settings
  const [relevanceThreshold, setRelevanceThreshold] = useState(45);
  const [autoRetrainModel, setAutoRetrainModel] = useState(false);
  const [stemmerCache, setStemmerCache] = useState(true);

  // Status message
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const sections: { id: SettingsSection; label: string; icon: any }[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'monitoring', label: 'Monitoring', icon: Clock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data', icon: HardDrive },
    { id: 'ai', label: 'AI Engine', icon: Cpu },
    { id: 'system', label: 'System', icon: Server },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-500" />
          <span>Pengaturan Sistem SCM</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Konfigurasi crawler, tampilan antarmuka, threshold AI lokal, dan retensi data platform
        </p>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Pengaturan berhasil diperbarui pada memori platform lokal.</span>
        </div>
      )}

      {/* Main Settings Grid: Navigation Tabs (Left) + Content (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left: Tab Sidebar */}
        <div className="md:col-span-1 space-y-1">
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm space-y-1">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Section Settings Panel */}
        <div className="md:col-span-3">
          <form onSubmit={handleSave} className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            {/* 1. General */}
            {activeSection === 'general' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">General Platform Settings</h3>
                  <p className="text-xs text-slate-400">Identitas dan informasi utama sistem monitoring</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Aplikasi
                    </label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tagline Resmi
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cakupan Wilayah Monitoring
                    </label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Monitoring */}
            {activeSection === 'monitoring' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Monitoring & Crawler Engine</h3>
                  <p className="text-xs text-slate-400">Pengaturan frekuensi perayapan dan background worker</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Interval Monitoring Rutin (Crawl Interval)
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {['1', '5', '10', '15', '30', '60'].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setCrawlInterval(mins)}
                          className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                            crawlInterval === mins
                              ? 'border-sky-500 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-300 ring-2 ring-sky-500/20'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {mins} Mnt
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Auto-Refresh Live Feed</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">Memperbarui aliran berita di monitor secara otomatis setiap 10 detik</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoRefreshFeed}
                      onChange={(e) => setAutoRefreshFeed(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Crawler User-Agent Header
                    </label>
                    <input
                      type="text"
                      value={userAgent}
                      onChange={(e) => setUserAgent(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Appearance */}
            {activeSection === 'appearance' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Appearance & Display</h3>
                  <p className="text-xs text-slate-400">Preferensi tema dan densitas antarmuka</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Tema Tampilan (Dark / Light Mode)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setThemeMode('dark');
                          document.documentElement.classList.add('dark');
                        }}
                        className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 font-bold ${
                          themeMode === 'dark'
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 ring-2 ring-sky-500/20'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Moon className="w-5 h-5" />
                        <span>Dark Mode (Utama)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setThemeMode('light');
                          document.documentElement.classList.remove('dark');
                        }}
                        className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 font-bold ${
                          themeMode === 'light'
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 ring-2 ring-sky-500/20'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Sun className="w-5 h-5 text-amber-500" />
                        <span>Light Mode</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setThemeMode('system')}
                        className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 font-bold ${
                          themeMode === 'system'
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 ring-2 ring-sky-500/20'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Laptop className="w-5 h-5" />
                        <span>Ikuti Sistem</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Densitas Informasi (Layout Density)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDensity('comfortable')}
                        className={`p-3 rounded-xl border text-left font-bold ${
                          density === 'comfortable'
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600'
                        }`}
                      >
                        <span>Comfortable</span>
                        <p className="text-[11px] font-normal text-slate-400 mt-0.5">Padding lega untuk layar standar</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDensity('compact')}
                        className={`p-3 rounded-xl border text-left font-bold ${
                          density === 'compact'
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600'
                        }`}
                      >
                        <span>Compact (Newsroom)</span>
                        <p className="text-[11px] font-normal text-slate-400 mt-0.5">Densitas tinggi ala Bloomberg terminal</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Notifications */}
            {activeSection === 'notifications' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notification & Alert Preferences</h3>
                  <p className="text-xs text-slate-400">Pemberitahuan peringatan isu krisis kampus</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Notifikasi Web Browser</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">Tampilkan pop-up browser saat berita berkategori krisis terdeteksi</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableBrowserNotifs}
                      onChange={(e) => setEnableBrowserNotifs(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Audio Chime Peringatan Kritis</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">Mainkan nada suara halus saat alert bernilai CRITICAL masuk</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={crisisAlertSound}
                      onChange={(e) => setCrisisAlertSound(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ambang Batas Minimum Notifikasi
                    </label>
                    <select
                      value={alertSeverityThreshold}
                      onChange={(e) => setAlertSeverityThreshold(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    >
                      <option value="CRITICAL">Hanya Tingkat Critical</option>
                      <option value="WARNING">Tingkat Warning & Critical</option>
                      <option value="INFO">Semua Tingkat (Info, Warning, Critical)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Data */}
            {activeSection === 'data' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Data Retention & Database Management</h3>
                  <p className="text-xs text-slate-400">Pengarsipan dan masa simpan artikel berita lokal</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Masa Retensi Berita (Retention Days)
                    </label>
                    <select
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    >
                      <option value="30">30 Hari (Pengujian)</option>
                      <option value="90">90 Hari (3 Bulan)</option>
                      <option value="180">180 Hari (6 Bulan - Disarankan)</option>
                      <option value="365">365 Hari (1 Tahun)</option>
                      <option value="unlimited">Permanen (Tanpa Penghapusan Otomatis)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Auto-Clean Audit Logs</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">Secara berkala membersihkan log system yang lebih lama dari 30 hari</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoCleanLogs}
                      onChange={(e) => setAutoCleanLogs(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => alert("Simulasi: Database SQLite dioptimasi dan tabel divacuum (hasil: 0 fragmentation).")}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors"
                    >
                      Jalankan Vacuum & Optimasi SQLite
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. AI Engine */}
            {activeSection === 'ai' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Local AI & NLP Configuration</h3>
                  <p className="text-xs text-slate-400">Parameter threshold dan inferensi offline PySastrawi & Scikit-Learn</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      <span>Default Relevance Threshold (Skor Relevansi Kampus)</span>
                      <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{relevanceThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      step="5"
                      value={relevanceThreshold}
                      onChange={(e) => setRelevanceThreshold(Number(e.target.value))}
                      className="w-full accent-sky-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Artikel dengan skor relevansi di bawah ambang batas ini akan dikategorikan sebagai berita umum non-akademik.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Sastrawi Stemmer LRU Cache</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">Menyimpan kata dasar yang telah di-stem di memori RAM untuk kecepatan 10x</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={stemmerCache}
                      onChange={(e) => setStemmerCache(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Auto-Retrain Model Berkala</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">Otomatis melatih ulang MultinomialNB setiap ada 25 sampel terverifikasi baru</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoRetrainModel}
                      onChange={(e) => setAutoRetrainModel(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 7. System */}
            {activeSection === 'system' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">System Diagnostics & Environment</h3>
                  <p className="text-xs text-slate-400">Informasi lingkungan server dan versi komponen</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Versi Frontend:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">v2.1.0-enterprise</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">NLP Core:</span>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400">PySastrawi + Scikit-Learn (Local)</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Relational Store:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">SQLite 3 (18 Tables)</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Status Real-time:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      All Services Healthy
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
