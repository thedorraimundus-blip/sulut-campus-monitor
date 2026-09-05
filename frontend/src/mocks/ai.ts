import { AIStatus, AiModel, AiPipelineNode, TrainingDataRecord } from '../types';

export const mockAiStatus: AIStatus = {
  model_version: "v1.0.1",
  is_bootstrap: false,
  accuracy: 0.942,
  precision: 0.938,
  recall: 0.925,
  f1_score: 0.931,
  dataset_size: 68,
  last_trained: "2026-09-05T05:00:00Z",
  classes_count: 19,
  status_label: "Ready",
  queue_count: 0
};

export const mockAiModels: AiModel[] = [
  {
    id: "rel-1",
    name: "Relevance Classifier",
    version: "v1.0.1",
    type: "Binary Campus Relevance (0-100%)",
    status: "ACTIVE",
    accuracy: 0.965,
    samples: 68,
    last_trained: "2026-09-05",
    description: "Membedakan berita seputar perguruan tinggi Sulut dari berita umum non-akademik."
  },
  {
    id: "cat-1",
    name: "19-Category News Classifier",
    version: "v1.0.1",
    type: "TF-IDF + MultinomialNB Multiclass",
    status: "ACTIVE",
    accuracy: 0.942,
    samples: 68,
    last_trained: "2026-09-05",
    description: "Klasifikasi otomatis 19 topik: Prestasi, Penelitian, Mahasiswa, Rektor, Beasiswa, dll."
  },
  {
    id: "sent-1",
    name: "Indonesian Sentiment Analyzer",
    version: "v1.0.1",
    type: "Rule-Assisted Lexicon + Polar Confidence",
    status: "ACTIVE",
    accuracy: 0.921,
    samples: 68,
    last_trained: "2026-09-05",
    description: "Analisis polaritas sentimen positif, netral, negatif dengan penanganan negasi bahasa Indonesia."
  },
  {
    id: "ent-1",
    name: "University Entity Detector",
    version: "v1.0.1",
    type: "Multi-Strategy Alias & Fuzzy Matcher",
    status: "ACTIVE",
    accuracy: 0.985,
    samples: 68,
    last_trained: "2026-09-05",
    description: "Mendeteksi nama kampus dan alias resmi 15 perguruan tinggi di Sulawesi Utara."
  }
];

export const mockAiPipelineNodes: AiPipelineNode[] = [
  { id: "1", label: "ARTICLE INGESTION", sublabel: "Trafilatura & RSS Extractor", status: "ACTIVE", latency_ms: 4 },
  { id: "2", label: "TEXT CLEANING", sublabel: "HTML stripping & Regex Cleanser", status: "ACTIVE", latency_ms: 6 },
  { id: "3", label: "TOKENIZATION", sublabel: "Indonesian Stopwords Filtering", status: "ACTIVE", latency_ms: 11 },
  { id: "4", label: "SASTRAWI STEMMING", sublabel: "LRU Memory Cached Root Words", status: "ACTIVE", latency_ms: 22 },
  { id: "5", label: "TF-IDF VECTORIZATION", sublabel: "1-2 Gram Term Frequency Matrix", status: "ACTIVE", latency_ms: 14 },
  { id: "6", label: "RELEVANCE SCORER", sublabel: "Campus Keyword Scoring (0-100)", status: "ACTIVE", latency_ms: 9 },
  { id: "7", label: "ENTITY RECOGNITION", sublabel: "15 Sulut Universities & Aliases", status: "ACTIVE", latency_ms: 16 },
  { id: "8", label: "CATEGORY CLASSIFIER", sublabel: "19 Higher Ed News Classes", status: "ACTIVE", latency_ms: 12 },
  { id: "9", label: "SENTIMENT POLARITY", sublabel: "Positive / Neutral / Negative", status: "ACTIVE", latency_ms: 10 },
  { id: "10", label: "EXTRACTIVE SUMMARY", sublabel: "TF-IDF Sentence Salience Rank", status: "ACTIVE", latency_ms: 15 },
  { id: "11", label: "SQLITE STORAGE", sublabel: "Zero External Cloud Transmission", status: "ACTIVE", latency_ms: 5 }
];

export const mockTrainingDataset: TrainingDataRecord[] = [
  {
    id: 1,
    text: "Mahasiswa Unsrat berhasil meraih medali emas dalam kompetisi karya ilmiah nasional di Jakarta",
    category: "Prestasi",
    sentiment: "Positive",
    university: "UNSRAT",
    is_relevant: true,
    created_at: "2026-09-01T10:00:00Z"
  },
  {
    id: 2,
    text: "Tim robotik Unima juara satu lomba robot cerdas tingkat nasional kategori autonomous",
    category: "Prestasi",
    sentiment: "Positive",
    university: "UNIMA",
    is_relevant: true,
    created_at: "2026-09-01T11:00:00Z"
  },
  {
    id: 3,
    text: "Unsrat resmi membuka pendaftaran jalur SNBP dan SNBT tahun akademik baru untuk calon mahasiswa",
    category: "Penerimaan Mahasiswa",
    sentiment: "Neutral",
    university: "UNSRAT",
    is_relevant: true,
    created_at: "2026-09-02T09:30:00Z"
  },
  {
    id: 4,
    text: "Pemprov Sulut kembali mengucurkan beasiswa pendidikan untuk mahasiswa kurang mampu dan berprestasi",
    category: "Beasiswa",
    sentiment: "Positive",
    university: "UNSRAT",
    is_relevant: true,
    created_at: "2026-09-02T14:15:00Z"
  },
  {
    id: 5,
    text: "Dosen Fakultas Teknik Unima ciptakan alat pengering cengkih cerdas bertenaga panel surya",
    category: "Penelitian",
    sentiment: "Positive",
    university: "UNIMA",
    is_relevant: true,
    created_at: "2026-09-03T08:00:00Z"
  },
  {
    id: 6,
    text: "Rektor Unsrat lantik puluhan dekan dan ketua lembaga baru di lingkungan kampus Kleak",
    category: "Rektor",
    sentiment: "Neutral",
    university: "UNSRAT",
    is_relevant: true,
    created_at: "2026-09-03T13:00:00Z"
  },
  {
    id: 7,
    text: "Ratusan mahasiswa gelar unjuk rasa di rektorat tuntut keringanan biaya kuliah tunggal UKT",
    category: "Konflik",
    sentiment: "Negative",
    university: "UNSRAT",
    is_relevant: true,
    created_at: "2026-09-04T10:00:00Z"
  },
  {
    id: 8,
    text: "Arus lalu lintas di jalan Boulevard Pierre Tendean Manado terpantau padat merayap sore ini",
    category: "Lainnya",
    sentiment: "Neutral",
    is_relevant: false,
    created_at: "2026-09-04T16:00:00Z"
  }
];
