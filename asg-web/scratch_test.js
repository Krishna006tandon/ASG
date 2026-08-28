const https = require('https');

const req = https.request('https://avinashsgore.vercel.app/api/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`BODY: ${data}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(JSON.stringify({
  type: 'blob.generate-client-token',
  pathname: 'test.pdf',
  callbackUrl: 'https://avinashsgore.vercel.app/api/upload',
  clientPayload: 'null'
}));
req.end();
