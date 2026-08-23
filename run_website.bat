@echo off
cd /d "%~dp0"

echo Starting Skillswap Campus website...

echo Installing dependencies (backend)...
cd /d "%~dp0backend"
if exist package.json (
    npm install
) else (
    echo No package.json in backend; skipping npm install.
)

echo Installing dependencies (frontend)...
cd /d "%~dp0frontend"
if exist package.json (
    npm install
) else (
    echo No package.json in frontend; skipping npm install.
)

cd /d "%~dp0"
echo Launching backend and frontend...
start "Backend" /MIN cmd /c "cd /d \"%~dp0backend\" && npm run dev"
start "Frontend" /MIN cmd /c "cd /d \"%~dp0frontend\" && npm run dev"

timeout /t 5 /nobreak >nul

echo Opening browser to http://localhost:5173
start "" "http://localhost:5173"

echo Website launch requested. Backend and frontend are running in the background.
