import React from 'react';
import { Radio, Sparkles, Building2, ChevronRight, Clock } from 'lucide-react';
import { Article } from '../../types';
import { Badge } from '../ui/Badge';
import { useModals } from '../../context/ModalContext';

interface NewsFeedProps {
  articles: Article[];
  title?: string;
  onSelect?: (article: Article) => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({
  articles,
  title = "Live Campus Feed",
  onSelect
}) => {
  const { openArticleModal } = useModals();

  return (
    <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
          </span>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            {title}
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
          Auto-refresh (15s)
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto max-h-[480px] scrollbar-thin pr-1">
        {articles.map((article) => {
          const sentimentName = article.sentiment?.sentiment || 'Neutral';
          const sentimentVariant =
            sentimentName === 'Positive'
              ? 'success'
              : sentimentName === 'Negative'
              ? 'danger'
              : 'neutral';

          return (
            <div
              key={article.id}
              onClick={() => (onSelect ? onSelect(article) : openArticleModal(article))}
              className="py-3 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2 text-[10px] text-slate-600 dark:text-slate-300 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {article.source_name}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(article.published_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <Badge variant={sentimentVariant} size="sm">
                  {sentimentName}
                </Badge>
              </div>

              <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 line-clamp-2 leading-snug">
                {article.title}
              </h4>

              {article.universities.length > 0 && (
                <div className="flex items-center gap-1 mt-1.5">
                  <Building2 className="w-3 h-3 text-sky-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 truncate">
                    {article.universities[0].university_short_name || article.universities[0].university_name}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
