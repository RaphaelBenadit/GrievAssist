# -----------------------------------------------------------------------------
# FILE: server/ml/serve_model.py
# Improved prediction module for GrievAssist ML Service
# -----------------------------------------------------------------------------
# Import and call `predict_complaint(text)` to get:
#   dominant_category, category_probs, secondary_categories,
#   priority, isFakeScore, top_k, confidence

import joblib
import numpy as np
from pathlib import Path
import re

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / 'models'

# Load artifacts
print("Loading ML model artifacts...")
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

print(f"✅ Models loaded. Categories: {category_cols}")

# ---------------------------------------------------------------------------
# Text preprocessing (must match training pipeline exactly)
# ---------------------------------------------------------------------------
DOMAIN_STOPWORDS = {
    'pls', 'please', 'fix', 'soon', 'near', 'my', 'home', 'causing',
    'problem', 'public', 'not', 'cleaned', 'week', 'everyday', 'issue',
    'totally', 'ignored', 'workers', 'urgent', 'attention', 'needed',
    'unsafe', 'kids', 'smells', 'really', 'bad'
}


def clean_text(text: str) -> str:
    """Basic text cleaning."""
    if not isinstance(text, str):
        text = str(text)
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', ' ', text)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def clean_text_no_stopwords(text: str) -> str:
    """Clean text and remove domain-specific stopwords (matches training)."""
    cleaned = clean_text(text)
    tokens = cleaned.split()
    tokens = [t for t in tokens if t not in DOMAIN_STOPWORDS and len(t) > 1]
    return ' '.join(tokens)


# ---------------------------------------------------------------------------
# Priority keyword boosting
# ---------------------------------------------------------------------------
HIGH_PRIORITY_KEYWORDS = {
    'emergency', 'urgent', 'immediately', 'critical', 'dangerous',
    'accident', 'injured', 'death', 'explosion', 'collapse',
    'electrocution', 'contamination', 'toxic', 'hazardous',
    'fire', 'burning', 'blaze', 'evacuation', 'stranded',
    'hospital', 'children', 'school', 'flood', 'submerged',
}
LOW_PRIORITY_KEYWORDS = {
    'minor', 'cosmetic', 'suggestion', 'request', 'install',
    'dim', 'faded', 'appearance', 'shabby', 'timing',
}


def _adjust_priority_score(text_lower: str, predicted_priority: str, prob: float) -> str:
    """Boost or lower priority based on keyword presence."""
    words = set(text_lower.split())
    high_matches = words & HIGH_PRIORITY_KEYWORDS
    low_matches = words & LOW_PRIORITY_KEYWORDS

    # If strong high-priority keywords and model says low/medium, bump up
    if len(high_matches) >= 2 and predicted_priority in ('low', 'medium'):
        return 'high'
    if len(high_matches) >= 1 and predicted_priority == 'low':
        return 'medium'
    # If only low-priority keywords and model says high with low confidence
    if len(low_matches) >= 1 and len(high_matches) == 0 and predicted_priority == 'high' and prob < 0.5:
        return 'medium'
    return predicted_priority


# ---------------------------------------------------------------------------
# Main prediction function
# ---------------------------------------------------------------------------
def predict_complaint(text: str, secondary_threshold: float = 0.30):
    """Predict categories and priority for a complaint text.

    Returns a dict with:
      - dominant_category (str)
      - category_probs (dict)
      - secondary_categories (list)
      - priority (str)
      - isFakeScore (float)    # 0 => likely genuine, 1 => likely fake/anomalous
      - top_k (list of {label, score})
      - confidence (float)     # probability of dominant category
    """
    # Preprocess to match training pipeline
    clean = clean_text_no_stopwords(text)
    vect = tfidf.transform([clean])

    # ---- Category probabilities ----
    label_probs = {}
    try:
        probs = cat_clf.predict_proba(vect)
        # Handle different return shapes from OneVsRest
        if isinstance(probs, np.ndarray):
            arr = probs[0]
            for i, col in enumerate(category_cols):
                label_probs[col] = float(arr[i])
        else:
            # List of arrays per estimator
            arr = np.array([p[0][1] if p.shape[-1] == 2 else p[0] for p in probs]).ravel()
            for i, col in enumerate(category_cols):
                label_probs[col] = float(arr[i])
    except Exception:
        try:
            # Fallback to decision_function
            df_vals = cat_clf.decision_function(vect)
            if isinstance(df_vals, np.ndarray):
                arr = df_vals[0] if df_vals.ndim > 1 else df_vals
            else:
                arr = np.array(df_vals).ravel()
            # Sigmoid to convert to probabilities
            probs_arr = 1 / (1 + np.exp(-arr))
            for i, col in enumerate(category_cols):
                label_probs[col] = float(probs_arr[i])
        except Exception:
            preds = cat_clf.predict(vect)[0]
            for i, col in enumerate(category_cols):
                label_probs[col] = float(preds[i])

    # ---- Determine dominant and secondary categories ----
    sorted_labels = sorted(label_probs.items(), key=lambda x: x[1], reverse=True)
    dominant_category, dominant_score = sorted_labels[0]

    # Dynamic threshold: use ratio-based secondary detection
    secondary = []
    for label, score in sorted_labels[1:]:
        # A category is secondary if its score is above threshold
        # AND reasonably close to dominant (within 60% ratio)
        if score >= secondary_threshold and (score / max(dominant_score, 0.01)) > 0.4:
            secondary.append(label)

    # Top_k
    top_k = [{"label": label, "score": round(score, 4)} for label, score in sorted_labels[:5]]

    # ---- Priority prediction ----
    text_lower = clean_text(text)
    if prio_clf is not None:
        prio_prob = prio_clf.predict_proba(vect)[0]
        prio_idx = int(np.argmax(prio_prob))
        priority = str(prio_encoder.inverse_transform([prio_idx])[0]) if prio_encoder else str(prio_idx)
        max_prio_prob = float(prio_prob[prio_idx])
        # Apply keyword-based adjustment
        priority = _adjust_priority_score(text_lower, priority, max_prio_prob)
    else:
        priority = None

    # ---- Anomaly / Fake score ----
    try:
        df_score = iso.decision_function(vect.toarray())[0]
        # decision_function: higher means more normal, lower means more anomalous
        # Map to 0..1 where 1 = likely fake
        isFake = float(max(0.0, min(1.0, (0.5 - df_score))))
    except Exception:
        isFake = 0.0

    result = {
        'dominant_category': dominant_category,
        'category_probs': label_probs,
        'secondary_categories': secondary,
        'priority': priority,
        'isFakeScore': round(isFake, 4),
        'top_k': top_k,
        'confidence': round(float(dominant_score), 4),
    }
    return result


# ---------------------------------------------------------------------------
# CLI testing
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        # Run a few test predictions
        test_texts = [
            "there are deep potholes on the main road causing accidents",
            "no water supply in our area for three days",
            "garbage not collected for a week stinking badly",
            "traffic signal broken at main junction",
            "fire broke out in the warehouse near market area",
            "streetlights not working in our colony very dark at night",
            "drain overflowing with sewage water on the street",
            "heavy rain caused flooding in our basement",
            "road near school has no speed breakers children at risk",
            "water coming from taps is dirty and brown coloured",
        ]
        print("\n" + "="*70)
        print("TEST PREDICTIONS")
        print("="*70)
        for t in test_texts:
            out = predict_complaint(t)
            print(f"\n📝 \"{t}\"")
            print(f"   Category:  {out['dominant_category']} ({out['confidence']:.2%})")
            print(f"   Priority:  {out['priority']}")
            print(f"   Secondary: {out['secondary_categories']}")
            print(f"   Fake:      {out['isFakeScore']:.4f}")
        sys.exit(0)

    text = ' '.join(sys.argv[1:])
    out = predict_complaint(text)
    import json
    print(json.dumps(out, indent=2))