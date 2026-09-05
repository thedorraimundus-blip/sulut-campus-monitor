import { University } from '../types';

export const mockUniversities: University[] = [
  {
    id: 1,
    name: "Universitas Sam Ratulangi",
    short_name: "UNSRAT",
    description: "Perguruan tinggi negeri tertua dan terbesar di Sulawesi Utara berlokasi di Kleak, Manado dengan akreditasi institusi Unggul.",
    website: "https://www.unsrat.ac.id",
    logo: "https://upload.wikimedia.org/wikipedia/id/f/fa/Logo_Unsrat.png",
    city: "Manado",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    aliases: [
      { id: 1, alias: "UNSRAT" },
      { id: 2, alias: "Unsrat" },
      { id: 3, alias: "Universitas Sam Ratulangi Manado" },
      { id: 4, alias: "Kampus Kleak" }
    ],
    article_count: 382,
    positive_count: 214,
    neutral_count: 132,
    negative_count: 36,
    trend: "+18.4%"
  },
  {
    id: 2,
    name: "Universitas Negeri Manado",
    short_name: "UNIMA",
    description: "Perguruan tinggi negeri kependidikan dan vokasi sains unggulan di dataran tinggi Tonsaru, Tondano.",
    website: "https://unima.ac.id",
    logo: "https://upload.wikimedia.org/wikipedia/id/b/b3/Logo_Unima.png",
    city: "Tondano",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    aliases: [
      { id: 5, alias: "UNIMA" },
      { id: 6, alias: "Unima" },
      { id: 7, alias: "Universitas Negeri Manado Tondano" },
      { id: 8, alias: "Kampus Tonsaru" }
    ],
    article_count: 294,
    positive_count: 178,
    neutral_count: 98,
    negative_count: 18,
    trend: "+12.1%"
  },
  {
    id: 3,
    name: "Universitas Klabat",
    short_name: "UNKLAB",
    description: "Perguruan tinggi swasta berstandar internasional dan bilingual di Airmadidi, Minahasa Utara.",
    website: "https://www.unklab.ac.id",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Logo_Universitas_Klabat.png",
    city: "Airmadidi",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    aliases: [
      { id: 9, alias: "UNKLAB" },
      { id: 10, alias: "Unklab" },
      { id: 11, alias: "Universitas Klabat Airmadidi" }
    ],
    article_count: 221,
    positive_count: 165,
    neutral_count: 51,
    negative_count: 5,
    trend: "+15.7%"
  },
  {
    id: 4,
    name: "Politeknik Negeri Manado",
    short_name: "Polimdo",
    description: "Pendidikan tinggi vokasi keteknikan dan pariwisata negeri di Buha, Mapanget, Manado.",
    website: "https://polimdo.ac.id",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Logo_Politeknik_Negeri_Manado.png",
    city: "Manado",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    aliases: [
      { id: 12, alias: "Polimdo" },
      { id: 13, alias: "Politeknik Negeri Manado" },
      { id: 14, alias: "Poltek Manado" }
    ],
    article_count: 173,
    positive_count: 118,
    neutral_count: 49,
    negative_count: 6,
    trend: "+9.5%"
  },
  {
    id: 5,
    name: "Universitas Katolik De La Salle Manado",
    short_name: "De La Salle",
    description: "Kampus swasta Katolik bereputasi internasional di Kombos Kairagi, Manado.",
    website: "https://www.unikadelasalle.ac.id",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Logo_Unika_De_La_Salle_Manado.png",
    city: "Manado",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    aliases: [
      { id: 15, alias: "De La Salle" },
      { id: 16, alias: "Unika De La Salle" },
      { id: 17, alias: "Universitas De La Salle Manado" }
    ],
    article_count: 151,
    positive_count: 108,
    neutral_count: 40,
    negative_count: 3,
    trend: "+11.2%"
  },
  {
    id: 6,
    name: "IAIN Manado",
    short_name: "IAIN Manado",
    description: "Institut Agama Islam Negeri satu-satunya di Sulawesi Utara, pusat kajian moderasi beragama kawasan Pasifik.",
    website: "https://iain-manado.ac.id",
    city: "Manado",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    aliases: [
      { id: 18, alias: "IAIN Manado" },
      { id: 19, alias: "Institut Agama Islam Negeri Manado" }
    ],
    article_count: 104,
    positive_count: 76,
    neutral_count: 26,
    negative_count: 2,
    trend: "+7.8%"
  },
  {
    id: 7,
    name: "Poltekkes Kemenkes Manado",
    short_name: "Poltekkes Manado",
    description: "Institusi pendidikan tinggi tenaga kesehatan di bawah Kementerian Kesehatan RI di Malalayang.",
    website: "https://poltekkesmanado.ac.id",
    city: "Manado",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    aliases: [
      { id: 20, alias: "Poltekkes Manado" },
      { id: 21, alias: "Poltekkes Kemenkes Manado" }
    ],
    article_count: 88,
    positive_count: 64,
    neutral_count: 22,
    negative_count: 2,
    trend: "+6.4%"
  },
  {
    id: 8,
    name: "Institut Teknologi Minaesa",
    short_name: "ITM",
    description: "Kampus rekayasa teknologi dan sains di kota sejuk Tomohon.",
    website: "https://itmtomohon.ac.id",
    city: "Tomohon",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    aliases: [
      { id: 22, alias: "ITM" },
      { id: 23, alias: "ITM Tomohon" },
      { id: 24, alias: "Institut Teknologi Minaesa" }
    ],
    article_count: 62,
    positive_count: 42,
    neutral_count: 18,
    negative_count: 2,
    trend: "+4.1%"
  },
  {
    id: 9,
    name: "Universitas Prisma",
    short_name: "Prisma",
    description: "Universitas swasta dengan fokus keilmuan teknologi digital di Kombos, Manado.",
    website: "https://prisma.ac.id",
    city: "Manado",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    aliases: [
      { id: 25, alias: "Prisma" },
      { id: 26, alias: "Universitas Prisma" }
    ],
    article_count: 54,
    positive_count: 38,
    neutral_count: 15,
    negative_count: 1,
    trend: "+8.9%"
  },
  {
    id: 10,
    name: "STIE Eben Haezar",
    short_name: "Benzar",
    description: "Sekolah Tinggi Ilmu Ekonomi terkemuka di bawah naungan Yayasan Eben Haezar Manado.",
    website: "https://stiebenhaezar.ac.id",
    city: "Manado",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    aliases: [
      { id: 27, alias: "Benzar" },
      { id: 28, alias: "STIE Benzar" },
      { id: 29, alias: "STIE Eben Haezar" }
    ],
    article_count: 46,
    positive_count: 32,
    neutral_count: 13,
    negative_count: 1,
    trend: "+3.2%"
  },
  {
    id: 11,
    name: "STIKES Bethesda Tomohon",
    short_name: "Bethesda",
    description: "Pendidikan keperawatan dan kebidanan bereputasi tinggi di Tomohon di bawah naungan Yayasan GMIM.",
    website: "https://stikesbethesda.ac.id",
    city: "Tomohon",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    aliases: [
      { id: 30, alias: "Bethesda Tomohon" },
      { id: 31, alias: "STIKES Bethesda" }
    ],
    article_count: 41,
    positive_count: 31,
    neutral_count: 9,
    negative_count: 1,
    trend: "+5.5%"
  },
  {
    id: 12,
    name: "Universitas Nusantara Manado",
    short_name: "UNN",
    description: "Universitas swasta di Manado dengan berbagai fakultas ekonomi dan hukum.",
    website: "https://nusantara.ac.id",
    city: "Manado",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    aliases: [
      { id: 32, alias: "UNN" },
      { id: 33, alias: "Universitas Nusantara Manado" }
    ],
    article_count: 37,
    positive_count: 25,
    neutral_count: 11,
    negative_count: 1,
    trend: "+2.8%"
  },
  {
    id: 13,
    name: "Universitas Trinita Manado",
    short_name: "Trinita",
    description: "Kampus kesehatan dan manajemen modern di Manado.",
    website: "https://trinita.ac.id",
    city: "Manado",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    aliases: [
      { id: 34, alias: "Trinita" },
      { id: 35, alias: "Universitas Trinita" }
    ],
    article_count: 29,
    positive_count: 20,
    neutral_count: 8,
    negative_count: 1,
    trend: "+4.6%"
  },
  {
    id: 14,
    name: "Universitas Sari Putra Indonesia Tomohon",
    short_name: "UNSRIT",
    description: "Perguruan tinggi swasta di Kakaskasen, Tomohon.",
    website: "https://unsrit.ac.id",
    city: "Tomohon",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    aliases: [
      { id: 36, alias: "UNSRIT" },
      { id: 37, alias: "Unsrit Tomohon" }
    ],
    article_count: 24,
    positive_count: 16,
    neutral_count: 7,
    negative_count: 1,
    trend: "+1.9%"
  },
  {
    id: 15,
    name: "Universitas Teknologi Sulawesi Utara",
    short_name: "UTSU",
    description: "Pusat studi teknik dan rekayasa di kawasan pusat Kota Manado.",
    website: "https://utsu.ac.id",
    city: "Manado",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    aliases: [
      { id: 38, alias: "UTSU" },
      { id: 39, alias: "Universitas Teknologi Sulawesi Utara" }
    ],
    article_count: 19,
    positive_count: 13,
    neutral_count: 5,
    negative_count: 1,
    trend: "+2.1%"
  }
];
