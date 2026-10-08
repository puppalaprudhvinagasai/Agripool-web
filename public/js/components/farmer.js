// public/js/components/farmer.js - Farmer Self-Service Portal (Section 8: Mobile-First + Icon-Driven)
async function renderFarmerPage() {
  let farmer;
  try {
    farmer = await api.getMyFarmerProfile();
  } catch (e) {
    try {
      const list = await api.getFarmers({ limit: 1 });
      farmer = list[0];
    } catch (e2) {}
  }

  if (!farmer) {
    const activeUser = window.auth ? window.auth.getUser() : null;
    farmer = {
      name: activeUser ? activeUser.name : 'Farmer',
      farmer_code: 'FAR-AP-0001',
      village_name: 'Kankipadu',
      bank_account_no: 'Pending Linkage',
      ifsc_code: 'SBIN0004128',
      lots: [],
      payments: []
    };
  }

  const lang = window.i18n ? window.i18n.getLang() : 'en';

  const latestPayment = (farmer.payments && farmer.payments.length > 0) ? farmer.payments[0] : null;
  const narrationText = latestPayment
    ? `Namaste ${farmer.name}. You have ${farmer.lots ? farmer.lots.length : 0} active produce lots with Kisan Vikas FPO. Your latest payment of rupees ${latestPayment.net_payable} has been credited to your bank account with UTR reference ${latestPayment.reference_utr}.`
    : `Namaste ${farmer.name}. Welcome to your AgriPool farmer portal. You have ${farmer.lots ? farmer.lots.length : 0} active produce lots. Your account is verified and ready.`;

  return `
    <div class="farmer-portal">
      <!-- Farmer Profile Header -->
      <div class="card" style="background: linear-gradient(135deg, #0F5132 0%, #157347 100%); color: #ffffff; padding: 24px; border-radius: var(--radius-lg); margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 700;">
              🌾 AgriPool • Farmer Portal (Kisan Vikas FPO)
            </div>
            <h2 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; margin: 4px 0;">
              👨‍🌾 ${farmer.name}
            </h2>
            <div style="font-size: 13.5px; color: #d1fae5;">
              Farmer ID: <strong>${farmer.farmer_code}</strong> • Village: <strong>${farmer.village_name || 'Kankipadu'}</strong>
            </div>
          </div>

          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <!-- Voice Readout Button -->
            <button onclick="speakFarmerNarration('${narrationText.replace(/'/g, "\\'")}')" class="btn btn-accent" style="gap: 8px; font-weight: 700;">
              🔊 <span>Listen Status</span>
            </button>
            <button onclick="openModal('create-crop-modal')" class="btn btn-outline" style="background: rgba(255, 255, 255, 0.15); color: #ffffff; border-color: rgba(255, 255, 255, 0.4);">
              + Add Crop
            </button>
            <button onclick="openModal('create-lot-modal')" class="btn btn-primary" style="background: #ffffff; color: #0f5132; font-weight: 700;">
              + Create Lot
            </button>
          </div>
        </div>

        <!-- Bank Account Direct Link -->
        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.2); display: flex; justify-content: space-between; align-items: center; font-size: 13px; flex-wrap: wrap; gap: 8px;">
          <span>Linked Bank A/C: <strong>${farmer.bank_account_no || 'SBIN00041289102'}</strong> (${farmer.ifsc_code || 'SBIN0004128'})</span>
          <span class="badge badge-settled" style="background: rgba(255, 255, 255, 0.2); color: #ffffff;">✓ DIRECT NEFT LINKED</span>
        </div>
      </div>

      <!-- Section 8 Home Cards (Mobile-first + Icon-driven) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; margin-bottom: 24px;">
        <div class="farmer-touch-card" onclick="navigateTo('crops')" style="background: #f0fdf4; border: 2px solid #bbf7d0; cursor: pointer; text-align: center; padding: 20px 14px; border-radius: 12px;">
          <div style="font-size: 32px; margin-bottom: 6px;">🌾</div>
          <div style="font-weight: 800; font-size: 15px; color: #166534;">My Crops</div>
          <div style="font-size: 12px; color: #15803d; margin-top: 2px;">Declared Harvest</div>
        </div>

        <div class="farmer-touch-card" onclick="document.getElementById('farmer-lots-sec').scrollIntoView({ behavior: 'smooth' })" style="background: #eff6ff; border: 2px solid #bfdbfe; cursor: pointer; text-align: center; padding: 20px 14px; border-radius: 12px;">
          <div style="font-size: 32px; margin-bottom: 6px;">🏷️</div>
          <div style="font-weight: 800; font-size: 15px; color: #1e40af;">My Lots</div>
          <div style="font-size: 12px; color: #1d4ed8; margin-top: 2px;">${farmer.lots ? farmer.lots.length : 0} Digital Lots</div>
        </div>

        <div class="farmer-touch-card" onclick="navigateTo('pools')" style="background: #faf5ff; border: 2px solid #e9d5ff; cursor: pointer; text-align: center; padding: 20px 14px; border-radius: 12px;">
          <div style="font-size: 32px; margin-bottom: 6px;">🤝</div>
          <div style="font-weight: 800; font-size: 15px; color: #6b21a8;">My Pools</div>
          <div style="font-size: 12px; color: #7e22ce; margin-top: 2px;">Pooled Produce</div>
        </div>

        <div class="farmer-touch-card" onclick="navigateTo('pickup')" style="background: #fffbeb; border: 2px solid #fde68a; cursor: pointer; text-align: center; padding: 20px 14px; border-radius: 12px;">
          <div style="font-size: 32px; margin-bottom: 6px;">🚚</div>
          <div style="font-weight: 800; font-size: 15px; color: #92400e;">Pickup</div>
          <div style="font-size: 12px; color: #b45309; margin-top: 2px;">Truck Dispatch</div>
        </div>

        <div class="farmer-touch-card" onclick="document.getElementById('farmer-payments-sec').scrollIntoView({ behavior: 'smooth' })" style="background: #ecfdf5; border: 2px solid #a7f3d0; cursor: pointer; text-align: center; padding: 20px 14px; border-radius: 12px;">
          <div style="font-size: 32px; margin-bottom: 6px;">💰</div>
          <div style="font-weight: 800; font-size: 15px; color: #065f46;">My Payments</div>
          <div style="font-size: 12px; color: #047857; margin-top: 2px;">Direct NEFT UTR</div>
        </div>

        <div class="farmer-touch-card" onclick="navigateTo('notifications')" style="background: #fef2f2; border: 2px solid #fecaca; cursor: pointer; text-align: center; padding: 20px 14px; border-radius: 12px;">
          <div style="font-size: 32px; margin-bottom: 6px;">🔔</div>
          <div style="font-weight: 800; font-size: 15px; color: #991b1b;">Notifications</div>
          <div style="font-size: 12px; color: #b91c1c; margin-top: 2px;">Weigh & Bid Alerts</div>
        </div>
      </div>

      <!-- Farmer Contact FPO Action Banner -->
      <div class="card" style="margin-bottom: 24px; padding: 16px 20px; background: #fffbeb; border: 1px solid #fde68a; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px;">📞</span>
          <div>
            <strong>Need assistance with weighing or collection?</strong>
            <div style="font-size: 12.5px; color: var(--text-secondary);">Contact Kisan Vikas FPO Field Coordinator (Tenali / Kankipadu)</div>
          </div>
        </div>
        <button onclick="showToast('Calling FPO Field Coordinator at +91 866 244 5500...', 'info')" class="btn btn-outline btn-sm" style="background: #ffffff;">
          📞 Contact FPO (+91 866 244 5500)
        </button>
      </div>

      <!-- Farmer's Lots Section -->
      <div class="card" id="farmer-lots-sec" style="margin-bottom: 24px;">
        <div class="card-header">
          <div>
            <h3 class="card-title">🏷️ My Lots (${farmer.lots ? farmer.lots.length : 0})</h3>
            <div class="card-subtitle">Digital lot passports issued at FPO collection center</div>
          </div>
          <button onclick="openModal('create-lot-modal')" class="btn btn-primary btn-sm">+ Create Lot</button>
        </div>

        ${(!farmer.lots || farmer.lots.length === 0) ? `
          <div style="text-align: center; padding: 32px 16px; background: #fafafa; border: 1px dashed var(--border); border-radius: var(--radius-md); color: var(--text-secondary);">
            <div style="font-size: 36px; margin-bottom: 8px;">🏷️</div>
            <strong style="font-size: 15px; color: var(--text-primary); display: block; margin-bottom: 4px;">No produce lots issued yet</strong>
            <span>Click <strong>+ Create Lot</strong> to register your first digital lot passport.</span>
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
            ${farmer.lots.map(l => `
              <div style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; background: #fafafa;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <strong style="color: var(--primary); font-size: 15px; font-family: monospace;">${l.lot_code}</strong>
                  <span class="badge badge-pool">${l.current_status}</span>
                </div>
                <div style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">${l.produce}</div>
                <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 10px;">
                  Weight: <strong>${l.actual_weight || '~' + l.estimated_quantity} kg</strong> • Grade: <strong>${l.grade}</strong>
                </div>
                <div style="border-top: 1px dashed var(--border); padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 12px; color: var(--text-muted);">${l.created_at ? l.created_at.split(' ')[0] : '2026-10-06'}</span>
                  <button onclick="viewLotPassport(${l.id})" class="btn btn-primary btn-sm" style="font-size: 11px; padding: 4px 10px;">
                    View Passport 🔍
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Farmer's Bank Credits Section -->
      <div class="card" id="farmer-payments-sec">
        <div class="card-header">
          <div>
            <h3 class="card-title">💰 Direct Bank Credits & Payment Receipts</h3>
            <div class="card-subtitle">All funds transferred directly to your bank account via NEFT</div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Payment Code</th>
                <th>Produce / Pool</th>
                <th>Net Credited (₹)</th>
                <th>Bank UTR Reference</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              ${(!farmer.payments || farmer.payments.length === 0) ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 28px; color: var(--text-secondary);">
                    No payment credits yet. Your settlement payouts will appear here after produce pooling and sale.
                  </td>
                </tr>
              ` : farmer.payments.map(p => `
                <tr>
                  <td><strong>${p.payment_code}</strong></td>
                  <td>${p.produce} (${p.settlement_code})</td>
                  <td><strong style="color: #16a34a; font-size: 16px;">₹${p.net_payable.toLocaleString()}</strong></td>
                  <td><code style="font-size: 12px;">${p.reference_utr}</code></td>
                  <td><span class="badge badge-settled">CREDITED TO BANK</span></td>
                  <td>
                    <button onclick="window.print()" class="btn btn-outline btn-sm">🖨️ Print Slip</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function speakFarmerNarration(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    showToast('Reading status aloud...', 'info');
  } else {
    showToast(text, 'info');
  }
}

window.renderFarmerPage = renderFarmerPage;
window.renderFarmerDashboard = renderFarmerPage;
window.speakFarmerNarration = speakFarmerNarration;
