import re
from typing import Tuple, List, Dict, Any
from app.ai.tokenizer import clean_text

# Strong higher education keywords and their relative weights
CAMPUS_KEYWORDS: Dict[str, float] = {
    # High-impact campus indicators
    "universitas": 25.0,
    "perguruan tinggi": 25.0,
    "kampus": 20.0,
    "mahasiswa": 20.0,
    "rektor": 25.0,
    "rektorat": 20.0,
    "dosen": 18.0,
    "guru besar": 20.0,
    "profesor": 15.0,
    "dekan": 20.0,
    "fakultas": 18.0,
    "akademik": 15.0,
    "wisuda": 20.0,
    "yudisium": 20.0,
    "skripsi": 18.0,
    "tesis": 18.0,
    "disertasi": 18.0,
    "beasiswa": 15.0,
    "kip kuliah": 20.0,
    "snbp": 25.0,
    "snbt": 25.0,
    "spmb": 20.0,
    "maba": 20.0,
    "ospek": 20.0,
    "kkn": 18.0,
    "pkm": 18.0,
    "politeknik": 20.0,
    "stie": 20.0,
    "stikes": 20.0,
    "iain": 20.0,
    "tridharma": 20.0,
    "civitas akademika": 25.0,
    # Medium-impact terms
    "kuliah": 10.0,
    "alumni": 10.0,
    "penelitian": 10.0,
    "jurnal": 10.0,
    "seminar": 8.0,
    "program studi": 15.0,
    "jurusan": 10.0,
    "bem": 15.0,
    "senat": 12.0,
}

# Sulut prominent university acronyms
SULUT_ACRONYMS = {
    "unsrat", "unima", "unklab", "polimdo", "itm", "prisma", "unn", "benzar",
    "bethesda", "poltekkes manado", "iain manado", "trinita", "unsrit", "utsu", "de la salle"
}


def calculate_relevance(title: str, content: str, detected_universities: List[str] = None) -> Tuple[bool, float, Dict[str, Any]]:
    """
    Compute campus relevance score (0.0 - 100.0) and boolean flag.
    - An article with score >= 40.0 is marked as relevant.
    """
    clean_t = clean_text(title)
    clean_c = clean_text(content)
    combined = f"{clean_t} {clean_t} {clean_c}"  # Title has double weight

    score = 0.0
    matched_keywords = []

    # 1. Detected universities bonus
    if detected_universities and len(detected_universities) > 0:
        score += 45.0
        # Additional bonus if mentioned in title
        for univ in detected_universities:
            if univ.lower() in clean_t:
                score += 25.0
                break

    # 2. Check Sulut acronyms in title or content
    for acr in SULUT_ACRONYMS:
        pattern = rf"\b{re.escape(acr)}\b"
        if re.search(pattern, clean_t):
            score += 35.0
            matched_keywords.append(acr.upper())
        elif re.search(pattern, clean_c):
            score += 15.0
            matched_keywords.append(acr.upper())

    # 3. Keyword occurrences
    for kw, weight in CAMPUS_KEYWORDS.items():
        pattern = rf"\b{re.escape(kw)}\b"
        if re.search(pattern, clean_t):
            score += weight * 1.5  # Title boost
            matched_keywords.append(kw)
        elif re.search(pattern, clean_c):
            score += weight * 0.8
            matched_keywords.append(kw)

    # 4. Cap score between 0 and 100
    final_score = min(100.0, max(0.0, round(score, 1)))
    is_rel = final_score >= 40.0
    confidence = min(1.0, max(0.1, round(final_score / 100.0, 2)))

    debug_info = {
        "score": final_score,
        "is_relevant": is_rel,
        "confidence": confidence,
        "matched_keywords": list(set(matched_keywords))[:10],
        "has_university": bool(detected_universities)
    }

    return is_rel, final_score, debug_info
