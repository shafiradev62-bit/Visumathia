export interface AIQuotaConfig {
  maxRequestsPerMinute: number;
  maxTokensPerDay: number;
  cacheTTL: number;
  warningThreshold: number;
  criticalThreshold: number;
  enableCaching: boolean;
  enableRateLimiting: boolean;
}

export interface AIUsageStats {
  requestsCount: number;
  tokensUsed: number;
  cacheHits: number;
  cacheMisses: number;
  lastReset: Date;
  dailyUsage: number;
  quotaWarning: 'none' | 'warning' | 'critical';
}

export interface AIRequestLog {
  timestamp: Date;
  provider: string;
  model: string;
  tokensUsed: number;
  cached: boolean;
  responseTime: number;
  success: boolean;
  error?: string;
}

export interface AICacheEntry {
  requestHash: string;
  response: unknown;
  timestamp: Date;
  expiresAt: Date;
  tokensUsed: number;
}

export const defaultAIQuotaConfig: AIQuotaConfig = {
  maxRequestsPerMinute: 60,
  maxTokensPerDay: 100000,
  cacheTTL: 3600,
  warningThreshold: 0.7,
  criticalThreshold: 0.9,
  enableCaching: true,
  enableRateLimiting: true,
};
