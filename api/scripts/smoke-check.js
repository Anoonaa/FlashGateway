import http from 'http';

const base = 'http://127.0.0.1:4001';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`${base}${path}`, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  const health = await request('/health');
  if (health.status !== 200) throw new Error(`Health failed: ${health.status}`);

  const login = await request('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'merchant@flashgateway.local', password: 'Password123!' })
  });
  if (login.status !== 200) throw new Error(`Login failed: ${login.status} ${login.body}`);

  const payload = JSON.parse(login.body);
  const merchantId = payload.user.merchantId;
  const token = payload.token;

  const balance = await request(`/api/v1/merchants/${merchantId}/balance`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (balance.status !== 200) throw new Error(`Balance failed: ${balance.status}`);

  const purchase = await request(`/api/v1/merchants/${merchantId}/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ amount: 100, product: 'Airtime' })
  });
  if (purchase.status !== 200) throw new Error(`Purchase failed: ${purchase.status} ${purchase.body}`);

  console.log('Smoke check passed');
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
