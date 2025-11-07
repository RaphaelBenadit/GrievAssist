# GrievAssist Setup Guide

This guide will help you set up the complete GrievAssist system with ML integration.

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MongoDB (running locally or cloud instance)

## Quick Start (Windows)

### Option 1: Automated Setup
```bash
# Run the PowerShell script
.\start_all_services.ps1

# Or run the batch file
.\start_all_services.bat
```

### Option 2: Manual Setup

#### 1. Install ML Dependencies
```bash
cd server/ml
pip install -r requirements.txt
```

#### 2. Start ML Service
```bash
cd server/ml
python start_ml_service.py
```
**Expected output:**
```
🚀 Starting GrievAssist ML Service...
📍 Service will be available at: http://localhost:8001
🔗 Prediction endpoint: http://localhost:8001/predict
❤️  Health check: http://localhost:8001/health
📚 API docs: http://localhost:8001/docs
```

#### 3. Start Node.js Backend
```bash
cd server
npm install
npm start
```
**Expected output:**
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

#### 4. Start React Frontend
```bash
cd client
npm install
npm start
```
**Expected output:**
```
webpack compiled with 0 errors
Local:            http://localhost:3000
```

## Testing the Integration

### 1. Test ML Service
```bash
cd server/ml
python test_ml_service.py
```

### 2. Test Full Integration
```bash
python test_full_integration.py
```

### 3. Manual Testing

1. **Open Frontend**: http://localhost:3000
2. **Submit a Complaint**: Use the complaint form
3. **Check Backend Logs**: You should see:
   ```
   🔍 Attempting ML classification for: "your complaint text"
   ✅ ML Prediction: Category = garbage, Priority = medium
   📢 Notification created for complaint CMP-xxxxx
   ```

## Expected Workflow

1. **User submits complaint** → Frontend (React)
2. **Frontend sends to backend** → Node.js (Port 5000)
3. **Backend calls ML service** → FastAPI (Port 8001)
4. **ML service returns prediction** → Category, Priority, Confidence
5. **Backend saves complaint** → MongoDB
6. **Notification created** → Admin dashboard

## Troubleshooting

### Common Issues

#### 1. ML Service Won't Start
```bash
# Check if port 8001 is in use
netstat -an | findstr :8001

# Try a different port in start_ml_service.py
uvicorn.run(app, host="0.0.0.0", port=8002)
```

#### 2. Node.js Backend Connection Issues
- Check MongoDB is running
- Verify MONGO_URI in .env file
- Check if port 5000 is available

#### 3. CORS Errors
- Update CORS origins in `server/ml/app.py`
- Add your frontend URL to allowed origins

#### 4. ML Model Files Missing
```bash
cd server/ml
python train_model.py
```

### Port Configuration

| Service | Port | URL |
|---------|------|-----|
| React Frontend | 3000 | http://localhost:3000 |
| Node.js Backend | 5000 | http://localhost:5000 |
| ML Service | 8001 | http://localhost:8001 |
| MongoDB | 27017 | mongodb://localhost:27017 |

## Development Commands

```bash
# ML Service
npm run ml:start      # Start ML service
npm run ml:test       # Test ML service
npm run ml:install    # Install ML dependencies

# Backend
npm start             # Start Node.js backend
npm run dev          # Start with nodemon (auto-reload)

# Frontend
npm start            # Start React frontend
```

## API Documentation

- **ML Service API**: http://localhost:8001/docs
- **Backend API**: Check routes in `server/routes/`

## Success Indicators

✅ **ML Service**: `INFO: Uvicorn running on http://0.0.0.0:8001`
✅ **Backend**: `🚀 Server running on port 5000`
✅ **Frontend**: `webpack compiled with 0 errors`
✅ **Integration**: `✅ ML Prediction: Category = garbage, Priority = medium`

## Next Steps

1. **Train your model** with your own data
2. **Customize categories** in the training data
3. **Deploy to production** using Docker or cloud services
4. **Monitor performance** through the admin dashboard
