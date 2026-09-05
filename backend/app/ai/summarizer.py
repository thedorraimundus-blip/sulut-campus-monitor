import re
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from app.ai.tokenizer import ALL_STOPWORDS


def split_sentences(text: str) -> List[str]:
    """Split text into sentences using Indonesian punctuation heuristics."""
    if not text:
        return []
    # Replace newlines with spaces
    text = re.sub(r"\n+", " ", text)
    # Split on sentence terminals (. ? !), accounting for titles/abbreviations like Prof., Dr., S.Pd., dll.
    raw_sentences = re.split(r"(?<=[.?!])\s+(?=[A-Z0-9\"'‘“])", text)
    clean_sents = []
    for s in raw_sentences:
        s = s.strip()
        if len(s) > 25 and not s.lower().startswith("baca juga") and not s.lower().startswith("sumber"):
            clean_sents.append(s)
    return clean_sents


def summarize_text(text: str, max_sentences: int = 3) -> str:
    """
    Extractive summarization using TF-IDF sentence salience scoring:
    1. Splits body text into candidate sentences.
    2. Constructs TF-IDF matrix across sentences.
    3. Scores each sentence by summing its term salience.
    4. Boosts the opening sentence (standard inverted pyramid journalistic structure).
    5. Returns the top sentences preserved in their chronological order.
    """
    sentences = split_sentences(text)
    if len(sentences) <= max_sentences:
        return " ".join(sentences)

    try:
        # Fit TF-IDF on all candidate sentences
        vectorizer = TfidfVectorizer(
            stop_words=list(ALL_STOPWORDS),
            max_features=200,
            token_pattern=r"(?u)\b[a-zA-Z]{3,}\b"
        )
        tfidf_matrix = vectorizer.fit_transform(sentences)
        
        # Calculate score per sentence by summing tf-idf values
        sentence_scores = []
        for i in range(len(sentences)):
            score = tfidf_matrix[i].sum()
            # Lead sentence bonus in news writing
            if i == 0:
                score *= 1.4
            elif i == 1:
                score *= 1.1
            sentence_scores.append((i, score, sentences[i]))

        # Select top N sentences based on score
        top_sentences = sorted(sentence_scores, key=lambda x: x[1], reverse=True)[:max_sentences]
        # Sort selected sentences back to original text order
        top_sentences.sort(key=lambda x: x[0])

        summary = " ".join([item[2] for item in top_sentences])
        return summary
    except Exception:
        # Fallback to the first 2-3 sentences if vectorizer fails (e.g. all stopwords)
        return " ".join(sentences[:max_sentences])
