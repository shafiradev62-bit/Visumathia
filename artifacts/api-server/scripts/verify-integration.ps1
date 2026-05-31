@echo off
setlocal

echo ========================================
echo   9Router Integration - Verification
echo ========================================
echo.

set API_BASE=http://localhost:3000
set NINEROUTER_URL=http://localhost:20128

echo [1/6] Checking 9Router Server...
curl -Method Get -Uri "%NINEROUTER_URL%" -TimeoutSec 5 -ErrorAction SilentlyContinue | Out-String
if %ERRORLEVEL% EQU 0 (
    echo     SUCCESS: 9Router is running
) else (
    echo     WARNING: 9Router not responding
)
echo.

echo [2/6] Testing API Server Health...
curl -Method Get -Uri "%API_BASE%/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue | Out-String
echo.

echo [3/6] Testing AI Stats...
curl -Method Get -Uri "%API_BASE%/api/ai/stats" -TimeoutSec 5 -ErrorAction SilentlyContinue | Out-String
echo.

echo [4/6] Testing AI Health...
curl -Method Get -Uri "%API_BASE%/api/ai/health" -TimeoutSec 5 -ErrorAction SilentlyContinue | Out-String
echo.

echo [5/6] Testing Rate Limit Status...
curl -Method Get -Uri "%API_BASE%/api/ai/rate-limit-status" -TimeoutSec 5 -ErrorAction SilentlyContinue | Out-String
echo.

echo [6/6] Testing 9Router Status...
curl -Method Get -Uri "%API_BASE%/api/9router/router-status" -TimeoutSec 5 -ErrorAction SilentlyContinue | Out-String
echo.

echo ========================================
echo   Verification Complete
echo ========================================
echo.
echo Available Endpoints:
echo   - Health: %API_BASE%/api/health
echo   - AI Stats: %API_BASE%/api/ai/stats
echo   - 9Router Dashboard: %API_BASE%/api/9router/dashboard
echo   - Alerts: %API_BASE%/api/alerts/summary
echo.
echo Scripts:
echo   - Real-time Dashboard: pnpm run quota:dashboard
echo   - Analysis: pnpm run quota:analyze
echo   - Stability Test: pnpm run quota:stability-test
echo.

endlocal
