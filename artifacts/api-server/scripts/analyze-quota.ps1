@echo off
setlocal EnableDelayedExpansion

echo ========================================
echo   9Router Quota Analysis - PowerShell
echo ========================================
echo.

set API_BASE=http://localhost:3000

echo Fetching AI Stats...
set statsResponse=
for /f "tokens=*" %%i in ('curl -s -Method Get -Uri "%API_BASE%/api/ai/stats" -TimeoutSec 5') do set "statsResponse=!statsResponse!%%i"

if defined statsResponse (
    echo Response:
    echo %statsResponse%
    echo.
) else (
    echo Failed to fetch stats from API.
    echo Make sure the API server is running.
    echo Start with: pnpm run dev
    echo.
)

echo Fetching Rate Limit Status...
set rateLimitResponse=
for /f "tokens=*" %%i in ('curl -s -Method Get -Uri "%API_BASE%/api/ai/rate-limit-status" -TimeoutSec 5') do set "rateLimitResponse=!rateLimitResponse!%%i"

if defined rateLimitResponse (
    echo Rate Limit Status:
    echo %rateLimitResponse%
    echo.
)

echo Fetching Alert Summary...
set alertResponse=
for /f "tokens=*" %%i in ('curl -s -Method Get -Uri "%API_BASE%/api/alerts/summary" -TimeoutSec 5') do set "alertResponse=!alertResponse!%%i"

if defined alertResponse (
    echo Alert Summary:
    echo %alertResponse%
    echo.
)

echo Checking 9Router Connection...
set routerResponse=
for /f "tokens=*" %%i in ('curl -s -Method Get -Uri "%API_BASE%/api/9router/router-status" -TimeoutSec 5') do set "routerResponse=!routerResponse!%%i"

if defined routerResponse (
    echo 9Router Status:
    echo %routerResponse%
    echo.
)

echo ========================================
echo   Analysis Complete
echo ========================================
echo.

endlocal
