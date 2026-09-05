"""
Local AI / NLP Engine for SULUT CAMPUS MONITOR (SCM).
Provides offline Indonesian text cleaning, relevance scoring, university entity detection,
category classification, sentiment analysis, extractive summarization, and local training.
"""

from app.ai.tokenizer import clean_text, tokenize, remove_stopwords, stem_word, stem_tokens, preprocess_text
from app.ai.relevance import calculate_relevance
from app.ai.entity_detector import entity_detector, UniversityEntityDetector
from app.ai.classifier import classify_category, classify_category_rule_based
from app.ai.sentiment import analyze_sentiment
from app.ai.summarizer import summarize_text, split_sentences
from app.ai.pipeline import process_article_intelligence, analyze_article
from app.ai.model_manager import model_manager, ModelManager
from app.ai.trainer import train_model, load_all_training_samples

__all__ = [
    "clean_text",
    "tokenize",
    "remove_stopwords",
    "stem_word",
    "stem_tokens",
    "preprocess_text",
    "calculate_relevance",
    "entity_detector",
    "UniversityEntityDetector",
    "classify_category",
    "classify_category_rule_based",
    "analyze_sentiment",
    "summarize_text",
    "split_sentences",
    "process_article_intelligence",
    "analyze_article",
    "model_manager",
    "ModelManager",
    "train_model",
    "load_all_training_samples",
]
