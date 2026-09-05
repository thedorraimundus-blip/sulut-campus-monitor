import re
import difflib
from typing import List, Dict, Any
from app.database.database import SessionLocal
from app.database.models import University, UniversityAlias
from app.ai.tokenizer import clean_text


class UniversityEntityDetector:
    def __init__(self):
        self.cached_universities: List[Dict[str, Any]] = []
        self._refresh_cache()

    def _refresh_cache(self):
        """Load universities and their aliases from database into memory."""
        db = SessionLocal()
        try:
            univs = db.query(University).filter(University.is_active == True).all()
            data = []
            for u in univs:
                aliases = [a.alias for a in u.aliases]
                # Include short_name and full name as primary aliases
                all_names = list(set([u.name, u.short_name] + aliases))
                data.append({
                    "id": u.id,
                    "name": u.name,
                    "short_name": u.short_name,
                    "aliases": all_names
                })
            self.cached_universities = data
        finally:
            db.close()

    def detect(self, text: str) -> List[Dict[str, Any]]:
        """
        Detect university entities mentioned in text.
        Multi-tier detection:
        1. Exact alias match with word boundaries (\b).
        2. Substring & case-insensitive matching for full names.
        3. Fuzzy matching for slight spelling variations.
        """
        if not self.cached_universities:
            self._refresh_cache()

        text_lower = text.lower()
        results = []

        for univ in self.cached_universities:
            matched = False
            best_confidence = 0.0

            for alias in univ["aliases"]:
                alias_clean = alias.strip().lower()
                if not alias_clean:
                    continue

                # 1. Regex word boundary matching
                pattern = rf"\b{re.escape(alias_clean)}\b"
                if re.search(pattern, text_lower):
                    matched = True
                    # Higher confidence if matched short name or full name
                    conf = 0.98 if len(alias_clean) <= 6 else 0.95
                    if conf > best_confidence:
                        best_confidence = conf

                # 2. Fuzzy match for longer names (>= 12 chars) to tolerate typos
                elif len(alias_clean) >= 12 and alias_clean not in text_lower:
                    # Look at words in text of similar length
                    words = text_lower.split()
                    for i in range(len(words) - len(alias_clean.split()) + 1):
                        window = " ".join(words[i : i + len(alias_clean.split())])
                        ratio = difflib.SequenceMatcher(None, alias_clean, window).ratio()
                        if ratio >= 0.85:
                            matched = True
                            conf = round(ratio * 0.9, 2)
                            if conf > best_confidence:
                                best_confidence = conf

            if matched:
                results.append({
                    "university_id": univ["id"],
                    "name": univ["name"],
                    "short_name": univ["short_name"],
                    "confidence_score": best_confidence
                })

        # Sort by confidence descending
        results.sort(key=lambda x: x["confidence_score"], reverse=True)
        return results


entity_detector = UniversityEntityDetector()
