import { Router, type Request, type Response, type NextFunction } from 'express';
import { aiQuotaManager } from '../lib/aiQuotaManager.js';
import { type AIQuotaConfig } from '../lib/aiQuotaConfig.js';

const router = Router();

router.post('/ai/proxy/:provider/:model', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider, model } = req.params;
    const apiKey = req.headers['x-ai-api-key'] as string || process.env['AI_API_KEY'];
    
    if (!apiKey) {
      res.status(401).json({ error: 'API key required' });
      return;
    }

    const result = await aiQuotaManager.proxyRequest(provider, model, req.body, apiKey);
    
    res.json({
      success: true,
      cached: result.cached,
      fromRouter: result.fromRouter,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/ai/stats', (req: Request, res: Response) => {
  const stats = aiQuotaManager.getStats();
  const rateLimit = aiQuotaManager.getRateLimitStatus();
  const config = aiQuotaManager.getConfig();
  
  res.json({
    usage: stats,
    rateLimit,
    config: {
      maxRequestsPerMinute: config.maxRequestsPerMinute,
      maxTokensPerDay: config.maxTokensPerDay,
      enableCaching: config.enableCaching,
      enableRateLimiting: config.enableRateLimiting,
    },
    cacheSize: aiQuotaManager.getCacheSize(),
  });
});

router.get('/ai/logs', (req: Request, res: Response) => {
  const limit = parseInt(req.query['limit'] as string) || 50;
  const logs = aiQuotaManager.getRecentLogs(limit);
  
  res.json({
    success: true,
    logs,
    count: logs.length,
  });
});

router.put('/ai/config', (req: Request, res: Response) => {
  const newConfig = req.body as Partial<AIQuotaConfig>;
  
  if (newConfig.maxRequestsPerMinute && newConfig.maxRequestsPerMinute < 1) {
    res.status(400).json({ error: 'maxRequestsPerMinute must be at least 1' });
    return;
  }
  
  if (newConfig.maxTokensPerDay && newConfig.maxTokensPerDay < 1000) {
    res.status(400).json({ error: 'maxTokensPerDay must be at least 1000' });
    return;
  }
  
  if (newConfig.cacheTTL && newConfig.cacheTTL < 60) {
    res.status(400).json({ error: 'cacheTTL must be at least 60 seconds' });
    return;
  }

  aiQuotaManager.updateConfig(newConfig);
  const config = aiQuotaManager.getConfig();
  
  res.json({
    success: true,
    config,
  });
});

router.post('/ai/cache/clear', (req: Request, res: Response) => {
  aiQuotaManager.clearCache();
  
  res.json({
    success: true,
    message: 'Cache cleared successfully',
  });
});

router.get('/ai/health', (req: Request, res: Response) => {
  const stats = aiQuotaManager.getStats();
  const rateLimit = aiQuotaManager.getRateLimitStatus();
  
  const isHealthy = 
    rateLimit.remaining > 0 && 
    stats.quotaWarning !== 'critical' &&
    stats.dailyUsage < aiQuotaManager.getConfig().maxTokensPerDay;
  
  res.status(isHealthy ? 200 : 503).json({
    healthy: isHealthy,
    quotaStatus: stats.quotaWarning,
    rateLimitRemaining: rateLimit.remaining,
    dailyUsagePercent: Math.round((stats.dailyUsage / aiQuotaManager.getConfig().maxTokensPerDay) * 100),
  });
});

router.get('/ai/rate-limit-status', (req: Request, res: Response) => {
  const status = aiQuotaManager.getRateLimitStatus();
  
  res.json({
    remaining: status.remaining,
    resetInMs: status.resetIn,
    resetInSeconds: Math.ceil(status.resetIn / 1000),
  });
});

export default router;
