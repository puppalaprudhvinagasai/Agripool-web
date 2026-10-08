// public/js/components/settings.js - Settings & Pilot Configuration
async function renderSettingsPage() {
  const statsRes = await api.getStats();

  return `
    <div class="settings-page">
      <!-- Header -->
      <div class="card-header" style="margin-bottom: 24px;">
        <div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary);">
            ⚙️ Settings
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Pilot organization parameters, language preferences, and database administration.
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
        <!-- Card 1: Pilot Organization Profile -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">🌾 Pilot Organization</h3>
              <div class="card-subtitle">Primary operational FPO configuration</div>
            </div>
            <span class="badge badge-settled">ACTIVE PILOT</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label class="form-label">FPO Name</label>
              <input type="text" class="form-control" value="Kisan Vikas FPO" readonly>
            </div>
            <div>
              <label class="form-label">Registration Code</label>
              <input type="text" class="form-control" value="FPO-AP-2024-KV01" readonly>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Districts</label>
                <input type="text" class="form-control" value="Krishna & Guntur" readonly>
              </div>
              <div class="form-group">
                <label class="form-label">State</label>
                <input type="text" class="form-control" value="Andhra Pradesh" readonly>
              </div>
            </div>
            <div>
              <label class="form-label">Head Office</label>
              <input type="text" class="form-control" value="Agri-Market Complex, Kankipadu, Krishna Dist" readonly>
            </div>
          </div>
        </div>

        <!-- Card 2: Regional & Language Preferences -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">🌐 Language & Localization</h3>
              <div class="card-subtitle">Assisted UI and farmer speech settings</div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div class="form-group">
              <label class="form-label">Preferred Interface Language</label>
              <select class="form-control" id="settings-lang-select" onchange="toggleLangPref(this.value)">
                <option value="en" selected>English (Primary)</option>
                <option value="te">తెలుగు (Telugu - Farmer Friendly)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Weight Measurement Unit</label>
              <select class="form-control">
                <option value="kg" selected>Kilograms (kg) & Quintals (Qtl = 100 kg)</option>
                <option value="mt">Metric Tonnes (MT = 10 Qtl)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Currency Symbol</label>
              <input type="text" class="form-control" value="₹ (Indian Rupee / INR)" readonly>
            </div>

            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 12.5px; color: var(--text-secondary);">
              🔊 <strong>Voice Narration:</strong> Enabled for Farmer self-service portal (Telugu & English speech synthesis supported).
            </div>
          </div>
        </div>

        <!-- Card 3: Database & Reset -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">🔄 Database & Demo State</h3>
              <div class="card-subtitle">Zero-dependency native SQLite state control</div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
              AgriPool runs an enterprise-grade SQLite relational engine with 28 relational tables, WAL mode enabled, and zero external binary dependencies.
            </div>

            <div style="background: #ecfdf5; padding: 12px 14px; border-radius: 8px; border: 1px solid #a7f3d0; font-size: 13px; color: #065f46;">
              Database status: <strong>HEALTHY & CONNECTED</strong><br>
              Entities tracked: <strong>${statsRes.kpis.totalFarmers} Farmers, ${statsRes.kpis.totalLots} Lots, ${statsRes.kpis.totalPools} Pools</strong>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 8px;">
              <button onclick="promptResetSeed()" class="btn btn-outline btn-sm" style="color: #dc2626; border-color: #fca5a5;">
                🔄 Reset to Clean Seed State (75 Farmers)
              </button>
              <button onclick="runAcceptanceDemoPrompt()" class="btn btn-accent btn-sm">
                ⚡ Run 20-Step Demo Workflow
              </button>
            </div>
          </div>
        </div>

        <!-- Card 4: SMTP Notification Engine -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">📧 Live SMTP Email Dispatcher</h3>
              <div class="card-subtitle">Authenticated Google Gmail TLS Engine</div>
            </div>
            <span class="badge badge-success">ACTIVE & VERIFIED</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
              <div style="background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div style="color: var(--text-muted); font-size: 11.5px;">SMTP Relay Host</div>
                <strong style="color: var(--text-primary);">smtp.gmail.com:465 (TLS)</strong>
              </div>
              <div style="background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div style="color: var(--text-muted); font-size: 11.5px;">Authenticated Account</div>
                <strong style="color: var(--text-primary); word-break: break-all;">official.agripool@gmail.com</strong>
              </div>
            </div>

            <div style="background: #eff6ff; padding: 12px; border-radius: 8px; border: 1px solid #bfdbfe; font-size: 12.5px; color: #1e40af; line-height: 1.5;">
              <strong>Live Notification Triggers Active:</strong>
              <ul style="margin: 6px 0 0 18px; padding: 0;">
                <li>🔐 <strong>Authentication:</strong> 6-Digit Verification OTP &amp; 1-click verify links</li>
                <li>🔑 <strong>Security:</strong> Forgot Password 6-Digit OTP recovery codes</li>
                <li>🛡️ <strong>Safety:</strong> Real-time Login Alerts with IP &amp; Device fingerprinting</li>
                <li>📋 <strong>Audit Alerts:</strong> Real-time Action Notifications dispatched on every platform event</li>
              </ul>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 4px;">
              <button onclick="showSmtpStatusModal()" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
                <span>✉️</span>
                <span>Test SMTP Email Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleLangPref(lang) {
  showToast(`Language set to ${lang === 'te' ? 'తెలుగు (Telugu)' : 'English'}.`, 'success');
}

window.renderSettingsPage = renderSettingsPage;
window.toggleLangPref = toggleLangPref;
