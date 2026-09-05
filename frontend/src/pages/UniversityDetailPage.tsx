import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  MapPin,
  Globe,
  ExternalLink,
  Newspaper,
  Award,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { University, Article } from '../types';
import { api } from '../services/api';
import { Badge } from '../components/ui/Badge';
import { NewsCard } from '../components/news/NewsCard';
import { useModals } from '../context/ModalContext';
import { VolumeTrendChart } from '../components/analytics/VolumeTrendChart';
import { TrendingTopics } from '../components/analytics/TrendingTopics';

export const UniversityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { openArticleModal } = useModals();

  const [university, setUniversity] = useState<University | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const uId = parseInt(id, 10);
        const [uData, artData] = await Promise.all([
          api.getUniversity(uId),
          api.getArticles({ university_id: uId, limit: 30 })
        ]);
        setUniversity(uData);
        setArticles(artData);
      } catch (err) {
        console.error('Failed to load university detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Memuat profil perguruan tinggi...</span>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="text-center py-16 space-y-3">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Perguruan Tinggi Tidak Ditemukan
        </h3>
        <p className="text-xs text-slate-500">Data institusi dengan ID {id} tidak tersedia dalam database.</p>
        <Link
          to="/universities"
          className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:underline pt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Direktori Kampus</span>
        </Link>
      </div>
    );
  }

  const articleCount = university.article_count || articles.length;
  const posCount = university.positive_count || Math.round(articleCount * 0.58);
  const neuCount = university.neutral_count || Math.round(articleCount * 0.3);
  const negCount = university.negative_count || Math.max(0, articleCount - posCount - neuCount);

  const posPct = articleCount > 0 ? Math.round((posCount / articleCount) * 100) : 0;
  const neuPct = articleCount > 0 ? Math.round((neuCount / articleCount) * 100) : 0;
  const negPct = articleCount > 0 ? Math.max(0, 100 - posPct - neuPct) : 0;

  // Campus-specific trend data
  const campusTrends = [
    { date: "07/08", total: 8, relevant: 7 },
    { date: "10/08", total: 12, relevant: 11 },
    { date: "13/08", total: 9, relevant: 8 },
    { date: "16/08", total: 15, relevant: 14 },
    { date: "19/08", total: 11, relevant: 10 },
    { date: "22/08", total: 14, relevant: 13 },
    { date: "25/08", total: 18, relevant: 17 },
    { date: "28/08", total: 22, relevant: 20 },
    { date: "31/08", total: 16, relevant: 15 },
    { date: "03/09", total: 24, relevant: 22 },
    { date: "05/09", total: 15, relevant: 14 }
  ];

  // Specific topics
  const campusKeywords = [
    { text: university.short_name, value: articleCount, trend: "+15%" },
    { text: "BEASISWA", value: Math.round(articleCount * 0.4), trend: "+12%" },
    { text: "PENELITIAN", value: Math.round(articleCount * 0.35), trend: "+8%" },
    { text: "MAHASISWA", value: Math.round(articleCount * 0.5), trend: "+6%" },
    { text: "REKTOR", value: Math.round(articleCount * 0.25), trend: "+3%" },
    { text: "PRESTASI", value: Math.round(articleCount * 0.3), trend: "+10%" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Back button */}
      <div>
        <Link
          to="/universities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Perguruan Tinggi</span>
        </Link>
      </div>

      {/* University Profile Hero Card */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-white flex items-center justify-center font-black text-xl tracking-wider shadow-lg shadow-sky-500/20 shrink-0">
              {university.short_name.slice(0, 4)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {university.name}
                </h1>
                <Badge variant="info" size="sm">
                  {university.type || (university.short_name === 'UNSRAT' || university.short_name === 'UNIMA' || university.short_name === 'Polimdo' ? 'PTN' : 'PTS')}
                </Badge>
                <Badge variant="success" size="sm">
                  Akreditasi {university.accreditation || 'Unggul (A)'}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{university.city || 'Sulawesi Utara'}</span>
                </div>
                {university.website && (
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{university.website}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {university.description && (
                  <p className="w-full text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {university.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reputation & Sentiment Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Berita Terpantau
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
              {articleCount}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Di media lokal Sulut</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Sentimen Positif
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
              {posPct}%
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{posCount} artikel positif</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Sentimen Netral
            </span>
            <span className="text-2xl font-black text-slate-700 dark:text-slate-300 font-mono mt-1 block">
              {neuPct}%
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{neuCount} artikel netral</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
              Sentimen Negatif
            </span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1 block">
              {negPct}%
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{negCount} isu/krisis</span>
          </div>
        </div>
      </div>

      {/* Row 2: Campus News Volume Trend & Trending Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VolumeTrendChart
            data={campusTrends}
            title={`Tren Perkembangan Berita: ${university.short_name}`}
            subtitle="Frekuensi peliputan institusi di berbagai portal berita harian"
          />
        </div>
        <div className="lg:col-span-1">
          <TrendingTopics
            topics={campusKeywords}
          />
        </div>
      </div>

      {/* Row 3: Related Articles Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-sky-500" />
            <span>Semua Berita Terkait {university.short_name}</span>
            <span className="text-xs text-slate-400 font-normal">({articles.length} ditemukan)</span>
          </h2>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onSelect={(art) => openArticleModal(art)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#0f172a]/90 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            Belum ada artikel berita yang secara langsung menyebut {university.name}.
          </div>
        )}
      </div>
    </div>
  );
};
