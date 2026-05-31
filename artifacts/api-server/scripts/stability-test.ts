#!/usr/bin/env node

const API_BASE = process.env['API_BASE'] || 'http://localhost:3000';
const NINEROUTER_URL = process.env['NINEROUTER_URL'] || 'http://localhost:20128';
const TEST_DURATION_HOURS = 72;
const CHECK_INTERVAL_MS = 60000;

interface TestResult {
  timestamp: Date;
  endpoint: string;
  status: 'pass' | 'fail';
  responseTime: number;
  error?: string;
}

interface StabilityReport {
  startTime: Date;
  endTime?: Date;
  duration: number;
  totalChecks: number;
  passed: number;
  failed: number;
  uptime: number;
  avgResponseTime: number;
  errors: string[];
  results: TestResult[];
}

async function checkEndpoint(name: string, url: string, method: string = 'GET', body?: unknown): Promise<TestResult> {
  const start = Date.now();
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const responseTime = Date.now() - start;
    
    if (!response.ok) {
      return {
        timestamp: new Date(),
        endpoint: name,
        status: 'fail',
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    
    return {
      timestamp: new Date(),
      endpoint: name,
      status: 'pass',
      responseTime,
    };
  } catch (error) {
    return {
      timestamp: new Date(),
      endpoint: name,
      status: 'fail',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function runHealthChecks(): Promise<TestResult[]> {
  const endpoints = [
    ['Health Check', `${API_BASE}/api/health`],
    ['AI Stats', `${API_BASE}/api/ai/stats`],
    ['AI Health', `${API_BASE}/api/ai/health`],
    ['AI Rate Limit', `${API_BASE}/api/ai/rate-limit-status`],
    ['9Router Status', `${API_BASE}/api/9router/router-status`],
    ['Alerts Summary', `${API_BASE}/api/alerts/summary`],
    ['9Router Direct', `${NINEROUTER_URL}/`],
  ];
  
  const results: TestResult[] = [];
  
  for (const [name, url] of endpoints) {
    const result = await checkEndpoint(name, url);
    results.push(result);
  }
  
  return results;
}

function generateReport(results: TestResult[]): StabilityReport {
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const responseTimes = results.map(r => r.responseTime).filter(t => t > 0);
  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : 0;
  
  return {
    startTime: new Date(),
    totalChecks: results.length,
    passed,
    failed,
    uptime: (passed / results.length) * 100,
    avgResponseTime,
    errors: results.filter(r => r.error).map(r => `${r.endpoint}: ${r.error}`),
    results,
  };
}

function logResult(result: TestResult): void {
  const status = result.status === 'pass' ? '✓' : '✗';
  const color = result.status === 'pass' ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${status}\x1b[0m ${result.endpoint}: ${result.responseTime}ms${result.error ? ` - ${result.error}` : ''}`);
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  console.log('\n========================================');
  console.log('  9Router Integration - Stability Test');
  console.log('========================================\n');
  console.log(`API Base: ${API_BASE}`);
  console.log(`9Router URL: ${NINEROUTER_URL}`);
  console.log(`Test Duration: ${TEST_DURATION_HOURS} hours`);
  console.log(`Check Interval: ${CHECK_INTERVAL_MS / 1000} seconds\n`);
  
  const allReports: StabilityReport[] = [];
  const startTime = new Date();
  let checkCount = 0;
  
  const expectedChecks = (TEST_DURATION_HOURS * 60 * 60 * 1000) / CHECK_INTERVAL_MS;
  
  console.log(`Starting stability monitoring (expecting ~${expectedChecks} checks)...\n`);
  console.log('----------------------------------------');
  
  try {
    while (true) {
      checkCount++;
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60);
      
      console.log(`\n[Check #${checkCount}] - Elapsed: ${elapsed} minutes`);
      console.log('----------------------------------------');
      
      const results = await runHealthChecks();
      results.forEach(logResult);
      
      const report = generateReport(results);
      allReports.push(report);
      
      const uptime = (report.uptime).toFixed(2);
      console.log(`\n\x1b[1mCurrent Uptime: ${uptime}%\x1b[0m`);
      
      if (report.errors.length > 0) {
        console.log(`\n\x1b[33mErrors encountered:\x1b[0m`);
        report.errors.forEach(err => console.log(`  - ${err}`));
      }
      
      const elapsedHours = (now.getTime() - startTime.getTime()) / 1000 / 60 / 60;
      
      if (elapsedHours >= TEST_DURATION_HOURS) {
        console.log('\n========================================');
        console.log('  Stability Test Complete');
        console.log('========================================\n');
        
        const totalPassed = allReports.reduce((sum, r) => sum + r.passed, 0);
        const totalFailed = allReports.reduce((sum, r) => sum + r.failed, 0);
        const totalChecks = allReports.reduce((sum, r) => sum + r.totalChecks, 0);
        const overallUptime = (totalPassed / totalChecks) * 100;
        
        console.log(`Total Duration: ${TEST_DURATION_HOURS} hours`);
        console.log(`Total Checks: ${checkCount}`);
        console.log(`Passed: ${totalPassed}/${totalChecks} (${overallUptime.toFixed(2)}%)`);
        console.log(`Failed: ${totalFailed}/${totalChecks}`);
        console.log(`Average Response Time: ${report.avgResponseTime.toFixed(2)}ms`);
        
        const allErrors = allReports.flatMap(r => r.errors);
        if (allErrors.length > 0) {
          console.log(`\n\x1b[31mAll Errors:\x1b[0m`);
          const uniqueErrors = [...new Set(allErrors)];
          uniqueErrors.forEach(err => console.log(`  - ${err}`));
        }
        
        console.log('\n========================================\n');
        break;
      }
      
      await sleep(CHECK_INTERVAL_MS);
    }
  } catch (error) {
    console.error('\n\x1b[31mStability test interrupted:\x1b[0m', error);
    
    const partialReport = {
      startTime,
      endTime: new Date(),
      duration: (new Date().getTime() - startTime.getTime()) / 1000 / 60,
      totalChecks: checkCount,
      passed: allReports.reduce((sum, r) => sum + r.passed, 0),
      failed: allReports.reduce((sum, r) => sum + r.failed, 0),
      uptime: allReports.length > 0 
        ? allReports.reduce((sum, r) => sum + r.uptime, 0) / allReports.length 
        : 0,
      avgResponseTime: allReports.length > 0
        ? allReports.reduce((sum, r) => sum + r.avgResponseTime, 0) / allReports.length
        : 0,
      errors: allReports.flatMap(r => r.errors),
      results: allReports.flatMap(r => r.results),
    };
    
    console.log('\nPartial Results:');
    console.log(JSON.stringify(partialReport, null, 2));
    
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { checkEndpoint, runHealthChecks, generateReport, StabilityReport, TestResult };
