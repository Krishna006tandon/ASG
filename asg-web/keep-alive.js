/**
 * Vercel & Backend Keep-Alive Script
 * 
 * Pings the backend service every 2 minutes to keep the Vercel serverless function
 * and database connection active, preventing cold starts and idle timeouts.
 * 
 * Usage:
 *   1. Default:
 *      node keep-alive.js
 * 
 *   2. With specific URL:
 *      node keep-alive.js https://your-actual-domain.vercel.app
 * 
 *   3. Using npm script:
 *      npm run keep-alive -- https://your-actual-domain.vercel.app
 * 
 *   4. With environment variable:
 *      APP_URL=https://your-actual-domain.vercel.app npm run keep-alive
 */

const https = require('https');
const http = require('http');

// Configurable target URL
const inputUrl = process.argv[2] || process.env.APP_URL || process.env.SITE_URL || 'https://your-vercel-domain.vercel.app';
const TARGET_URL = inputUrl.endsWith('/api/keep-alive')
  ? inputUrl
  : `${inputUrl.replace(/\/$/, '')}/api/keep-alive`;

const INTERVAL_MINUTES = 2;
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000; // 2 minutes in milliseconds

function ping() {
  const startTime = Date.now();
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  const client = TARGET_URL.startsWith('http://') ? http : https;

  const req = client.get(TARGET_URL, (res) => {
    const duration = Date.now() - startTime;
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`[${timestamp}] \x1b[32m✅ Ping successful\x1b[0m | Status: ${res.statusCode} | Latency: ${duration}ms`);
      } else {
        console.warn(`[${timestamp}] \x1b[33m⚠️ Ping responded\x1b[0m | Status: ${res.statusCode} | Latency: ${duration}ms`);
      }
    });
  });

  req.on('error', (err) => {
    const duration = Date.now() - startTime;
    console.error(`[${timestamp}] \x1b[31m❌ Ping failed\x1b[0m | Error: ${err.message} | Latency: ${duration}ms`);
  });

  req.setTimeout(15000, () => {
    req.destroy(new Error('Request timed out after 15s'));
  });
}

console.log('====================================================');
console.log('🚀 ASG Backend Keep-Alive Service Started');
console.log(`🎯 Target URL: ${TARGET_URL}`);
console.log(`⏱️  Interval:   Every ${INTERVAL_MINUTES} minutes`);
console.log('====================================================\n');

// Trigger immediate ping on startup
ping();

// Run on recurring 2-minute interval
setInterval(ping, INTERVAL_MS);
