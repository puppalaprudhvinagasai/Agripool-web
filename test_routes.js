const http = require('node:http');

const routes = [
  '/',
  '/farmers',
  '/crops',
  '/lots',
  '/pools',
  '/pickup',
  '/storage',
  '/buyers',
  '/orders',
  '/payments',
  '/reports',
  '/notifications',
  '/activity',
  '/growth-plan',
  '/settings'
];

async function checkRoute(r) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${r}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          route: r,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          bodyLength: body.length,
          hasAgriPool: body.includes('AgriPool')
        });
      });
    }).on('error', (err) => {
      resolve({
        route: r,
        statusCode: 0,
        error: err.message
      });
    });
  });
}

async function run() {
  console.log('Testing all 15 routes on http://localhost:3000...\n');
  const results = [];
  for (const r of routes) {
    const res = await checkRoute(r);
    results.push(res);
    console.log(`Route: ${r.padEnd(16)} -> Status: ${res.statusCode} | Content-Type: ${res.contentType} | Length: ${res.bodyLength} bytes | Contains AgriPool: ${res.hasAgriPool}`);
  }

  const allPassed = results.every(r => r.statusCode === 200 && r.hasAgriPool && r.contentType.includes('text/html'));
  console.log(`\nAll 15 Routes Validated: ${allPassed ? '✅ YES (15/15 PASSED)' : '❌ NO'}`);
}

run();
