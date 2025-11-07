# -----------------------------------------------------------------------------
# FILE: server/ml/serve_model.py
# -----------------------------------------------------------------------------
# Lightweight prediction module. Import and call `predict_complaint(text)`.
# It will return: dominant_category, category_probs, secondary_categories, priority, isFakeScore, top_k, confidence

import joblib
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / 'models'

# Load artifacts
tfidf = joblib.load(MODELS_DIR / 'tfidf_vectorizer.joblib')
cat_clf = joblib.load(MODELS_DIR / 'category_model.joblib')
category_cols = joblib.load(MODELS_DIR / 'category_columns.joblib')
iso = joblib.load(MODELS_DIR / 'isoforest.joblib')
try:
    prio_clf = joblib.load(MODELS_DIR / 'priority_model.joblib')
    prio_encoder = joblib.load(MODELS_DIR / 'priority_encoder.joblib')
except Exception:
    prio_clf = None
    prio_encoder = None

# Helper clean_text (same as training)
import re

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        text = str(text)
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', ' ', text)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def predict_complaint(text: str, secondary_threshold: float = 0.35):
    """Predict categories and priority for a complaint text.

    Returns a dict with:
      - dominant_category (str)
      - category_probs (dict)
      - secondary_categories (list)
      - priority (str)
      - isFakeScore (float)  # 0 => likely genuine, 1 => likely fake/anomalous
      - top_k (list of {label, score})
      - confidence (float)  # probability of dominant category
    """
    clean = clean_text(text)
    vect = tfidf.transform([clean])

    # Category probabilities (OneVsRestClassifier exposes predict_proba)
    try:
        probs = cat_clf.predict_proba(vect)
        # probs shape: (n_labels, 2) or (n_samples, n_labels)
        # sklearn OneVsRest with estimators returning (n_samples,2) per label -> predict_proba returns list
    except Exception:
        # fallback to decision_function
        probs = None

    # Normalize to label-prob mapping
    label_probs = {}
    # Many sklearn wrappers return an array shape (n_samples, n_labels)
    if isinstance(probs, np.ndarray):
        # shape (1, n_labels)
        arr = probs[0]
        for i, col in enumerate(category_cols):
            label_probs[col] = float(arr[i])
    else:
        # Some OneVsRestClassifier returns list of arrays per estimator
        # Try to extract positive class probability
        try:
            arr = np.array([p[0][1] if p.shape[-1] == 2 else p[0] for p in probs]).ravel()
            for i, col in enumerate(category_cols):
                label_probs[col] = float(arr[i])
        except Exception:
            # As a last resort, use predict() to get binary labels
            preds = cat_clf.predict(vect)[0]
            for i, col in enumerate(category_cols):
                label_probs[col] = float(preds[i])

    # Determine dominant and secondary
    sorted_labels = sorted(label_probs.items(), key=lambda x: x[1], reverse=True)
    dominant_category, dominant_score = sorted_labels[0]
    secondary = [label for label, score in sorted_labels[1:] if score >= secondary_threshold]

    # Top_k
    top_k = [{"label": label, "score": score} for label, score in sorted_labels[:5]]

    # Priority prediction
    if prio_clf is not None:
        prio_prob = prio_clf.predict_proba(vect)[0]
        prio_idx = int(np.argmax(prio_prob))
        priority = str(prio_encoder.inverse_transform([prio_idx])[0]) if prio_encoder is not None else str(prio_idx)
    else:
        priority = None

    # IsoForest anomaly score -> map to isFakeScore between 0 and 1 (higher -> more likely fake)
    try:
        # decision_function: higher means more normal. We invert and scale roughly to 0..1
        df_score = iso.decision_function(vect.toarray())[0]
        # typical range approx [-0.5, 0.5] depending on data; convert to 0..1
        isFake = float(max(0.0, min(1.0, (0.5 - df_score))))
    except Exception:
        isFake = 0.0

    result = {
        'dominant_category': dominant_category,
        'category_probs': label_probs,
        'secondary_categories': secondary,
        'priority': priority,
        'isFakeScore': isFake,
        'top_k': top_k,
        'confidence': float(dominant_score)
    }
    return result


# If run as script, accept sample text from CLI
if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print('Usage: python serve_model.py "complaint text here"')
        sys.exit(1)
    text = ' '.join(sys.argv[1:])
    out = predict_complaint(text)
    import json
    print(json.dumps(out, indent=2))