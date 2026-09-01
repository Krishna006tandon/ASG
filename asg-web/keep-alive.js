const https = require('https');

// Apni deployed website ka URL yahan dalein
const URL = 'https://your-vercel-domain.vercel.app/api/keep-alive'; 

console.log('Keep-alive script started. Pinging every 14 minutes...');

setInterval(() => {
  https.get(URL, (res) => {
    console.log(`[${new Date().toISOString()}] Pinged backend. Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Error pinging backend:`, err.message);
  });
}, 14 * 60 * 1000); // 14 minutes
