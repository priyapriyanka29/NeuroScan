@echo off
title Start MRI Brain Scan Analysis Application

REM --- Check if Python is installed ---
where python >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH.
    echo Please install Python 3.7+ and add it to your PATH environment variable.
    pause
    exit /b 1
)

REM --- Check if Node.js is installed ---
where npm >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js and add it to your PATH environment variable.
    pause
    exit /b 1
)

REM --- Set project folders relative to this script ---
set BACKEND_DIR=%~dp0app
set FRONTEND_DIR=%~dp0frontend

REM --- Create and activate virtual environment if it does not exist ---
if not exist "%BACKEND_DIR%\venv" (
    echo Creating Python virtual environment...
    python -m venv "%BACKEND_DIR%\venv"
)

echo Activating virtual environment...
call "%BACKEND_DIR%\venv\Scripts\activate.bat"

REM --- Upgrade pip and install required Python packages ---
echo Installing required Python packages...
pip install --upgrade pip
pip install fastapi uvicorn pillow numpy scikit-image python-multipart joblib scikit-learn pandas

REM --- Install frontend dependencies if not already installed ---
if not exist "%FRONTEND_DIR%\node_modules" (
    echo Installing frontend dependencies...
    cd /d "%FRONTEND_DIR%"
    npm install
)

REM --- Start backend in new terminal window ---
start cmd /k "cd /d %BACKEND_DIR% && call venv\Scripts\activate.bat && python -m uvicorn main:app --reload & pause"

REM --- Start frontend in new terminal window ---
start cmd /k "cd /d %FRONTEND_DIR% && npm run dev & pause"

echo All services started.
echo Please wait until backend and frontend are fully ready.
echo Then open your browser and go to http://localhost:5173
pause
