# -----------------------------------------------------------------------------
# FILE: server/ml/train_model.py
# Improved training pipeline for GrievAssist complaint classification
# -----------------------------------------------------------------------------
import json
from pathlib import Path
import joblib
import pandas as pd
import numpy as np
import datetime
import re
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.ensemble import (
    IsolationForest,
    GradientBoostingClassifier,
    RandomForestClassifier,
)
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import LabelEncoder, MultiLabelBinarizer
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.multiclass import OneVsRestClassifier
from sklearn.metrics import classification_report, accuracy_score, f1_score
import warnings
warnings.filterwarnings('ignore')

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / 'data'

# Load ALL available datasets and merge them
datasets = []
for csv_name in ['complaints_dataset.csv', 'complaints_labeled.csv']:
    csv_path = DATA_DIR / csv_name
    if csv_path.exists():
        print(f"  Loading {csv_name}...")
        datasets.append(pd.read_csv(csv_path))

if not datasets:
    raise FileNotFoundError(
        f"No dataset found. Place complaints_dataset.csv or complaints_labeled.csv in {DATA_DIR}"
    )

df = pd.concat(datasets, ignore_index=True)
print(f"Combined dataset: {len(df)} samples")

OUT_DIR = BASE_DIR / 'models'
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Text Preprocessing (enhanced)
# ---------------------------------------------------------------------------
# Common complaint-domain stop words that don't help classification
DOMAIN_STOPWORDS = {
    'pls', 'please', 'fix', 'soon', 'near', 'my', 'home', 'causing',
    'problem', 'public', 'not', 'cleaned', 'week', 'everyday', 'issue',
    'totally', 'ignored', 'workers', 'urgent', 'attention', 'needed',
    'unsafe', 'kids', 'smells', 'really', 'bad'
}

def clean_text(text: str) -> str:
    """Enhanced text cleaning for complaint descriptions."""
    if not isinstance(text, str):
        text = str(text)
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', ' ', text)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def clean_text_no_stopwords(text: str) -> str:
    """Clean text and remove domain-specific stopwords for better TF-IDF features."""
    cleaned = clean_text(text)
    tokens = cleaned.split()
    tokens = [t for t in tokens if t not in DOMAIN_STOPWORDS and len(t) > 1]
    return ' '.join(tokens)


# ---------------------------------------------------------------------------
# Data Validation & Cleaning
# ---------------------------------------------------------------------------
if 'description' not in df.columns:
    raise ValueError('CSV must include a "description" column')

# Identify category columns
reserved = {'description', 'priority'}
category_cols = [c for c in df.columns if c not in reserved]
if len(category_cols) == 0:
    if 'category' in df.columns:
        df['category'] = df['category'].astype(str).str.lower().str.strip()
        unique = sorted(df['category'].unique())
        for u in unique:
            df[u] = (df['category'] == u).astype(int)
        category_cols = unique
    else:
        raise ValueError('No category columns detected.')

print(f'Category columns: {category_cols}')

# Drop rows with empty descriptions
df = df.dropna(subset=['description']).reset_index(drop=True)

# Remove exact duplicate descriptions (keep first)
before_dedup = len(df)
df = df.drop_duplicates(subset=['description'], keep='first').reset_index(drop=True)
print(f'Removed {before_dedup - len(df)} duplicate descriptions. Remaining: {len(df)}')

# Clean descriptions
df['description_clean'] = df['description'].astype(str).apply(clean_text)
df['description_features'] = df['description'].astype(str).apply(clean_text_no_stopwords)

# ---------------------------------------------------------------------------
# Data Augmentation: generate paraphrased variants
# ---------------------------------------------------------------------------
def augment_data(df, category_cols, n_augments=2):
    """Simple data augmentation by word reordering and synonym injection."""
    augmented_rows = []

    # Synonym map for complaint domain
    synonyms = {
        'road': ['roadway', 'highway', 'street', 'path'],
        'pothole': ['crater', 'pit', 'hole', 'depression'],
        'water': ['water supply', 'drinking water', 'tap water'],
        'garbage': ['waste', 'trash', 'rubbish', 'litter'],
        'fire': ['blaze', 'flames', 'inferno', 'burning'],
        'drain': ['drainage', 'sewer', 'gutter', 'channel'],
        'flood': ['waterlogging', 'inundation', 'submersion'],
        'light': ['lamp', 'illumination', 'streetlight', 'bulb'],
        'traffic': ['congestion', 'gridlock', 'bottleneck', 'jam'],
        'broken': ['damaged', 'cracked', 'shattered', 'deteriorated'],
        'leak': ['leaking', 'seeping', 'dripping', 'oozing'],
        'blocked': ['clogged', 'choked', 'obstructed', 'jammed'],
        'dangerous': ['hazardous', 'risky', 'unsafe', 'perilous'],
        'stench': ['odour', 'smell', 'foul odor', 'stink'],
        'dark': ['unlit', 'pitch black', 'no visibility', 'dim'],
        'overflow': ['overflowing', 'spilling', 'flooding over'],
    }

    np.random.seed(42)
    for _, row in df.iterrows():
        text = row['description_clean']
        words = text.split()
        if len(words) < 4:
            continue

        for _ in range(n_augments):
            new_words = words.copy()
            # Randomly apply synonym replacement (30% chance per word)
            for i, w in enumerate(new_words):
                if w in synonyms and np.random.random() < 0.3:
                    new_words[i] = np.random.choice(synonyms[w])

            # Randomly swap adjacent words (10% chance)
            for i in range(len(new_words) - 1):
                if np.random.random() < 0.1:
                    new_words[i], new_words[i+1] = new_words[i+1], new_words[i]

            new_text = ' '.join(new_words)
            if new_text != text:  # Only add if different
                new_row = row.copy()
                new_row['description_clean'] = new_text
                new_row['description_features'] = clean_text_no_stopwords(new_text)
                augmented_rows.append(new_row)

    if augmented_rows:
        aug_df = pd.DataFrame(augmented_rows)
        print(f'Generated {len(aug_df)} augmented samples')
        return pd.concat([df, aug_df], ignore_index=True)
    return df

print('\nAugmenting dataset...')
df = augment_data(df, category_cols, n_augments=2)
print(f'Total samples after augmentation: {len(df)}')

# ---------------------------------------------------------------------------
# Build Features: Combined Word + Character n-gram TF-IDF
# ---------------------------------------------------------------------------
print('\nBuilding TF-IDF features...')

# Word-level TF-IDF
word_tfidf = TfidfVectorizer(
    analyzer='word',
    ngram_range=(1, 3),        # Capture up to 3-word phrases
    min_df=2,
    max_df=0.9,
    max_features=8000,
    sublinear_tf=True,         # Apply log normalization
    strip_accents='unicode',
)

# Character-level TF-IDF (captures partial word matches, typos)
char_tfidf = TfidfVectorizer(
    analyzer='char_wb',
    ngram_range=(3, 5),
    min_df=2,
    max_df=0.9,
    max_features=5000,
    sublinear_tf=True,
    strip_accents='unicode',
)

# Combine both feature sets
tfidf = FeatureUnion([
    ('word', word_tfidf),
    ('char', char_tfidf),
], n_jobs=1)

X = df['description_features'].values
y_multi = df[category_cols].astype(int).values

X_vect = tfidf.fit_transform(X)
print(f'Feature matrix shape: {X_vect.shape}')

# ---------------------------------------------------------------------------
# IsolationForest for anomaly/fake detection
# ---------------------------------------------------------------------------
print('\nTraining IsolationForest...')
X_dense_sample = X_vect.toarray()
iso = IsolationForest(n_estimators=300, contamination=0.02, random_state=42, n_jobs=-1)
iso.fit(X_dense_sample)

# ---------------------------------------------------------------------------
# Multi-label Category Classifier
# ---------------------------------------------------------------------------
print('\nTraining multi-label category classifier...')

# Use Calibrated LinearSVC (better for text classification than LogisticRegression)
base_clf = LinearSVC(
    C=1.0,
    class_weight='balanced',
    max_iter=5000,
    loss='squared_hinge',
    random_state=42,
)
calibrated_clf = CalibratedClassifierCV(base_clf, cv=3, method='sigmoid')
cat_clf = OneVsRestClassifier(calibrated_clf, n_jobs=-1)
cat_clf.fit(X_vect, y_multi)
print('Category classifier trained successfully.')

# ---------------------------------------------------------------------------
# Evaluation: Stratified split
# ---------------------------------------------------------------------------
print('\n' + '='*60)
print('EVALUATION: Category Classification')
print('='*60)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_multi, test_size=0.2, random_state=42
)
X_test_vect = tfidf.transform(X_test)
y_pred = cat_clf.predict(X_test_vect)

for i, col in enumerate(category_cols):
    f1 = f1_score(y_test[:, i], y_pred[:, i], zero_division=0)
    print(f"  {col:12s} -> F1: {f1:.3f}")

# Overall metrics
from sklearn.metrics import hamming_loss
print(f"\n  Hamming Loss: {hamming_loss(y_test, y_pred):.4f}")
print(f"  Micro F1:     {f1_score(y_test, y_pred, average='micro', zero_division=0):.3f}")
print(f"  Macro F1:     {f1_score(y_test, y_pred, average='macro', zero_division=0):.3f}")

# ---------------------------------------------------------------------------
# Priority Classifier (with keyword features)
# ---------------------------------------------------------------------------
has_priority = 'priority' in df.columns
if has_priority:
    print('\n' + '='*60)
    print('TRAINING: Priority Classifier')
    print('='*60)

    df['priority'] = df['priority'].astype(str).str.lower().str.strip()
    # Normalize priority values
    priority_map = {
        'high': 'high', 'h': 'high', 'critical': 'high', 'urgent': 'high',
        'medium': 'medium', 'med': 'medium', 'moderate': 'medium', 'm': 'medium',
        'low': 'low', 'l': 'low', 'minor': 'low',
    }
    df['priority'] = df['priority'].map(lambda x: priority_map.get(x, x))

    priority_le = LabelEncoder()
    y_priority = priority_le.fit_transform(df['priority'].values)

    # Use Gradient Boosting for priority (handles class imbalance better)
    prio_clf = GradientBoostingClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.1,
        subsample=0.8,
        random_state=42,
    )
    prio_clf.fit(X_vect, y_priority)

    # Evaluate priority
    try:
        X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(
            X, y_priority, test_size=0.2, random_state=42, stratify=y_priority
        )
        X_test_p_vect = tfidf.transform(X_test_p)
        y_pred_p = prio_clf.predict(X_test_p_vect)
        print('\nPriority classification report:')
        print(classification_report(
            y_test_p, y_pred_p,
            target_names=priority_le.classes_,
            zero_division=0
        ))
        print(f"  Accuracy: {accuracy_score(y_test_p, y_pred_p):.3f}")
    except Exception as e:
        print(f'Skipping priority eval: {e}')
else:
    prio_clf = None
    priority_le = None

# ---------------------------------------------------------------------------
# Save Artifacts
# ---------------------------------------------------------------------------
print('\nSaving model artifacts...')

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
    'n_original_samples': int(len(df)),
    'n_features': int(X_vect.shape[1]),
    'categories': list(category_cols),
    'has_priority': bool(has_priority),
    'model_type': 'CalibratedLinearSVC',
    'priority_model_type': 'GradientBoosting' if has_priority else None,
    'tfidf_config': 'word(1-3gram) + char_wb(3-5gram)',
}
with open(OUT_DIR / 'metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print(f'\n[OK] All model artifacts saved to {OUT_DIR}')
print(f'   Total training samples: {len(df)}')
print(f'   Feature dimensions: {X_vect.shape[1]}')
print(f'   Categories: {category_cols}')