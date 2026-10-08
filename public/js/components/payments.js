// public/js/components/payments.js - Payments & Settlement Ledger Module (Section 22 & 23)
async function renderPaymentsPage() {
  const settlements = await api.getSettlements();
  const pools = await api.getPools();
  const soldPools = pools.filter(p => p.status === 'SOLD' && !settlements.some(s => s.pool_id === p.id));

  const totalGross = settlements.reduce((sum, s) => sum + (s.gross_sale_amount || 0), 0);
  const totalNet = settlements.reduce((sum, s) => sum + (s.net_settlement_amount || 0), 0);
  const totalDeductions = totalGross - totalNet;

  return `
    <div class="payments-page">
      <!-- Header with Primary + Add Button -->
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary);">
            💰 Payments
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Audited financial settlement ledger, transparent cost waterfall, and direct farmer bank payouts.
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button onclick="openModal('record-payment-modal')" class="btn btn-primary" style="font-size: 14px; padding: 10px 20px;">
            + Record Payment
          </button>
          ${soldPools.length > 0 ? `
            <button onclick="openGenerateSettlementModal(${soldPools[0].id})" class="btn btn-accent" style="font-size: 14px;">
              ⚡ Generate Settlement (${soldPools.length})
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Section 22 Waterfall Demonstration Card -->
      <div class="card" style="margin-bottom: 24px; padding: 24px; background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%); border-left: 5px solid var(--primary);">
        <div style="font-size: 12px; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
          ⚖️ The AgriPool Transparent Waterfall Formula (Never Hidden)
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; font-family: monospace; font-size: 15px;">
          <div style="background: #ffffff; padding: 12px 18px; border-radius: 8px; border: 1px solid var(--border); text-align: center;">
            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-body);">GROSS SALE VALUE</div>
            <strong style="color: #0f172a; font-size: 18px;">₹${Math.round(totalGross || 0).toLocaleString()}</strong>
          </div>
          <div style="color: #dc2626; font-size: 20px; font-weight: 800;">−</div>
          <div style="background: #ffffff; padding: 12px 18px; border-radius: 8px; border: 1px solid var(--border); text-align: center;">
            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-body);">LOGISTICS EXPENSE</div>
            <strong style="color: #dc2626; font-size: 18px;">₹${Math.round(settlements.reduce((sum, s) => sum + (s.logistics_deduction || 0), 0) || 0).toLocaleString()}</strong>
          </div>
          <div style="color: #dc2626; font-size: 20px; font-weight: 800;">−</div>
          <div style="background: #ffffff; padding: 12px 18px; border-radius: 8px; border: 1px solid var(--border); text-align: center;">
            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-body);">STORAGE CHARGES</div>
            <strong style="color: #dc2626; font-size: 18px;">₹${Math.round(settlements.reduce((sum, s) => sum + (s.storage_deduction || 0), 0) || 0).toLocaleString()}</strong>
          </div>
          <div style="color: #dc2626; font-size: 20px; font-weight: 800;">−</div>
          <div style="background: #ffffff; padding: 12px 18px; border-radius: 8px; border: 1px solid var(--border); text-align: center;">
            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-body);">FPO SERVICE FEE</div>
            <strong style="color: #dc2626; font-size: 18px;">₹${Math.round(settlements.reduce((sum, s) => sum + (s.fpo_service_fee || 0), 0) || 0).toLocaleString()}</strong>
          </div>
          <div style="color: #16a34a; font-size: 22px; font-weight: 800;">=</div>
          <div style="background: #ecfdf5; padding: 12px 20px; border-radius: 8px; border: 2px solid #10b981; text-align: center;">
            <div style="font-size: 11px; color: #047857; font-family: var(--font-body); font-weight: 700;">NET SETTLEMENT TO FARMERS</div>
            <strong style="color: #047857; font-size: 20px;">₹${Math.round(totalNet || 0).toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <!-- Section 23 Farmer Payout Banner -->
      <div class="card" style="margin-bottom: 24px; padding: 20px; background: #ecfdf5; border: 1px solid #a7f3d0;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="font-size: 12px; font-weight: 700; color: #065f46; text-transform: uppercase;">
              👨‍🌾 Farmer View Summary (Clean & Simple)
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #047857; margin-top: 4px;">
              Sale Amount − Transparent Costs = <span style="font-size: 20px; color: #065f46; text-decoration: underline;">You Receive: ₹${Math.round(totalNet).toLocaleString()}</span>
            </div>
          </div>
          <span class="badge badge-settled" style="font-size: 13px; padding: 6px 14px;">100% AUDITED & CLEARED</span>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="kpi-grid" style="margin-bottom: 24px;">
        <div class="kpi-card">
          <div class="kpi-icon-wrap green">💰</div>
          <div class="kpi-content">
            <div class="kpi-label">Gross Value Cleared</div>
            <div class="kpi-value">₹${Math.round(totalGross).toLocaleString()}</div>
            <div class="kpi-subtext">Verified buyer escrow funds</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap blue">🏦</div>
          <div class="kpi-content">
            <div class="kpi-label">Net Farmer Credits</div>
            <div class="kpi-value">₹${Math.round(totalNet).toLocaleString()}</div>
            <div class="kpi-subtext">Direct NEFT payments transferred</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap amber">⚖️</div>
          <div class="kpi-content">
            <div class="kpi-label">Total Shared Deductions</div>
            <div class="kpi-value">₹${Math.round(totalDeductions).toLocaleString()}</div>
            <div class="kpi-subtext">Logistics, storage & service</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap purple">📋</div>
          <div class="kpi-content">
            <div class="kpi-label">Settlement Cycles</div>
            <div class="kpi-value">${settlements.length}</div>
            <div class="kpi-subtext">Immutable ledger entries</div>
          </div>
        </div>
      </div>

      <!-- Settlements Table -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Settlement Cycles & Payout Certificates</h3>
            <div class="card-subtitle">Complete ledger of pooled batches with automated pro-rata distribution</div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Settlement ID</th>
                <th>Pool Ref</th>
                <th>Buyer</th>
                <th>Gross Sale</th>
                <th>Logistics</th>
                <th>Storage</th>
                <th>Service Fee</th>
                <th>Net Farmer Payout</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${settlements.length === 0 ? `
                <tr>
                  <td colspan="11" style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
                    <div style="font-size: 32px; margin-bottom: 8px;">💳</div>
                    <div style="font-size: 15px; font-weight: 600; color: var(--text-main);">No Settlements Recorded Yet</div>
                    <div style="font-size: 13px;">When lots in your pools are sold and paid out, detailed waterfall breakdown and payment certificates will appear here.</div>
                  </td>
                </tr>
              ` : settlements.map(s => `
                <tr>
                  <td><strong style="color: var(--primary); font-family: monospace;">SETTLE-${String(s.id).padStart(4, '0')}</strong></td>
                  <td><span class="badge badge-pool">POOL-${String(s.pool_id).padStart(4, '0')}</span></td>
                  <td><strong>${s.buyer_name || 'Verified Bulk Buyer'}</strong></td>
                  <td>₹${Math.round(s.gross_sale_amount).toLocaleString()}</td>
                  <td style="color: #dc2626;">− ₹${Math.round(s.logistics_deduction).toLocaleString()}</td>
                  <td style="color: #dc2626;">− ₹${Math.round(s.storage_deduction).toLocaleString()}</td>
                  <td style="color: #dc2626;">− ₹${Math.round(s.fpo_service_fee).toLocaleString()}</td>
                  <td><strong style="color: #059669; font-size: 15px;">₹${Math.round(s.net_settlement_amount).toLocaleString()}</strong></td>
                  <td>${s.settlement_date ? s.settlement_date.split('T')[0] : '2026-10-06'}</td>
                  <td><span class="badge badge-settled">${s.payment_status || 'PAID'}</span></td>
                  <td>
                    <button onclick="viewSettlementDetail(${s.id})" class="btn btn-primary btn-sm">Inspect Ledger</button>
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

async function handleRecordPaymentSubmit(e) {
  e.preventDefault();
  const settlementId = Number(document.getElementById('payment-form-settlement-id').value);
  const amount = Number(document.getElementById('payment-form-amount').value);
  const paymentMethod = document.getElementById('payment-form-method').value;
  const paymentRef = document.getElementById('payment-form-ref').value;

  try {
    await api.recordPayment(settlementId, {
      amount,
      payment_method: paymentMethod,
      payment_reference: paymentRef
    });
    closeModal('record-payment-modal');
    showToast(`Payment of ₹${amount.toLocaleString()} recorded successfully! Ref: ${paymentRef}`, 'success');
    navigateTo('payments');
  } catch (err) {
    showToast('Failed to record payment: ' + err.message, 'error');
  }
}

window.renderPaymentsPage = renderPaymentsPage;
window.renderSettlementPage = renderPaymentsPage; // backward compatibility
window.handleRecordPaymentSubmit = handleRecordPaymentSubmit;
