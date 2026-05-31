import { aiQuotaManager } from '../src/lib/aiQuotaManager.js';
import { quotaAlertSystem } from '../src/lib/quotaAlertSystem.js';
import { type AIQuotaConfig, type AIUsageStats } from '../src/lib/aiQuotaConfig.js';

interface OptimizationSuggestion {
  category: 'caching' | 'rate_limiting' | 'request_optimization' | 'quota_increase';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavings: string;
  implementation: string;
}

function analyzeCacheEfficiency(): OptimizationSuggestion | null {
  const stats = aiQuotaManager.getStats();
  const totalRequests = stats.cacheHits + stats.cacheMisses;
  const cacheHitRatio = totalRequests > 0 ? (stats.cacheHits / totalRequests) * 100 : 0;
  
  if (cacheHitRatio < 30) {
    return {
      category: 'caching',
      priority: 'high',
      title: 'Low Cache Hit Ratio Detected',
      description: `Only ${cacheHitRatio.toFixed(1)}% of requests are being served from cache. This means redundant API calls are being made.`,
      potentialSavings: `Could save up to ${(100 - cacheHitRatio).toFixed(0)}% on redundant requests`,
      implementation: 'Review request patterns and consider increasing TTL or implementing request deduplication',
    };
  }
  
  if (cacheHitRatio > 70) {
    return {
      category: 'caching',
      priority: 'low',
      title: 'Excellent Cache Performance',
      description: `${cacheHitRatio.toFixed(1)}% cache hit ratio - well optimized!`,
      potentialSavings: 'No immediate optimization needed',
      implementation: 'Current caching strategy is effective',
    };
  }
  
  return null;
}

function analyzeRateLimiting(): OptimizationSuggestion | null {
  const config = aiQuotaManager.getConfig();
  const stats = aiQuotaManager.getStats();
  const usageRatio = stats.dailyUsage / config.maxTokensPerDay;
  
  if (usageRatio > 0.8 && config.maxRequestsPerMinute < 100) {
    return {
      category: 'rate_limiting',
      priority: 'medium',
      title: 'Aggressive Rate Limiting',
      description: `Usage is at ${(usageRatio * 100).toFixed(0)}% of daily quota with rate limit of ${config.maxRequestsPerMinute} req/min`,
      potentialSavings: 'Consider relaxing rate limits to improve user experience during peak times',
      implementation: 'Increase maxRequestsPerMinute if quota allows, or optimize request batching',
    };
  }
  
  return null;
}

function analyzeRequestPatterns(): OptimizationSuggestion | null {
  const logs = aiQuotaManager.getRecentLogs(100);
  const modelCounts: Record<string, number> = {};
  
  logs.forEach(log => {
    const key = `${log.provider}/${log.model}`;
    modelCounts[key] = (modelCounts[key] || 0) + 1;
  });
  
  const mostUsed = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0];
  
  if (mostUsed && mostUsed[1] > 50) {
    const [model, count] = mostUsed;
    return {
      category: 'request_optimization',
      priority: 'medium',
      title: 'High Request Volume to Single Model',
      description: `${count} requests to ${model} in recent history`,
      potentialSavings: 'Consider implementing request batching or caching for this model',
      implementation: `Batch similar ${model} requests together or cache common responses`,
    };
  }
  
  return null;
}

function analyzeQuotaUsage(): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];
  const stats = aiQuotaManager.getStats();
  const config = aiQuotaManager.getConfig();
  const usageRatio = stats.dailyUsage / config.maxTokensPerDay;
  
  if (usageRatio > 0.7) {
    suggestions.push({
      category: 'quota_increase',
      priority: 'high',
      title: 'Approaching Daily Quota Limit',
      description: `Daily usage at ${(usageRatio * 100).toFixed(0)}% of maximum (${config.maxTokensPerDay} tokens)`,
      potentialSavings: 'Reduce unnecessary requests or increase quota allocation',
      implementation: 'Review which requests are essential, implement aggressive caching, or consider upgrading quota',
    });
  }
  
  return suggestions;
}

function generateComprehensiveReport(): {
  timestamp: Date;
  currentStats: AIUsageStats;
  suggestions: OptimizationSuggestion[];
  summary: {
    totalSuggestions: number;
    highPriority: number;
    potentialImpact: 'high' | 'medium' | 'low';
  };
} {
  const suggestions: OptimizationSuggestion[] = [];
  
  const cacheSuggestion = analyzeCacheEfficiency();
  if (cacheSuggestion) suggestions.push(cacheSuggestion);
  
  const rateLimitSuggestion = analyzeRateLimiting();
  if (rateLimitSuggestion) suggestions.push(rateLimitSuggestion);
  
  const patternSuggestion = analyzeRequestPatterns();
  if (patternSuggestion) suggestions.push(patternSuggestion);
  
  suggestions.push(...analyzeQuotaUsage());
  
  const highPriorityCount = suggestions.filter(s => s.priority === 'high').length;
  
  return {
    timestamp: new Date(),
    currentStats: aiQuotaManager.getStats(),
    suggestions: suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }),
    summary: {
      totalSuggestions: suggestions.length,
      highPriority: highPriorityCount,
      potentialImpact: highPriorityCount > 1 ? 'high' : highPriorityCount > 0 ? 'medium' : 'low',
    },
  };
}

function displayReport(): void {
  const report = generateComprehensiveReport();
  
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║        9Router AI Quota Optimization Analysis Report            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`  Generated: ${report.timestamp.toLocaleString()}\n`);
  
  console.log('  ┌─ CURRENT STATUS ────────────────────────────────────────────┐');
  const stats = report.currentStats;
  console.log(`  │   Daily Usage: ${stats.dailyUsage.toLocaleString()} tokens`);
  console.log(`  │   Total Requests: ${stats.requestsCount}`);
  console.log(`  │   Cache Hits: ${stats.cacheHits} | Misses: ${stats.cacheMisses}`);
  console.log(`  │   Quota Warning: ${stats.quotaWarning.toUpperCase()}`);
  console.log('  └──────────────────────────────────────────────────────────────┘\n');
  
  if (report.suggestions.length === 0) {
    console.log('  ✅ No optimization suggestions at this time.\n');
    return;
  }
  
  console.log('  ┌─ OPTIMIZATION SUGGESTIONS ───────────────────────────────────┐');
  report.suggestions.forEach((suggestion, index) => {
    const priorityIcon = suggestion.priority === 'high' ? '🔴' : suggestion.priority === 'medium' ? '🟡' : '🟢';
    console.log(`  │`);
    console.log(`  │ ${priorityIcon} [${suggestion.priority.toUpperCase()}] ${suggestion.title}`);
    console.log(`  │   ${suggestion.description}`);
    console.log(`  │   💡 ${suggestion.potentialSavings}`);
    console.log(`  │   ⚙️  ${suggestion.implementation}`);
  });
  console.log('  └──────────────────────────────────────────────────────────────┘\n');
  
  console.log('  ┌─ SUMMARY ────────────────────────────────────────────────────┐');
  console.log(`  │   Total Suggestions: ${report.summary.totalSuggestions}`);
  console.log(`  │   High Priority: ${report.summary.highPriority}`);
  console.log(`  │   Potential Impact: ${report.summary.potentialImpact.toUpperCase()}`);
  console.log('  └──────────────────────────────────────────────────────────────┘\n');
  
  return;
}

async function main(): Promise<void> {
  console.log('Running 9Router Quota Optimization Analysis...\n');
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  displayReport();
  
  const report = generateComprehensiveReport();
  
  console.log('  Report saved. Run with --json for machine-readable output.\n');
  
  return;
}

main().catch(console.error);
