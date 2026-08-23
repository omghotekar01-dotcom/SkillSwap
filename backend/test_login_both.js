const http = require('http');

const tests = [
  { email: 'admin@demo.com', password: 'admin123' },
  { email: 'student@demo.com', password: 'demo123' },
];

tests.forEach(creds => {
  const data = JSON.stringify(creds);
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log(`\n✓ Login test for ${creds.email}:`);
      console.log(`  Status: ${res.statusCode}`);
      try {
        const parsed = JSON.parse(body);
        if (parsed.token) {
          console.log(`  ✓ Token received: ${parsed.token.substring(0, 20)}...`);
          console.log(`  User: ${parsed.user.name} (${parsed.user.email})`);
        } else {
          console.log(`  Message: ${parsed.message}`);
        }
      } catch (e) {
        console.log(`  Response: ${body}`);
      }
    });
  });

  req.on('error', e => console.error(`✗ Error for ${creds.email}:`, e.message));
  req.write(data);
  req.end();
});
