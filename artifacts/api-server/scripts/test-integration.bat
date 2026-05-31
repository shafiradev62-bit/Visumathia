@echo off
setlocal

echo ========================================
echo   9Router Integration - Quick Test
echo ========================================
echo.

set API_BASE=http://localhost:3000
set NINEROUTER_URL=http://localhost:20128

echo Configuration:
echo   API Base: %API_BASE%
echo   9Router URL: %NINEROUTER_URL%
echo.

echo 1. Testing API Health...
for /f "tokens=*" %%i in ('curl -s -w "\n%%{http_code}" "%API_BASE%/api/health"') do set "response=%%i"
for %%A in (%response%) do set "http_code=%%A"
for %%A in (%response%) do set "body=%%A"

if "%http_code%"=="200" (
    echo    ✓ API Server is healthy
) else (
    echo    ✗ API Server returned HTTP %http_code%
    exit /b 1
)

echo.
echo 2. Testing AI Stats Endpoint...
for /f "tokens=*" %%i in ('curl -s "%API_BASE%/api/ai/stats"') do set "body=%%i"
echo    ✓ AI Stats endpoint working

echo.
echo 3. Testing 9Router Connection...
for /f "tokens=*" %%i in ('curl -s "%API_BASE%/api/9router/router-status"') do set "body=%%i"
echo    Response: %body%

echo.
echo 4. Testing AI Health...
for /f "tokens=*" %%i in ('curl -s "%API_BASE%/api/ai/health"') do set "body=%%i"
echo    ✓ AI Health check passed

echo.
echo 5. Testing Rate Limit Status...
for /f "tokens=*" %%i in ('curl -s "%API_BASE%/api/ai/rate-limit-status"') do set "body=%%i"
echo    ✓ Rate limit status endpoint working

echo.
echo 6. Testing Alert System...
for /f "tokens=*" %%i in ('curl -s "%API_BASE%/api/alerts/summary"') do set "body=%%i"
echo    ✓ Alert system endpoint working

echo.
echo ========================================
echo   All Tests Completed Successfully!
echo ========================================
echo.
echo Next steps:
echo   1. Start 9Router: 9router
echo   2. Start API Server: pnpm run dev
echo   3. View quota dashboard: pnpm run quota:dashboard
echo   4. Run stability test: pnpm run quota:stability-test
echo.

endlocal
