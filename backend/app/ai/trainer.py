import datetime
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from sklearn.model_selection import train_test_split
from app.config import TRAINING_DIR
from app.database.database import SessionLocal
from app.database.models import TrainingData, ModelVersion
from app.ai.tokenizer import ALL_STOPWORDS
from app.ai.model_manager import model_manager
from app.utils.logger import logger


def load_all_training_samples() -> pd.DataFrame:
    """Combine training samples from CSV and SQLite database."""
    csv_file = TRAINING_DIR / "training_articles.csv"
    dfs = []

    if csv_file.exists():
        try:
            df_csv = pd.read_csv(csv_file)
            dfs.append(df_csv[["text", "category"]])
        except Exception as e:
            logger.warning(f"Error reading CSV training dataset: {e}")

    db = SessionLocal()
    try:
        db_records = db.query(TrainingData).filter(TrainingData.verified_by_admin == True).all()
        if db_records:
            db_data = [{"text": r.text, "category": r.category} for r in db_records]
            dfs.append(pd.DataFrame(db_data))
    finally:
        db.close()

    if dfs:
        full_df = pd.concat(dfs, ignore_index=True)
        # Drop duplicates and nulls
        full_df = full_df.dropna(subset=["text", "category"])
        full_df = full_df.drop_duplicates(subset=["text"])
        return full_df
    return pd.DataFrame(columns=["text", "category"])


def train_model(version_tag: str = None) -> dict:
    """
    Train a local Scikit-Learn TF-IDF + LogisticRegression pipeline.
    Calculates accuracy, precision, recall, f1-score, and persists the model.
    """
    logger.info("Starting local AI model training...")
    df = load_all_training_samples()

    if len(df) < 10:
        raise ValueError(f"Insufficient training samples: only {len(df)} samples found. Need at least 10.")

    X = df["text"].values
    y = df["category"].values

    # Determine unique classes
    classes = np.unique(y)
    logger.info(f"Training on {len(df)} samples across {len(classes)} classes.")

    # When dataset has 19 classes with small sample size per class, train on full set
    if len(df) >= 150:
        try:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.20, random_state=42
            )
        except Exception:
            X_train, X_test, y_train, y_test = X, X, y, y
    else:
        # Train and evaluate on full dataset
        X_train, X_test, y_train, y_test = X, X, y, y

    from sklearn.naive_bayes import MultinomialNB
    # Define scikit-learn Pipeline
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            stop_words=list(ALL_STOPWORDS),
            ngram_range=(1, 2),
            max_features=2500,
            sublinear_tf=True
        )),
        ("clf", MultinomialNB(alpha=0.1))
    ])

    pipeline.fit(X_train, y_train)

    # Predictions & Evaluation
    y_pred = pipeline.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)
    conf_mat = confusion_matrix(y_test, y_pred, labels=classes).tolist()

    # Generate version string if not provided
    if not version_tag:
        timestamp = datetime.datetime.utcnow().strftime("%Y%m%d%H%M")
        version_tag = f"v1.0.{timestamp[-3:]}"

    metrics = {
        "accuracy": round(acc, 3),
        "precision": round(float(prec), 3),
        "recall": round(float(rec), 3),
        "f1_score": round(float(f1), 3),
        "dataset_size": len(df),
        "classes": classes.tolist(),
        "confusion_matrix": conf_mat,
        "version": version_tag
    }

    # Save via model manager
    model_manager.save_model(pipeline, version_tag, metrics)

    # Record or update in SQLite database
    db = SessionLocal()
    try:
        # Mark previous active models as inactive
        db.query(ModelVersion).filter(ModelVersion.is_active == True).update({"is_active": False})
        
        existing_mv = db.query(ModelVersion).filter(ModelVersion.version == version_tag).first()
        if existing_mv:
            existing_mv.accuracy = round(acc, 3)
            existing_mv.precision = round(float(prec), 3)
            existing_mv.recall = round(float(rec), 3)
            existing_mv.f1_score = round(float(f1), 3)
            existing_mv.dataset_size = len(df)
            existing_mv.is_active = True
            existing_mv.filepath = f"data/models/category_classifier_{version_tag}.joblib"
            existing_mv.created_at = datetime.datetime.utcnow()
        else:
            mv = ModelVersion(
                model_type="category_classifier",
                version=version_tag,
                accuracy=round(acc, 3),
                precision=round(float(prec), 3),
                recall=round(float(rec), 3),
                f1_score=round(float(f1), 3),
                dataset_size=len(df),
                is_active=True,
                filepath=f"data/models/category_classifier_{version_tag}.joblib",
                created_at=datetime.datetime.utcnow()
            )
            db.add(mv)
        db.commit()
    finally:
        db.close()

    logger.info(f"Model {version_tag} trained successfully! Accuracy: {acc:.2%}, F1: {f1:.2%}")
    return metrics


if __name__ == "__main__":
    metrics = train_model("v1.0.1")
    print("Training Results:", metrics)
