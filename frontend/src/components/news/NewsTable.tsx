import React from 'react';
import { ExternalLink, Building2, Tag, ChevronRight } from 'lucide-react';
import { Article } from '../../types';
import { Badge } from '../ui/Badge';
import { useModals } from '../../context/ModalContext';

interface NewsTableProps {
  articles: Article[];
  onSelect?: (article: Article) => void;
}

export const NewsTable: React.FC<NewsTableProps> = ({ articles, onSelect }) => {
  const { openArticleModal } = useModals();

  const handleRowClick = (article: Article) => {
    if (onSelect) {
      onSelect(article);
    } else {
      openArticleModal(article);
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]/90 shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4">Judul Berita & Media</th>
            <th className="py-3 px-3">Kampus Terdeteksi</th>
            <th className="py-3 px-3">Kategori</th>
            <th className="py-3 px-3 text-center">Sentimen</th>
            <th className="py-3 px-3 text-center">Relevansi</th>
            <th className="py-3 px-3 text-right">Waktu</th>
            <th className="py-3 px-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {articles.map((article) => {
            const sentimentName = article.sentiment?.sentiment || 'Neutral';
            const sentimentVariant =
              sentimentName === 'Positive'
                ? 'success'
                : sentimentName === 'Negative'
                ? 'danger'
                : 'neutral';

            const relevancePct = Math.round(article.relevance_score * 100);

            return (
              <tr
                key={article.id}
                onClick={() => handleRowClick(article)}
                className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                {/* Title & Media */}
                <td className="py-3.5 px-4 max-w-md">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
                      {article.title}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-bold text-slate-600 dark:text-slate-300">
                        {article.source_name}
                      </span>
                      {article.is_demo && (
                        <span className="px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold">
                          DEMO
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Campus */}
                <td className="py-3.5 px-3">
                  <div className="flex flex-wrap gap-1">
                    {article.universities.length > 0 ? (
                      article.universities.map((u) => (
                        <span
                          key={u.university_id}
                          className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/40 text-[10px]"
                        >
                          <Building2 className="w-2.5 h-2.5" />
                          {u.university_short_name || u.university_name}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">-</span>
                    )}
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-3">
                  <div className="flex flex-wrap gap-1">
                    {article.categories.length > 0 ? (
                      article.categories.map((c) => (
                        <span
                          key={c.category_id}
                          className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {c.category_name}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Umum</span>
                    )}
                  </div>
                </td>

                {/* Sentiment */}
                <td className="py-3.5 px-3 text-center">
                  <Badge variant={sentimentVariant} size="sm">
                    {sentimentName}
                  </Badge>
                </td>

                {/* Relevance */}
                <td className="py-3.5 px-3 text-center">
                  <span
                    className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-full border ${
                      relevancePct >= 80
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {relevancePct}%
                  </span>
                </td>

                {/* Published Date */}
                <td className="py-3.5 px-3 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">
                  {new Date(article.published_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>

                {/* Action */}
                <td className="py-3.5 px-3 text-center">
                  <button
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                    title="Buka Detail Berita"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
