@echo off
echo Starting Holographic Pulse System...

REM Check if Docker is running
docker info > nul 2>&1
if errorlevel 1 (
    echo Docker is not running! Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Create necessary directories if they don't exist
if not exist "data" mkdir data
if not exist "monitoring" mkdir monitoring

REM Build and start the containers
echo Building and starting containers...
docker-compose up --build -d

REM Wait for services to be ready
echo Waiting for services to start...
timeout /t 10 /nobreak

REM Check service health
echo Checking service health...
docker-compose ps

echo.
echo Holographic Pulse System is ready!
echo API is available at http://localhost:5000
echo Grafana dashboard is at http://localhost:3000 (admin/admin)
echo.
echo Press any key to view logs (Ctrl+C to exit logs)
pause > nul

REM Show logs
docker-compose logs -f