import { Router, type Request, type Response, type NextFunction } from 'express';
import { quotaAlertSystem } from '../lib/quotaAlertSystem.js';
import { aiQuotaManager } from '../lib/aiQuotaManager.js';

const router = Router();

router.get('/alerts', (req: Request, res: Response) => {
  const limit = parseInt(req.query['limit'] as string) || 20;
  const unacknowledgedOnly = req.query['unacknowledged'] === 'true';
  
  const alerts = unacknowledgedOnly 
    ? quotaAlertSystem.getUnacknowledgedAlerts()
    : quotaAlertSystem.getRecentAlerts(limit);
  
  const summary = quotaAlertSystem.getAlertSummary();
  
  res.json({
    success: true,
    alerts,
    summary,
  });
});

router.post('/alerts/:alertId/acknowledge', (req: Request, res: Response) => {
  const { alertId } = req.params;
  const success = quotaAlertSystem.acknowledgeAlert(alertId);
  
  if (success) {
    res.json({
      success: true,
      message: `Alert ${alertId} acknowledged`,
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Alert not found or already acknowledged',
    });
  }
});

router.post('/alerts/clear', (req: Request, res: Response) => {
  const olderThanHours = parseInt(req.query['olderThanHours'] as string) || 24;
  quotaAlertSystem.clearOldAlerts(olderThanHours);
  
  res.json({
    success: true,
    message: `Cleared alerts older than ${olderThanHours} hours`,
  });
});

router.get('/alerts/summary', (req: Request, res: Response) => {
  const summary = quotaAlertSystem.getAlertSummary();
  const stats = aiQuotaManager.getStats();
  const rateLimit = aiQuotaManager.getRateLimitStatus();
  
  res.json({
    success: true,
    alerts: summary,
    currentStatus: {
      quotaWarning: stats.quotaWarning,
      dailyUsage: stats.dailyUsage,
      rateLimitRemaining: rateLimit.remaining,
    },
  });
});

router.get('/alerts/realtime', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const sendUpdate = () => {
    const summary = quotaAlertSystem.getAlertSummary();
    const stats = aiQuotaManager.getStats();
    const unacknowledged = quotaAlertSystem.getUnacknowledgedAlerts();
    
    const data = JSON.stringify({
      timestamp: new Date().toISOString(),
      summary,
      currentStats: stats,
      alerts: unacknowledged.slice(-5),
    });
    
    res.write(`data: ${data}\n\n`);
  };
  
  const interval = setInterval(sendUpdate, 5000);
  
  req.on('close', () => {
    clearInterval(interval);
  });
  
  sendUpdate();
});

export default router;
