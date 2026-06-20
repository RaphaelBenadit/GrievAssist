#!/usr/bin/env python3
"""
Startup script for the ML service
Run this to start the FastAPI ML service on port 8001
"""

import uvicorn

if __name__ == "__main__":
    print("🚀 Starting GrievAssist ML Service...")
    print("📍 Service will be available at: http://localhost:8001")
    print("🔗 Prediction endpoint: http://localhost:8001/predict")
    print("❤️  Health check: http://localhost:8001/health")
    print("📚 API docs: http://localhost:8001/docs")
    print("=" * 50)
    
    uvicorn.run(
        "app:app",  # <-- Import string matches your file name 'app.py'
        host="0.0.0.0",
        port=8001,
        reload=False,  # Disabled to avoid stale cache issues
        log_level="info"
    )
