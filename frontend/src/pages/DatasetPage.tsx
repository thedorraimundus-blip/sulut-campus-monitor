import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Database, Plus, Upload, Download, Search, Filter,
  Tag, CheckCircle2, AlertCircle, FileText, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { aiApi } from '../services/api/aiApi';
import { TrainingDataRecord } from '../types';
import { Badge } from '../components/ui/Badge';

export const DatasetPage: React.FC = () => {
  const [dataset, setDataset] = useState<TrainingDataRecord[]>([]);
  const [totalDataset, setTotalDataset] = useState(0);
  const [loadingDataset, setLoadingDataset] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');

  // Add Data Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('Prestasi');
  const [newSentiment, setNewSentiment] = useState('Positive');
  const [newUniv, setNewUniv] = useState('UNSRAT');
  const [addSuccess, setAddSuccess] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const categories = [
    "Pendidikan", "Prestasi", "Mahasiswa", "Penelitian", "Kegiatan", "Kerja Sama",
    "Rektor", "Dosen", "Beasiswa", "Penerimaan Mahasiswa", "Akademik",
    "Infrastruktur", "Teknologi", "Organisasi", "Alumni", "Kebijakan",
    "Konflik", "Hukum", "Lainnya"
  ];

  const fetchDataset = useCallback(async () => {
    setLoadingDataset(true);
    const result = await aiApi.getDataset(currentPage, pageSize, search || undefined);
    setDataset(result.items);
    setTotalDataset(result.total);
    setLoadingDataset(false);
  }, [currentPage, pageSize, search]);

  useEffect(() => {
    const timer = setTimeout(fetchDataset, 300);
    return () => clearTimeout(timer);
  }, [fetchDataset]);

  // Stats
  const totalCount = totalDataset;
  const labeledCount = dataset.filter((d) => d.category && d.category !== 'Lainnya').length;
  const unlabeledCount = dataset.length - labeledCount;
  const uniqueCategoriesCount = new Set(dataset.map((d) => d.category)).size;

  const filteredDataset = useMemo(() => {
    return dataset.filter((item) => {
      if (categoryFilter && item.category !== categoryFilter) return false;
      if (sentimentFilter && item.sentiment !== sentimentFilter) return false;
      return true;
    });
  }, [dataset, categoryFilter, sentimentFilter]);


  const totalPages = Math.max(1, Math.ceil(totalDataset / pageSize));
  const currentItems = filteredDataset;

  const handleAddSample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const result = await aiApi.addTrainingSample({
      text: newText,
      category: newCategory,
      sentiment: newSentiment,
      university: newUniv,
      is_relevant: true,
    });

    if (result.success) {
      setIsAddModalOpen(false);
      setNewText('');
      setAddSuccess(true);
      fetchDataset();
      setTimeout(() => setAddSuccess(false), 3000);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataset, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `scm_training_dataset_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportSimulate = () => {
    alert("Import: Pilih file CSV atau JSON berisi korpus berita kampus untuk digabungkan ke pipeline training lokal.");
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-sky-500" />
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Dataset Training AI Lokal
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Koleksi data latih teranotasi bahasa Indonesia untuk model klasifikasi TF-IDF dan MultinomialNB offline
          </p>
        </div>

        {/* Action Buttons: Import, Export, Add */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleImportSimulate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-sky-600 font-bold text-xs transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Import Dataset</span>
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-sky-600 font-bold text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Dataset</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data</span>
          </button>
        </div>
      </div>

      {/* Dataset Statistics Row (5 KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Training Data
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
            {totalCount} Sampel
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Korpus teks berita</span>
        </div>

        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Labeled Data
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
            {labeledCount} Sampel
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Label terverifikasi</span>
        </div>

        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
            Unlabeled Data
          </span>
          <span className="text-2xl font-black text-amber-500 font-mono mt-1 block">
            {unlabeledCount} Sampel
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Menunggu kurasi</span>
        </div>

        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
            Kategori Terwakili
          </span>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1 block">
            {uniqueCategoriesCount} / 19
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Topik perguruan tinggi</span>
        </div>

        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
            Label Sentimen
          </span>
          <span className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono mt-1 block">
            3 Kelas
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Positif / Netral / Negatif</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari cuplikan teks, topik, atau kata kunci..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>

          <div className="w-full md:w-56">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <option value="">Semua Kategori ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-44">
            <select
              value={sentimentFilter}
              onChange={(e) => {
                setSentimentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <option value="">Semua Sentimen</option>
              <option value="Positive">Positif</option>
              <option value="Neutral">Netral</option>
              <option value="Negative">Negatif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dataset Table */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
            Tabel Korpus Anotasi ({filteredDataset.length} data ditemukan)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Format: Text, Category, Sentiment</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center">ID</th>
                <th className="py-3 px-4">Teks Berita / Sampel Korpus</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3 text-center">Sentimen</th>
                <th className="py-3 px-3">Kampus</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-slate-400 text-[11px]">
                    {item.id}
                  </td>
                  <td className="py-3 px-4 max-w-lg font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {item.text}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-semibold text-[11px] px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900/50">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.sentiment === 'Positive'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : item.sentiment === 'Negative'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.sentiment || 'Neutral'}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-bold text-sky-600 dark:text-sky-400">
                    {item.university || '-'}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Labeled</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Sample Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Tambah Sampel Teks ke Dataset Training
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSample} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teks Cuplikan Berita
                </label>
                <textarea
                  rows={3}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Contoh: Mahasiswa Universitas Sam Ratulangi berhasil memenangkan kompetisi riset maritim nasional..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Label Kategori
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Label Sentimen
                  </label>
                  <select
                    value={newSentiment}
                    onChange={(e) => setNewSentiment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  >
                    <option value="Positive">Positif</option>
                    <option value="Neutral">Netral</option>
                    <option value="Negative">Negatif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Kampus
                </label>
                <select
                  value={newUniv}
                  onChange={(e) => setNewUniv(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                >
                  <option value="UNSRAT">UNSRAT (Universitas Sam Ratulangi)</option>
                  <option value="UNIMA">UNIMA (Universitas Negeri Manado)</option>
                  <option value="UNKLAB">UNKLAB (Universitas Klabat)</option>
                  <option value="Polimdo">Polimdo (Politeknik Negeri Manado)</option>
                  <option value="De La Salle">De La Salle Manado</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/30"
                >
                  Simpan Sampel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
