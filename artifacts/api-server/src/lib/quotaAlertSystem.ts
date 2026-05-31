import { type AIUsageStats } from './aiQuotaConfig.js';

export interface QuotaAlert {
  id: string;
  type: 'warning' | 'critical' | 'rate_limit' | 'daily_reset';
  message: string;
  timestamp: Date;
  stats: Partial<AIUsageStats>;
  acknowledged: boolean;
}

class QuotaAlertSystem {
  private alerts: QuotaAlert[] = [];
  private maxAlerts: number = 100;
  private alertThresholds = {
    warning: 0.7,
    critical: 0.9,
    rateLimitWindow: 60000,
    maxRateLimitErrors: 5,
  };

  public handleWarning(stats: AIUsageStats): QuotaAlert | null {
    const usagePercent = Math.round((stats.dailyUsage / 100000) * 100);
    
    if (stats.quotaWarning === 'critical') {
      const alert = this.createAlert(
        'critical',
        `⚠️ KUOTA KRITIS: Penggunaan AI sudah mencapai ${usagePercent}% dari batas harian!`,
        stats
      );
      this.addAlert(alert);
      return alert;
    }
    
    if (stats.quotaWarning === 'warning') {
      const alert = this.createAlert(
        'warning',
        `⚡ Peringatan Kuota: Penggunaan AI sudah mencapai ${usagePercent}% dari batas harian`,
        stats
      );
      this.addAlert(alert);
      return alert;
    }
    
    return null;
  }

  public handleRateLimitExceeded(remaining: number, resetIn: number): QuotaAlert {
    const alert = this.createAlert(
      'rate_limit',
      `🚫 Rate Limit Tercapai: ${remaining} request tersisa. Reset dalam ${Math.ceil(resetIn / 1000)} detik`,
      { requestsCount: 0 }
    );
    this.addAlert(alert);
    return alert;
  }

  public handleDailyReset(): QuotaAlert {
    const alert = this.createAlert(
      'daily_reset',
      '🔄 Kuota Harian Telah Direset: Penggunaan AI dimulai dari awal',
      { dailyUsage: 0 }
    );
    this.addAlert(alert);
    return alert;
  }

  private createAlert(
    type: QuotaAlert['type'],
    message: string,
    stats: Partial<AIUsageStats>
  ): QuotaAlert {
    return {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type,
      message,
      timestamp: new Date(),
      stats,
      acknowledged: false,
    };
  }

  private addAlert(alert: QuotaAlert): void {
    const existingIndex = this.alerts.findIndex(
      a => a.type === alert.type && !a.acknowledged
    );
    
    if (existingIndex >= 0) {
      const hoursSinceLast = (Date.now() - this.alerts[existingIndex].timestamp.getTime()) / 3600000;
      if (hoursSinceLast < 1) {
        return;
      }
      this.alerts.splice(existingIndex, 1);
    }
    
    this.alerts.push(alert);
    
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-Math.floor(this.maxAlerts / 2));
    }
  }

  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  public getUnacknowledgedAlerts(): QuotaAlert[] {
    return this.alerts.filter(a => !a.acknowledged);
  }

  public getRecentAlerts(limit: number = 20): QuotaAlert[] {
    return this.alerts.slice(-limit);
  }

  public clearOldAlerts(olderThanHours: number = 24): void {
    const cutoff = Date.now() - (olderThanHours * 3600000);
    this.alerts = this.alerts.filter(
      a => a.timestamp.getTime() > cutoff || !a.acknowledged
    );
  }

  public getAlertSummary(): {
    total: number;
    unacknowledged: number;
    byType: Record<QuotaAlert['type'], number>;
  } {
    const unacknowledged = this.alerts.filter(a => !a.acknowledged);
    const byType: Record<QuotaAlert['type'], number> = {
      warning: 0,
      critical: 0,
      rate_limit: 0,
      daily_reset: 0,
    };
    
    this.alerts.forEach(alert => {
      byType[alert.type]++;
    });
    
    return {
      total: this.alerts.length,
      unacknowledged: unacknowledged.length,
      byType,
    };
  }
}

export const quotaAlertSystem = new QuotaAlertSystem();
