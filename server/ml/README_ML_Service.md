# GrievAssist ML Service

This directory contains the machine learning service for complaint categorization and prioritization.

## Quick Start

### 1. Install Dependencies
```bash
cd server/ml
pip install -r requirements.txt
```

### 2. Start the ML Service
```bash
# Option 1: Using the startup script
python start_ml_service.py

# Option 2: Using uvicorn directly
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Test the Service
```bash
python test_ml_service.py
```

## API Endpoints

- **Health Check**: `GET http://localhost:8001/health`
- **Prediction**: `POST http://localhost:8001/predict`
- **API Documentation**: `http://localhost:8001/docs`

## Request Format

```json
{
  "text": "Complaint description here",
  "top_k": 3
}
```

## Response Format

```json
{
  "category": "garbage",
  "priority": "medium", 
  "confidence": 0.85,
  "isFakeScore": 0.1,
  "top_k": [
    {"label": "garbage", "score": 0.85},
    {"label": "roads", "score": 0.10},
    {"label": "utilities", "score": 0.05}
  ],
  "secondary_categories": ["roads"],
  "category_probs": {
    "garbage": 0.85,
    "roads": 0.10,
    "utilities": 0.05
  }
}
```

## Integration with Node.js Backend

The Node.js backend is already configured to call this service at `http://localhost:8001/predict`.

Make sure both services are running:
1. ML Service: `python start_ml_service.py` (port 8001)
2. Node.js Backend: `npm start` (port 5000)
3. React Frontend: `npm start` (port 3000)

## Troubleshooting

### Common Issues

1. **Port 8001 already in use**: Change the port in `start_ml_service.py`
2. **Model files missing**: Run `python train_model.py` first
3. **CORS errors**: Check that the frontend URL is in the CORS origins list in `app.py`

### Logs

The service logs all requests and responses. Check the terminal output for:
- `🔍 Attempting ML classification for: "complaint text"`
- `✅ ML Prediction: Category = garbage, Priority = medium`
- `📢 Notification created for complaint CMP-xxxxx`
