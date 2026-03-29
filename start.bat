@echo off
echo Starting E-Commerce Backend Server...
start "E-Com Backend" cmd /k "cd /d "%~dp0backend" && node server.js"
timeout /t 2 /nobreak > nul
echo Starting E-Commerce Frontend Server...
start "E-Com Frontend" cmd /k "cd /d "%~dp0frontend" && npx vite --port 3000"
echo.
echo ==========================================
echo Both servers are starting...
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo ==========================================
echo Open http://localhost:3000 in your browser
pause
