import React, { useEffect, useState, useMemo } from 'react';
import {
  GraduationCap, Building2, TrendingUp, Search, Award,
  Filter, MapPin, ExternalLink, ArrowRight
} from 'lucide-react';
import { University } from '../types';
import { api } from '../services/api';
import { UniversityStats } from '../components/universities/UniversityStats';
import { UniversityCard } from '../components/universities/UniversityCard';

export const UniversitiesPage: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PTN' | 'PTS'>('ALL');
  const [selectedCity, setSelectedCity] = useState('');

  const fetchUniversities = async () => {
    try {
      const data = await api.getUniversities();
      setUniversities(data);
    } catch (err) {
      console.error('Error fetching universities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const cities = useMemo(() => {
    const list = universities.map((u) => u.city).filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [universities]);

  const filteredUniversities = useMemo(() => {
    return universities.filter((u) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesShort = u.short_name.toLowerCase().includes(q);
        if (!matchesName && !matchesShort) return false;
      }

      if (typeFilter !== 'ALL') {
        const isPTN = u.type === 'PTN' || u.short_name === 'UNSRAT' || u.short_name === 'UNIMA' || u.short_name === 'Polimdo';
        if (typeFilter === 'PTN' && !isPTN) return false;
        if (typeFilter === 'PTS' && isPTN) return false;
      }

      if (selectedCity && u.city !== selectedCity) {
        return false;
      }

      return true;
    });
  }, [universities, search, typeFilter, selectedCity]);

  // Aggregate stats
  const totalCount = universities.length;
  const ptnCount = universities.filter(
    (u) => u.type === 'PTN' || u.short_name === 'UNSRAT' || u.short_name === 'UNIMA' || u.short_name === 'Polimdo'
  ).length;
  const ptsCount = totalCount - ptnCount;
  const topUniv = [...universities].sort((a, b) => b.article_count - a.article_count)[0];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Direktori Perguruan Tinggi Sulawesi Utara
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pantau reputasi, share of voice, profil sentimen, dan tren pemberitaan 15 kampus PTN & PTS di Sulut
        </p>
      </div>

      {/* Aggregate KPI Stats Bar */}
      <UniversityStats
        totalCount={totalCount || 15}
        ptnCount={ptnCount || 3}
        ptsCount={ptsCount || 12}
        topUniversityName={topUniv ? topUniv.short_name : 'UNSRAT'}
        topUniversityArticles={topUniv ? topUniv.article_count : 382}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama kampus (contoh: Unsrat, Unima, Unklab, De La Salle)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-full md:w-auto overflow-x-auto">
            {(['ALL', 'PTN', 'PTS'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  typeFilter === t
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t === 'ALL' ? 'Semua Status' : t}
              </button>
            ))}
          </div>

          {/* City Dropdown */}
          <div className="w-full md:w-44">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <option value="">Semua Lokasi / Kota</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* University Grid */}
      {loading ? (
        <div className="flex justify-center p-16">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredUniversities.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#0f172a]/90 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          Tidak ada perguruan tinggi yang cocok dengan filter pencarian.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUniversities.map((u) => (
            <UniversityCard key={u.id} university={u} />
          ))}
        </div>
      )}
    </div>
  );
};
