@echo off
title NeuroScan - Alzheimer's Disease Stage Classification
echo =====================================================================
echo                NeuroScan Healthcare AI Research System
echo           Alzheimer's Disease Stage Classification & Grad-CAM
echo =====================================================================
echo.

REM --- Check Python ---
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3.8+ and ensure it is added to PATH.
    pause
    exit /b 1
)

REM --- Check Node.js / NPM ---
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js / npm is not installed or not in your PATH.
    echo Please install Node.js (v18+) and ensure it is added to PATH.
    pause
    exit /b 1
)

set ROOT_DIR=%~dp0
set BACKEND_DIR=%ROOT_DIR%backend
set FRONTEND_DIR=%ROOT_DIR%frontend

echo [*] Initializing NeuroScan Backend Environment...
if not exist "%BACKEND_DIR%\venv" (
    echo [*] Creating Python virtual environment in %BACKEND_DIR%\venv...
    python -m venv "%BACKEND_DIR%\venv"
)

echo [*] Activating backend virtual environment...
call "%BACKEND_DIR%\venv\Scripts\activate.bat"

echo [*] Checking backend dependencies...
pip install -r "%BACKEND_DIR%\requirements.txt" --quiet

echo [*] Checking frontend dependencies...
if not exist "%FRONTEND_DIR%\node_modules" (
    echo [*] Installing frontend npm packages...
    cd /d "%FRONTEND_DIR%"
    call npm install
)

echo.
echo [*] Starting NeuroScan FastAPI Backend on http://127.0.0.1:8000...
start "NeuroScan Backend API" cmd /k "cd /d %BACKEND_DIR% && call venv\Scripts\activate.bat && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo [*] Starting NeuroScan React Frontend on http://127.0.0.1:5173...
start "NeuroScan Frontend UI" cmd /k "cd /d %FRONTEND_DIR% && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo =====================================================================
echo  NeuroScan services are starting!
echo  - Frontend Dashboard: http://127.0.0.1:5173
echo  - Backend API & Docs: http://127.0.0.1:8000/docs
echo =====================================================================
echo.
pause
