import os
from pathlib import Path
from typing import Optional, Any
import joblib
from app.config import MODELS_DIR, settings
from app.utils.logger import logger

ACTIVE_MODEL_FILE = MODELS_DIR / "active_category_classifier.joblib"


class ModelManager:
    def __init__(self):
        self.model: Optional[Any] = None
        self.active_version: str = settings.BOOTSTRAP_MODEL_VERSION
        self.load_active_model()

    def load_active_model(self):
        """Load active model from disk if available."""
        if ACTIVE_MODEL_FILE.exists():
            try:
                bundle = joblib.load(ACTIVE_MODEL_FILE)
                self.model = bundle.get("pipeline")
                self.active_version = bundle.get("version", "v1.0.0")
                logger.info(f"Loaded trained ML model: {self.active_version}")
            except Exception as e:
                logger.error(f"Error loading trained model from {ACTIVE_MODEL_FILE}: {e}")
                self.model = None
                self.active_version = settings.BOOTSTRAP_MODEL_VERSION
        else:
            self.model = None
            self.active_version = settings.BOOTSTRAP_MODEL_VERSION
            logger.info("No trained model on disk yet. Running in bootstrap hybrid mode.")

    def save_model(self, pipeline: Any, version: str, metrics: dict):
        """Save pipeline and metadata to disk."""
        bundle = {
            "pipeline": pipeline,
            "version": version,
            "metrics": metrics
        }
        # Save active symlink/file
        joblib.dump(bundle, ACTIVE_MODEL_FILE)
        # Also save version-specific archive
        version_file = MODELS_DIR / f"category_classifier_{version}.joblib"
        joblib.dump(bundle, version_file)
        self.model = pipeline
        self.active_version = version
        logger.info(f"Model saved successfully: {version}")


model_manager = ModelManager()
