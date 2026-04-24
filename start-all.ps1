# Nutriplan - Start All Services Script
# All services are now accessible through the root app on port 3000!

$originalDir = Get-Location

Write-Host "================================" -ForegroundColor Green
Write-Host "Starting Nutriplan Full-Stack Apps" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "All apps will be accessible through:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host ""
Write-Host "Service Mappings:" -ForegroundColor Cyan
Write-Host "  - /              → Root Launcher (this page)"
Write-Host "  - /landing/*     → Landing & Auth App (port 5173)"
Write-Host "  - /dashboard/*   → Dashboard App (port 5174)"
Write-Host "  - /api/*         → Backend API (port 4000)"
Write-Host ""

# Function to start a service in a new window
function Start-ServiceInWindow {
    param(
        [string]$Name,
        [string]$Directory,
        [string]$Command,
        [string]$Port
    )
    Write-Host "Starting $Name on port $Port..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Directory'; Write-Host '[$Name] Starting...' -ForegroundColor Yellow; $Command"
}

# Get the root directory
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $rootDir) { $rootDir = Get-Location }

# Start Backend (Port 4000)
Start-ServiceInWindow -Name "Backend API" -Directory "$rootDir\backend" -Command "npm run dev" -Port "4000"

Start-Sleep -Seconds 2

# Start Landing Page (Port 5173)
Start-ServiceInWindow -Name "Landing Page" -Directory "$rootDir\Nutriplanlandingpage-main" -Command "npm run dev" -Port "5173"

Start-Sleep -Seconds 2

# Start Dashboard (Port 5174)
Start-ServiceInWindow -Name "Dashboard App" -Directory "$rootDir\Nutriplan-main" -Command "npm run dev" -Port "5174"

Start-Sleep -Seconds 2

# Start Root App (Port 3000) - This is the main entry point
Write-Host "Starting Root Launcher on port 3000 (main entry point)..." -ForegroundColor Green -BackgroundColor Black
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir'; Write-Host '[ROOT LAUNCHER - Main Entry Point] Starting...' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "All services are starting!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Open your browser to:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host ""
Write-Host "Direct Access (if needed):" -ForegroundColor Gray
Write-Host "  - Landing Page:   http://localhost:5173"
Write-Host "  - Dashboard:      http://localhost:5174"
Write-Host "  - Backend API:    http://localhost:4000"
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
