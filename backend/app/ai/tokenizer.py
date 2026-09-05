import re
from functools import lru_cache
from typing import List
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory

# Initialize Sastrawi singletons
_stemmer_factory = StemmerFactory()
_stemmer = _stemmer_factory.create_stemmer()

_stopword_factory = StopWordRemoverFactory()
_default_stopwords = set(_stopword_factory.get_stop_words())

# Additional Indonesian news & campus domain stopwords
ADDITIONAL_STOPWORDS = {
    "yang", "di", "dan", "dari", "ini", "untuk", "dalam", "ke", "pada", "oleh",
    "dengan", "adalah", "itu", "sebagai", "juga", "akan", "dapat", "atau",
    "bisa", "para", "kepada", "karena", "kita", "mereka", "saat", "bahwa",
    "tersebut", "telah", "bukan", "hanya", "namun", "setelah", "hingga", "antara",
    "serta", "yaitu", "seperti", "sedang", "harus", "banyak", "setiap", "tahun",
    "hari", "kota", "baca", "juga", "redaksi", "kutip", "berita", "post", "com",
    "senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu", "januari",
    "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september",
    "oktober", "november", "desember", "kata", "ujar", "tambah", "jelas", "menurut"
}

ALL_STOPWORDS = _default_stopwords.union(ADDITIONAL_STOPWORDS)


def clean_text(text: str) -> str:
    """
    Remove HTML tags, URLs, special symbols, extra whitespace,
    and convert to lower case.
    """
    if not text:
        return ""
    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    # Remove HTML remnants
    text = re.sub(r"<.*?>", " ", text)
    # Remove non-alphabetical characters (preserve standard Indonesian words)
    text = re.sub(r"[^a-zA-Z\s-]", " ", text)
    # Collapse whitespace
    text = re.sub(r"\s+", " ", text).strip().lower()
    return text


def tokenize(text: str) -> List[str]:
    """Tokenize clean text into word tokens."""
    cleaned = clean_text(text)
    if not cleaned:
        return []
    return [token for token in cleaned.split() if len(token) > 1]


def remove_stopwords(tokens: List[str]) -> List[str]:
    """Filter out Indonesian stopwords."""
    return [t for t in tokens if t not in ALL_STOPWORDS]


@lru_cache(maxsize=10000)
def stem_word(word: str) -> str:
    """Stem a single word with caching for fast repeated lookups."""
    try:
        return _stemmer.stem(word)
    except Exception:
        return word


def stem_tokens(tokens: List[str]) -> List[str]:
    """Apply stemming to a list of tokens."""
    return [stem_word(t) for t in tokens]


def preprocess_text(text: str, stem: bool = False) -> str:
    """
    Full text preprocessing pipeline:
    clean -> tokenize -> remove stopwords -> (optional) stem -> join
    """
    tokens = tokenize(text)
    tokens = remove_stopwords(tokens)
    if stem:
        tokens = stem_tokens(tokens)
    return " ".join(tokens)
