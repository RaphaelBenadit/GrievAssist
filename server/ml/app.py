# FastAPI application for ML model serving
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from serve_model import predict_complaint
import uvicorn
import tempfile
import os
import traceback

# Create FastAPI app
app = FastAPI(
    title="GrievAssist ML Service",
    description="ML service for complaint categorization, prioritization, and audio transcription",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== Whisper Model (lazy load) ==========
whisper_model = None

def get_whisper_model():
    global whisper_model
    if whisper_model is None:
        try:
            import whisper
            print("🎙️ Loading Whisper model (base)... This may take a moment on first run.")
            whisper_model = whisper.load_model("base")
            print("✅ Whisper model loaded successfully!")
        except Exception as e:
            print(f"❌ Failed to load Whisper model: {e}")
            raise e
    return whisper_model

# ========== Request/Response Models ==========
class PredictionRequest(BaseModel):
    text: str
    top_k: int = 3

class PredictionResponse(BaseModel):
    category: str
    priority: str
    confidence: float
    isFakeScore: float
    top_k: list
    secondary_categories: list
    category_probs: dict

class TranscriptionResponse(BaseModel):
    transcription: str
    summary: str
    detectedCategory: str
    detectedPriority: str
    detectedLanguage: str
    confidence: float

# ========== Health Check ==========
@app.get("/")
async def root():
    return {"message": "GrievAssist ML Service is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ml-prediction"}

# ========== Prediction Endpoint ==========
@app.post("/predict", response_model=PredictionResponse)
async def predict_complaint_endpoint(request: PredictionRequest):
    try:
        result = predict_complaint(request.text)
        response = PredictionResponse(
            category=result['dominant_category'],
            priority=result['priority'] or 'low',
            confidence=result['confidence'],
            isFakeScore=result['isFakeScore'],
            top_k=result['top_k'][:request.top_k] if request.top_k else result['top_k'],
            secondary_categories=result['secondary_categories'],
            category_probs=result['category_probs']
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# ========== Audio Transcription Endpoint ==========
@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Transcribe an audio file using Whisper and classify it using the ML model.
    Supports English and Tamil audio.
    """
    temp_path = None
    try:
        # Save uploaded file to temp location
        suffix = os.path.splitext(audio.filename)[1] if audio.filename else ".webm"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await audio.read()
            tmp.write(content)
            temp_path = tmp.name

        print(f"🎙️ Transcribing audio file: {audio.filename} ({len(content)} bytes)")

        # Transcribe with Whisper
        model = get_whisper_model()
        result = model.transcribe(
            temp_path,
            language=None,  # Auto-detect language
            task="transcribe"  # Keep original language
        )

        transcription = result.get("text", "").strip()
        detected_language = result.get("language", "unknown")

        # Map Whisper language codes to readable names
        lang_map = {
            "en": "english",
            "ta": "tamil",
            "hi": "hindi",
        }
        detected_language_name = lang_map.get(detected_language, detected_language)

        print(f"📝 Transcription ({detected_language_name}): {transcription[:100]}...")

        if not transcription:
            return {
                "transcription": "No speech detected in the recording.",
                "summary": "The audio recording did not contain detectable speech.",
                "detectedCategory": "other",
                "detectedPriority": "low",
                "detectedLanguage": detected_language_name,
                "confidence": 0.0
            }

        # Use existing ML model for category/priority classification
        try:
            ml_result = predict_complaint(transcription)
            category = ml_result['dominant_category']
            priority = ml_result['priority'] or 'low'
            confidence = ml_result['confidence']
        except Exception as ml_err:
            print(f"⚠️ ML classification failed, using fallback: {ml_err}")
            category = "other"
            priority = "medium"
            confidence = 0.0

        # Generate a simple summary from the transcription
        summary = generate_summary(transcription)

        response = {
            "transcription": transcription,
            "summary": summary,
            "detectedCategory": category,
            "detectedPriority": priority,
            "detectedLanguage": detected_language_name,
            "confidence": confidence
        }

        print(f"✅ Audio analysis complete: category={category}, priority={priority}, lang={detected_language_name}")
        return response

    except Exception as e:
        print(f"❌ Transcription error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        # Clean up temp file
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except:
                pass


def generate_summary(text: str) -> str:
    """Generate a concise summary from the transcription text."""
    sentences = text.replace(".", ".\n").replace("!", "!\n").replace("?", "?\n").strip().split("\n")
    sentences = [s.strip() for s in sentences if s.strip() and len(s.strip()) > 10]

    if not sentences:
        return text[:200] if len(text) > 200 else text

    # Take first 2-3 meaningful sentences as summary
    summary_sentences = sentences[:3]
    summary = " ".join(summary_sentences)

    # Truncate if too long
    if len(summary) > 300:
        summary = summary[:297] + "..."

    return summary


# ========== Video Analysis Endpoint ==========
class VideoAnalysisRequest(BaseModel):
    video_url: str
    complaint_id: str = None

class VideoAnalysisResponse(BaseModel):
    category: str
    confidence: float
    frames_analyzed: int
    frame_predictions: list = []


def analyze_video_frames(video_path: str, max_frames: int = 10):
    """Extract frames from video and analyze them for complaint categories."""
    try:
        import cv2
    except ImportError:
        print("⚠️ OpenCV not installed, using fallback analysis")
        return {"category": "unassigned", "confidence": 0.5, "frames_analyzed": 0, "frame_predictions": []}

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise Exception(f"Could not open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps if fps > 0 else 0

    print(f"📹 Video: {total_frames} frames, {fps:.1f} FPS, {duration:.1f}s duration")

    # Extract 1 frame per second, max 10 frames
    frame_interval = max(int(fps), 1)
    frames_to_extract = min(max_frames, int(duration) + 1)

    frame_predictions = []
    frame_idx = 0

    for i in range(frames_to_extract):
        target_frame = i * frame_interval
        cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
        ret, frame = cap.read()
        if not ret:
            break

        # Resize frame to 224x224 for analysis
        frame_resized = cv2.resize(frame, (224, 224))

        # Analyze frame using visual features
        prediction = classify_frame(frame_resized, cv2)
        frame_predictions.append(prediction)
        frame_idx += 1

    cap.release()

    if not frame_predictions:
        return {"category": "unassigned", "confidence": 0.5, "frames_analyzed": 0, "frame_predictions": []}

    # Majority voting across frames
    category_votes = {}
    confidence_sums = {}
    for pred in frame_predictions:
        cat = pred["category"]
        category_votes[cat] = category_votes.get(cat, 0) + 1
        confidence_sums[cat] = confidence_sums.get(cat, 0.0) + pred["confidence"]

    # Get winning category
    winning_category = max(category_votes, key=category_votes.get)
    avg_confidence = confidence_sums[winning_category] / category_votes[winning_category]

    return {
        "category": winning_category,
        "confidence": round(avg_confidence, 4),
        "frames_analyzed": len(frame_predictions),
        "frame_predictions": frame_predictions,
    }


def classify_frame(frame, cv2):
    """Classify a single frame using visual feature analysis.

    Uses color histograms, edge density, and brightness to detect:
    - Roads: grey/asphalt tones, edge lines
    - Garbage: diverse colors, high texture variation
    - Water: blue/brown water tones
    - Lighting: dark scenes, bright spots
    """
    import numpy as np

    # Convert to different color spaces
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Feature 1: Color histogram analysis
    h_hist = cv2.calcHist([hsv], [0], None, [180], [0, 180]).flatten()
    s_hist = cv2.calcHist([hsv], [1], None, [256], [0, 256]).flatten()
    v_hist = cv2.calcHist([hsv], [2], None, [256], [0, 256]).flatten()

    h_hist = h_hist / (h_hist.sum() + 1e-7)
    s_hist = s_hist / (s_hist.sum() + 1e-7)
    v_hist = v_hist / (v_hist.sum() + 1e-7)

    # Feature 2: Edge density (Canny)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.mean(edges) / 255.0

    # Feature 3: Mean brightness & saturation
    mean_brightness = np.mean(v_hist * np.arange(256))
    mean_saturation = np.mean(s_hist * np.arange(256))

    # Feature 4: Color dominance
    blue_ratio = np.sum(h_hist[90:130])   # Blue-cyan hues
    green_ratio = np.sum(h_hist[35:85])   # Green hues
    brown_ratio = np.sum(h_hist[10:25])   # Brown/earth hues
    grey_ratio = 1.0 - np.sum(s_hist[50:])  # Low saturation = grey

    # Score each category
    scores = {}

    # Roads: grey tones, medium edge density (road markings), low saturation
    scores["roads"] = float(
        grey_ratio * 0.35 +
        min(edge_density * 2, 1.0) * 0.35 +
        brown_ratio * 0.15 +
        (1.0 - mean_saturation / 256) * 0.15
    )

    # Garbage: high color variance (diverse items), high texture
    color_variance = float(np.std(h_hist))
    scores["garbage"] = float(
        color_variance * 3.0 * 0.3 +
        edge_density * 0.3 +
        brown_ratio * 0.2 +
        green_ratio * 0.2
    )

    # Water: blue tones, low edge density (smooth surface)
    scores["water"] = float(
        blue_ratio * 0.4 +
        (1.0 - edge_density) * 0.25 +
        mean_saturation / 256 * 0.2 +
        brown_ratio * 0.15
    )

    # Lighting: dark scenes, low brightness
    darkness = 1.0 - (mean_brightness / 256)
    scores["lighting"] = float(
        darkness * 0.5 +
        (1.0 - edge_density) * 0.2 +
        grey_ratio * 0.15 +
        (1.0 - mean_saturation / 256) * 0.15
    )

    # Normalize scores
    total = sum(scores.values()) + 1e-7
    for k in scores:
        scores[k] = scores[k] / total

    # Get predicted category
    predicted = max(scores, key=scores.get)
    confidence = scores[predicted]

    return {"category": predicted, "confidence": round(confidence, 4)}


@app.post("/analyze-video", response_model=VideoAnalysisResponse)
async def analyze_video_endpoint(request: VideoAnalysisRequest):
    """
    Download video from URL, extract frames, analyze with CV, and return category prediction.
    """
    temp_path = None
    try:
        import requests as req_lib

        # Step 1: Download video from Cloudinary URL
        print(f"📥 Downloading video from: {request.video_url[:80]}...")
        response = req_lib.get(request.video_url, stream=True, timeout=60)
        response.raise_for_status()

        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            for chunk in response.iter_content(chunk_size=8192):
                tmp.write(chunk)
            temp_path = tmp.name

        file_size = os.path.getsize(temp_path)
        print(f"💾 Downloaded video: {file_size / (1024*1024):.2f} MB")

        # Step 2: Analyze video frames
        result = analyze_video_frames(temp_path, max_frames=10)

        print(f"✅ Video analysis complete: {result['category']} ({result['confidence']:.2%}), {result['frames_analyzed']} frames")

        return VideoAnalysisResponse(
            category=result["category"],
            confidence=result["confidence"],
            frames_analyzed=result["frames_analyzed"],
            frame_predictions=result.get("frame_predictions", []),
        )

    except Exception as e:
        print(f"❌ Video analysis error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except:
                pass


# Run the app
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)

