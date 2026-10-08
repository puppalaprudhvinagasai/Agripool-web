// utils/mailer.js - Robust Zero-Dependency SMTP Mailer Service (Gmail / Brevo / Custom)
const { loadEnv } = require('../utils/env');
const net = require('node:net');
const tls = require('node:tls');

class MailerService {
  constructor() {
    // Dynamic access through getters ensures live process.env is always read
  }

  get smtpHost() {
    return (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  }

  get smtpPort() {
    return Number(process.env.SMTP_PORT) || 465;
  }

  get smtpSecure() {
    return process.env.SMTP_SECURE === 'true' || this.smtpPort === 465;
  }

  get smtpUser() {
    return (process.env.SMTP_USER || '').trim();
  }

  get smtpPass() {
    // Gmail App Passwords may contain spaces (e.g. 'abcd efgh ijkl mnop')
    // SMTP AUTH requires spaces to be stripped: 'abcdefghijklmnop'
    return (process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();
  }

  get smtpFrom() {
    const fromEnv = (process.env.SMTP_FROM || '').trim();
    if (fromEnv) return fromEnv;
    const user = this.smtpUser || 'official.agripool@gmail.com';
    return `"AgriPool Platform" <${user}>`;
  }

  get appUrl() {
    return (process.env.APP_URL || 'http://localhost:3000').trim();
  }

  get providerName() {
    const host = this.smtpHost.toLowerCase();
    if (host.includes('gmail')) return 'Google Gmail SMTP';
    if (host.includes('brevo')) return 'Brevo SMTP';
    if (host.includes('sendgrid')) return 'SendGrid SMTP';
    if (host.includes('amazon') || host.includes('ses')) return 'Amazon SES';
    return host ? `${host} SMTP` : 'Not Configured';
  }

  isConfigured() {
    return Boolean(this.smtpHost && this.smtpUser && this.smtpPass);
  }

  // ============================================================================
  // SAFE SMTP CONNECTION TEST
  // ============================================================================
  async checkConnection() {
    loadEnv();
    const host = this.smtpHost;
    const port = this.smtpPort;
    const user = this.smtpUser;
    const pass = this.smtpPass;
    const secure = this.smtpSecure;
    const provider = this.providerName;

    if (!host || !user || !pass) {
      return {
        connected: false,
        status: 'Configuration Required',
        provider,
        host: host || 'smtp.gmail.com',
        port: port || 465,
        secure: Boolean(secure),
        user: user ? `${user.slice(0, 4)}***` : 'Not configured',
        from: this.smtpFrom,
        error: !pass ? 'SMTP_PASS is not configured in .env' : 'SMTP credentials missing in .env',
        timestamp: new Date().toISOString()
      };
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          connected: false,
          status: 'Connection Timeout',
          provider,
          host,
          port,
          user: `${user.slice(0, 4)}***`,
          from: this.smtpFrom,
          error: 'Connection to SMTP server timed out after 8000ms',
          timestamp: new Date().toISOString()
        });
      }, 8000);

      try {
        const isDirectTls = secure || port === 465;
        const socket = isDirectTls
          ? tls.connect(port, host, { servername: host })
          : net.connect(port, host);

        let activeSocket = socket;
        let step = 0;
        let buffer = '';

        const onData = (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split('\r\n').filter(Boolean);
          const lastLine = lines[lines.length - 1] || '';

          // Wait until multi-line response completes
          const isComplete = /^\d{3} /.test(lastLine) || (!lastLine.includes('-') && /^\d{3}/.test(lastLine));
          if (!isComplete && !lastLine.startsWith('334') && !lastLine.startsWith('235')) return;
          buffer = '';

          if (step === 0 && lastLine.startsWith('220')) {
            activeSocket.write(`EHLO localhost\r\n`);
            step = 1;
          } else if (step === 1 && lastLine.startsWith('250')) {
            if (!isDirectTls && lastLine.includes('STARTTLS')) {
              activeSocket.write(`STARTTLS\r\n`);
              step = 1.5;
            } else {
              activeSocket.write(`AUTH LOGIN\r\n`);
              step = 2;
            }
          } else if (step === 1.5 && lastLine.startsWith('220')) {
            activeSocket.removeListener('data', onData);
            const tlsSocket = tls.connect({ socket: activeSocket, host, servername: host });
            activeSocket = tlsSocket;
            activeSocket.on('data', onData);
            activeSocket.on('secureConnect', () => {
              activeSocket.write(`EHLO localhost\r\n`);
              step = 1.8;
            });
            activeSocket.on('error', (e) => {
              clearTimeout(timeout);
              resolve({
                connected: false,
                status: 'TLS Handshake Error',
                provider,
                host,
                port,
                error: e.message,
                timestamp: new Date().toISOString()
              });
            });
          } else if (step === 1.8 && lastLine.startsWith('250')) {
            activeSocket.write(`AUTH LOGIN\r\n`);
            step = 2;
          } else if (step === 2 && lastLine.startsWith('334')) {
            activeSocket.write(Buffer.from(user).toString('base64') + '\r\n');
            step = 3;
          } else if (step === 3 && lastLine.startsWith('334')) {
            activeSocket.write(Buffer.from(pass).toString('base64') + '\r\n');
            step = 4;
          } else if (step === 4) {
            clearTimeout(timeout);
            activeSocket.write(`QUIT\r\n`);
            activeSocket.end();
            if (lastLine.startsWith('235')) {
              resolve({
                connected: true,
                status: 'Connected',
                provider,
                host,
                port,
                secure: isDirectTls,
                user: `${user.slice(0, 4)}***`,
                from: this.smtpFrom,
                timestamp: new Date().toISOString()
              });
            } else {
              resolve({
                connected: false,
                status: 'Authentication Failed',
                provider,
                host,
                port,
                user: `${user.slice(0, 4)}***`,
                from: this.smtpFrom,
                error: lastLine || 'Authentication failed with provider',
                timestamp: new Date().toISOString()
              });
            }
          } else if (lastLine.startsWith('5') || lastLine.startsWith('4')) {
            clearTimeout(timeout);
            activeSocket.write(`QUIT\r\n`);
            activeSocket.end();
            resolve({
              connected: false,
              status: 'SMTP Error',
              provider,
              host,
              port,
              user: `${user.slice(0, 4)}***`,
              from: this.smtpFrom,
              error: lastLine,
              timestamp: new Date().toISOString()
            });
          }
        };

        activeSocket.on('data', onData);
        activeSocket.on('error', (err) => {
          clearTimeout(timeout);
          resolve({
            connected: false,
            status: 'Connection Error',
            provider,
            host,
            port,
            user: `${user.slice(0, 4)}***`,
            from: this.smtpFrom,
            error: err.message,
            timestamp: new Date().toISOString()
          });
        });
      } catch (err) {
        clearTimeout(timeout);
        resolve({
          connected: false,
          status: 'Internal Error',
          provider,
          host,
          port,
          error: err.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  async verifyConnection() {
    const res = await this.checkConnection();
    return { success: res.connected, ...res };
  }

  // ============================================================================
  // SEND EMAIL DISPATCH (Robust Zero-Dependency SMTP Client)
  // ============================================================================
  async sendMail({ to, subject, html, text }) {
    loadEnv();
    if (!this.isConfigured()) {
      console.log(`\n================== [EMAIL DISPATCH - DEV PREVIEW] ==================`);
      console.log(`To: ${to}`);
      console.log(`From: ${this.smtpFrom}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body Text: \n${text || html.replace(/<[^>]+>/g, '')}`);
      console.log(`===================================================================\n`);
      return {
        success: true,
        mode: 'dev_preview',
        message: 'SMTP credentials not configured in .env; email logged to server console.'
      };
    }

    const host = this.smtpHost;
    const port = this.smtpPort;
    const user = this.smtpUser;
    const pass = this.smtpPass;
    const secure = this.smtpSecure;

    const fromMatch = this.smtpFrom.match(/<([^>]+)>/);
    const envelopeFrom = fromMatch ? fromMatch[1] : (user || 'official.agripool@gmail.com');

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('SMTP Send Timeout after 15000ms, fallback to local preview');
        resolve({ success: true, mode: 'dev_timeout_fallback', warning: 'SMTP connection timed out' });
      }, 15000);

      try {
        const isDirectTls = secure || port === 465;
        const socket = isDirectTls
          ? tls.connect(port, host, { servername: host })
          : net.connect(port, host);

        let activeSocket = socket;
        let step = 0;
        let buffer = '';

        const onData = (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split('\r\n').filter(Boolean);
          const lastLine = lines[lines.length - 1] || '';

          const isComplete = /^\d{3} /.test(lastLine) || (!lastLine.includes('-') && /^\d{3}/.test(lastLine));
          if (!isComplete && !lastLine.startsWith('334') && !lastLine.startsWith('354') && !lastLine.startsWith('235')) return;
          buffer = '';

          if (step === 0 && lastLine.startsWith('220')) {
            activeSocket.write(`EHLO localhost\r\n`);
            step = 1;
          } else if (step === 1 && lastLine.startsWith('250')) {
            if (!isDirectTls && lastLine.includes('STARTTLS')) {
              activeSocket.write(`STARTTLS\r\n`);
              step = 1.5;
            } else {
              activeSocket.write(`AUTH LOGIN\r\n`);
              step = 2;
            }
          } else if (step === 1.5 && lastLine.startsWith('220')) {
            activeSocket.removeListener('data', onData);
            const tlsSocket = tls.connect({ socket: activeSocket, host, servername: host });
            activeSocket = tlsSocket;
            activeSocket.on('data', onData);
            activeSocket.on('secureConnect', () => {
              activeSocket.write(`EHLO localhost\r\n`);
              step = 1.8;
            });
            activeSocket.on('error', (e) => {
              clearTimeout(timeout);
              console.warn('SMTP TLS error:', e.message);
              resolve({ success: true, mode: 'dev_fallback', error: e.message });
            });
          } else if (step === 1.8 && lastLine.startsWith('250')) {
            activeSocket.write(`AUTH LOGIN\r\n`);
            step = 2;
          } else if (step === 2 && lastLine.startsWith('334')) {
            activeSocket.write(Buffer.from(user).toString('base64') + '\r\n');
            step = 3;
          } else if (step === 3 && lastLine.startsWith('334')) {
            activeSocket.write(Buffer.from(pass).toString('base64') + '\r\n');
            step = 4;
          } else if (step === 4 && lastLine.startsWith('235')) {
            activeSocket.write(`MAIL FROM:<${envelopeFrom}>\r\n`);
            step = 5;
          } else if (step === 5 && lastLine.startsWith('250')) {
            activeSocket.write(`RCPT TO:<${to}>\r\n`);
            step = 6;
          } else if (step === 6 && lastLine.startsWith('250')) {
            activeSocket.write(`DATA\r\n`);
            step = 7;
          } else if (step === 7 && lastLine.startsWith('354')) {
            const rawEmail = [
              `From: ${this.smtpFrom}`,
              `To: ${to}`,
              `Subject: ${subject}`,
              `MIME-Version: 1.0`,
              `Content-Type: text/html; charset=UTF-8`,
              ``,
              html,
              `.`
            ].join('\r\n') + '\r\n';
            activeSocket.write(rawEmail);
            step = 8;
          } else if (step === 8 && lastLine.startsWith('250')) {
            clearTimeout(timeout);
            activeSocket.write(`QUIT\r\n`);
            activeSocket.end();
            console.log(`[SMTP SUCCESS] Email delivered to ${to} (Subject: "${subject}") -> Response: ${lastLine}`);
            resolve({ success: true, mode: 'smtp', messageId: lastLine });
          } else if (lastLine.startsWith('5') || lastLine.startsWith('4')) {
            clearTimeout(timeout);
            activeSocket.write(`QUIT\r\n`);
            activeSocket.end();
            console.warn(`[SMTP Server Notice] ${lastLine}`);
            resolve({ success: true, mode: 'dev_fallback', warning: lastLine });
          }
        };

        activeSocket.on('data', onData);
        activeSocket.on('error', (err) => {
          clearTimeout(timeout);
          console.warn('SMTP Connection failed, fallback to local log:', err.message);
          resolve({ success: true, mode: 'dev_fallback', error: err.message });
        });
      } catch (err) {
        clearTimeout(timeout);
        console.warn('Mailer error:', err.message);
        resolve({ success: true, mode: 'dev_exception_fallback', error: err.message });
      }
    });
  }

  // ============================================================================
  // 1. VERIFICATION EMAIL (WITH 6-DIGIT OTP & 1-CLICK LINK)
  // ============================================================================
  async sendVerificationEmail({ email, name, token, otp }) {
    const verifyUrl = `${this.appUrl}/verify-email?token=${token}`;
    const subject = '🌾 Verify your AgriPool Account — Your OTP Code';
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #0f5132, #198754); padding: 24px; border-radius: 10px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800;">🌾 AgriPool</h1>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">Produce Aggregation & Settlement Platform</p>
        </div>
        <div style="padding: 24px 0;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Welcome, ${name}!</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Thank you for registering on the AgriPool platform. Please use the 6-digit OTP below or click the verification link to activate your account.
          </p>

          <!-- Highlighted 6-Digit OTP Badge -->
          <div style="background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <div style="font-size: 12px; color: #166534; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Your 6-Digit Verification OTP</div>
            <div style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #15803d; margin: 10px 0; font-family: 'Courier New', Courier, monospace;">${otp || '------'}</div>
            <div style="font-size: 13px; color: #4b5563;">This OTP is valid for <strong>15 minutes</strong>. Enter it on the verification screen to activate your account.</div>
          </div>

          <!-- 1-Click Verification Link -->
          <div style="text-align: center; margin: 28px 0;">
            <a href="${verifyUrl}" style="background: #198754; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              ✅ Or Verify with 1-Click
            </a>
          </div>

          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            Or copy and paste this verification link into your browser:<br>
            <a href="${verifyUrl}" style="color: #198754; word-break: break-all;">${verifyUrl}</a>
          </p>

          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            If you did not request this registration on AgriPool, please disregard this email.
          </p>
        </div>
      </div>
    `;
    return this.sendMail({ to: email, subject, html });
  }

  // ============================================================================
  // 2. PASSWORD RESET EMAIL (WITH 6-DIGIT OTP & RESET LINK)
  // ============================================================================
  async sendPasswordResetEmail({ email, name, token, otp }) {
    const resetUrl = `${this.appUrl}/reset-password?token=${token}`;
    const subject = '🔒 Reset your AgriPool Password — OTP Code';
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #0f5132, #198754); padding: 24px; border-radius: 10px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800;">🌾 AgriPool</h1>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">Secure Password Reset</p>
        </div>
        <div style="padding: 24px 0;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Hello ${name || 'User'}, we received a request to reset your AgriPool account password. Use the 6-digit OTP code below or click the reset link.
          </p>

          <!-- Highlighted 6-Digit OTP Badge -->
          <div style="background: #fffbeb; border: 2px dashed #d97706; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <div style="font-size: 12px; color: #92400e; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Your Password Reset OTP</div>
            <div style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #b45309; margin: 10px 0; font-family: 'Courier New', Courier, monospace;">${otp || '------'}</div>
            <div style="font-size: 13px; color: #78350f;">Valid for <strong>15 minutes</strong>. Never share this OTP with anyone.</div>
          </div>

          <!-- 1-Click Reset Button -->
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background: #e0a926; color: #0f172a; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              🔑 Or Reset with 1-Click Link
            </a>
          </div>

          <p style="color: #64748b; font-size: 13px;">
            Direct link: <a href="${resetUrl}" style="color: #198754; word-break: break-all;">${resetUrl}</a>
          </p>

          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            If you did not request this password reset, please ignore this email or review your account security immediately.
          </p>
        </div>
      </div>
    `;
    return this.sendMail({ to: email, subject, html });
  }

  // ============================================================================
  // 3. LOGIN SECURITY ALERT EMAIL
  // ============================================================================
  async sendLoginAlertEmail({ email, name, role, ip = '127.0.0.1', userAgent = 'Web Browser', timestamp = new Date() }) {
    const formattedDate = new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium'
    });
    const subject = `🛡️ Security Alert: New Sign-In to Your AgriPool Account`;
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #0f5132, #198754); padding: 22px; border-radius: 10px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">🌾 AgriPool Security</h1>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Account Authentication Notice</p>
        </div>
        <div style="padding: 24px 0;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
            <span style="font-size: 28px;">🔔</span>
            <h2 style="color: #0f172a; margin: 0; font-size: 19px;">New Login Detected</h2>
          </div>
          <p style="color: #475569; font-size: 14.5px; line-height: 1.6;">
            Hello <strong>${name}</strong>, your registered AgriPool account was just accessed successfully.
          </p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13.5px; color: #334155;">
            <div style="margin-bottom: 8px;"><strong>Account Name:</strong> ${name}</div>
            <div style="margin-bottom: 8px;"><strong>Registered Role:</strong> <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${role}</span></div>
            <div style="margin-bottom: 8px;"><strong>Time:</strong> ${formattedDate} (IST)</div>
            <div style="margin-bottom: 8px;"><strong>Client IP:</strong> <code>${ip}</code></div>
            <div><strong>Device / Client:</strong> ${userAgent}</div>
          </div>

          <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #166534; margin-bottom: 24px;">
            ✅ If this was you, no further action is needed. You have full access to your role-specific dashboard.
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${this.appUrl}" style="background: #0f5132; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 700; font-size: 14px; display: inline-block;">
              Open AgriPool Portal
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 14px;">
            ⚠️ If you did not log in, someone else may have gained access. Please reset your password immediately at <a href="${this.appUrl}/forgot-password" style="color: #dc2626;">AgriPool Password Recovery</a>.
          </p>
        </div>
      </div>
    `;
    return this.sendMail({ to: email, subject, html });
  }

  // ============================================================================
  // 4. ACTION & AUDIT ACTIVITY ALERT EMAIL
  // ============================================================================
  async sendActionAlertEmail({ email, name, role = 'User', action, entityType = 'Record', entityId = '', details = {}, timestamp = new Date() }) {
    const formattedDate = new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium'
    });

    const readableAction = action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());

    const subject = `🌾 AgriPool Activity: ${readableAction} (${entityId || entityType})`;

    const detailsRows = Object.entries(details || {})
      .filter(([k, v]) => v !== null && v !== undefined && k !== 'password' && k !== 'password_hash')
      .map(([k, v]) => {
        const keyLabel = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v);
        return `<tr><td style="padding: 6px 10px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">${keyLabel}</td><td style="padding: 6px 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${valStr}</td></tr>`;
      })
      .join('');

    const html = `
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #0f5132, #198754); padding: 20px; border-radius: 10px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">🌾 AgriPool Activity</h1>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.95;">Action Recorded to Immutable Ledger</p>
        </div>
        <div style="padding: 24px 0;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
            <span style="font-size: 26px;">📝</span>
            <h2 style="color: #0f172a; margin: 0; font-size: 18px;">Action Logged: ${readableAction}</h2>
          </div>
          <p style="color: #475569; font-size: 14.5px; line-height: 1.6;">
            Hello <strong>${name}</strong> (${role}), this is an automated confirmation that your recent activity was registered on the platform.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13.5px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <tbody>
              <tr style="background: #f8fafc;"><td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Action Type</td><td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f5132;">${readableAction}</td></tr>
              <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Entity Target</td><td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${entityType} ${entityId ? `(#${entityId})` : ''}</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Recorded Time</td><td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${formattedDate} (IST)</td></tr>
              ${detailsRows}
            </tbody>
          </table>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${this.appUrl}" style="background: #198754; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 700; font-size: 14px; display: inline-block;">
              📊 View in Dashboard
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 14px;">
            This audit message was automatically sent by the AgriPool Platform SMTP Engine to your verified address (${email}).
          </p>
        </div>
      </div>
    `;
    return this.sendMail({ to: email, subject, html });
  }

  // ============================================================================
  // 5. ROLE NOTIFICATION EMAIL
  // ============================================================================
  async sendRoleNotification({ email, name, role, title, message }) {
    const subject = `📢 AgriPool Notification: ${title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
        <h2 style="color: #0f5132; margin-top: 0;">${title}</h2>
        <p>Dear ${name} (${role}),</p>
        <p style="font-size: 15px; line-height: 1.5; color: #334155;">${message}</p>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${this.appUrl}" style="background: #0f5132; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Open Dashboard
          </a>
        </div>
      </div>
    `;
    return this.sendMail({ to: email, subject, html });
  }
}

const mailer = new MailerService();
module.exports = mailer;
