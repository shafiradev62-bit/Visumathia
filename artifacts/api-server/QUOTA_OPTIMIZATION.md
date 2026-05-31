# 9Router AI Quota Optimization Integration

## Overview
This integration connects the AR-Game-Fix system with 9Router (running on localhost:20128) to optimize AI usage through intelligent rate limiting, caching, and real-time quota monitoring.

## Features

### 1. AI Proxy with Rate Limiting
- **Request Throttling**: Limits AI requests to prevent quota exhaustion
- **Burst Protection**: Handles sudden spikes in request volume
- **Sliding Window**: Tracks requests over time for fair usage

### 2. Intelligent Caching
- **Response Caching**: Stores frequently requested AI responses
- **Configurable TTL**: Set expiration times for cached entries
- **Selective Caching**: Excludes certain endpoint patterns from caching
- **Cache Statistics**: Track hit/miss ratios

### 3. Quota Monitoring & Alerts
- **Real-time Tracking**: Monitor daily token usage
- **Threshold Alerts**: Warning at 70%, Critical at 90%
- **Alert Management**: View, acknowledge, and clear alerts
- **SSE Streaming**: Real-time alert updates

### 4. Dashboard Integration
- **9Router Dashboard**: Accessible at /api/9router/dashboard
- **Usage Statistics**: /api/ai/stats endpoint
- **Health Checks**: /api/ai/health endpoint

## API Endpoints

### AI Proxy
```
POST /api/ai/proxy/:provider/:model
- Headers: X-AI-API-Key (or AI_API_KEY env var)
- Body: AI request payload
- Returns: Proxied AI response with cache status
```

### Statistics & Monitoring
```
GET /api/ai/stats
- Returns: Usage stats, rate limit status, cache size

GET /api/ai/logs?limit=50
- Returns: Recent AI request logs

GET /api/ai/health
- Returns: Health status and quota warning level

GET /api/ai/rate-limit-status
- Returns: Remaining requests and reset time
```

### Configuration
```
PUT /api/ai/config
- Body: Partial AIQuotaConfig object
- Updates rate limiting and caching parameters

POST /api/ai/cache/clear
- Clears the AI response cache
```

### 9Router Integration
```
GET /api/9router/dashboard
- Proxies to 9Router dashboard at localhost:20128/dashboard

GET /api/9router/router-status
- Checks 9Router server connectivity

GET /api/9router/router-metrics
- Fetches metrics from 9Router
```

### Alerts
```
GET /api/alerts
- Returns: Recent alerts with summaries

GET /api/alerts/summary
- Returns: Alert statistics and current status

POST /api/alerts/:alertId/acknowledge
- Marks an alert as acknowledged

GET /api/alerts/realtime
- SSE stream for real-time alert updates
```

## Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# 9Router Connection
NINEROUTER_URL=http://localhost:20128
NINEROUTER_DASHBOARD_PATH=/dashboard

# AI Configuration
AI_API_KEY=your-api-key
AI_PROXY_ENABLED=true
AI_RATE_LIMIT_ENABLED=true
AI_MAX_REQUESTS_PER_MINUTE=60
AI_MAX_TOKENS_PER_DAY=100000
AI_WARNING_THRESHOLD=0.7
AI_CRITICAL_THRESHOLD=0.9
AI_CACHE_ENABLED=true
AI_CACHE_TTL=3600

# Monitoring
QUOTA_MONITORING_ENABLED=true
QUOTA_LOG_LEVEL=info
```

## Usage Examples

### Making AI Requests Through Proxy
```typescript
const response = await fetch('/api/ai/proxy/openai/gpt-4', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-AI-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

const { data, cached } = await response.json();
console.log(cached ? 'Served from cache' : 'Fresh request');
```

### Monitoring Quota Usage
```typescript
const stats = await fetch('/api/ai/stats').then(r => r.json());
console.log(`Daily usage: ${stats.usage.dailyUsage} tokens`);
console.log(`Remaining requests: ${stats.rateLimit.remaining}`);
```

### Subscribing to Real-time Alerts
```typescript
const eventSource = new EventSource('/api/alerts/realtime');
eventSource.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  if (alert.alerts.length > 0) {
    showNotification(alert.alerts[0].message);
  }
};
```

## Quota Optimization Strategies

### 1. Request Batching
Combine multiple similar requests into batches to reduce API calls.

### 2. Smart Caching
- Cache responses for repeated queries
- Use longer TTL for stable responses
- Exclude dynamic endpoints from caching

### 3. Rate Limiting
- Set appropriate request limits based on quota size
- Use burst allowance for occasional spikes
- Monitor rate limit resets

### 4. Alert Thresholds
- Warning at 70%: Begin optimizing requests
- Critical at 90%: Switch to aggressive caching
- Emergency at 95%: Prioritize essential requests only

## Testing

### Health Check
```bash
curl http://localhost:3000/api/ai/health
```

### Test Rate Limiting
```bash
# Make rapid requests to trigger rate limit
for i in {1..70}; do
  curl -s http://localhost:3000/api/ai/stats
done
```

### Check 9Router Connection
```bash
curl http://localhost:3000/api/9router/router-status
```

## Monitoring

### Dashboard Access
- **9Router Dashboard**: http://localhost:3000/api/9router/dashboard
- **Local Stats**: http://localhost:3000/api/ai/stats

### Log Levels
Configure logging verbosity in environment:
- `debug`: All requests and responses
- `info`: Summary statistics
- `warn`: Errors and warnings
- `error`: Failures only

## Troubleshooting

### 9Router Not Available
- Ensure 9Router is running: `9router`
- Check endpoint: `curl http://localhost:20128`
- Verify firewall rules

### Rate Limit Too Aggressive
- Adjust `AI_MAX_REQUESTS_PER_MINUTE` in config
- Update dynamically via `/api/ai/config`

### Cache Not Working
- Ensure `AI_CACHE_ENABLED=true`
- Check cache size limit
- Clear cache: `POST /api/ai/cache/clear`

### High Token Usage
- Enable aggressive caching
- Implement request deduplication
- Review frequently accessed endpoints

## Performance Considerations

### Cache Size
- Default: 1000 entries
- Adjust based on available memory
- Monitor cache hit ratio

### TTL Settings
- Static responses: 3600+ seconds
- Dynamic content: 300-600 seconds
- User-specific: No caching

### Rate Limiting
- Balance between responsiveness and quota conservation
- Consider time-of-day patterns
- Implement priority queuing for critical requests

## Security

- API keys stored in environment variables
- Rate limiting prevents abuse
- Request validation on proxy endpoints
- Audit logging for all AI requests

## Future Enhancements

- [ ] Redis caching support
- [ ] Priority queue for requests
- [ ] Automatic quota scaling
- [ ] Email/Slack webhook notifications
- [ ] Advanced analytics dashboard
- [ ] Request deduplication across users
