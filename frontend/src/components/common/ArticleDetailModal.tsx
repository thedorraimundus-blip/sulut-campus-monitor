import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Sparkles, Building2, Tag, Calendar, User, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Article } from '../../types';
import { api } from '../../services/api';

interface ArticleDetailModalProps {
  article: Article | null;
  onClose: () => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  const sentiment = article.sentiment;
  const [confirmStatus, setConfirmStatus] = useState<string>(
    article.sentiment?.confirmation_status || 'PENDING'
  );
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    setConfirmStatus(article.sentiment?.confirmation_status || 'PENDING');
  }, [article]);

  const handleConfirmSentiment = async (status: 'CONFIRMED' | 'REJECTED') => {
    setIsConfirming(true);
    try {
      await api.confirmSentiment(article.id, status, article.sentiment?.sentiment);
      setConfirmStatus(status);
      if (article.sentiment) {
        article.sentiment.confirmation_status = status;
      }
    } catch (err) {
      console.error('Error confirming sentiment:', err);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300">
              {article.source_name || 'Media Online'}
            </span>
            {article.is_demo && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                DEMO DATA
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50 leading-snug">
              {article.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
              {article.published_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(article.published_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                </div>
              )}
              {article.author && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{article.author}</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Intelligence Card */}
          <div className="bg-gradient-to-br from-sky-50 to-blue-50/50 dark:from-slate-800/80 dark:to-slate-800/40 border border-sky-100 dark:border-slate-700/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-semibold text-xs tracking-wider uppercase">
                <Sparkles className="w-4 h-4 text-sky-500" />
                Analisis AI Lokal (Offline Engine)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Skor Relevansi Kampus:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  article.relevance_score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                  article.relevance_score >= 50 ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {article.relevance_score}%
                </span>
              </div>
            </div>

            {/* University & Category Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Perguruan Tinggi:</span>
                <div className="flex flex-wrap gap-1">
                  {article.universities.length > 0 ? (
                    article.universities.map((u) => (
                      <span key={u.university_id} className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded">
                        <Building2 className="w-3 h-3" />
                        {u.short_name} ({Math.round(u.confidence_score * 100)}%)
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Umum / Tidak spesifik</span>
                  )}
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Kategori Berita:</span>
                <div className="flex flex-wrap gap-1">
                  {article.categories.length > 0 ? (
                    article.categories.map((c) => (
                      <span key={c.category_id} className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                        <Tag className="w-3 h-3" />
                        {c.category_name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Pendidikan</span>
                  )}
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Analisis Sentimen:</span>
                {sentiment ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        sentiment.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' :
                        sentiment.sentiment === 'Negative' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {sentiment.sentiment}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        +{Math.round(sentiment.positive_score * 100)}% / -{Math.round(sentiment.negative_score * 100)}%
                      </span>
                    </div>

                    {/* Human Confirmation Section */}
                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                      {confirmStatus === 'CONFIRMED' ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Status Sentimen: Terkonfirmasi</span>
                        </div>
                      ) : confirmStatus === 'REJECTED' ? (
                        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Status Sentimen: Ditolak / Tidak Sesuai</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 block">Verifikasi Analisis AI:</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={isConfirming}
                              onClick={() => handleConfirmSentiment('CONFIRMED')}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-all disabled:opacity-50"
                            >
                              Konfirmasi
                            </button>
                            <button
                              disabled={isConfirming}
                              onClick={() => handleConfirmSentiment('REJECTED')}
                              className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-[10px] font-bold transition-all disabled:opacity-50"
                            >
                              Tolak
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Netral</span>
                )}
              </div>
            </div>

            {/* AI Extractive Summary */}
            {article.summary && (
              <div className="pt-2 border-t border-sky-100 dark:border-slate-700/60">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ringkasan Ekstraktif AI:
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-white/50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  "{article.summary}"
                </p>
              </div>
            )}
          </div>

          {/* Article Excerpt / Snippet */}
          {article.excerpt && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cuplikan Artikel</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {article.excerpt}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Terdeteksi sistem: {new Date(article.scraped_at).toLocaleTimeString('id-ID')}
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm shadow-sky-600/20"
          >
            <span>Baca Sumber Asli</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
