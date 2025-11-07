# GrievAssist Full Stack Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    GrievAssist Full Stack Startup" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Starting all services..." -ForegroundColor Green
Write-Host ""

# Install ML dependencies
Write-Host "📦 Installing ML dependencies..." -ForegroundColor Yellow
Set-Location "server\ml"
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install ML dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🤖 Starting ML Service (Port 8001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python start_ml_service.py" -WindowStyle Normal

Write-Host ""
Write-Host "⏳ Waiting for ML service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🗄️  Starting Node.js Backend (Port 5000)..." -ForegroundColor Yellow
Set-Location ".."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

Write-Host ""
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "⚛️  Starting React Frontend (Port 3000)..." -ForegroundColor Yellow
Set-Location "..\client"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Blue
Write-Host "🔧 Backend:  http://localhost:5000" -ForegroundColor Blue
Write-Host "🤖 ML API:   http://localhost:8001" -ForegroundColor Blue
Write-Host "📚 ML Docs:  http://localhost:8001/docs" -ForegroundColor Blue
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
Read-Host
