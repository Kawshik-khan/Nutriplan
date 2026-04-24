@echo off
cls
echo ========================================
echo    Starting Nutriplan Full-Stack Apps
echo ========================================
echo.
echo All apps will be accessible through:
echo    http://localhost:3000
echo.
echo Service Mappings:
echo    - /              = Root Launcher (this page)
echo    - /landing/*     = Landing and Auth App (port 5173)
echo    - /dashboard/*   = Dashboard App (port 5174)
echo    - /api/*         = Backend API (port 4000)
echo.

set "ROOT_DIR=%~dp0"

:: Start Backend (Port 4000)
echo [1/4] Starting Backend API on port 4000...
start "Nutriplan Backend" cmd /c "cd /d ""%ROOT_DIR%backend"" ^&^& echo Starting Backend... ^&^& npm run dev"

timeout /t 3 /nobreak >nul

:: Start Landing Page (Port 5173)
echo [2/4] Starting Landing Page on port 5173...
start "Nutriplan Landing" cmd /c "cd /d ""%ROOT_DIR%Nutriplanlandingpage-main"" ^&^& echo Starting Landing Page... ^&^& npm run dev"

timeout /t 3 /nobreak >nul

:: Start Dashboard (Port 5174)
echo [3/4] Starting Dashboard App on port 5174...
start "Nutriplan Dashboard" cmd /c "cd /d ""%ROOT_DIR%Nutriplan-main"" ^&^& echo Starting Dashboard... ^&^& npm run dev"

timeout /t 3 /nobreak >nul

:: Start Root App (Port 3000) - Main Entry Point
echo [4/4] Starting Root Launcher on port 3000 (main entry point)...
start "Nutriplan Root Launcher" cmd /c "cd /d ""%ROOT_DIR%"" ^&^& echo [ROOT LAUNCHER - Main Entry Point] Starting... ^&^& npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo    All services are starting!
echo ========================================
echo.
echo Open your browser to:
echo    http://localhost:3000
echo.
echo Direct Access (if needed):
echo    - Landing Page:   http://localhost:5173
echo    - Dashboard:      http://localhost:5174
echo    - Backend API:    http://localhost:4000
echo.
echo All windows should now be open. Press any key to close this window.
pause >nul
