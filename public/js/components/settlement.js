// public/js/components/settlement.js - Transparent Settlement Ledger
async function renderSettlementPage() {
  const settlements = await api.getSettlements();
  const pools = await api.getPools();
  const soldPools = pools.filter(p => p.status === 'SOLD' && !settlements.some(s => s.pool_id === p.id));

  return `
    <div class="settlement-page">
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 800;">
            🧾 Transparent Settlement Ledger & Farmer Payouts
          </h2>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Every rupee explained. Complete waterfall deduction breakdown and pro-rata farmer bank credit tracking.
          </p>
        </div>
        <div>
          ${soldPools.length > 0 ? `
            <button onclick="openGenerateSettlementModal(${soldPools[0].id})" class="btn btn-primary">
              ⚡ Generate Settlement (${soldPools.length} Pools Ready)
            </button>
          ` : `
            <button onclick="runAcceptanceDemoPrompt()" class="btn btn-accent btn-sm">
              ✨ Simulate Live Settlement Cycle
            </button>
          `}
        </div>
      </div>

      <!-- Settlement Overview Metrics -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon-wrap green">💰</div>
          <div class="kpi-content">
            <div class="kpi-label">Gross Value Cleared</div>
            <div class="kpi-value">₹${Math.round(settlements.reduce((sum, s) => sum + s.gross_sale_amount, 0)).toLocaleString()}</div>
            <div class="kpi-subtext">Verified buyer escrow funds</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap blue">🏦</div>
          <div class="kpi-content">
            <div class="kpi-label">Net Farmer Credits</div>
            <div class="kpi-value">₹${Math.round(settlements.reduce((sum, s) => sum + s.net_settlement_amount, 0)).toLocaleString()}</div>
            <div class="kpi-subtext">Direct NEFT payments</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap purple">⚖️</div>
          <div class="kpi-content">
            <div class="kpi-label">Settlement Cycles</div>
            <div class="kpi-value">${settlements.length}</div>
            <div class="kpi-subtext">Fully audited transactions</div>
          </div>
        </div>
      </div>

      <!-- Settlements List -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">📜 Settlement Cycles</h3>
            <div class="card-subtitle">Click any cycle to inspect the full waterfall and farmer payout schedule</div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Settlement ID</th>
                <th>Pool / Commodity</th>
                <th>Buyer</th>
                <th>Gross Sale</th>
                <th>Total Deductions</th>
                <th>Net Settlement</th>
                <th>Farmers Paid</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${settlements.map(s => {
                const totalDeductions = (s.logistics_cost + s.storage_cost + s.platform_fee + s.mandi_cess).toFixed(2);
                return `
                  <tr>
                    <td><strong>${s.settlement_code}</strong></td>
                    <td>
                      <div style="color: var(--primary); font-weight: 700;">${s.pool_code}</div>
                      <div style="font-size: 11px; color: var(--text-secondary);">${s.produce} (${s.total_weight} kg)</div>
                    </td>
                    <td><strong>${s.buyer_name}</strong></td>
                    <td><strong>₹${s.gross_sale_amount.toLocaleString()}</strong></td>
                    <td style="color: #b91c1c;">− ₹${parseFloat(totalDeductions).toLocaleString()}</td>
                    <td><strong style="color: #16a34a; font-size: 14px;">₹${s.net_settlement_amount.toLocaleString()}</strong></td>
                    <td>
                      <span class="badge ${s.paid_farmer_count === s.total_farmer_count ? 'badge-settled' : 'badge-weighed'}">
                        ${s.paid_farmer_count} / ${s.total_farmer_count} Paid
                      </span>
                    </td>
                    <td><span class="badge badge-${s.status.toLowerCase()}">${s.status}</span></td>
                    <td>
                      <button onclick="inspectSettlementWaterfall(${s.id})" class="btn btn-primary btn-sm" style="padding: 4px 10px; font-size: 12px;">
                        Inspect Waterfall 📊
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function inspectSettlementWaterfall(settlementId) {
  try {
    const s = await api.getSettlementById(settlementId);
    if (!s) return;

    const modalBody = document.getElementById('settlement-detail-content');
    const totalDeductions = (s.logistics_cost + s.storage_cost + s.platform_fee + s.mandi_cess).toFixed(2);

    modalBody.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h3 style="font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--primary);">${s.settlement_code}</h3>
            <div style="font-size: 12px; color: var(--text-secondary);">Pool: ${s.pool_code} • Produce: ${s.produce} • Buyer: ${s.buyer_name}</div>
          </div>
          <span class="badge badge-${s.status.toLowerCase()}">${s.status}</span>
        </div>

        <!-- Waterfall Explanation Box -->
        <div class="waterfall-box" style="margin-bottom: 24px;">
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px;">
            Audited Deduction Waterfall (All Figures in INR)
          </div>
          <div class="waterfall-row">
            <span><strong>Gross Sale Value (${s.buyer_name})</strong></span>
            <span style="font-weight: 700; color: #16a34a;">₹${s.gross_sale_amount.toLocaleString()}</span>
          </div>
          <div class="waterfall-row deduction">
            <span>− Logistics & Shared Route Freight</span>
            <span>− ₹${s.logistics_cost.toLocaleString()}</span>
          </div>
          <div class="waterfall-row deduction">
            <span>− Cold Storage / Warehousing Charges</span>
            <span>− ₹${s.storage_cost.toLocaleString()}</span>
          </div>
          <div class="waterfall-row deduction">
            <span>− FPO Platform & Quality Assaying Fee (1.5%)</span>
            <span>− ₹${s.platform_fee.toLocaleString()}</span>
          </div>
          <div class="waterfall-row deduction">
            <span>− Mandi Cess & Handling</span>
            <span>− ₹${s.mandi_cess.toLocaleString()}</span>
          </div>
          <div class="waterfall-row total">
            <span>Net Disbursable Pool Amount</span>
            <span>₹${s.net_settlement_amount.toLocaleString()}</span>
          </div>
        </div>

        <!-- Individual Farmer Payments Schedule -->
        <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 10px;">
          Farmer Pro-Rata Share Breakdown & Bank Credit Status (${s.payments.length} Farmers)
        </h4>

        <div class="table-responsive" style="max-height: 280px; overflow-y: auto; margin-bottom: 20px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Farmer Name</th>
                <th>Bank A/C & IFSC</th>
                <th>Gross Share</th>
                <th>Deductions</th>
                <th>Net Payable</th>
                <th>Payment Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${s.payments.map(p => `
                <tr>
                  <td>
                    <div><strong>${p.farmer_name}</strong></div>
                    <div style="font-size: 11px; color: var(--text-secondary);">${p.farmer_code} • ${p.village_name || 'Kankipadu'}</div>
                  </td>
                  <td>
                    <code style="font-size: 11.5px;">${p.bank_account_no}</code>
                    <div style="font-size: 10px; color: var(--text-muted);">${p.ifsc_code}</div>
                  </td>
                  <td>₹${p.gross_share.toLocaleString()}</td>
                  <td style="color: #b91c1c;">− ₹${p.deductions.toLocaleString()}</td>
                  <td><strong style="color: #16a34a; font-size: 14px;">₹${p.net_payable.toLocaleString()}</strong></td>
                  <td>
                    ${p.status === 'PAID' ? `
                      <span class="badge badge-settled">PAID (UTR: ${p.reference_utr})</span>
                    ` : `
                      <span class="badge badge-weighed">PENDING NEFT</span>
                    `}
                  </td>
                  <td>
                    ${p.status !== 'PAID' ? `
                      <button onclick="handleDisburseFarmerPayment(${p.id}, ${s.id})" class="btn btn-accent btn-sm" style="padding: 4px 8px; font-size: 11px;">
                        Pay Direct ⚡
                      </button>
                    ` : `
                      <button onclick="window.print()" class="btn btn-outline btn-sm" style="padding: 4px 8px; font-size: 11px;">
                        Slip 🖨️
                      </button>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 14px;">
          <span style="font-size: 12px; color: var(--text-secondary);">Direct NEFT payment protocol compliant with RBI settlement rules</span>
          <button onclick="closeModal('settlement-detail-modal')" class="btn btn-primary btn-sm">Close</button>
        </div>
      </div>
    `;

    openModal('settlement-detail-modal');
  } catch (err) {
    showToast('Failed to load settlement details: ' + err.message, 'error');
  }
}

async function handleDisburseFarmerPayment(paymentId, settlementId) {
  try {
    const paid = await api.recordPayment(paymentId, {
      referenceUtr: `HDFC${new Date().toISOString().slice(0, 10).replace(/-/g, '')}00${paymentId}`,
      paymentMode: 'NEFT_DIRECT'
    });
    showToast(`Payment of ₹${paid.net_payable} credited directly to ${paid.farmer_name} bank account. UTR: ${paid.reference_utr}`, 'success');
    inspectSettlementWaterfall(settlementId);
  } catch (err) {
    showToast('Payment disbursement failed: ' + err.message, 'error');
  }
}

function openGenerateSettlementModal(poolId) {
  const modalContent = document.getElementById('generate-settlement-content');
  modalContent.innerHTML = `
    <form onsubmit="handleGenerateSettlementSubmit(event, ${poolId})">
      <div style="background: #f8fafc; padding: 12px; border-radius: var(--radius-md); margin-bottom: 16px;">
        <div>Generating Settlement for <strong>Pool #${poolId}</strong></div>
        <div style="font-size: 12px; color: var(--text-secondary);">Enter approved shared costs to automatically compute individual farmer credits</div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Consolidated Logistics Cost (₹)</label>
          <input type="number" class="form-control" id="gen-logistics" value="5000" required>
        </div>
        <div class="form-group">
          <label class="form-label">Storage Charges (₹)</label>
          <input type="number" class="form-control" id="gen-storage" value="2000" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Platform & Assaying Fee (%)</label>
          <input type="number" step="0.1" class="form-control" id="gen-platform-fee" value="1.5" required>
        </div>
        <div class="form-group">
          <label class="form-label">Mandi Cess / Handling (₹)</label>
          <input type="number" class="form-control" id="gen-mandi" value="1000" required>
        </div>
      </div>

      <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
        <button type="button" onclick="closeModal('generate-settlement-modal')" class="btn btn-outline btn-sm">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm">Generate Settlement & Credit Farmers</button>
      </div>
    </form>
  `;
  openModal('generate-settlement-modal');
}

async function handleGenerateSettlementSubmit(e, poolId) {
  e.preventDefault();
  const logisticsCost = parseFloat(document.getElementById('gen-logistics').value);
  const storageCost = parseFloat(document.getElementById('gen-storage').value);
  const platformFeePct = parseFloat(document.getElementById('gen-platform-fee').value);
  const mandiCess = parseFloat(document.getElementById('gen-mandi').value);

  try {
    const settlement = await api.generateSettlement({
      poolId,
      logisticsCost,
      storageCost,
      platformFeePct,
      mandiCess
    });
    closeModal('generate-settlement-modal');
    showToast(`Settlement ${settlement.settlement_code} generated for ₹${settlement.net_settlement_amount}!`, 'success');
    navigateTo('settlement');
    inspectSettlementWaterfall(settlement.id);
  } catch (err) {
    showToast('Failed to generate settlement: ' + err.message, 'error');
  }
}
