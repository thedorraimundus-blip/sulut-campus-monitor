import { AlertRule, AlertItem } from '../types';

export const mockAlertRules: AlertRule[] = [
  {
    id: 1,
    name: "Negative News — UNSRAT",
    condition: "Perguruan Tinggi = UNSRAT & Sentimen = Negative",
    university: "UNSRAT",
    sentiment: "Negative",
    status: "TRIGGERED",
    created_at: "2026-08-15T00:00:00Z",
    trigger_count: 4
  },
  {
    id: 2,
    name: "Crisis Keyword — Tipikor / Korupsi",
    condition: "Keyword memuat 'korupsi' atau 'tipikor'",
    keyword: "korupsi",
    status: "ACTIVE",
    created_at: "2026-08-20T00:00:00Z",
    trigger_count: 2
  },
  {
    id: 3,
    name: "Demonstrasi Kampus Sulut",
    condition: "Keyword memuat 'unjuk rasa' atau 'demo'",
    keyword: "unjuk rasa",
    status: "ACTIVE",
    created_at: "2026-08-25T00:00:00Z",
    trigger_count: 1
  },
  {
    id: 4,
    name: "Beasiswa Monitoring",
    condition: "Kategori = Beasiswa & Sentimen = Positive",
    sentiment: "Positive",
    keyword: "beasiswa",
    status: "ACTIVE",
    created_at: "2026-09-01T00:00:00Z",
    trigger_count: 8
  }
];

export const mockAlertItems: AlertItem[] = [
  {
    id: 1,
    title: "Berita Negatif Terdeteksi: UNSRAT",
    message: "Artikel 'BEM Unsrat Desak Evaluasi Sistem UKT dan Transparansi Fasilitas' memiliki indikasi sentimen negatif (72%).",
    article_id: 6,
    university_id: 1,
    alert_type: "NEGATIVE_SENTIMENT",
    severity: "WARNING",
    is_read: false,
    created_at: "2026-09-04T08:05:00Z"
  },
  {
    id: 2,
    title: "Kata Kunci Krisis: Unjuk Rasa Mahasiswa",
    message: "Deteksi aksi unjuk rasa di lingkungan perguruan tinggi Sulawesi Utara.",
    article_id: 6,
    university_id: 1,
    alert_type: "CRISIS_KEYWORD",
    severity: "WARNING",
    is_read: false,
    created_at: "2026-09-04T08:04:00Z"
  },
  {
    id: 3,
    title: "Pemberitahuan: Akreditasi Unggul UNSRAT",
    message: "Capaian positif akreditasi institusi Unggul oleh Universitas Sam Ratulangi dari BAN-PT.",
    article_id: 1,
    university_id: 1,
    alert_type: "PRESTASI_MAJOR",
    severity: "INFO",
    is_read: true,
    created_at: "2026-09-05T02:46:00Z"
  }
];
