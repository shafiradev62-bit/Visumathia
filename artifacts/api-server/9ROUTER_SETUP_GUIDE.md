# 9Router AI Quota Optimization - Complete Setup Guide

## Overview
Integration sistem monitoring dan optimalisasi kuota AI menggunakan 9Router yang berjalan di localhost:20128. Sistem ini menyediakan:
- Rate limiting untuk mencegah penggunaan berlebihan
- Caching untuk mengurangi request redundant
- Real-time monitoring melalui dashboard
- Early warning system untuk quota thresholds
- 72-hour stability testing

## Quick Start

### Step 1: Start 9Router (Terminal 1)
```bash
# Terminal 1: Start 9Router
9router

# Expected output:
# Server: localhost:20128
# Dasbor: localhost:20128/dashboard
# Siap untuk melakukan routing ✓
```

### Step 2: Start API Server (Terminal 2)
```bash
# Terminal 2: Navigate and install dependencies
cd AR-Game-Fix/artifacts/api-server
pnpm install

# Start development server
pnpm run dev
```

### Step 3: Access Dashboard
```
# 9Router Dashboard (proxied through API)
http://localhost:3000/api/9router/dashboard

# Local Quota Dashboard (terminal-based)
pnpm run quota:dashboard
```

## Available Endpoints

### Core AI Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/proxy/:provider/:model` | Proxy AI requests |
| GET | `/api/ai/stats` | Usage statistics |
| GET | `/api/ai/health` | Health check |
| GET | `/api/ai/logs` | Request logs |
| PUT | `/api/ai/config` | Update config |
| POST | `/api/ai/cache/clear` | Clear cache |

### 9Router Integration
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/9router/dashboard` | 9Router dashboard |
| GET | `/api/9router/router-status` | Connection status |
| GET | `/api/9router/router-metrics` | Metrics from 9Router |

### Alert System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | Recent alerts |
| GET | `/api/alerts/summary` | Alert summary |
| POST | `/api/alerts/:id/acknowledge` | Acknowledge alert |
| GET | `/api/alerts/realtime` | SSE stream |

## Configuration

### Environment Variables (.env)
```bash
# 9Router Connection
NINEROUTER_URL=http://localhost:20128

# AI Configuration
AI_API_KEY=your-api-key
AI_PROXY_ENABLED=true
AI_RATE_LIMIT_ENABLED=true
AI_MAX_REQUESTS_PER_MINUTE=60
AI_MAX_TOKENS_PER_DAY=100000

# Thresholds
AI_WARNING_THRESHOLD=0.7
AI_CRITICAL_THRESHOLD=0.9

# Caching
AI_CACHE_ENABLED=true
AI_CACHE_TTL=3600
AI_CACHE_MAX_SIZE=1000
```

## Monitoring Scripts

### 1. Real-time Quota Dashboard
```bash
pnpm run quota:dashboard
```
Displays:
- Token usage progress bar
- Rate limit status
- Cache hit ratio
- Active alerts
- Recent activity

### 2. Usage Analysis
```bash
pnpm run quota:analyze
```
Provides optimization suggestions based on usage patterns.

### 3. Stability Test (72 Hours)
```bash
pnpm run quota:stability-test
```
Continuously monitors all endpoints for specified duration.

### 4. Integration Test
```bash
# PowerShell
.\scripts\verify-integration.ps1

# Or manual curl tests
curl http://localhost:3000/api/ai/stats
curl http://localhost:3000/api/9router/router-status
```

## Testing

### Manual Tests
```bash
# Test 9Router connectivity
curl http://localhost:20128/

# Test API health
curl http://localhost:3000/api/health

# Test AI endpoints
curl http://localhost:3000/api/ai/stats
curl http://localhost:3000/api/ai/health
curl http://localhost:3000/api/ai/rate-limit-status

# Test proxy
curl -X POST http://localhost:3000/api/ai/proxy/openai/gpt-4 \
  -H "Content-Type: application/json" \
  -H "X-AI-API-Key: your-key" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

## Optimization Features

### Rate Limiting
- Configurable requests per minute
- Sliding window tracking
- Burst allowance for spikes
- Automatic rate limit status

### Intelligent Caching
- SHA256 request hashing
- Configurable TTL (default: 1 hour)
- Cache statistics tracking
- Selective endpoint exclusion
- Memory-efficient storage

### Quota Management
- Real-time token tracking
- Daily usage reset
- Percentage-based thresholds
- Warning at 70%, Critical at 90%

### Alert System
- Real-time alert generation
- Alert acknowledgment
- SSE streaming for real-time updates
- Alert history and summary

## Troubleshooting

### 9Router Not Available
```bash
# Check if 9Router is running
curl http://localhost:20128/

# Restart 9Router
9router
```

### Rate Limit Exceeded
```bash
# Check current status
curl http://localhost:3000/api/ai/rate-limit-status

# Adjust limit dynamically
curl -X PUT http://localhost:3000/api/ai/config \
  -H "Content-Type: application/json" \
  -d '{"maxRequestsPerMinute": 120}'
```

### High Token Usage
```bash
# Run analysis
pnpm run quota:analyze

# Clear cache
curl -X POST http://localhost:3000/api/ai/cache/clear

# Check usage stats
curl http://localhost:3000/api/ai/stats
```

### API Not Starting
```bash
# Check dependencies
pnpm install

# Rebuild
pnpm run build

# Check logs for errors
pnpm run start
```

## Architecture

### Files Created

**Core Library** (`src/lib/`)
- `aiQuotaConfig.ts` - Type definitions and default config
- `aiQuotaManager.ts` - Main quota management class
- `quotaAlertSystem.ts` - Alert generation and management
- `quotaOptimizationConfig.ts` - Optimization settings

**API Routes** (`src/routes/`)
- `aiQuota.ts` - AI proxy and quota endpoints
- `ninerouter.ts` - 9Router proxy routes
- `quotaAlerts.ts` - Alert management endpoints

**Scripts** (`scripts/`)
- `quota-dashboard.ts` - Real-time monitoring dashboard
- `analyze-quota.ts` - Usage analysis tool
- `stability-test.ts` - 72-hour stability test
- `test-integration.sh` - Unix integration test
- `test-integration.bat` - Windows batch test
- `verify-integration.ps1` - PowerShell verification
- `analyze-quota.ps1` - PowerShell analysis

**Configuration**
- `.env.example` - Environment template
- `config/quota-config.json` - Default config
- `QUOTA_OPTIMIZATION.md` - Detailed documentation
- `NINEROUTER_INTEGRATION.md` - Quick start guide

## API Response Examples

### AI Stats Response
```json
{
  "usage": {
    "requestsCount": 150,
    "tokensUsed": 45000,
    "dailyUsage": 45000,
    "quotaWarning": "none"
  },
  "rateLimit": {
    "remaining": 45,
    "resetIn": 30000
  },
  "config": {
    "maxRequestsPerMinute": 60,
    "maxTokensPerDay": 100000
  },
  "cacheSize": 25
}
```

### Alert Response
```json
{
  "success": true,
  "alerts": [
    {
      "id": "warning-1234567890-abc123",
      "type": "warning",
      "message": "Peringatan Kuota: Penggunaan AI sudah mencapai 75% dari batas harian",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "acknowledged": false
    }
  ],
  "summary": {
    "total": 5,
    "unacknowledged": 1,
    "byType": {
      "warning": 3,
      "critical": 0,
      "rate_limit": 1,
      "daily_reset": 1
    }
  }
}
```

## Best Practices

1. **Monitor Regularly**: Check quota dashboard daily
2. **Set Appropriate Thresholds**: Adjust based on usage patterns
3. **Enable Caching**: Reduces API calls significantly
4. **Review Logs**: Identify optimization opportunities
5. **Acknowledge Alerts**: Keep alert system clean
6. **Run Stability Tests**: Verify system reliability
7. **Document Changes**: Track configuration modifications

## Support

For detailed documentation, see:
- [QUOTA_OPTIMIZATION.md](QUOTA_OPTIMIZATION.md) - Comprehensive guide
- [NINEROUTER_INTEGRATION.md](NINEROUTER_INTEGRATION.md) - Quick start

## Version History

### v1.0.0 (2024-01-15)
- Initial integration with 9Router
- Rate limiting implementation
- Intelligent caching system
- Real-time monitoring dashboard
- Alert management system
- 72-hour stability testing
- Comprehensive documentation
