# FastAPI application for ML model serving
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from serve_model import predict_complaint
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="GrievAssist ML Service",
    description="ML service for complaint categorization and prioritization",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],  # React frontend and Node.js backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
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

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "GrievAssist ML Service is running", "status": "healthy"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ml-prediction"}

# Main prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict_complaint_endpoint(request: PredictionRequest):
    try:
        # Get prediction from the model
        result = predict_complaint(request.text)
        
        # Map the result to the expected response format
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

# Run the app
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
