export interface QuotaOptimizationConfig {
  version: string;
  router: {
    endpoint: string;
    dashboardPort: number;
    healthCheckInterval: number;
    retryAttempts: number;
    timeout: number;
  };
  rateLimiting: {
    enabled: boolean;
    maxRequestsPerMinute: number;
    burstAllowance: number;
    slidingWindow: boolean;
  };
  caching: {
    enabled: boolean;
    ttlSeconds: number;
    maxCacheSize: number;
    cacheStrategy: 'memory' | 'redis';
    excludePatterns: string[];
  };
  quota: {
    maxTokensPerDay: number;
    warningThreshold: number;
    criticalThreshold: number;
    emergencyThreshold: number;
    autoScale: boolean;
  };
  monitoring: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    metricsInterval: number;
    alertChannels: ('log' | 'webhook' | 'email')[];
    webhookUrl?: string;
  };
  optimization: {
    batchRequests: boolean;
    batchSize: number;
    dedupeRequests: boolean;
    compressResponses: boolean;
    fallbackToCache: boolean;
  };
}

export const defaultQuotaOptimizationConfig: QuotaOptimizationConfig = {
  version: '1.0.0',
  router: {
    endpoint: 'http://localhost:20128',
    dashboardPort: 20128,
    healthCheckInterval: 30000,
    retryAttempts: 3,
    timeout: 30000,
  },
  rateLimiting: {
    enabled: true,
    maxRequestsPerMinute: 60,
    burstAllowance: 10,
    slidingWindow: true,
  },
  caching: {
    enabled: true,
    ttlSeconds: 3600,
    maxCacheSize: 1000,
    cacheStrategy: 'memory',
    excludePatterns: [
      '/v1/models',
      '/v1/embeddings',
      '/v1/images/generations',
    ],
  },
  quota: {
    maxTokensPerDay: 100000,
    warningThreshold: 0.7,
    criticalThreshold: 0.9,
    emergencyThreshold: 0.95,
    autoScale: false,
  },
  monitoring: {
    enabled: true,
    logLevel: 'info',
    metricsInterval: 60000,
    alertChannels: ['log'],
  },
  optimization: {
    batchRequests: true,
    batchSize: 5,
    dedupeRequests: true,
    compressResponses: true,
    fallbackToCache: true,
  },
};
