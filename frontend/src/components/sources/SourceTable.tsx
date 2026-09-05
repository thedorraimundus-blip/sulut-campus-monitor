import React from 'react';
import { Globe, RefreshCw, Rss, ExternalLink, CheckCircle2, AlertTriangle, Play } from 'lucide-react';
import { Source } from '../../types';
import { Badge } from '../ui/Badge';

interface SourceTableProps {
  sources: Source[];
  onTriggerScan: (sourceId: number) => void;
  scanningId?: number | null;
}

export const SourceTable: React.FC<SourceTableProps> = ({
  sources,
  onTriggerScan,
  scanningId
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]/90 shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <th className="py-3.5 px-4">Nama Media & URL</th>
            <th className="py-3.5 px-3">Tipe Sumber</th>
            <th className="py-3.5 px-3">Interval Crawl</th>
            <th className="py-3.5 px-3 text-center">Status</th>
            <th className="py-3.5 px-3 text-center">Total Artikel</th>
            <th className="py-3.5 px-3 text-right">Crawl Terakhir</th>
            <th className="py-3.5 px-4 text-center">Tindakan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {sources.map((source) => {
            const isScanning = scanningId === source.id;
            const isHealthy = source.status === 'ACTIVE' || source.is_active;

            return (
              <tr
                key={source.id}
                className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Media Name & URL */}
                <td className="py-4 px-4 max-w-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                        {source.name}
                      </span>
                      <a
                        href={source.base_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-slate-400 hover:text-sky-500 flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{source.base_url}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    </div>
                  </div>
                </td>

                {/* Source Type */}
                <td className="py-4 px-3">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                    {source.rss_url ? (
                      <Rss className="w-3 h-3 text-amber-500" />
                    ) : (
                      <Globe className="w-3 h-3 text-sky-500" />
                    )}
                    <span>{source.source_type || (source.rss_url ? 'RSS Feed' : 'Web Scraper')}</span>
                  </div>
                </td>

                {/* Interval */}
                <td className="py-4 px-3 font-mono text-slate-600 dark:text-slate-300">
                  {source.crawl_interval ? `Setiap ${source.crawl_interval} mnt` : 'Setiap 15 mnt'}
                </td>

                {/* Status */}
                <td className="py-4 px-3 text-center">
                  <Badge variant={isHealthy ? 'success' : 'danger'} size="sm">
                    {isHealthy ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </td>

                {/* Total Articles */}
                <td className="py-4 px-3 text-center font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {source.article_count || source.articles_count || 0}
                </td>

                {/* Last Crawl */}
                <td className="py-4 px-3 text-right font-mono text-[11px] text-slate-400">
                  {source.last_crawled_at
                    ? new Date(source.last_crawled_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Baru saja'}
                </td>

                {/* Actions */}
                <td className="py-4 px-4 text-center">
                  <button
                    onClick={() => onTriggerScan(source.id)}
                    disabled={isScanning}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isScanning
                        ? 'bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300 cursor-wait'
                        : 'bg-slate-100 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-sky-600'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-sky-500' : ''}`} />
                    <span>{isScanning ? 'Memindai...' : 'Pindai Sekarang'}</span>
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
