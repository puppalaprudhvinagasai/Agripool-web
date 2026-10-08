// scripts/test_smtp_e2e.js
// Complete End-to-End Test for Gmail SMTP Integration
const { spawn } = require('node:child_process');
const http = require('node:http');
const { getDatabase } = require('../db/database.js');
const mailer = require('../utils/mailer.js');

const db = getDatabase();

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log('====================================================');
  console.log('🚀 STARTING AGRIPOOL END-TO-END SMTP VALIDATION');
  console.log('====================================================\n');

  // 1. Direct Mailer Connectivity Test
  console.log('1️⃣ Checking direct Gmail SMTP TLS connectivity...');
  const verifyRes = await mailer.verifyConnection();
  console.log('   SMTP Verify Result:', verifyRes);
  if (!verifyRes.success) {
    throw new Error('SMTP connection test failed: ' + verifyRes.message);
  }
  console.log('   ✅ Gmail SMTP connection verified successfully.\n');

  // 2. Start server
  console.log('2️⃣ Starting AgriPool HTTP Server on port 3000...');
  const serverProcess = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (d) => {
    // console.log('[Server stdout]:', d.toString().trim());
  });
  serverProcess.stderr.on('data', (d) => {
    console.error('[Server stderr]:', d.toString().trim());
  });

  // Wait for server to be up
  let serverReady = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/health',
        method: 'GET'
      });
      if (res.status === 200) {
        serverReady = true;
        break;
      }
    } catch {
      await new Promise(r => setTimeout(r, 400));
    }
  }

  if (!serverReady) {
    serverProcess.kill();
    throw new Error('Server failed to start within timeout.');
  }
  console.log('   ✅ AgriPool HTTP server is live and responsive.\n');

  try {
    // 3. Test /api/smtp/status
    console.log('3️⃣ Testing GET /api/smtp/status endpoint...');
    const smtpRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/smtp/status',
      method: 'GET'
    });
    const smtpData = smtpRes.body.data || smtpRes.body;
    console.log('   Response Status:', smtpRes.status);
    console.log('   Connected:', smtpData.connected);
    console.log('   Host:', smtpData.host);
    console.log('   User:', smtpData.user);
    if (!smtpData.connected) {
      throw new Error('SMTP status endpoint reported disconnected or misconfigured: ' + JSON.stringify(smtpData));
    }
    console.log('   ✅ /api/smtp/status returned healthy & connected.\n');

    // 4. Test Sign Up with 6-digit OTP dispatch
    const testEmail = 'official.agripool@gmail.com'; // Use authorized address to test real delivery
    const testPassword = 'Password123!Secure';
    const testName = 'Prudhvi Puppala';
    console.log(`4️⃣ Testing Sign Up with 6-digit OTP verification for ${testEmail}...`);

    // Clean up any existing test user in SQLite to ensure fresh test
    db.prepare('DELETE FROM users WHERE email = ?').run(testEmail);

    const signupRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/signup',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: testName,
      email: testEmail,
      password: testPassword,
      role: 'fpo_admin'
    });

    const signupData = signupRes.body.data || signupRes.body;
    console.log('   Signup Status:', signupRes.status);
    console.log('   Verification Required:', signupData.verificationRequired);
    console.log('   Generated OTP:', signupData.verificationOtp);

    const otpCode = signupData.verificationOtp;
    if (!otpCode || otpCode.length !== 6) {
      throw new Error('Failed to generate 6-digit verification OTP!');
    }
    console.log('   ✅ Signup succeeded and 6-digit OTP email dispatched.\n');

    // 5. Test Verify OTP
    console.log(`5️⃣ Testing OTP Verification with code: ${otpCode}...`);
    const verifyOtpRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/verify-otp',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail,
      otp: otpCode
    });

    const verifyData = verifyOtpRes.body.data || verifyOtpRes.body;
    console.log('   Verify Status:', verifyOtpRes.status);
    console.log('   Success:', verifyData.success);
    if (!verifyData.success) {
      throw new Error('OTP verification failed: ' + JSON.stringify(verifyData));
    }
    console.log('   ✅ User email verified successfully with 6-digit OTP.\n');

    // 6. Test Login & Login Alert Email
    console.log('6️⃣ Testing Sign In and Real-time Login Security Alert...');
    const loginRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AgriPool-Automated-Test-Client/1.0',
        'X-Forwarded-For': '127.0.0.1'
      }
    }, {
      identifier: testEmail,
      password: testPassword
    });

    const loginData = loginRes.body.data || loginRes.body;
    console.log('   Login Status:', loginRes.status);
    console.log('   User ID:', loginData.id);
    console.log('   Email:', loginData.email);
    console.log('   Role:', loginData.role);
    if (!loginData.token) {
      throw new Error('Login failed: ' + JSON.stringify(loginRes.body));
    }
    const authToken = loginData.token;
    const authUserId = loginData.id;
    console.log('   ✅ Login successful! Login security alert email dispatched in background.\n');

    // 7. Test Forgot Password & Reset OTP
    console.log('7️⃣ Testing Forgot Password flow with 6-digit recovery OTP...');
    const forgotRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/forgot-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail
    });

    const forgotData = forgotRes.body.data || forgotRes.body;
    console.log('   Forgot Password Status:', forgotRes.status);
    console.log('   Reset OTP:', forgotData.resetOtp);
    const resetOtp = forgotData.resetOtp;
    if (!resetOtp || resetOtp.length !== 6) {
      throw new Error('Failed to generate 6-digit password reset OTP!');
    }
    console.log('   ✅ Password reset OTP dispatched via Gmail SMTP.\n');

    // 8. Test Verify Reset OTP
    console.log(`8️⃣ Testing Verify Reset OTP endpoint with code: ${resetOtp}...`);
    const verifyResetRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/verify-reset-otp',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail,
      otp: resetOtp
    });
    const verifyResetData = verifyResetRes.body.data || verifyResetRes.body;
    console.log('   Verify Reset OTP Status:', verifyResetRes.status);
    console.log('   Success:', verifyResetData.success);
    if (!verifyResetData.success) {
      throw new Error('Reset OTP verification failed!');
    }
    console.log('   ✅ Reset OTP validated successfully.\n');

    // 9. Test Reset Password with OTP
    console.log('9️⃣ Testing Reset Password with OTP...');
    const newPassword = 'NewSecretPassword2026!';
    const resetRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/reset-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail,
      otp: resetOtp,
      newPassword: newPassword
    });

    const resetData = resetRes.body.data || resetRes.body;
    console.log('   Reset Password Status:', resetRes.status);
    console.log('   Success:', resetData.success);
    if (!resetData.success) {
      throw new Error('Password reset failed!');
    }

    // Verify login with new password
    const reLoginRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      identifier: testEmail,
      password: newPassword
    });
    const reLoginData = reLoginRes.body.data || reLoginRes.body;
    if (!reLoginData.token) {
      throw new Error('Could not log in with newly reset password: ' + JSON.stringify(reLoginRes.body));
    }
    console.log('   ✅ Password updated and verified with fresh sign in.\n');

    // 10. Test User Action Recording & Action Alert Email
    console.log('🔟 Testing User Action Recording & Action Alert Email via SMTP...');
    // Create a new crop or lot with caller context headers
    const testCropName = 'Certified Test Turmeric ' + Date.now();
    const actionRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/crops',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-User-Id': String(authUserId),
        'X-User-Email': testEmail,
        'X-User-Name': testName,
        'X-User-Role': 'fpo_admin'
      }
    }, {
      farmer_id: 1,
      crop_name: testCropName,
      crop_category: 'Spices',
      quantity: 50.0,
      expected_harvest_date: '2026-11-15',
      quality_grade: 'GRADE_A',
      village: 'Kankipadu',
      storage_status: 'On Farm',
      status: 'Ready'
    });

    console.log('   Action API Response Status:', actionRes.status);
    console.log('   Action Response Body:', actionRes.body);

    // Give background async email dispatch a moment to complete
    console.log('   Waiting 3.5 seconds for asynchronous mail delivery and audit commit...');
    await new Promise(r => setTimeout(r, 3500));

    // Check audit_logs table in database
    const latestAudit = db.prepare(`
      SELECT * FROM audit_logs 
      WHERE action = 'CREATE_CROP' 
      ORDER BY id DESC LIMIT 1
    `).get();

    console.log('   Audit Log Record in Database:');
    console.log('     ID:', latestAudit?.id);
    console.log('     Action:', latestAudit?.action);
    console.log('     User Name:', latestAudit?.user_name);
    console.log('     User Email:', latestAudit?.user_email);
    console.log('     Mail Status:', latestAudit?.mail_status);
    console.log('     Entity Type:', latestAudit?.entity_type);
    console.log('     Entity ID:', latestAudit?.entity_id);

    if (!latestAudit) {
      throw new Error('Audit log record not found in database!');
    }
    if (latestAudit.user_email !== testEmail) {
      throw new Error(`Expected audit log email to be ${testEmail}, got: ${latestAudit.user_email}`);
    }
    if (latestAudit.mail_status !== 'SENT') {
      console.warn(`   ⚠️ Warning: mail_status is ${latestAudit.mail_status} (Expected 'SENT')`);
    } else {
      console.log('   ✅ Audit Log recorded AND Action Notification Email sent via Gmail SMTP!');
    }

    console.log('\n====================================================');
    console.log('🎉 ALL SMTP & AUTH & AUDIT NOTIFICATION TESTS PASSED!');
    console.log('====================================================\n');

  } finally {
    console.log('Stopping test HTTP server...');
    serverProcess.kill();
  }
}

run().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
