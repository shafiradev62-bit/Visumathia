#!/usr/bin/env node

import { aiQuotaManager } from '../src/lib/aiQuotaManager.js';
import { quotaAlertSystem } from '../src/lib/quotaAlertSystem.js';

const API_BASE = process.env['API_BASE'] || 'http://localhost:3000';

interface QuotaStatus {
  timestamp: Date;
  dailyUsage: number;
  maxTokens: number;
  usagePercent: number;
  warningLevel: 'none' | 'warning' | 'critical';
  remainingRequests: number;
  cacheHitRatio: number;
  rateLimitResetIn: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1000000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${(bytes / 1000000).toFixed(1)} MB`;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function drawProgressBar(percent: number, width: number = 30): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function getColorForPercent(percent: number): string {
  if (percent >= 90) return '\x1b[31m';
  if (percent >= 70) return '\x1b[33m';
  return '\x1b[32m';
}

async function fetchQuotaStatus(): Promise<QuotaStatus> {
  try {
    const stats = aiQuotaManager.getStats();
    const rateLimit = aiQuotaManager.getRateLimitStatus();
    const config = aiQuotaManager.getConfig();
    
    const totalCache = stats.cacheHits + stats.cacheMisses;
    const cacheHitRatio = totalCache > 0 ? (stats.cacheHits / totalCache) * 100 : 0;
    
    return {
      timestamp: new Date(),
      dailyUsage: stats.dailyUsage,
      maxTokens: config.maxTokensPerDay,
      usagePercent: (stats.dailyUsage / config.maxTokensPerDay) * 100,
      warningLevel: stats.quotaWarning,
      remainingRequests: rateLimit.remaining,
      cacheHitRatio,
      rateLimitResetIn: rateLimit.resetIn,
    };
  } catch (error) {
    throw error;
  }
}

async function displayDashboard(): Promise<void> {
  console.clear();
  
  const status = await fetchQuotaStatus();
  const alerts = quotaAlertSystem.getUnacknowledgedAlerts();
  const recentLogs = aiQuotaManager.getRecentLogs(5);
  const summary = quotaAlertSystem.getAlertSummary();
  
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║        9Router AI Quota Optimization - Real-time Monitor       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`  Last Update: ${status.timestamp.toLocaleTimeString()}\n`);
  
  console.log('  ┌─ QUOTA USAGE ─────────────────────────────────────────────────┐');
  const color = getColorForPercent(status.usagePercent);
  console.log(`  │ ${color}${drawProgressBar(status.usagePercent, 40)}\x1b[0m │`);
  console.log(`  │   ${status.dailyUsage.toLocaleString().padStart(10)} / ${status.maxTokens.toLocaleString().padStart(10)} tokens (${status.usagePercent.toFixed(1).padStart(5)}%)`);
  console.log('  └──────────────────────────────────────────────────────────────┘\n');
  
  console.log('  ┌─ RATE LIMIT ─────────────────────────────────────────────────┐');
  console.log(`  │   Remaining Requests: ${status.remainingRequests.toString().padStart(3)}`);
  console.log(`  │   Reset In: ${formatTime(status.rateLimitResetIn).padStart(10)}`);
  console.log('  └──────────────────────────────────────────────────────────────┘\n');
  
  console.log('  ┌─ CACHE STATISTICS ───────────────────────────────────────────┐');
  console.log(`  │   Cache Size: ${aiQuotaManager.getCacheSize().toString().padStart(5)} entries`);
  console.log(`  │   Hit Ratio: ${status.cacheHitRatio.toFixed(1).padStart(5)}%`);
  const config = aiQuotaManager.getConfig();
  console.log(`  │   TTL: ${config.cacheTTL}s`);
  console.log('  └──────────────────────────────────────────────────────────────┘\n');
  
  if (alerts.length > 0) {
    console.log('  ┌─ ACTIVE ALERTS ───────────────────────────────────────────────┐');
    alerts.slice(0, 3).forEach(alert => {
      const alertType = alert.type === 'critical' ? '🔴' : alert.type === 'warning' ? '🟡' : '🔵';
      console.log(`  │ ${alertType} ${alert.message}`);
    });
    console.log(`  │   Total: ${summary.unacknowledged} unacknowledged`);
    console.log('  └──────────────────────────────────────────────────────────────┘\n');
  }
  
  console.log('  ┌─ RECENT ACTIVITY ────────────────────────────────────────────┐');
  if (recentLogs.length === 0) {
    console.log('  │   No recent activity');
  } else {
    recentLogs.slice(-3).reverse().forEach(log => {
      const time = log.timestamp.toLocaleTimeString();
      const cached = log.cached ? '📦' : '🌐';
      const statusIcon = log.success ? '✓' : '✗';
      console.log(`  │ ${statusIcon} ${cached} [${time}] ${log.provider}/${log.model} - ${log.tokensUsed} tokens`);
    });
  }
  console.log('  └──────────────────────────────────────────────────────────────┘\n');
  
  console.log('  Press Ctrl+C to exit\n');
}

async function main(): Promise<void> {
  console.log('Starting 9Router Quota Dashboard...\n');
  
  await displayDashboard();
  
  setInterval(displayDashboard, 5000);
  
  process.on('SIGINT', () => {
    console.log('\n\nDashboard stopped.');
    process.exit(0);
  });
}

main().catch(console.error);
