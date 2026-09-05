import React from 'react';
import { GraduationCap, Building2, TrendingUp, Award } from 'lucide-react';
import { Card } from '../ui/Card';

interface UniversityStatsProps {
  totalCount: number;
  ptnCount: number;
  ptsCount: number;
  topUniversityName: string;
  topUniversityArticles: number;
}

export const UniversityStats: React.FC<UniversityStatsProps> = ({
  totalCount,
  ptnCount,
  ptsCount,
  topUniversityName,
  topUniversityArticles
}) => {
  const stats = [
    {
      label: 'Perguruan Tinggi Terdaftar',
      value: totalCount,
      sublabel: 'Sulawesi Utara (PTN & PTS)',
      icon: GraduationCap,
      color: 'text-sky-500 bg-sky-500/10'
    },
    {
      label: 'Perguruan Tinggi Negeri',
      value: ptnCount,
      sublabel: 'UNSRAT, UNIMA, Polimdo, dll.',
      icon: Building2,
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      label: 'Perguruan Tinggi Swasta',
      value: ptsCount,
      sublabel: 'UNKLAB, De La Salle, dll.',
      icon: Award,
      color: 'text-indigo-500 bg-indigo-500/10'
    },
    {
      label: 'Volume Liputan Tertinggi',
      value: topUniversityName,
      sublabel: `${topUniversityArticles} artikel terdeteksi`,
      icon: TrendingUp,
      color: 'text-amber-500 bg-amber-500/10',
      isText: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block truncate">
                {stat.label}
              </span>
              <div className={`font-black text-slate-900 dark:text-slate-50 leading-tight mt-0.5 truncate ${
                stat.isText ? 'text-lg' : 'text-2xl'
              }`}>
                {stat.value}
              </div>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 block truncate mt-0.5">
                {stat.sublabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
