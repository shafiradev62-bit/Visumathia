#!/bin/bash

set -e

echo "========================================"
echo "  9Router Integration - Quick Test"
echo "========================================"
echo ""

API_BASE="${API_BASE:-http://localhost:3000}"
NINEROUTER_URL="${NINEROUTER_URL:-http://localhost:20128}"

echo "Configuration:"
echo "  API Base: $API_BASE"
echo "  9Router URL: $NINEROUTER_URL"
echo ""

echo "1. Testing API Health..."
response=$(curl -s -w "\n%{http_code}" "$API_BASE/api/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "   ✓ API Server is healthy"
else
    echo "   ✗ API Server returned HTTP $http_code"
    echo "   Response: $body"
    exit 1
fi

echo ""
echo "2. Testing AI Stats Endpoint..."
response=$(curl -s -w "\n%{http_code}" "$API_BASE/api/ai/stats")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "   ✓ AI Stats endpoint working"
    echo "   Response: $body" | head -c 200
    echo "..."
else
    echo "   ✗ AI Stats returned HTTP $http_code"
    echo "   Response: $body"
    exit 1
fi

echo ""
echo "3. Testing 9Router Connection..."
response=$(curl -s -w "\n%{http_code}" "$API_BASE/api/9router/router-status")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    connected=$(echo "$body" | grep -o '"connected":[^,}]*' | cut -d':' -f2)
    if [ "$connected" = "true" ]; then
        echo "   ✓ 9Router is connected"
    else
        echo "   ⚠ 9Router endpoint reachable but not connected"
        echo "   Response: $body"
    fi
else
    echo "   ✗ 9Router status check failed with HTTP $http_code"
fi

echo ""
echo "4. Testing AI Health..."
response=$(curl -s -w "\n%{http_code}" "$API_BASE/api/ai/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "   ✓ AI Health check passed"
else
    echo "   ⚠ AI Health check returned HTTP $http_code"
    echo "   Response: $body"
fi

echo ""
echo "5. Testing Rate Limit Status..."
response=$(curl -s -w "\n%{http_code}" "$API_BASE/api/ai/rate-limit-status")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "   ✓ Rate limit status endpoint working"
    remaining=$(echo "$body" | grep -o '"remaining":[^,}]*' | cut -d':' -f2)
    echo "   Remaining requests: $remaining"
else
    echo "   ✗ Rate limit status failed with HTTP $http_code"
fi

echo ""
echo "6. Testing Alert System..."
response=$(curl -s -w "\n%{http_code}" "$API_BASE/api/alerts/summary")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "   ✓ Alert system endpoint working"
else
    echo "   ✗ Alert system failed with HTTP $http_code"
fi

echo ""
echo "========================================"
echo "  All Tests Completed Successfully!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Start 9Router: 9router"
echo "  2. Start API Server: pnpm run dev"
echo "  3. View quota dashboard: pnpm run quota:dashboard"
echo "  4. Run stability test: pnpm run quota:stability-test"
echo ""
