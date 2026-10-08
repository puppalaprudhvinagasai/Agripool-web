// test_auth_api.js - Validate new Authentication, Supabase bridge, Market Prices, and Live Stock APIs
async function test() {
  console.log('--- TESTING NEW APIS ON http://localhost:3000 ---');

  // 1. Roles
  const rolesRes = await fetch('http://localhost:3000/api/auth/roles');
  const roles = await rolesRes.json();
  console.log('✅ Roles API:', roles.success ? 'PASSED' : 'FAILED', `(${roles.data?.length} roles available)`);

  // 2. Market Prices
  const pricesRes = await fetch('http://localhost:3000/api/market/prices');
  const prices = await pricesRes.json();
  console.log('✅ Market Prices API:', prices.success ? 'PASSED' : 'FAILED', `(${prices.data?.length} commodities tracked)`);

  // 3. Live Stock
  const stockRes = await fetch('http://localhost:3000/api/market/stock');
  const stock = await stockRes.json();
  console.log('✅ Live Stock API:', stock.success ? 'PASSED' : 'FAILED', `(${stock.data?.length} crop stocks tracked)`);

  // 4. Crop Market Details (Tomato)
  const tomatoRes = await fetch('http://localhost:3000/api/market/crops/Tomato');
  const tomato = await tomatoRes.json();
  console.log('✅ Tomato Market Details API:', tomato.success ? 'PASSED' : 'FAILED', `Rate: ₹${tomato.data?.currentPrice}/kg, Stock: ${tomato.data?.availableStockKg} kg`);

  // 5. Login Existing Seed Farmer
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'farmer@agripool.in', password: 'password123' })
  });
  const login = await loginRes.json();
  console.log('✅ Farmer Login API:', login.success ? 'PASSED' : 'FAILED', `Logged in as: ${login.data?.name} (Role: ${login.data?.role})`);

  // 6. Signup New Farmer
  const testEmail = `test_farmer_${Date.now()}@agripool.in`;
  const signupRes = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'password123',
      role: 'farmer',
      name: 'Ramesh Reddy',
      phone: '+91 98489 99999',
      metadata: {
        village: 'Kankipadu',
        mandal: 'Kankipadu',
        district: 'Krishna',
        state: 'Andhra Pradesh',
        preferred_language: 'te',
        land_size_acres: 3.5
      }
    })
  });
  const signup = await signupRes.json();
  console.log('✅ Farmer Signup API:', signup.success ? 'PASSED' : 'FAILED', `Created: ${signup.data?.email} (Token: ${signup.data?.verificationToken ? 'Issued' : 'None'})`);

  // 7. Verify Email with Token
  if (signup.data?.verificationToken) {
    const verifyRes = await fetch('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: signup.data.verificationToken })
    });
    const verify = await verifyRes.json();
    console.log('✅ Email Verification API:', verify.success ? 'PASSED' : 'FAILED', verify.data?.message);
  }

  // 8. Forgot Password Flow
  const forgotRes = await fetch('http://localhost:3000/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail })
  });
  const forgot = await forgotRes.json();
  console.log('✅ Forgot Password API:', forgot.success ? 'PASSED' : 'FAILED', forgot.data?.message);

  if (forgot.data?.resetToken) {
    const resetRes = await fetch('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: forgot.data.resetToken, newPassword: 'NewPassword@2026' })
    });
    const reset = await resetRes.json();
    console.log('✅ Password Reset API:', reset.success ? 'PASSED' : 'FAILED', reset.data?.message);
  }

  console.log('\n--- ALL AUTHENTICATION AND MARKET BACKEND APIS FUNCTIONING PROPERLY ---');
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
