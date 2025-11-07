@echo off
echo ========================================
echo    GrievAssist Full Stack Startup
echo ========================================
echo.

echo 🚀 Starting all services...
echo.

echo 📦 Installing ML dependencies...
cd server\ml
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install ML dependencies
    pause
    exit /b 1
)

echo.
echo 🤖 Starting ML Service (Port 8001)...
start "ML Service" cmd /k "python start_ml_service.py"

echo.
echo ⏳ Waiting for ML service to start...
timeout /t 5 /nobreak >nul

echo.
echo 🗄️  Starting Node.js Backend (Port 5000)...
cd ..
start "Node Backend" cmd /k "npm start"

echo.
echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo ⚛️  Starting React Frontend (Port 3000)...
cd ..\client
start "React Frontend" cmd /k "npm start"

echo.
echo ========================================
echo ✅ All services started!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000  
echo 🤖 ML API:   http://localhost:8001
echo 📚 ML Docs:  http://localhost:8001/docs
echo.
echo Press any key to close this window...
pause >nul
