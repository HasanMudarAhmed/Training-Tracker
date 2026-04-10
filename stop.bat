@echo off
title Training Tracker — Stop
echo.
echo  Stopping Training Tracker servers...
echo.
taskkill /FI "WINDOWTITLE eq Training Tracker BACKEND*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Training Tracker FRONTEND*" /F >nul 2>&1
taskkill /IM "python.exe" /F >nul 2>&1
taskkill /IM "node.exe" /F >nul 2>&1
echo  All servers stopped.
echo.
pause
