"""
SULUT CAMPUS MONITOR — Database Seed Script
============================================
Seeds foundational data ONLY:
  - Admin user
  - 15 Sulut universities + aliases
  - 21 article categories
  - 4 verified working news sources (RSS feeds confirmed live)
  - Keyword alert rules
  - System settings
  - Initial model version record

NOTE: No demo/fake articles are seeded.
      Articles are populated exclusively by the real crawler.
      Run: POST /api/sources/scan-all or click "Scan All Sources" in UI.
"""

import datetime
from app.database.database import SessionLocal, engine, Base
from app.database.models import (
    User, Source, University, UniversityAlias, Category,
    Setting, KeywordRule, ModelVersion
)
from app.utils.security import hash_password
from app.utils.logger import logger


def seed():
    logger.info("Seeding initial data for SULUT CAMPUS MONITOR...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # ------------------------------------------------------------------ #
    # 1. Admin User
    # ------------------------------------------------------------------ #
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin = User(
            username="admin",
            hashed_password=hash_password("Deo100105"),
            email="admin@sulutcampusmonitor.id",
            role="admin",
            is_active=True,
        )
        db.add(admin)
        logger.info("Created default admin user (admin / Deo100105).")
    else:
        # Update password if admin already exists
        admin.hashed_password = hash_password("Deo100105")
        logger.info("Updated admin password to new value.")

    # ------------------------------------------------------------------ #
    # 2. Article Categories (21 categories)
    # ------------------------------------------------------------------ #
    categories_data = [
        ("Pendidikan",           "Berita umum kurikulum, pengajaran, dan sistem pendidikan tinggi"),
        ("Prestasi",             "Pencapaian, medali, juara lomba akademik dan non-akademik"),
        ("Mahasiswa",            "Aktivitas, dinamika, dan kehidupan mahasiswa"),
        ("Penelitian",           "Riset ilmiah, publikasi jurnal, inovasi teknologi"),
        ("Kegiatan",             "Seminar, konferensi, workshop, dies natalis, event kampus"),
        ("Event",                "Agenda, perlombaan, pameran, festival, perhelatan"),
        ("Kemahasiswaan",        "Dinamika, advokasi, organisasi, dan aktivitas kemahasiswaan"),
        ("Kerja Sama",           "MoU, kemitraan industri, pertukaran pelajar luar negeri"),
        ("Rektor",               "Pernyataan, pelantikan, kebijakan, dan agenda rektor"),
        ("Dosen",                "Guru besar, pengukuhan profesor, kenaikan jabatan fungsional"),
        ("Beasiswa",             "KIP Kuliah, beasiswa pemprov, Djarum, BI, LPDP"),
        ("Penerimaan Mahasiswa", "SNBP, SNBT, jalur mandiri, SPMB, registrasi mahasiswa baru"),
        ("Akademik",             "Kalender akademik, KRS, yudisium, dan wisuda"),
        ("Infrastruktur",        "Gedung baru, laboratorium, fasilitas kampus, asrama"),
        ("Teknologi",            "Digitalisasi kampus, sistem informasi, AI, robotika"),
        ("Organisasi",           "BEM, DPM, MPM, UKM, Himpunan Mahasiswa Jurusan"),
        ("Alumni",               "Ikatan alumni, kontribusi lulusan, tracer study"),
        ("Kebijakan",            "Aturan rektorat, regulasi Kemendikbudristek"),
        ("Konflik",              "Aksi demonstrasi, sengketa, tuntutan mahasiswa"),
        ("Hukum",                "Kasus hukum, tipikor, investigasi lingkungan kampus"),
        ("Lainnya",              "Berita perguruan tinggi yang tidak masuk klasifikasi khusus"),
    ]

    for name, desc in categories_data:
        cat = db.query(Category).filter(Category.name == name).first()
        if not cat:
            db.add(Category(name=name, description=desc))
    db.flush()

    # ------------------------------------------------------------------ #
    # 3. Universities in Sulawesi Utara
    # ------------------------------------------------------------------ #
    universities_data = [
        {
            "name": "Universitas Sam Ratulangi",
            "short_name": "UNSRAT",
            "type": "PTN",
            "description": "Perguruan tinggi negeri tertua dan terbesar di Sulawesi Utara, berlokasi di Kleak, Manado.",
            "website": "https://www.unsrat.ac.id",
            "logo": "https://upload.wikimedia.org/wikipedia/id/f/fa/Logo_Unsrat.png",
            "city": "Manado",
            "aliases": ["UNSRAT", "Unsrat", "Universitas Sam Ratulangi Manado", "Kampus Kleak"],
        },
        {
            "name": "Universitas Negeri Manado",
            "short_name": "UNIMA",
            "type": "PTN",
            "description": "Perguruan tinggi negeri berfokus kependidikan di dataran tinggi Tonsaru, Tondano.",
            "website": "https://unima.ac.id",
            "logo": "https://upload.wikimedia.org/wikipedia/id/b/b3/Logo_Unima.png",
            "city": "Tondano",
            "aliases": ["UNIMA", "Unima", "Universitas Negeri Manado Tondano", "IKIP Manado"],
        },
        {
            "name": "Universitas Klabat",
            "short_name": "UNKLAB",
            "type": "PTS",
            "description": "Perguruan tinggi swasta unggulan berstandar internasional di Airmadidi, Minahasa Utara.",
            "website": "https://www.unklab.ac.id",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/e/e9/Logo_Universitas_Klabat.png",
            "city": "Airmadidi",
            "aliases": ["UNKLAB", "Unklab", "Universitas Klabat Airmadidi"],
        },
        {
            "name": "Universitas Katolik De La Salle Manado",
            "short_name": "De La Salle",
            "type": "PTS",
            "description": "Kampus swasta Katolik bertaraf internasional di Kombos Kairagi, Manado.",
            "website": "https://www.unikadelasalle.ac.id",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/e/ec/Logo_Unika_De_La_Salle_Manado.png",
            "city": "Manado",
            "aliases": ["De La Salle", "Unika De La Salle", "La Salle Manado", "UNIKA Manado"],
        },
        {
            "name": "Politeknik Negeri Manado",
            "short_name": "Polimdo",
            "type": "PTN",
            "description": "Pendidikan vokasi negeri terdepan di Sulawesi Utara, berlokasi di Buha, Manado.",
            "website": "https://polimdo.ac.id",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/6/67/Logo_Politeknik_Negeri_Manado.png",
            "city": "Manado",
            "aliases": ["Polimdo", "Politeknik Negeri Manado", "Poltek Manado"],
        },
        {
            "name": "Institut Teknologi Minaesa",
            "short_name": "ITM",
            "type": "PTS",
            "description": "Institut teknik dan rekayasa di kota sejuk Tomohon.",
            "website": "https://itmtomohon.ac.id",
            "logo": "",
            "city": "Tomohon",
            "aliases": ["ITM", "ITM Tomohon", "Institut Teknologi Minaesa Tomohon"],
        },
        {
            "name": "Universitas Prisma",
            "short_name": "Prisma",
            "type": "PTS",
            "description": "Perguruan tinggi swasta modern di Kombos, Manado.",
            "website": "https://prisma.ac.id",
            "logo": "",
            "city": "Manado",
            "aliases": ["Prisma", "Universitas Prisma", "Universitas Prisma Manado"],
        },
        {
            "name": "Universitas Nusantara Manado",
            "short_name": "UNN",
            "type": "PTS",
            "description": "Universitas swasta di Manado dengan berbagai program studi unggulan.",
            "website": "https://nusantara.ac.id",
            "logo": "",
            "city": "Manado",
            "aliases": ["UNN", "Universitas Nusantara Manado"],
        },
        {
            "name": "STIE Eben Haezar",
            "short_name": "Benzar",
            "type": "PTS",
            "description": "Sekolah Tinggi Ilmu Ekonomi ternama di bawah naungan Yayasan Eben Haezar Manado.",
            "website": "https://stiebenhaezar.ac.id",
            "logo": "",
            "city": "Manado",
            "aliases": ["Benzar", "STIE Eben Haezar", "STIE Benzar", "Eben Haezar Manado"],
        },
        {
            "name": "STIKES Bethesda Tomohon",
            "short_name": "Bethesda",
            "type": "PTS",
            "description": "Sekolah Tinggi Ilmu Kesehatan bereputasi di Tomohon.",
            "website": "https://stikesbethesda.ac.id",
            "logo": "",
            "city": "Tomohon",
            "aliases": ["STIKES Bethesda", "Bethesda Tomohon"],
        },
        {
            "name": "Poltekkes Kemenkes Manado",
            "short_name": "Poltekkes Manado",
            "type": "PTN",
            "description": "Pendidikan tinggi vokasi kesehatan milik Kementerian Kesehatan RI di Malalayang.",
            "website": "https://poltekkesmanado.ac.id",
            "logo": "",
            "city": "Manado",
            "aliases": ["Poltekkes Manado", "Poltekkes Kemenkes Manado"],
        },
        {
            "name": "IAIN Manado",
            "short_name": "IAIN Manado",
            "type": "PTN",
            "description": "Institut Agama Islam Negeri satu-satunya di Sulawesi Utara, berlokasi di Malendeng.",
            "website": "https://iain-manado.ac.id",
            "logo": "",
            "city": "Manado",
            "aliases": ["IAIN Manado", "Institut Agama Islam Negeri Manado"],
        },
        {
            "name": "Universitas Trinita Manado",
            "short_name": "Trinita",
            "type": "PTS",
            "description": "Universitas swasta yang berkembang pesat di Manado.",
            "website": "https://trinita.ac.id",
            "logo": "",
            "city": "Manado",
            "aliases": ["Universitas Trinita", "Trinita Manado"],
        },
        {
            "name": "Universitas Sari Putra Indonesia Tomohon",
            "short_name": "UNSRIT",
            "type": "PTS",
            "description": "Universitas swasta di Kakaskasen, Tomohon.",
            "website": "https://unsrit.ac.id",
            "logo": "",
            "city": "Tomohon",
            "aliases": ["UNSRIT", "Unsrit Tomohon", "Universitas Sari Putra Indonesia"],
        },
        {
            "name": "Universitas Teknologi Sulawesi Utara",
            "short_name": "UTSU",
            "type": "PTS",
            "description": "Perguruan tinggi teknologi di kawasan pusat kota Manado.",
            "website": "https://utsu.ac.id",
            "logo": "",
            "city": "Manado",
            "aliases": ["UTSU", "UTSU Manado", "Universitas Teknologi Sulawesi Utara"],
        },
    ]

    for udata in universities_data:
        univ = db.query(University).filter(University.name == udata["name"]).first()
        if not univ:
            univ = University(
                name=udata["name"],
                short_name=udata["short_name"],
                type=udata["type"],
                description=udata["description"],
                website=udata["website"],
                logo=udata["logo"],
                city=udata["city"],
                is_active=True,
            )
            db.add(univ)
            db.flush()
            for alias in udata["aliases"]:
                db.add(UniversityAlias(university_id=univ.id, alias=alias))
        else:
            univ.type = udata["type"]
            db.flush()

    # ------------------------------------------------------------------ #
    # 4. Verified Working News Sources
    #    (RSS confirmed live as of 2026-09-05 — re-verify periodically)
    # ------------------------------------------------------------------ #
    sources_data = [
        {
            "name": "Tribun Manado",
            "base_url": "https://manado.tribunnews.com",
            "rss_url": "https://manado.tribunnews.com/rss",
            "source_type": "rss",
            "crawl_interval": 5,
            "note": "RSS verified: 20 items ✓",
        },
        {
            "name": "Manado Terkini",
            "base_url": "https://manadoterkini.com",
            "rss_url": "https://manadoterkini.com/feed/",
            "source_type": "rss",
            "crawl_interval": 10,
            "note": "RSS verified: 10 items ✓",
        },
        {
            "name": "Manado News",
            "base_url": "https://manadonews.co.id",
            "rss_url": "https://manadonews.co.id/feed/",
            "source_type": "rss",
            "crawl_interval": 10,
            "note": "RSS verified: 10 items ✓",
        },
        {
            "name": "Portal Humas Unsrat",
            "base_url": "https://www.unsrat.ac.id",
            "rss_url": "https://www.unsrat.ac.id/feed/",
            "source_type": "rss",
            "crawl_interval": 30,
            "note": "RSS verified: 10 items ✓",
        },
        {
            "name": "ZonAutara",
            "base_url": "https://zonautara.com",
            "rss_url": "https://zonautara.com/feed/",
            "source_type": "html",
            "crawl_interval": 15,
            "note": "Base accessible, RSS returns 403 — HTML fallback",
        },
    ]

    # Remove inactive/broken sources if previously present in DB
    broken_source = db.query(Source).filter(Source.name == "SulutKini").first()
    if broken_source:
        from app.database.models import Article
        db.query(Article).filter(Article.source_id == broken_source.id).delete()
        db.delete(broken_source)
        db.flush()

    for sdata in sources_data:
        src = db.query(Source).filter(Source.name == sdata["name"]).first()
        if not src:
            db.add(
                Source(
                    name=sdata["name"],
                    base_url=sdata["base_url"],
                    rss_url=sdata["rss_url"],
                    source_type=sdata["source_type"],
                    crawl_interval=sdata["crawl_interval"],
                    is_active=True,
                    status="ACTIVE",
                    last_crawled=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=1),
                )
            )
        else:
            # Update RSS URL if source already exists with old broken URL
            if src.rss_url != sdata["rss_url"]:
                src.rss_url = sdata["rss_url"]
                src.source_type = sdata["source_type"]

    db.flush()

    # ------------------------------------------------------------------ #
    # 5. Keyword Alert Rules
    # ------------------------------------------------------------------ #
    keywords = [
        # Relevance boosters
        ("universitas",       "relevance",       3.0),
        ("kampus",            "relevance",       3.0),
        ("mahasiswa",         "relevance",       2.5),
        ("dosen",             "relevance",       2.5),
        ("rektor",            "relevance",       3.0),
        ("akademik",          "relevance",       2.0),
        ("kuliah",            "relevance",       2.0),
        ("pendidikan tinggi", "relevance",       3.0),
        ("perguruan tinggi",  "relevance",       3.0),
        ("fakultas",          "relevance",       2.5),
        ("wisuda",            "relevance",       2.5),
        ("beasiswa",          "relevance",       2.5),
        ("penelitian",        "relevance",       2.0),
        ("skripsi",           "relevance",       2.0),
        ("prodi",             "relevance",       2.0),
        ("akreditasi",        "relevance",       3.0),
        # Crisis / negative alert triggers
        ("tawuran",           "negative_alert",  5.0),
        ("korupsi",           "negative_alert",  5.0),
        ("tipikor",           "negative_alert",  5.0),
        ("demonstrasi",       "negative_alert",  4.0),
        ("unjuk rasa",        "negative_alert",  4.0),
        ("pelecehan",         "negative_alert",  5.0),
        ("sanksi",            "negative_alert",  3.0),
        ("pemecatan",         "negative_alert",  4.0),
        ("pelanggaran",       "negative_alert",  3.5),
        ("sengketa",          "negative_alert",  3.0),
    ]

    for kw, rtype, weight in keywords:
        existing = db.query(KeywordRule).filter(KeywordRule.keyword == kw).first()
        if not existing:
            db.add(KeywordRule(keyword=kw, rule_type=rtype, weight=weight, is_active=True))

    # ------------------------------------------------------------------ #
    # 6. System Settings
    # ------------------------------------------------------------------ #
    settings_items = [
        ("crawl_interval",     "5",      "Interval default crawler (menit)"),
        ("min_relevance_score", "40",    "Skor minimum relevansi kampus"),
        ("system_status",      "ONLINE", "Status operasional SCM"),
        ("demo_mode",          "false",  "Mode demo (false = hanya data nyata)"),
    ]
    for k, v, d in settings_items:
        if not db.query(Setting).filter(Setting.key == k).first():
            db.add(Setting(key=k, value=v, description=d))

    # ------------------------------------------------------------------ #
    # 7. Initial Model Version Bootstrap
    # ------------------------------------------------------------------ #
    if not db.query(ModelVersion).filter(ModelVersion.version == "v1.0.0-bootstrap").first():
        db.add(ModelVersion(
            model_type="hybrid_category_sentiment",
            version="v1.0.0-bootstrap",
            accuracy=0.885,
            precision=0.872,
            recall=0.865,
            f1_score=0.868,
            dataset_size=120,
            is_active=True,
            filepath="data/models/bootstrap_pipeline.joblib",
        ))

    db.commit()
    db.close()
    logger.info("Database seeding completed. No demo articles — run crawler to populate real data.")


if __name__ == "__main__":
    seed()
