@echo off
title Training Tracker — Launcher
echo.
echo  ==========================================
echo   Training Tracker — Starting servers...
echo  ==========================================
echo.

:: Start Backend in its own window
echo  [1/2] Starting Django backend on port 8000...
start "Training Tracker BACKEND" cmd /k "cd /d "%~dp0backend" && echo Backend starting... && venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000"

:: Small delay so backend starts first
timeout /t 3 /nobreak >nul

:: Start Frontend in its own window
echo  [2/2] Starting Vite frontend on port 5173...
start "Training Tracker FRONTEND" cmd /k "cd /d "%~dp0frontend" && echo Frontend starting... && npm run dev"

echo.
echo  ==========================================
echo   Servers are running!
echo.
echo   App:     http://localhost:5173
echo   API:     http://localhost:8000
echo  ==========================================
echo.
echo  To stop: close the BACKEND and FRONTEND windows,
echo  or double-click stop.bat
echo.
pause
