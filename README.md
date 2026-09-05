# SULUT CAMPUS MONITOR
### Intelligent Higher Education News Monitoring System
> **"Pantau Perkembangan Perguruan Tinggi Sulawesi Utara dalam Satu Dashboard."**

Sistem monitoring berita profesional berbasis AI/NLP lokal (100% offline tanpa ketergantungan API cloud seperti ChatGPT, OpenAI, Claude, atau Gemini) yang mengumpulkan, membersihkan, dan menganalisis pemberitaan seputar perguruan tinggi di Sulawesi Utara dari media online, portal berita lokal, dan website institusi.

---

## 🏛️ Perguruan Tinggi yang Dipantau
- **Universitas Sam Ratulangi (UNSRAT)** — Manado
- **Universitas Negeri Manado (UNIMA)** — Tondano
- **Universitas Klabat (UNKLAB)** — Airmadidi, Minahasa Utara
- **Universitas Katolik De La Salle Manado** — Manado
- **Politeknik Negeri Manado (Polimdo)** — Manado
- **Institut Teknologi Minaesa (ITM)** — Tomohon
- **Universitas Prisma** — Manado
- **Universitas Nusantara Manado (UNN)** — Manado
- **STIE Eben Haezar (Benzar)** — Manado
- **STIKES Bethesda Tomohon** — Tomohon
- **Poltekkes Kemenkes Manado** — Manado
- **IAIN Manado** — Manado
- **Universitas Trinita Manado** — Manado
- **Universitas Sari Putra Indonesia Tomohon (UNSRIT)** — Tomohon
- **Universitas Teknologi Sulawesi Utara (UTSU)** — Manado

---

## 🧠 Arsitektur Local AI / NLP Engine (100% Offline-First)

```
Raw Article
   │
   ▼
[Text Cleaning & Normalization]
   │
   ▼
[Indonesian Tokenization & Stopwords]
   │
   ▼
[PySastrawi Stemming (LRU Cached)]
   │
   ├──▶ [Campus Relevance Scorer] ──────▶ Skor 0 - 100 (Relevan: Ya/Tidak)
   │
   ├──▶ [University Entity Recognition] ──▶ Exact, Alias, & Fuzzy Match
   │
   ├──▶ [19-Category ML Classifier] ────▶ TF-IDF + MultinomialNB (v1.0.1)
   │
   ├──▶ [Indonesian Sentiment Analyzer] ─▶ Positive, Neutral, Negative (+ Scores)
   │
   └──▶ [Extractive Summarizer] ────────▶ TF-IDF Sentence Salience (2-4 kalimat)
```

### 19 Kategori Berita:
1. *Pendidikan*, 2. *Prestasi*, 3. *Mahasiswa*, 4. *Penelitian*, 5. *Kegiatan*, 6. *Kerja Sama*, 7. *Rektor*, 8. *Dosen*, 9. *Beasiswa*, 10. *Penerimaan Mahasiswa*, 11. *Akademik*, 12. *Infrastruktur*, 13. *Teknologi*, 14. *Organisasi*, 15. *Alumni*, 16. *Kebijakan*, 17. *Konflik*, 18. *Hukum*, 19. *Lainnya*.

---

## 🚀 Fitur Utama

1. **Near Real-Time Live Monitor**: Aliran berita masuk langsung via WebSocket tanpa reload halaman.
2. **Resilient Crawler**:
   - Deteksi RSS/Atom otomatis.
   - Fallback ke trafilatura dan BeautifulSoup untuk scraping HTML bersih.
   - Pengecekan `robots.txt` dengan cache per domain.
   - Perlindungan SSRF (memblokir akses localhost dan IP privat).
   - Deduplikasi ganda: normalisasi URL dan SHA-256 content hash.
3. **Pusat Pemantauan & Filter Multi-Faset**:
   - Pencarian judul dan konten.
   - Filter perguruan tinggi, kategori, sentimen, sumber media, dan slider skor relevansi.
   - Tombol **[Baca Sumber Asli]** untuk menghormati hak cipta penerbit asli.
4. **Dossier Perguruan Tinggi**:
   - Analisis sentimen tiap kampus, volume berita, dan timeline liputan.
5. **Manajemen Sumber Media**:
   - Tambah sumber dengan verifikasi pra-crawl instan (*URL valid, robots.txt, deteksi RSS*).
   - Tombol *Scan Now* dan *Scan All Sources*.
6. **Analitik Visual (Recharts)**:
   - Grafik tren volume berita harian.
   - Share of Voice kampus.
   - Distribusi sentimen.
   - Trending Topics (analisis frekuensi TF-IDF).
7. **Sistem Peringatan Dini (Alerts)**:
   - Deteksi otomatis sentimen negatif dan kata kunci krisis (*korupsi, tawuran, sengketa*).
8. **Manajemen & Pelatihan Model AI**:
   - Metrik Akurasi, Precision, Recall, F1-Score, dan Confusion Matrix.
   - Penambahan sampel artikel baru ke dataset pelatihan.
   - Satu klik tombol **[TRAIN / RETRAIN MODEL]** dengan versioning otomatis (`v1.0.0`, `v1.0.1`, dst.).

---

## 🛠️ Panduan Instalasi & Menjalankan

### Persyaratan Sistem:
- Python 3.10+ (Diuji pada Python 3.14)
- Node.js 18+ (Diuji pada Node.js 24)

### 1. Menjalankan Backend (FastAPI)

```bash
cd backend

# Buat dan aktifkan virtual environment (opsional)
python -m venv .venv
.venv\Scripts\activate   # Windows

# Instal dependensi
pip install -r requirements.txt

# Inisialisasi dan isi data awal database SQLite
python -m app.database.init_db
python -m app.database.seed

# Jalankan server API
uvicorn app.main:app --reload --port 8000
```
- API Swagger UI: `http://localhost:8000/docs`
- Redoc Documentation: `http://localhost:8000/redoc`

### 2. Menjalankan Frontend (React + Vite)

Buka terminal baru:
```bash
cd frontend

# Instal dependensi (jika belum)
npm.cmd install

# Jalankan dev server
npm.cmd run dev
```
Buka browser pada: `http://localhost:5173`

---

## 🔐 Kredensial Administrator Bawaan
- **Username**: `admin`
- **Password**: `admin123`

---

## 🧪 Menjalankan Pengujian (Testing)

Jalankan rangkaian unit & integration tests pada backend:
```bash
cd backend
python -m pytest tests/ -v
```
Pengujian mencakup (**46/46 passed - 100% passing**):
- `test_crawler.py`: Validator SSRF, normalisasi URL, pembersihan HTML.
- `test_crawler_pipeline.py`: Pipeline crawler, deteksi RSS/HTML, deduplikasi URL & SHA-256 content hash, kepatuhan robots.txt, asynchronous crawl execution.
- `test_ai.py`: Tokenizer, Sastrawi stemmer, skor relevansi, entitas kampus, sentimen, summarizer, classifier.
- `test_api.py`: Endpoint dashboard, berita, perguruan tinggi, sumber, analitik, AI status, login admin.
- `test_backend_core.py`: CRUD operations, schema validation, duplicate constraints, auth tokens.
- `test_end_to_end_pipeline.py`: Full end-to-end integration (Source -> Crawler -> DB -> Local AI -> Alert Generation -> Sentiment Confirmation & Traceability -> API endpoints).

---

## ☁️ Panduan Deployment ke Vercel & Production

### 1. Frontend (Vercel)
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_API_BASE_URL`: URL public backend FastAPI Anda (contoh: `https://api.sulutcampusmonitor.id`)
- Konfigurasi SPA routing sudah tersedia otomatis di `frontend/vercel.json`.

### 2. Backend (Docker / VPS / Railway / Render)
- Jalankan via ASGI server:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
  ```
- Persistensi Database: Mount volume persistent pada direktori data (misal: `/app/data/database.sqlite`).
- Security Cron Secret: Set env `CRON_SECRET=your_secret_token`.
- Trigger crawl periodik dapat dipanggil via Vercel Cron atau external cron trigger ke:
  `GET /api/cron/crawl-due` dengan header `Authorization: Bearer <CRON_SECRET>`.

---

## ⚠️ Batasan yang Diketahui (Known Limitations)
1. Kecepatan crawling internet bergantung pada stabilitas koneksi jaringan dan batas laju (*rate-limiting*) domain media bersangkutan.
2. Pemrosesan NLP berjalan sepenuhnya lokal sehingga aman dari kebocoran data (*zero external data leakage*), namun performa bergantung pada CPU lokal pengguna.

