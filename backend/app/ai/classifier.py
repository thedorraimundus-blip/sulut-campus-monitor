import re
from typing import Tuple, Dict, Any, List
from app.ai.tokenizer import clean_text
from app.ai.model_manager import model_manager

# Keyword rule sets for bootstrap and ensemble
CATEGORY_RULES: Dict[str, List[str]] = {
    "Prestasi": ["juara", "medali", "emas", "perak", "perunggu", "olimpiade", "menang", "penghargaan", "sabet", "terbaik", "pemenang", "membanggakan"],
    "Penerimaan Mahasiswa": ["snbp", "snbt", "spmb", "maba", "pendaftaran", "seleksi mandiri", "mahasiswa baru", "registrasi ulang", "kuota penerimaan"],
    "Beasiswa": ["beasiswa", "kip kuliah", "bantuan pendidikan", "djarum plus", "beasiswa bi", "dana pendidikan", "sponsor beasiswa"],
    "Penelitian": ["penelitian", "riset", "jurnal", "scopus", "inovasi", "peneliti", "eksperimen", "paten", "senyawa", "hilirisasi"],
    "Rektor": ["rektor", "rektorat", "pelantikan rektor", "sambutan rektor", "forum rektor", "pimpinan rektorat"],
    "Dosen": ["dosen", "guru besar", "profesor", "pengukuhan", "jabatan fungsional", "tenaga pengajar"],
    "Mahasiswa": ["mahasiswa", "aktivitas mahasiswa", "mapala", "bakti sosial", "kehidupan kampus", "anak kampus"],
    "Akademik": ["akademik", "wisuda", "yudisium", "krs", "kartu rencana studi", "kalender akademik", "jadwal kuliah", "ipk"],
    "Kerja Sama": ["kerja sama", "mou", "nota kesepahaman", "kemitraan", "pertukaran mahasiswa", "industri", "magang industri"],
    "Infrastruktur": ["gedung", "fasilitas", "laboratorium", "asrama", "pembangunan", "renovasi", "sarana", "prasarana"],
    "Teknologi": ["teknologi", "sistem informasi", "portal", "cloud", "aplikasi", "kecerdasan buatan", "e-learning", "robotik"],
    "Organisasi": ["bem", "dpm", "mpm", "organisasi", "himpunan", "senat mahasiswa", "kongres"],
    "Alumni": ["alumni", "ikatan alumni", "ika", "reuni", "lulusan"],
    "Kebijakan": ["kebijakan", "regulasi", "surat edaran", "kemendikbud", "kemendiktisaintek", "aturan", "peraturan rektor"],
    "Konflik": ["unjuk rasa", "demonstrasi", "demo", "tuntutan", "ricuh", "konflik", "protes", "memanas", "sengketa"],
    "Hukum": ["hukum", "kejaksaan", "tipikor", "korupsi", "ijazah palsu", "pidana", "penyelidikan", "polisi", "tersangka"],
    "Kegiatan": ["dies natalis", "seminar", "workshop", "webinar", "konferensi", "acara", "peringatan", "festival"],
    "Pendidikan": ["pendidikan", "kurikulum", "akreditasi", "mutu", "pembelajaran", "pengajaran"],
    "Lainnya": []
}


def classify_category_rule_based(text: str) -> Tuple[str, float]:
    """Rule-based heuristic category detection."""
    clean = clean_text(text)
    best_cat = "Pendidikan"
    max_matches = 0

    for cat, kws in CATEGORY_RULES.items():
        if not kws:
            continue
        matches = 0
        for kw in kws:
            if rf"\b{kw}\b" in clean or kw in clean:
                matches += 1
        if matches > max_matches:
            max_matches = matches
            best_cat = cat

    confidence = min(0.95, 0.65 + (max_matches * 0.10)) if max_matches > 0 else 0.50
    return best_cat, round(confidence, 2)


def classify_category(text: str) -> Tuple[str, float, str]:
    """
    Classify text into one of 19 categories.
    Uses trained scikit-learn ML model if available,
    falling back to rule-based classification in bootstrap mode.
    Returns: (category, confidence, model_version)
    """
    if model_manager.model is not None:
        try:
            preds = model_manager.model.predict([text])
            predicted_category = str(preds[0])
            confidence = 0.88
            if hasattr(model_manager.model, "predict_proba"):
                probs = model_manager.model.predict_proba([text])[0]
                confidence = float(max(probs))
            return predicted_category, round(confidence, 2), model_manager.active_version
        except Exception:
            pass

    # Fallback to rule-based classification
    cat, conf = classify_category_rule_based(text)
    return cat, conf, model_manager.active_version
