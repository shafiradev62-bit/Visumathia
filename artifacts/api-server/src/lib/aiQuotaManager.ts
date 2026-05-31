import { 
  type AIUsageStats, 
  type AIRequestLog, 
  type AICacheEntry,
  type AIQuotaConfig,
  defaultAIQuotaConfig 
} from './aiQuotaConfig.js';
import crypto from 'crypto';

class AIQuotaManager {
  private usageStats: AIUsageStats;
  private requestLogs: AIRequestLog[] = [];
  private cache: Map<string, AICacheEntry> = new Map();
  private requestTimestamps: Date[] = [];
  private config: AIQuotaConfig;
  private warningCallbacks: Array<(stats: AIUsageStats) => void> = [];
  private routerEndpoint: string;

  constructor(routerEndpoint: string = 'http://localhost:20128') {
    this.routerEndpoint = routerEndpoint;
    this.config = defaultAIQuotaConfig;
    this.usageStats = this.initializeStats();
    this.startDailyResetTimer();
  }

  private initializeStats(): AIUsageStats {
    return {
      requestsCount: 0,
      tokensUsed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      lastReset: new Date(),
      dailyUsage: 0,
      quotaWarning: 'none',
    };
  }

  private startDailyResetTimer(): void {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    setTimeout(() => {
      this.resetDailyUsage();
      this.startDailyResetTimer();
    }, msUntilMidnight);
  }

  private resetDailyUsage(): void {
    this.usageStats.dailyUsage = 0;
    this.usageStats.lastReset = new Date();
    this.usageStats.quotaWarning = 'none';
    this.checkQuotaThresholds();
  }

  private generateRequestHash(request: unknown): string {
    const content = typeof request === 'string' ? request : JSON.stringify(request);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private cleanExpiredCache(): void {
    const now = new Date();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  private checkQuotaThresholds(): void {
    const usageRatio = this.usageStats.dailyUsage / this.config.maxTokensPerDay;
    
    if (usageRatio >= this.config.criticalThreshold) {
      if (this.usageStats.quotaWarning !== 'critical') {
        this.usageStats.quotaWarning = 'critical';
        this.notifyWarning();
      }
    } else if (usageRatio >= this.config.warningThreshold) {
      if (this.usageStats.quotaWarning === 'none') {
        this.usageStats.quotaWarning = 'warning';
        this.notifyWarning();
      }
    } else {
      this.usageStats.quotaWarning = 'none';
    }
  }

  private notifyWarning(): void {
    for (const callback of this.warningCallbacks) {
      callback(this.usageStats);
    }
  }

  public onWarning(callback: (stats: AIUsageStats) => void): void {
    this.warningCallbacks.push(callback);
  }

  public async proxyRequest<T>(
    provider: string,
    model: string,
    request: unknown,
    apiKey: string
  ): Promise<{ data: T; cached: boolean; fromRouter: boolean }> {
    const startTime = Date.now();
    
    if (this.config.enableRateLimiting) {
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded. Please wait before making more requests.');
      }
    }

    if (this.config.enableCaching) {
      this.cleanExpiredCache();
      const cacheKey = this.generateRequestHash({ provider, model, request });
      const cachedEntry = this.cache.get(cacheKey);
      
      if (cachedEntry && cachedEntry.expiresAt > new Date()) {
        this.usageStats.cacheHits++;
        this.logRequest(provider, model, cachedEntry.tokensUsed, true, Date.now() - startTime, true);
        return { data: cachedEntry.response as T, cached: true, fromRouter: false };
      }
      
      this.usageStats.cacheMisses++;
    }

    try {
      const response = await this.forwardToRouter<T>(provider, model, request, apiKey);
      
      this.usageStats.requestsCount++;
      this.usageStats.dailyUsage += response.usage?.total_tokens || 0;
      this.usageStats.tokensUsed += response.usage?.total_tokens || 0;
      
      if (this.config.enableCaching && response.cached !== true) {
        const cacheKey = this.generateRequestHash({ provider, model, request });
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + this.config.cacheTTL);
        
        this.cache.set(cacheKey, {
          requestHash: cacheKey,
          response: response.data,
          timestamp: new Date(),
          expiresAt,
          tokensUsed: response.usage?.total_tokens || 0,
        });
      }

      this.checkQuotaThresholds();
      this.logRequest(provider, model, response.usage?.total_tokens || 0, false, Date.now() - startTime, true);

      return { 
        data: response.data, 
        cached: false, 
        fromRouter: true 
      };
    } catch (error) {
      this.logRequest(provider, model, 0, false, Date.now() - startTime, false, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async forwardToRouter<T>(
    provider: string,
    model: string,
    request: unknown,
    apiKey: string
  ): Promise<{ data: T; usage?: { total_tokens: number }; cached?: boolean }> {
    const endpoint = `${this.routerEndpoint}/v1/${provider}/${model}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'X-Quota-Track': 'true',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`9Router error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      this.logRequest(provider, model, data.usage?.total_tokens || 0, false, 0, true);

      return data;
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  private checkRateLimit(): boolean {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo);
    
    if (this.requestTimestamps.length >= this.config.maxRequestsPerMinute) {
      return false;
    }
    
    this.requestTimestamps.push(now);
    return true;
  }

  private logRequest(
    provider: string, 
    model: string, 
    tokensUsed: number, 
    cached: boolean, 
    responseTime: number,
    success: boolean,
    error?: string
  ): void {
    const log: AIRequestLog = {
      timestamp: new Date(),
      provider,
      model,
      tokensUsed,
      cached,
      responseTime,
      success,
      error,
    };
    
    this.requestLogs.push(log);
    
    if (this.requestLogs.length > 1000) {
      this.requestLogs = this.requestLogs.slice(-500);
    }
  }

  public getStats(): AIUsageStats {
    return { ...this.usageStats };
  }

  public getRecentLogs(limit: number = 50): AIRequestLog[] {
    return this.requestLogs.slice(-limit);
  }

  public updateConfig(newConfig: Partial<AIQuotaConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): AIQuotaConfig {
    return { ...this.config };
  }

  public getCacheSize(): number {
    this.cleanExpiredCache();
    return this.cache.size;
  }

  public clearCache(): void {
    this.cache.clear();
    this.usageStats.cacheHits = 0;
    this.usageStats.cacheMisses = 0;
  }

  public getRateLimitStatus(): { remaining: number; resetIn: number } {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo);
    
    const oldestRequest = this.requestTimestamps[0];
    const resetIn = oldestRequest 
      ? Math.max(0, 60000 - (now.getTime() - oldestRequest.getTime())) 
      : 0;
    
    return {
      remaining: this.config.maxRequestsPerMinute - this.requestTimestamps.length,
      resetIn,
    };
  }
}

export const aiQuotaManager = new AIQuotaManager();

export function createAIQuotaRouter(routerEndpoint: string = 'http://localhost:20128') {
  return new AIQuotaManager(routerEndpoint);
}
