import { AnalyticsSummary } from '../types';

export const mockAnalytics: AnalyticsSummary = {
  total_articles: 1284,
  relevant_articles: 982,
  volume_trend: [
    { date: "07/08", total: 32, relevant: 24 },
    { date: "10/08", total: 45, relevant: 36 },
    { date: "13/08", total: 38, relevant: 29 },
    { date: "16/08", total: 52, relevant: 41 },
    { date: "19/08", total: 41, relevant: 33 },
    { date: "22/08", total: 48, relevant: 37 },
    { date: "25/08", total: 58, relevant: 46 },
    { date: "28/08", total: 64, relevant: 51 },
    { date: "31/08", total: 50, relevant: 39 },
    { date: "03/09", total: 68, relevant: 54 },
    { date: "05/09", total: 47, relevant: 38 }
  ],
  share_of_voice: [
    { name: "UNSRAT", full_name: "Universitas Sam Ratulangi", count: 382 },
    { name: "UNIMA", full_name: "Universitas Negeri Manado", count: 294 },
    { name: "UNKLAB", full_name: "Universitas Klabat", count: 221 },
    { name: "Polimdo", full_name: "Politeknik Negeri Manado", count: 173 },
    { name: "De La Salle", full_name: "Universitas Katolik De La Salle Manado", count: 151 },
    { name: "IAIN Manado", full_name: "IAIN Manado", count: 104 },
    { name: "Poltekkes", full_name: "Poltekkes Kemenkes Manado", count: 88 },
    { name: "ITM", full_name: "Institut Teknologi Minaesa", count: 62 },
    { name: "Prisma", full_name: "Universitas Prisma", count: 54 }
  ],
  sentiment_distribution: [
    { name: "Positif", value: 53, color: "#10b981", count: 684 },
    { name: "Netral", value: 33, color: "#64748b", count: 428 },
    { name: "Negatif", value: 14, color: "#ef4444", count: 132 }
  ],
  category_distribution: [
    { name: "Pendidikan", count: 245 },
    { name: "Prestasi", count: 212 },
    { name: "Mahasiswa", count: 184 },
    { name: "Penelitian", count: 156 },
    { name: "Kegiatan", count: 139 },
    { name: "Kerja Sama", count: 118 },
    { name: "Beasiswa", count: 98 },
    { name: "Rektor", count: 86 },
    { name: "Akademik", count: 74 },
    { name: "Konflik", count: 36 }
  ],
  source_distribution: [
    { name: "Manado Post", count: 428 },
    { name: "Tribun Manado", count: 395 },
    { name: "BeritaManado", count: 342 },
    { name: "SulutPos", count: 184 },
    { name: "Portal Unsrat", count: 112 },
    { name: "Portal Unima", count: 98 }
  ],
  trending_keywords: [
    { text: "UNSRAT", value: 243, trend: "+18%" },
    { text: "MAHASISWA", value: 215, trend: "+12%" },
    { text: "BEASISWA", value: 187, trend: "+15%" },
    { text: "PENELITIAN", value: 164, trend: "+8%" },
    { text: "REKTOR", value: 142, trend: "+5%" },
    { text: "PENDIDIKAN", value: 138, trend: "+9%" },
    { text: "KAMPUS", value: 126, trend: "+7%" },
    { text: "DOSEN", value: 110, trend: "+4%" },
    { text: "UNIMA", value: 98, trend: "+11%" },
    { text: "POLIMDO", value: 85, trend: "+6%" },
    { text: "VOKASI", value: 72, trend: "+14%" },
    { text: "AKREDITASI", value: 68, trend: "+20%" }
  ]
};
