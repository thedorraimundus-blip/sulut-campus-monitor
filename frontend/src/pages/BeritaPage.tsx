import React, { useEffect, useState, useMemo } from 'react';
import {
  Search, Filter, ExternalLink, Calendar, Building2, Tag,
  Sparkles, SlidersHorizontal, RefreshCw, LayoutGrid, Table as TableIcon,
  ChevronLeft, ChevronRight, RotateCcw, ArrowUpDown, CheckCircle2
} from 'lucide-react';
import { Article, University, Source } from '../types';
import { api } from '../services/api';
import { useModals } from '../context/ModalContext';
import { NewsCard } from '../components/news/NewsCard';
import { NewsTable } from '../components/news/NewsTable';
import { Badge } from '../components/ui/Badge';

interface BeritaPageProps {
  onSelectArticle?: (article: Article) => void;
}

export const BeritaPage: React.FC<BeritaPageProps> = ({ onSelectArticle }) => {
  const { openArticleModal } = useModals();
  const handleSelectArticle = onSelectArticle || openArticleModal;

  const [articles, setArticles] = useState<Article[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedUniv, setSelectedUniv] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('');
  const [minRelevance, setMinRelevance] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'relevance' | 'oldest'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);

  const categoriesList = [
    "Pendidikan", "Prestasi", "Mahasiswa", "Penelitian", "Kegiatan", "Kerja Sama",
    "Rektor", "Dosen", "Beasiswa", "Penerimaan Mahasiswa", "Akademik",
    "Infrastruktur", "Teknologi", "Organisasi", "Alumni", "Kebijakan",
    "Konflik", "Hukum", "Lainnya"
  ];

  const fetchFiltersAndArticles = async () => {
    setLoading(true);
    try {
      const [uData, sData, artData] = await Promise.all([
        api.getUniversities(),
        api.getSources(),
        api.getArticles({
          limit: 150
        })
      ]);
      setUniversities(uData);
      setSources(sData);
      setArticles(artData);
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersAndArticles();
  }, []);

  // Filter & Sort Pipeline
  const processedArticles = useMemo(() => {
    let result = [...articles];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.summary && a.summary.toLowerCase().includes(q)) ||
          a.source_name.toLowerCase().includes(q) ||
          a.universities.some((u) => u.university_name.toLowerCase().includes(q) || (u.short_name && u.short_name.toLowerCase().includes(q)))
      );
    }

    // University filter
    if (selectedUniv) {
      const uId = Number(selectedUniv);
      result = result.filter((a) =>
        a.universities.some((u) => u.university_id === uId || u.short_name === selectedUniv)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((a) =>
        a.categories.some((c) => c.category_name.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    // Sentiment filter
    if (selectedSentiment) {
      result = result.filter((a) => (a.sentiment?.sentiment || 'Neutral') === selectedSentiment);
    }

    // Minimum relevance filter
    if (minRelevance > 0) {
      result = result.filter((a) => Math.round(a.relevance_score * 100) >= minRelevance);
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());
    } else if (sortBy === 'relevance') {
      result.sort((a, b) => b.relevance_score - a.relevance_score);
    }

    return result;
  }, [articles, search, selectedUniv, selectedCategory, selectedSentiment, minRelevance, sortBy]);

  // Pagination calculation
  const totalItems = processedArticles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentArticles = processedArticles.slice(startIndex, startIndex + pageSize);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedUniv('');
    setSelectedCategory('');
    setSelectedSentiment('');
    setMinRelevance(0);
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Katalog Berita Perguruan Tinggi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manajemen dan arsip berita Sulawesi Utara dengan metadata NLP lokal terstruktur
          </p>
        </div>

        {/* View Switcher & Reload */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
          </div>

          <button
            onClick={fetchFiltersAndArticles}
            className="p-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-600 transition-colors"
            title="Muat Ulang Berita"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari judul berita, ringkasan, atau nama narasumber..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>

          {/* Sentiment Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-full md:w-auto overflow-x-auto">
            {[
              { id: '', label: 'Semua Sentimen' },
              { id: 'Positive', label: 'Positif' },
              { id: 'Neutral', label: 'Netral' },
              { id: 'Negative', label: 'Negatif' }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSentiment(s.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSentiment === s.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Second Row: Dropdowns & Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* University Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Perguruan Tinggi</label>
            <select
              value={selectedUniv}
              onChange={(e) => {
                setSelectedUniv(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <option value="">Semua Perguruan Tinggi</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id.toString()}>
                  {u.short_name} — {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kategori Berita</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <option value="">Semua Kategori (19 Topik)</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Minimum Relevance */}
          <div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
              <span>Min. Relevansi</span>
              <span className="text-sky-500">{minRelevance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minRelevance}
              onChange={(e) => {
                setMinRelevance(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full accent-sky-500 mt-2"
            />
          </div>

          {/* Sorting Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Urutkan</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <option value="newest">Terbaru (Waktu Publikasi)</option>
              <option value="relevance">Skor Relevansi Tertinggi</option>
              <option value="oldest">Terlama</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset */}
        {(search || selectedUniv || selectedCategory || selectedSentiment || minRelevance > 0) && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">
              Ditemukan <strong className="text-slate-800 dark:text-slate-200">{processedArticles.length}</strong> artikel dari filter aktif
            </span>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-rose-500 hover:underline font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area: Grid or Table */}
      {loading ? (
        <div className="flex justify-center p-16">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : currentArticles.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#0f172a]/90 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400 space-y-2">
          <p className="font-semibold text-slate-600 dark:text-slate-300">Tidak ada artikel berita yang cocok</p>
          <p>Coba kurangi filter atau bersihkan kata kunci pencarian.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentArticles.map((art) => (
            <NewsCard
              key={art.id}
              article={art}
              onSelect={(article) => handleSelectArticle(article)}
            />
          ))}
        </div>
      ) : (
        <NewsTable
          articles={currentArticles}
          onSelect={(article) => handleSelectArticle(article)}
        />
      )}

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-slate-500">
            Menampilkan <strong className="text-slate-800 dark:text-slate-200">{startIndex + 1}</strong> –{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {Math.min(startIndex + pageSize, totalItems)}
            </strong>{' '}
            dari <strong className="text-slate-800 dark:text-slate-200">{totalItems}</strong> artikel
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 disabled:opacity-40 disabled:hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 disabled:opacity-40 disabled:hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Page Size Select */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="ml-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
            >
              <option value={9}>9 / hal</option>
              <option value={18}>18 / hal</option>
              <option value={36}>36 / hal</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
