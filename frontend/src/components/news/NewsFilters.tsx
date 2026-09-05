import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';

interface NewsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedUniversity: string;
  onUniversityChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedSentiment: string;
  onSentimentChange: (value: string) => void;
  onlyRelevant: boolean;
  onOnlyRelevantChange: (value: boolean) => void;
  universities: { id: number; name: string; short_name: string }[];
  categories: string[];
  onReset: () => void;
}

export const NewsFilters: React.FC<NewsFiltersProps> = ({
  search,
  onSearchChange,
  selectedUniversity,
  onUniversityChange,
  selectedCategory,
  onCategoryChange,
  selectedSentiment,
  onSentimentChange,
  onlyRelevant,
  onOnlyRelevantChange,
  universities,
  categories,
  onReset,
}) => {
  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedUniversity) ||
    Boolean(selectedCategory) ||
    Boolean(selectedSentiment) ||
    !onlyRelevant;

  return (
    <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
      {/* Top Row: Search and Quick Toggles */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari judul berita, topik, nama dosen/mahasiswa..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sentiment Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-full md:w-auto overflow-x-auto">
          {[
            { id: '', label: 'Semua' },
            { id: 'Positive', label: 'Positif' },
            { id: 'Neutral', label: 'Netral' },
            { id: 'Negative', label: 'Negatif' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSentimentChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSentiment === tab.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Second Row: Dropdowns & Relevant Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* University Dropdown */}
          <div className="w-full sm:w-56">
            <select
              value={selectedUniversity}
              onChange={(e) => onUniversityChange(e.target.value)}
              aria-label="Filter Perguruan Tinggi"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
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
          <div className="w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              aria-label="Filter Kategori"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <option value="">Semua Kategori (19 Topik)</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Only Relevant Toggle */}
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={onlyRelevant}
              onChange={(e) => onOnlyRelevantChange(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <span>Hanya Berita Relevan Kampus (&gt;= 45%)</span>
          </label>
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>
    </div>
  );
};
