import re
from typing import Dict, Any, Tuple
from app.ai.tokenizer import clean_text

# Indonesian sentiment lexicon
POSITIVE_WORDS = {
    "prestasi", "juara", "unggul", "sukses", "menang", "kebanggaan", "bangga",
    "apresiasi", "terbaik", "pujian", "inovasi", "inovatif", "berhasil", "hadiah",
    "kemajuan", "akreditasi unggul", "meraih", "lulus", "beasiswa", "bantuan",
    "mendukung", "kolaborasi", "kerja sama", "positif", "solusi", "membangun",
    "berkualitas", "hebat", "terpilih", "rekor", "kontribusi", "berkembang",
    "harmonis", "damai", "penghargaan", "berjaya", "mengagumkan", "meningkat",
    "optimis", "mumpuni", "kebajikan", "kebaikan", "berkah", "solidaritas"
}

NEGATIVE_WORDS = {
    "korupsi", "sanksi", "tawuran", "skandal", "pelecehan", "demo", "demonstrasi",
    "ricuh", "protes", "konflik", "curang", "palsu", "ijazah palsu", "ditangkap",
    "tersangka", "polisi", "kejaksaan", "tipikor", "drop out", "do", "dipecat",
    "kerugian", "kriminal", "narkoba", "pungli", "mahal", "keluhan", "rusak",
    "kecewa", "gagal", "ancam", "ancaman", "memanas", "sengketa", "mogok",
    "pembekuan", "terpuruk", "menurun", "krisis", "cacat", "kasus", "terjerat"
}

NEGATION_WORDS = {"tidak", "bukan", "belum", "tanpa", "tak", "tiada", "jangan"}
INTENSIFIER_WORDS = {"sangat", "amat", "sekali", "luar biasa", "benar-benar", "sungguh"}


def analyze_sentiment(text: str) -> Tuple[str, float, float, float]:
    """
    Indonesian rule-assisted sentiment analyzer.
    Returns:
        sentiment: "Positive" | "Neutral" | "Negative"
        pos_score: float (0.0 - 1.0)
        neu_score: float (0.0 - 1.0)
        neg_score: float (0.0 - 1.0)
    """
    cleaned = clean_text(text)
    words = cleaned.split()
    if not words:
        return "Neutral", 0.1, 0.8, 0.1

    pos_count = 0.0
    neg_count = 0.0

    # Multi-word phrase checks
    for phrase in ["akreditasi unggul", "kerja sama", "ijazah palsu", "drop out"]:
        if phrase in cleaned:
            if phrase in POSITIVE_WORDS:
                pos_count += 3.0
            elif phrase in NEGATIVE_WORDS:
                neg_count += 4.0

    # Word-level evaluation with negation lookback
    n_words = len(words)
    for i, w in enumerate(words):
        multiplier = 1.0
        # Check previous word for negation or intensifier
        is_negated = False
        if i > 0:
            prev_word = words[i - 1]
            if prev_word in NEGATION_WORDS:
                is_negated = True
            elif prev_word in INTENSIFIER_WORDS:
                multiplier = 1.8

        if w in POSITIVE_WORDS:
            if is_negated:
                neg_count += 1.5 * multiplier
            else:
                pos_count += 1.5 * multiplier
        elif w in NEGATIVE_WORDS:
            if is_negated:
                pos_count += 1.0 * multiplier
            else:
                neg_count += 2.0 * multiplier

    # Score calculation & normalization
    total_sentiment_signals = pos_count + neg_count

    if total_sentiment_signals < 1.0:
        # Mostly factual/objective news
        return "Neutral", 0.15, 0.75, 0.10

    # Convert to probabilities with softmax-like scaling
    net_polarity = (pos_count - neg_count) / max(total_sentiment_signals, 1.0)

    if net_polarity > 0.25:
        sentiment = "Positive"
        pos_score = min(0.96, 0.60 + (net_polarity * 0.35))
        neg_score = max(0.02, (1.0 - pos_score) * 0.2)
        neu_score = round(1.0 - pos_score - neg_score, 2)
    elif net_polarity < -0.20:
        sentiment = "Negative"
        neg_score = min(0.96, 0.60 + (abs(net_polarity) * 0.35))
        pos_score = max(0.02, (1.0 - neg_score) * 0.2)
        neu_score = round(1.0 - neg_score - pos_score, 2)
    else:
        sentiment = "Neutral"
        neu_score = 0.60
        pos_score = round((1.0 - neu_score) * (pos_count / (total_sentiment_signals + 0.01)), 2)
        neg_score = round(1.0 - neu_score - pos_score, 2)

    return (
        sentiment,
        round(pos_score, 2),
        round(neu_score, 2),
        round(neg_score, 2)
    )
