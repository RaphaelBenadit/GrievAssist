# -----------------------------------------------------------------------------
# FILE: server/ml/train_model.py
# -----------------------------------------------------------------------------
import json
from pathlib import Path
import joblib
import pandas as pd
import numpy as np
import datetime
import re
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder, MultiLabelBinarizer
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.multiclass import OneVsRestClassifier
from sklearn.metrics import classification_report, accuracy_score

# Resolve paths relative to this file
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / 'data'
# Prefer the new multilabel dataset filename but fall back to old
PREFERRED_FILES = [DATA_DIR / 'complaints_dataset.csv', DATA_DIR / 'complaints_labeled.csv']
DATA_PATH = None
for p in PREFERRED_FILES:
    if p.exists():
        DATA_PATH = p
        break

OUT_DIR = BASE_DIR / 'models'
OUT_DIR.mkdir(parents=True, exist_ok=True)

if DATA_PATH is None:
    raise FileNotFoundError(
        f"Dataset not found. Please place complaints_dataset.csv (multi-label) or complaints_labeled.csv in {DATA_DIR}"
    )

print("Using dataset:", DATA_PATH)

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        text = str(text)
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', ' ', text)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# Read csv
df = pd.read_csv(DATA_PATH)
# Expect at minimum: description, priority (optional) and one-hot category columns
if 'description' not in df.columns:
    raise ValueError('CSV must include a "description" column')

# Identify category columns: all columns except description and priority
reserved = {'description', 'priority'}
category_cols = [c for c in df.columns if c not in reserved]
if len(category_cols) == 0:
    # Fallback: if there is a 'category' text column, convert it to single-label one-hot
    if 'category' in df.columns:
        df['category'] = df['category'].astype(str).str.lower().str.strip()
        unique = sorted(df['category'].unique())
        for u in unique:
            df[u] = (df['category'] == u).astype(int)
        category_cols = unique
    else:
        raise ValueError('No category columns detected. Provide one-hot category columns or a "category" column.')

print('Detected category columns:', category_cols)

# Fill NAs and clean descriptions
df = df.dropna(subset=['description']).reset_index(drop=True)
df['description_clean'] = df['description'].astype(str).apply(clean_text)

# Build X and y_multi
X = df['description_clean'].values

y_multi = df[category_cols].astype(int).values

# Priority column (optional)
has_priority = 'priority' in df.columns
if has_priority:
    df['priority'] = df['priority'].astype(str).str.lower().str.strip()
    priority_le = LabelEncoder()
    y_priority = priority_le.fit_transform(df['priority'].values)
else:
    priority_le = None
    y_priority = None

# TF-IDF vectorizer (shared)
tfidf = TfidfVectorizer(ngram_range=(1,2), min_df=2, max_df=0.95, preprocessor=None)
X_vect = tfidf.fit_transform(X)

# Train IsolationForest on TF-IDF dense representation
X_dense = X_vect.toarray()
iso = IsolationForest(n_estimators=200, contamination=0.01, random_state=42)
iso.fit(X_dense)

# Train multi-label classifier (One-vs-Rest)
print('\nTraining multi-label category classifier...')
base_clf = LogisticRegression(max_iter=2000, class_weight='balanced', solver='liblinear')
cat_clf = OneVsRestClassifier(base_clf)
cat_clf.fit(X_vect, y_multi)

# Optionally evaluate using a holdout set (simple random split)
try:
    X_train, X_test, y_train, y_test = train_test_split(X, y_multi, test_size=0.2, random_state=42)
    X_test_vect = tfidf.transform(X_test)
    y_pred = cat_clf.predict(X_test_vect)
    # Print micro/macro-level reports per label
    print('\nCategory classification report (per-label):')
    for i, col in enumerate(category_cols):
        print(f"--- {col} ---")
        print(classification_report(y_test[:, i], y_pred[:, i], zero_division=0))
except Exception as e:
    print('Skipping holdout evaluation due to:', e)

# Train priority classifier if priority column exists
if has_priority:
    print('\nTraining priority classifier...')
    prio_clf = LogisticRegression(max_iter=2000, class_weight='balanced', solver='liblinear')
    # Use same tfidf features
    prio_clf.fit(X_vect, y_priority)
    # Evaluate
    try:
        X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(X, y_priority, test_size=0.2, random_state=42, stratify=y_priority)
        X_test_p_vect = tfidf.transform(X_test_p)
        y_pred_p = prio_clf.predict(X_test_p_vect)
        print('\nPriority classification report:')
        print(classification_report(y_test_p, y_pred_p, target_names=priority_le.classes_, zero_division=0))
    except Exception as e:
        print('Skipping priority holdout eval due to:', e)
else:
    prio_clf = None

# Save artifacts
joblib.dump(tfidf, OUT_DIR / 'tfidf_vectorizer.joblib')
joblib.dump(cat_clf, OUT_DIR / 'category_model.joblib')
joblib.dump(category_cols, OUT_DIR / 'category_columns.joblib')
joblib.dump(iso, OUT_DIR / 'isoforest.joblib')
if has_priority:
    joblib.dump(prio_clf, OUT_DIR / 'priority_model.joblib')
    joblib.dump(priority_le, OUT_DIR / 'priority_encoder.joblib')

metadata = {
    'created_at': datetime.datetime.utcnow().isoformat(),
    'n_samples': int(df.shape[0]),
    'categories': category_cols,
    'has_priority': bool(has_priority),
}
with open(OUT_DIR / 'metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print('\nSaved model artifacts to', OUT_DIR)