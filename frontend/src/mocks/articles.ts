import { Article, ArticleDetail } from '../types';

export const mockArticles: ArticleDetail[] = [
  {
    id: 1,
    source_id: 1,
    source_name: "Manado Post",
    title: "Universitas Sam Ratulangi Raih Peringkat Akreditasi Unggul BAN-PT",
    url: "https://manadopost.jawapos.com/pendidikan/2026/09/01/unsrat-akreditasi-unggul-ban-pt",
    canonical_url: "https://manadopost.jawapos.com/pendidikan/2026/09/01/unsrat-akreditasi-unggul-ban-pt",
    author: "Redaksi Manado Post",
    published_at: "2026-09-05T02:45:00Z",
    scraped_at: "2026-09-05T02:46:12Z",
    language: "id",
    is_relevant: true,
    relevance_score: 98,
    is_demo: false,
    content_hash: "a81fe68c93475d81b8389659b87641ccb47f7d189db8e49e6231908bf284892c",
    image_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop",
    excerpt: "Universitas Sam Ratulangi (UNSRAT) Manado resmi mencatatkan sejarah baru dengan mengantongi Akreditasi Unggul dari Badan Akreditasi Nasional Perguruan Tinggi (BAN-PT).",
    summary: "UNSRAT Manado resmi meraih peringkat Akreditasi Unggul dari BAN-PT. Rektor Unsrat mengapresiasi dedikasi civitas akademika dalam menjaga mutu akademik dan riset global. Capaian ini memperkokoh posisi Unsrat di tingkat internasional.",
    content: `MANADO — Universitas Sam Ratulangi (UNSRAT) Manado mencatatkan sejarah baru dengan resmi meraih peringkat Akreditasi Unggul dari Badan Akreditasi Nasional Perguruan Tinggi (BAN-PT). 

Rektor Unsrat Prof. Dr. Ir. Oktovian Berty Alexander Sompie, M.Eng., IPU., ASEAN Eng menyampaikan apresiasi setinggi-tingginya kepada seluruh dosen, tenaga kependidikan, serta mahasiswa yang telah bekerja keras mempersiapkan borang akreditasi institusi.

"Capaian ini adalah bukti komitmen Unsrat dalam meningkatkan standar mutu akademik, riset internasional, serta pelayanan kepada mahasiswa. Unsrat terus memperkuat kerja sama dengan perguruan tinggi dunia dan siap bersaing di kancah global," tegas Rektor saat memberikan sambutan di Auditorium Kampus Unsrat Kleak, Manado.

Peringkat Unggul ini diharapkan dapat memacu peningkatan publikasi jurnal internasional bereputasi serta pembukaan program studi bertaraf dunia di kawasan Pasifik.`,
    universities: [
      {
        university_id: 1,
        university_name: "Universitas Sam Ratulangi",
        short_name: "UNSRAT",
        confidence_score: 0.98
      }
    ],
    categories: [
      {
        category_id: 2,
        category_name: "Prestasi",
        confidence_score: 0.96
      }
    ],
    sentiment: {
      sentiment: "Positive",
      positive_score: 0.94,
      neutral_score: 0.05,
      negative_score: 0.01
    },
    key_topics: ["UNSRAT", "AKREDITASI UNGGUL", "BAN-PT", "REKTOR", "MUTU PENDIDIKAN"]
  },
  {
    id: 2,
    source_id: 3,
    source_name: "BeritaManado",
    title: "Mahasiswa UNIMA Ciptakan Alat Pengering Cengkih Cerdas Berbasis Energi Surya di Minahasa",
    url: "https://beritamanado.com/mahasiswa-unima-ciptakan-alat-pengering-cengkih-cerdas-di-minahasa",
    canonical_url: "https://beritamanado.com/mahasiswa-unima-ciptakan-alat-pengering-cengkih-cerdas-di-minahasa",
    author: "Fransiskus",
    published_at: "2026-09-05T01:15:00Z",
    scraped_at: "2026-09-05T01:16:30Z",
    language: "id",
    is_relevant: true,
    relevance_score: 95,
    is_demo: false,
    content_hash: "b92ef79d04586e92c9490760c98752ddc58f8e290ec9f50f7342019ce395903d",
    image_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop",
    excerpt: "Tim mahasiswa Fakultas Teknik Universitas Negeri Manado (UNIMA) sukses mengembangkan mesin pengering cengkih cerdas bertenaga panel surya.",
    summary: "Mahasiswa Fakultas Teknik UNIMA menciptakan mesin pengering cengkih cerdas bertenaga panel surya dan IoT. Inovasi ini membantu petani Minahasa mengeringkan hasil panen di segala kondisi cuaca.",
    content: `TONDANO — Tim mahasiswa Fakultas Teknik Universitas Negeri Manado (UNIMA) berhasil menciptakan inovasi berupa mesin pengering cengkih cerdas berbasis solar cell dan sensor IoT.

Inovasi ini ditujukan langsung untuk membantu para petani cengkih di Kabupaten Minahasa agar tidak lagi bergantung pada cuaca terik saat musim penghujan tiba. Alat ini mampu mengontrol kelembaban secara otomatis dan mempercepat pengeringan hingga 40%.

Dekan FT Unima menyatakan kebanggaannya atas karya mahasiswa yang langsung menjawab persoalan riil masyarakat Sulawesi Utara dan mendorong hilirisasi paten ke industri lokal.`,
    universities: [
      {
        university_id: 2,
        university_name: "Universitas Negeri Manado",
        short_name: "UNIMA",
        confidence_score: 0.95
      }
    ],
    categories: [
      {
        category_id: 4,
        category_name: "Penelitian",
        confidence_score: 0.92
      }
    ],
    sentiment: {
      sentiment: "Positive",
      positive_score: 0.91,
      neutral_score: 0.08,
      negative_score: 0.01
    },
    key_topics: ["UNIMA", "PENELITIAN", "INOVASI", "PETANI CENGKIH", "MINAHASA"]
  },
  {
    id: 3,
    source_id: 2,
    source_name: "Tribun Manado",
    title: "Universitas Klabat Resmikan Center of Excellence AI dan Cloud Computing di Airmadidi",
    url: "https://manado.tribunnews.com/unklab-resmikan-ai-center-kerja-sama-global",
    canonical_url: "https://manado.tribunnews.com/unklab-resmikan-ai-center-kerja-sama-global",
    author: "Yohanes Sondakh",
    published_at: "2026-09-04T22:30:00Z",
    scraped_at: "2026-09-04T22:32:00Z",
    language: "id",
    is_relevant: true,
    relevance_score: 94,
    is_demo: false,
    content_hash: "c03fa80e15697f03d0501871d09863eec69f9f301fd0a61a8453120df406014e",
    image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop",
    excerpt: "Universitas Klabat (UNKLAB) meresmikan fasilitas laboratorium riset kecerdasan buatan mutakhir hasil kerja sama dengan industri teknologi global.",
    summary: "Universitas Klabat meresmikan Center of Excellence bidang AI dan Cloud Computing. Kampus Airmadidi ini membekali mahasiswa Fakultas Ilmu Komputer dengan keahlian teknologi terkini.",
    content: `AIRMADIDI — Universitas Klabat (UNKLAB) yang berlokasi di Airmadidi, Minahasa Utara, baru saja meresmikan kerja sama strategis internasional guna pembangunan Center of Excellence bidang Kecerdasan Buatan (AI) dan Cloud Computing.

Presiden UNKLAB menyatakan bahwa kampus berkomitmen membekali mahasiswa Fakultas Ilmu Komputer dengan keahlian teknologi terkini yang siap diserap pasar kerja dunia.

Fasilitas ini dilengkapi superkomputer GPU berkecepatan tinggi untuk melatih model pembelajaran mesin lokal dan sistem visi komputer.`,
    universities: [
      {
        university_id: 3,
        university_name: "Universitas Klabat",
        short_name: "UNKLAB",
        confidence_score: 0.96
      }
    ],
    categories: [
      {
        category_id: 6,
        category_name: "Kerja Sama",
        confidence_score: 0.89
      }
    ],
    sentiment: {
      sentiment: "Positive",
      positive_score: 0.89,
      neutral_score: 0.10,
      negative_score: 0.01
    },
    key_topics: ["UNKLAB", "KECERDASAN BUATAN", "KERJA SAMA", "AIRMADIDI", "TEKNOLOGI"]
  },
  {
    id: 4,
    source_id: 1,
    source_name: "Manado Post",
    title: "Politeknik Negeri Manado Buka SPMB Jalur Kerja Sama Industri Manufaktur",
    url: "https://manadopost.jawapos.com/polimdo-buka-spmb-vokasi-industri",
    canonical_url: "https://manadopost.jawapos.com/polimdo-buka-spmb-vokasi-industri",
    author: "Glen Mantiri",
    published_at: "2026-09-04T18:10:00Z",
    scraped_at: "2026-09-04T18:12:00Z",
    language: "id",
    is_relevant: true,
    relevance_score: 92,
    is_demo: false,
    content_hash: "d14ab91f26708a14e1612982e10974ffc70a0a412fd1b72b9564231df517125f",
    image_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop",
    excerpt: "Politeknik Negeri Manado (Polimdo) resmi mengumumkan pembukaan penerimaan mahasiswa baru jalur ikatan kerja sama industri.",
    summary: "Politeknik Negeri Manado membuka pendaftaran jalur kerja sama industri yang menghubungkan mahasiswa langsung ke dunia kerja dan magang internasional ke Jerman dan Jepang.",
    content: `MANADO — Politeknik Negeri Manado (Polimdo) resmi mengumumkan pembukaan penerimaan mahasiswa baru (SPMB) jalur ikatan kerja sama industri manufaktur dan keteknikan.

Direktur Polimdo Dra. Maryke Alelo, MBA menerangkan bahwa program ini menjamin lulusan langsung diserap bekerja di industri nasional maupun magang ke Jepang dan Jerman.

Calon pendaftar dapat mengakses portal resmi Polimdo mulai pekan depan dan melengkapi berkas administrasi.`,
    universities: [
      {
        university_id: 4,
        university_name: "Politeknik Negeri Manado",
        short_name: "Polimdo",
        confidence_score: 0.94
      }
    ],
    categories: [
      {
        category_id: 10,
        category_name: "Penerimaan Mahasiswa",
        confidence_score: 0.91
      }
    ],
    sentiment: {
      sentiment: "Neutral",
      positive_score: 0.25,
      neutral_score: 0.72,
      negative_score: 0.03
    },
    key_topics: ["POLIMDO", "SPMB", "VOKASI", "MAGANG JEPANG", "INDUSTRI"]
  },
  {
    id: 5,
    source_id: 3,
    source_name: "BeritaManado",
    title: "Mahasiswa De La Salle Manado Gelar Aksi Solidaritas Sosial Bantu Korban Banjir Manado",
    url: "https://beritamanado.com/mahasiswa-de-la-salle-manado-bantu-korban-banjir",
    canonical_url: "https://beritamanado.com/mahasiswa-de-la-salle-manado-bantu-korban-banjir",
    author: "Clara Runtu",
    published_at: "2026-09-04T12:00:00Z",
    scraped_at: "2026-09-04T12:02:15Z",
    language: "id",
    is_relevant: true,
    relevance_score: 88,
    is_demo: false,
    content_hash: "e25bc02a37819b25f2723093f21085aac81b1b523fe2c83ca675342ea628236a",
    image_url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop",
    excerpt: "Korps relawan BEM Unika De La Salle Manado turun menyalurkan bantuan makanan dan obat-obatan bagi korban terdampak genangan air.",
    summary: "Mahasiswa Universitas Katolik De La Salle Manado menunjukkan kepedulian sosial dengan membantu warga terdampak banjir di Manado serta membagikan logistik siap saji.",
    content: `MANADO — Korps relawan Badan Eksekutif Mahasiswa (BEM) Universitas Katolik De La Salle Manado turun ke sejumlah titik terdampak genangan air di Kota Manado.

Mereka membagikan makanan siap saji, obat-obatan ringan, serta membantu membersihkan fasilitas umum warga. Aksi ini mendapat apresiasi hangat dari warga sekitar kampus Kairagi.`,
    universities: [
      {
        university_id: 5,
        university_name: "Universitas Katolik De La Salle Manado",
        short_name: "De La Salle",
        confidence_score: 0.95
      }
    ],
    categories: [
      {
        category_id: 5,
        category_name: "Kegiatan",
        confidence_score: 0.88
      }
    ],
    sentiment: {
      sentiment: "Positive",
      positive_score: 0.85,
      neutral_score: 0.13,
      negative_score: 0.02
    },
    key_topics: ["DE LA SALLE", "BEM", "BAKTI SOSIAL", "BANJIR MANADO", "PEDULI"]
  },
  {
    id: 6,
    source_id: 2,
    source_name: "Tribun Manado",
    title: "BEM Unsrat Desak Evaluasi Sistem UKT dan Transparansi Fasilitas Laboratorium Kampus",
    url: "https://manado.tribunnews.com/bem-unsrat-evaluasi-ukt-lab",
    canonical_url: "https://manado.tribunnews.com/bem-unsrat-evaluasi-ukt-lab",
    author: "Rivaldo Pontoh",
    published_at: "2026-09-04T08:00:00Z",
    scraped_at: "2026-09-04T08:02:40Z",
    language: "id",
    is_relevant: true,
    relevance_score: 96,
    is_demo: false,
    content_hash: "f36cd13b48920c3603834104032196bbd92c2c634af3d94db786453fb739347b",
    image_url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop",
    excerpt: "Perwakilan BEM se-Universitas Sam Ratulangi menggelar audiensi di kantor rektorat menyampaikan evaluasi penggolongan UKT.",
    summary: "BEM Unsrat menggelar audiensi menyampaikan aspirasi penyesuaian UKT semester akhir dan peremajaan alat laboratorium sains. Pihak pimpinan universitas berjanji membentuk tim investigasi bersama.",
    content: `MANADO — Ratusan perwakilan mahasiswa BEM se-Universitas Sam Ratulangi menggelar audiensi terbuka di depan gedung rektorat Unsrat.

Mahasiswa menuntut adanya peninjauan kembali penggolongan UKT mahasiswa semester akhir serta transparansi anggaran peremajaan fasilitas alat laboratorium sains. Pihak rektorat menerima perwakilan mahasiswa dan berkomitmen mencari titik temu.`,
    universities: [
      {
        university_id: 1,
        university_name: "Universitas Sam Ratulangi",
        short_name: "UNSRAT",
        confidence_score: 0.97
      }
    ],
    categories: [
      {
        category_id: 17,
        category_name: "Konflik",
        confidence_score: 0.94
      }
    ],
    sentiment: {
      sentiment: "Negative",
      positive_score: 0.06,
      neutral_score: 0.22,
      negative_score: 0.72
    },
    key_topics: ["UNSRAT", "BEM", "UKT", "REKTORAT", "TUNTUTAN"]
  },
  {
    id: 7,
    source_id: 4,
    source_name: "SulutPos",
    title: "Gubernur Sulut Serahkan Bantuan Beasiswa Pendidikan untuk 500 Mahasiswa di Manado",
    url: "https://sulutpos.com/gubernur-sulut-serahkan-beasiswa-mahasiswa",
    canonical_url: "https://sulutpos.com/gubernur-sulut-serahkan-beasiswa-mahasiswa",
    author: "Marten Rumagit",
    published_at: "2026-09-03T10:00:00Z",
    scraped_at: "2026-09-03T10:05:00Z",
    language: "id",
    is_relevant: true,
    relevance_score: 91,
    is_demo: false,
    content_hash: "047de24c59031d4714945215143207cce03d3d745bf4ea5ec8975640c840458c",
    image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop",
    excerpt: "Pemprov Sulawesi Utara kembali merealisasikan program beasiswa bagi 500 mahasiswa berprestasi dan kurang mampu dari berbagai kampus.",
    summary: "Pemprov Sulawesi Utara menyalurkan beasiswa pendidikan kepada 500 mahasiswa berprestasi dari Unsrat, Unima, IAIN Manado, dan Polimdo untuk mendorong generasi unggul Sulut.",
    content: `MANADO — Pemerintah Provinsi Sulawesi Utara kembali merealisasikan program beasiswa bagi 500 mahasiswa berprestasi dan kurang mampu dari berbagai kampus seperti Unsrat, Unima, IAIN Manado, dan Polimdo.

Gubernur menegaskan bahwa investasi sumber daya manusia generasi muda Sulut adalah kunci menyongsong Indonesia Emas 2045. Bantuan langsung ditransfer ke rekening mahasiswa.`,
    universities: [
      {
        university_id: 1,
        university_name: "Universitas Sam Ratulangi",
        short_name: "UNSRAT",
        confidence_score: 0.85
      },
      {
        university_id: 2,
        university_name: "Universitas Negeri Manado",
        short_name: "UNIMA",
        confidence_score: 0.82
      }
    ],
    categories: [
      {
        category_id: 9,
        category_name: "Beasiswa",
        confidence_score: 0.95
      }
    ],
    sentiment: {
      sentiment: "Positive",
      positive_score: 0.88,
      neutral_score: 0.10,
      negative_score: 0.02
    },
    key_topics: ["BEASISWA", "GUBERNUR SULUT", "UNSRAT", "UNIMA", "MAHASISWA"]
  },
  {
    id: 8,
    source_id: 3,
    source_name: "BeritaManado",
    title: "IAIN Manado Sukses Jadi Tuan Rumah Konferensi Moderasi Beragama Kawasan Pasifik",
    url: "https://beritamanado.com/iain-manado-konferensi-internasional-moderasi",
    canonical_url: "https://beritamanado.com/iain-manado-konferensi-internasional-moderasi",
    author: "Ahmad Dani",
    published_at: "2026-09-02T15:00:00Z",
    scraped_at: "2026-09-02T15:04:20Z",
    language: "id",
    is_relevant: true,
    relevance_score: 90,
    is_demo: false,
    content_hash: "158ef35d60142e5825056326254318ddf14e4e856cf5fb6fd9086751d951569d",
    image_url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop",
    excerpt: "IAIN Manado sukses menggelar konferensi internasional mengenai moderasi beragama bersama akademisi kawasan Asia Pasifik.",
    summary: "IAIN Manado menjadi tuan rumah konferensi internasional moderasi beragama dengan peserta dari Australia, Filipina, dan Malaysia yang menegaskan Sulut sebagai rujukan toleransi.",
    content: `MANADO — Institut Agama Islam Negeri (IAIN) Manado sukses menyelenggarakan The 3rd International Conference on Religious Moderation yang dihadiri pakar dari Malaysia, Filipina, dan Australia.

Rektor IAIN Manado menegaskan peran Sulut sebagai laboratorium kerukunan antarumat beragama di Indonesia yang patut dicontoh masyarakat global.`,
    universities: [
      {
        university_id: 6,
        university_name: "IAIN Manado",
        short_name: "IAIN Manado",
        confidence_score: 0.96
      }
    ],
    categories: [
      {
        category_id: 5,
        category_name: "Kegiatan",
        confidence_score: 0.90
      }
    ],
    sentiment: {
      sentiment: "Positive",
      positive_score: 0.87,
      neutral_score: 0.11,
      negative_score: 0.02
    },
    key_topics: ["IAIN MANADO", "MODERASI BERAGAMA", "KONFERENSI", "PASIFIK"]
  },
  {
    id: 9,
    source_id: 2,
    source_name: "Tribun Manado",
    title: "Arus Lalu Lintas di Kawasan Boulevard Pierre Tendean Manado Terpantau Padat",
    url: "https://manado.tribunnews.com/lalu-lintas-boulevard-manado-padat",
    canonical_url: "https://manado.tribunnews.com/lalu-lintas-boulevard-manado-padat",
    author: "Tim Redaksi",
    published_at: "2026-09-05T03:10:00Z",
    scraped_at: "2026-09-05T03:11:00Z",
    language: "id",
    is_relevant: false,
    relevance_score: 4,
    is_demo: false,
    content_hash: "269fa46e71253f6936167437365429eea25f5f967df6ac70ea197862ea62670e",
    excerpt: "Arus kendaraan bermotor di sepanjang jalan Pierre Tendean Boulevard Manado terpantau padat merayap menjelang akhir pekan.",
    summary: "Kemacetan terpantau di ruas Jalan Boulevard Manado akibat peningkatan volume kendaraan akhir pekan dan aktivitas perbelanjaan di pusat kota.",
    content: `MANADO — Arus lalu lintas di sepanjang jalan utama Pierre Tendean Boulevard Manado terpantau padat merayap pada Jumat sore.

Petugas kepolisian lalu lintas dan dinas perhubungan dikerahkan di titik persimpangan guna mengurai kemacetan akibat membludaknya kendaraan warga yang menuju pusat perbelanjaan tepi pantai.`,
    universities: [],
    categories: [
      {
        category_id: 19,
        category_name: "Lainnya",
        confidence_score: 0.85
      }
    ],
    sentiment: {
      sentiment: "Neutral",
      positive_score: 0.10,
      neutral_score: 0.80,
      negative_score: 0.10
    },
    key_topics: ["LALU LINTAS", "BOULEVARD", "MANADO", "KENDARAAN"]
  }
];
