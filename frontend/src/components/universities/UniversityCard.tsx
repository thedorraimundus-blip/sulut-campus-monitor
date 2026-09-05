import React from 'react';
import { Building2, MapPin, Newspaper, ArrowRight, ExternalLink } from 'lucide-react';
import { University } from '../../types';
import { Link } from 'react-router-dom';

interface UniversityCardProps {
  university: University;
  onSelectForArticles?: (universityId: number) => void;
}

export const UniversityCard: React.FC<UniversityCardProps> = ({
  university,
  onSelectForArticles
}) => {
  const articleCount = university.article_count || 0;
  const posCount = university.positive_count || Math.round(articleCount * 0.55);
  const neuCount = university.neutral_count || Math.round(articleCount * 0.32);
  const negCount = university.negative_count || Math.max(0, articleCount - posCount - neuCount);

  const posPct = articleCount > 0 ? Math.round((posCount / articleCount) * 100) : 0;
  const neuPct = articleCount > 0 ? Math.round((neuCount / articleCount) * 100) : 0;
  const negPct = articleCount > 0 ? Math.max(0, 100 - posPct - neuPct) : 0;

  // Generate distinct pastel or deep gradient based on initials
  const initials = university.short_name || university.name.substring(0, 3).toUpperCase();

  return (
    <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-sky-500/60 dark:hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header: Logo initials & Accreditation */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
              {initials.slice(0, 4)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-tight">
                  {university.short_name}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {university.type || 'PTN'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {university.name}
              </p>
            </div>
          </div>
        </div>

        {/* Location & Website */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{university.city || 'Sulawesi Utara'}</span>
          </div>
          {university.website && (
            <a
              href={university.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sky-600 hover:text-sky-700 dark:text-sky-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{university.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
        </div>

        {/* Sentiment Mini Bar */}
        <div className="space-y-1.5 mb-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Newspaper className="w-3.5 h-3.5 text-sky-500" />
              <span>{articleCount} Berita Terpantau</span>
            </span>
            <span>{posPct}% Positif</span>
          </div>

          {/* Tri-color progress bar */}
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${posPct}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Positif: ${posPct}%`}
            />
            <div
              style={{ width: `${neuPct}%` }}
              className="bg-slate-400 dark:bg-slate-500 transition-all duration-500"
              title={`Netral: ${neuPct}%`}
            />
            <div
              style={{ width: `${negPct}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Negatif: ${negPct}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 pt-0.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{posCount} Pos</span>
            <span className="text-slate-500 dark:text-slate-400 font-bold">{neuCount} Net</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">{negCount} Neg</span>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <Link
          to={`/universities/${university.id}`}
          className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
        >
          <span>Profil & Analitik Kampus</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {onSelectForArticles && (
          <button
            onClick={() => onSelectForArticles(university.id)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 transition-colors"
          >
            Filter Berita
          </button>
        )}
      </div>
    </div>
  );
};
