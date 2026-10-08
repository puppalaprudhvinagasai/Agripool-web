// public/js/components/finance.js - Partner-Driven Liquidity & Working Capital Advances
async function renderFinancePage() {
  const advances = await api.getAdvances();

  return `
    <div class="finance-page">
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 800;">
            💳 Partner-Driven Working Capital & Warehouse Receipt Liquidity
          </h2>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            AgriPool does not lend directly. We provide workflow integration for authorized institutional NBFC/MFI partners (e.g. Samunnati, NABARD Linkage).
          </p>
        </div>
      </div>

      <!-- Partner Notice Box -->
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 24px; display: flex; align-items: center; gap: 14px;">
        <div style="font-size: 28px;">ℹ️</div>
        <div style="font-size: 13.5px; color: #92400e;">
          <strong>Asset-Light Infrastructure:</strong> Advances are collateralized against digitally locked pooled lots and verified warehouse receipts. Loans are disbursed and settled by licensed financial partners.
        </div>
      </div>

      <!-- Advances List -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">📜 Active Working Capital Advances</h3>
            <div class="card-subtitle">Collateralized farmer liquidity requests</div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Advance Code</th>
                <th>Farmer Name</th>
                <th>Linked Pool</th>
                <th>Financial Partner</th>
                <th>Requested</th>
                <th>Approved</th>
                <th>Interest Rate</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${advances.map(a => `
                <tr>
                  <td><strong>${a.advance_code}</strong></td>
                  <td>
                    <div><strong>${a.farmer_name}</strong></div>
                    <div style="font-size: 11px; color: var(--text-secondary);">${a.farmer_code}</div>
                  </td>
                  <td><span style="color: #7c3aed; font-weight: 600;">${a.pool_code}</span> (${a.produce})</td>
                  <td><strong>${a.lender_partner}</strong></td>
                  <td>₹${a.requested_amount.toLocaleString()}</td>
                  <td><strong>₹${(a.approved_amount || a.requested_amount).toLocaleString()}</strong></td>
                  <td>${a.interest_rate_pct}% p.a.</td>
                  <td><span class="badge badge-${a.status.toLowerCase()}">${a.status}</span></td>
                  <td>
                    <button onclick="openUpdateAdvanceModal(${a.id}, '${a.status}')" class="btn btn-outline btn-sm">
                      Update Status ⚙️
                    </button>
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

function openUpdateAdvanceModal(advanceId, currentStatus) {
  const modalContent = document.getElementById('advance-update-content');
  modalContent.innerHTML = `
    <form onsubmit="handleUpdateAdvanceSubmit(event, ${advanceId})">
      <div class="form-group">
        <label class="form-label">Update Partner Liquidity Status</label>
        <select class="form-control" id="advance-modal-status" required>
          <option value="REQUESTED" ${currentStatus === 'REQUESTED' ? 'selected' : ''}>REQUESTED</option>
          <option value="UNDER_REVIEW" ${currentStatus === 'UNDER_REVIEW' ? 'selected' : ''}>UNDER_REVIEW</option>
          <option value="APPROVED" ${currentStatus === 'APPROVED' ? 'selected' : ''}>APPROVED</option>
          <option value="DISBURSED" ${currentStatus === 'DISBURSED' ? 'selected' : ''}>DISBURSED</option>
          <option value="SETTLED" ${currentStatus === 'SETTLED' ? 'selected' : ''}>SETTLED</option>
          <option value="REJECTED" ${currentStatus === 'REJECTED' ? 'selected' : ''}>REJECTED</option>
        </select>
      </div>

      <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
        <button type="button" onclick="closeModal('advance-update-modal')" class="btn btn-outline btn-sm">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm">Update Liquidity Status</button>
      </div>
    </form>
  `;
  openModal('advance-update-modal');
}

async function handleUpdateAdvanceSubmit(e, advanceId) {
  e.preventDefault();
  const status = document.getElementById('advance-modal-status').value;
  try {
    await api.updateAdvanceStatus(advanceId, status);
    closeModal('advance-update-modal');
    showToast(`Advance updated to ${status}`, 'success');
    navigateTo('finance');
  } catch (err) {
    showToast('Failed to update advance: ' + err.message, 'error');
  }
}
