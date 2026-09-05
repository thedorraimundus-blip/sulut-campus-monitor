import React from 'react';
import { ExternalLink, Sparkles, Building2, Tag, Calendar, ChevronRight } from 'lucide-react';
import { Article } from '../../types';
import { Badge } from '../ui/Badge';
import { useModals } from '../../context/ModalContext';

interface NewsCardProps {
  article: Article;
  onSelect?: (article: Article) => void;
  compact?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onSelect, compact = false }) => {
  const { openArticleModal } = useModals();

  const handleClick = () => {
    if (onSelect) {
      onSelect(article);
    } else {
      openArticleModal(article);
    }
  };

  const sentimentName = article.sentiment?.sentiment || 'Neutral';
  const sentimentVariant =
    sentimentName === 'Positive'
      ? 'success'
      : sentimentName === 'Negative'
      ? 'danger'
      : 'neutral';

  const relevancePct = Math.round(article.relevance_score * 100);

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white dark:bg-[#0f172a]/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 hover:border-sky-500/60 dark:hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Source, Date, Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {article.source_name}
            </span>
            {article.is_demo && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                DEMO
              </span>
            )}
            <span className="text-[11px] text-slate-600 dark:text-slate-300">
              {new Date(article.published_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Relevance Score Pill */}
            <div
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                relevancePct >= 80
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800'
              }`}
              title={`Relevance AI Score: ${relevancePct}%`}
            >
              Relevance {relevancePct}%
            </div>

            {/* Sentiment Badge */}
            <Badge variant={sentimentVariant} size="sm">
              {sentimentName}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
          {article.title}
        </h3>

        {/* Summary Snippet */}
        {article.summary && !compact && (
          <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
        )}
      </div>

      {/* Footer Entities & Categories */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-xs">
        {/* Campus & Category Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {article.universities.slice(0, 2).map((u) => (
            <span
              key={u.university_id}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/50"
            >
              <Building2 className="w-3 h-3" />
              <span>{u.university_short_name || u.university_name}</span>
            </span>
          ))}

          {article.categories.slice(0, 2).map((c) => (
            <span
              key={c.category_id}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <Tag className="w-2.5 h-2.5" />
              <span>{c.category_name}</span>
            </span>
          ))}
        </div>

        {/* Read detail indicator */}
        <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Lihat Detail</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
