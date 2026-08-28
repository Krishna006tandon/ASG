const https = require('https');

// Step 1: Generate client token
const tokenReq = https.request('https://avinashsgore.vercel.app/api/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (tokenRes) => {
  let tokenData = '';
  tokenRes.on('data', d => tokenData += d);
  tokenRes.on('end', () => {
    console.log('Token response:', tokenData);
    try {
      const payload = JSON.parse(tokenData);
      
      if (!payload.clientToken) {
        console.log('No clientToken in response. Aborting.');
        return;
      }

      // Step 2: Simulate file PUT request
      const fileContent = 'dummy pdf content'; // tiny payload
      const uploadUrl = payload.url || 'https://vercel.com/api/blob/?pathname=test_book.pdf';
      const putReq = https.request(uploadUrl, {
        method: 'PUT',
        headers: {
          'authorization': `Bearer ${payload.clientToken}`,
          'Content-Type': 'application/pdf',
          'Content-Length': fileContent.length
        }
      }, (putRes) => {
        let putData = '';
        putRes.on('data', d => putData += d);
        putRes.on('end', () => {
          console.log(`PUT STATUS: ${putRes.statusCode}`);
          console.log(`PUT BODY: ${putData}`);
        });
      });

      putReq.on('error', (e) => console.error('PUT Error:', e.message));
      putReq.write(fileContent);
      putReq.end();
      
    } catch (e) {
      console.log('Error parsing token:', e.message);
    }
  });
});

tokenReq.on('error', (e) => console.error('Token Error:', e.message));
tokenReq.write(JSON.stringify({
  type: 'blob.generate-client-token',
  payload: {
    pathname: 'test_book.pdf',
    callbackUrl: 'https://avinashsgore.vercel.app/api/upload',
    clientPayload: null
  }
}));
tokenReq.end();
