# 9Router AI Quota Optimization - Quick Start Guide

## Prerequisites
- 9Router installed globally: `npm install -g 9router`
- Node.js and pnpm installed

## Quick Setup

### 1. Start 9Router
```bash
9router
```
Output:
```
Server: localhost:20128
Dasbor: localhost:20128/dashboard
Siap untuk melakukan routing ✓
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NINEROUTER_URL=http://localhost:20128
AI_API_KEY=your-openai-api-key
AI_PROXY_ENABLED=true
AI_RATE_LIMIT_ENABLED=true
AI_MAX_REQUESTS_PER_MINUTE=60
AI_MAX_TOKENS_PER_DAY=100000
```

### 3. Start API Server
```bash
cd artifacts/api-server
pnpm install
pnpm run dev
```

## Available Endpoints

### AI Proxy
- `POST /api/ai/proxy/:provider/:model` - Proxy AI requests through 9Router
- `GET /api/ai/stats` - Get usage statistics
- `GET /api/ai/health` - Health check with quota status
- `PUT /api/ai/config` - Update quota configuration
- `POST /api/ai/cache/clear` - Clear cache

### 9Router Dashboard
- `GET /api/9router/dashboard` - Access 9Router dashboard
- `GET /api/9router/router-status` - Check 9Router connection
- `GET /api/9router/router-metrics` - Get 9Router metrics

### Alerts
- `GET /api/alerts` - Get recent alerts
- `GET /api/alerts/summary` - Alert summary
- `POST /api/alerts/:id/acknowledge` - Acknowledge alert
- `GET /api/alerts/realtime` - SSE stream for real-time alerts

## Monitoring Tools

### Quota Dashboard (Real-time)
```bash
pnpm run quota:dashboard
```
Shows:
- Token usage progress bar
- Rate limit status
- Cache statistics
- Active alerts
- Recent activity

### Quota Analysis
```bash
pnpm run quota:analyze
```
Provides optimization suggestions based on current usage patterns.

### Stability Test (72 hours)
```bash
pnpm run quota:stability-test
```
Monitors all endpoints continuously for the specified duration.

### Quick Integration Test
```bash
# Unix/Mac
bash scripts/test-integration.sh

# Windows
scripts\test-integration.bat
```

## Configuration

### Rate Limiting
Adjust in `.env` or via API:
```env
AI_RATE_LIMIT_ENABLED=true
AI_MAX_REQUESTS_PER_MINUTE=60
```

### Caching
```env
AI_CACHE_ENABLED=true
AI_CACHE_TTL=3600
AI_CACHE_MAX_SIZE=1000
```

### Alert Thresholds
```env
AI_WARNING_THRESHOLD=0.7
AI_CRITICAL_THRESHOLD=0.9
```

## Testing

### Health Check
```bash
curl http://localhost:3000/api/ai/health
```

### Get Stats
```bash
curl http://localhost:3000/api/ai/stats
```

### Test Proxy
```bash
curl -X POST http://localhost:3000/api/ai/proxy/openai/gpt-4 \
  -H "Content-Type: application/json" \
  -H "X-AI-API-Key: your-key" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

## Dashboard Access

### 9Router Dashboard
Open in browser:
```
http://localhost:3000/api/9router/dashboard
```

### Local Quota Dashboard
Run in terminal:
```bash
pnpm run quota:dashboard
```

## Troubleshooting

### 9Router Not Available
```bash
# Check if 9Router is running
curl http://localhost:20128

# Restart 9Router
9router
```

### Rate Limit Exceeded
```bash
# Check rate limit status
curl http://localhost:3000/api/ai/rate-limit-status

# Wait for reset or adjust limit
curl -X PUT http://localhost:3000/api/ai/config \
  -H "Content-Type: application/json" \
  -d '{"maxRequestsPerMinute": 120}'
```

### High Token Usage
```bash
# Analyze usage patterns
pnpm run quota:analyze

# Clear cache if needed
curl -X POST http://localhost:3000/api/ai/cache/clear
```

## Optimization Tips

1. **Enable Caching**: Reduces redundant API calls
2. **Set Appropriate Rate Limits**: Balance between responsiveness and quota conservation
3. **Monitor Alert Thresholds**: Get early warnings before quota exhaustion
4. **Use Request Batching**: Combine multiple requests when possible
5. **Review Cache Hit Ratio**: Aim for >50% cache hit rate

## Files Created

### Core Integration
- `src/lib/aiQuotaManager.ts` - Main quota management system
- `src/lib/quotaAlertSystem.ts` - Alert management
- `src/routes/aiQuota.ts` - AI quota API routes
- `src/routes/ninerouter.ts` - 9Router proxy routes
- `src/routes/quotaAlerts.ts` - Alert API routes

### Configuration
- `.env.example` - Environment template
- `config/quota-config.json` - Default configuration

### Documentation
- `QUOTA_OPTIMIZATION.md` - Detailed documentation

### Monitoring Scripts
- `scripts/quota-dashboard.ts` - Real-time dashboard
- `scripts/analyze-quota.ts` - Usage analysis
- `scripts/stability-test.ts` - 72-hour stability test
- `scripts/test-integration.sh` - Integration tests

## Support

For more details, see `QUOTA_OPTIMIZATION.md`.
