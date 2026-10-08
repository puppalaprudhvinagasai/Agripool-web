// public/js/components/acceptance.js - 1-Click Acceptance Test & Scenario Runner
async function runAcceptanceDemoPrompt() {
  const modalContent = document.getElementById('acceptance-modal-content');
  modalContent.innerHTML = `
    <div>
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 36px; margin-bottom: 8px;">⚡</div>
        <h3 style="font-family: var(--font-display); font-size: 22px; font-weight: 800;">
          Execute Master Acceptance Scenario (Section 33)
        </h3>
        <p style="font-size: 13.5px; color: var(--text-secondary); max-width: 540px; margin: 4px auto 0;">
          This will execute the complete 14-step end-to-end lifecycle in real-time, verifying every relational constraint, calculation, and audit log.
        </p>
      </div>

      <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.6;">
        <ol style="padding-left: 20px; display: flex; flex-direction: column; gap: 4px;">
          <li>Create Farmer profile: <strong>Suresh Babu Varma</strong></li>
          <li>Issue 250 kg produce lot (Digital Lot ID Passport)</li>
          <li>Record calibrated electronic scale weight (250 kg Net)</li>
          <li>Assay quality verification (Grade A, 10.8% Moisture)</li>
          <li>Create 3 additional smallholder lots (220kg, 280kg, 250kg)</li>
          <li>Pool all 4 lots (Total: <strong>1,000 kg</strong>)</li>
          <li>Schedule logistics pickup request (Tata 407)</li>
          <li>Assign cold storage facility (Sri Krishna Cold Storage)</li>
          <li>Generate verified corporate purchase order (ITC Agri @ ₹225/kg)</li>
          <li>Confirm sale transaction (Gross: <strong>₹2,25,000.00</strong>)</li>
          <li>Apply waterfall deductions (Logistics, Storage, 1.5% Fee, Mandi Cess)</li>
          <li>Generate pro-rata farmer settlement ledger</li>
          <li>Disburse demo NEFT payment with audited UTR</li>
          <li>Cryptographically log all 14 actions to immutable audit trail</li>
        </ol>
      </div>

      <div id="acceptance-progress-indicator" style="display: none; margin-bottom: 18px; text-align: center;">
        <div style="display: inline-block; width: 24px; height: 24px; border: 3px solid #0f5132; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <div style="font-size: 13px; font-weight: 600; color: var(--primary); margin-top: 8px;">
          Executing transaction ledger & pro-rata calculations...
        </div>
      </div>

      <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
        <button type="button" onclick="closeModal('acceptance-modal')" class="btn btn-outline btn-sm">Cancel</button>
        <button type="button" id="start-acceptance-btn" onclick="executeAcceptanceTest()" class="btn btn-primary btn-sm">
          🚀 Run Complete Scenario Now
        </button>
      </div>
    </div>
  `;
  openModal('acceptance-modal');
}

async function executeAcceptanceTest() {
  const btn = document.getElementById('start-acceptance-btn');
  const progress = document.getElementById('acceptance-progress-indicator');
  if (btn) btn.disabled = true;
  if (progress) progress.style.display = 'block';

  try {
    const res = await api.runAcceptanceScenario();
    const summary = res.summary;

    const modalContent = document.getElementById('acceptance-modal-content');
    modalContent.innerHTML = `
      <div>
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 42px; margin-bottom: 8px;">🎉</div>
          <h3 style="font-family: var(--font-display); font-size: 22px; font-weight: 800; color: #16a34a;">
            Acceptance Scenario Passed Successfully!
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary);">
            All 14 lifecycle stages executed and validated in database with zero errors.
          </p>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 18px; margin-bottom: 20px;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #dcfce7; height: 28px;">
              <td><strong>Farmer Created:</strong></td>
              <td style="text-align: right;">${summary.farmerCreated}</td>
            </tr>
            <tr style="border-bottom: 1px solid #dcfce7; height: 28px;">
              <td><strong>Digital Lot Passport:</strong></td>
              <td style="text-align: right;"><code style="font-weight: 700;">${summary.lot1Code}</code> (${summary.lot1NetWeight} kg)</td>
            </tr>
            <tr style="border-bottom: 1px solid #dcfce7; height: 28px;">
              <td><strong>Total Lots Pooled:</strong></td>
              <td style="text-align: right;"><strong>${summary.totalLotsPooled} Lots</strong> into <strong>${summary.poolCode}</strong></td>
            </tr>
            <tr style="border-bottom: 1px solid #dcfce7; height: 28px;">
              <td><strong>Total Pooled Weight:</strong></td>
              <td style="text-align: right; font-weight: 700; color: var(--primary);">${summary.totalPooledQuantityKg} kg</td>
            </tr>
            <tr style="border-bottom: 1px solid #dcfce7; height: 28px;">
              <td><strong>Gross Sale (Corporate PO):</strong></td>
              <td style="text-align: right; font-weight: 700; color: #16a34a;">₹${summary.grossAmount.toLocaleString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #dcfce7; height: 28px;">
              <td><strong>Logistics + Storage + Fee:</strong></td>
              <td style="text-align: right; color: #b91c1c;">− ₹${(summary.logisticsCost + summary.storageCost + summary.platformFee).toLocaleString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #dcfce7; height: 28px;">
              <td><strong>Net Settlement Amount:</strong></td>
              <td style="text-align: right; font-weight: 800; font-size: 15px; color: #047857;">₹${summary.netSettlementAmount.toLocaleString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #dcfce7; height: 28px;">
              <td><strong>First Farmer Net Payout:</strong></td>
              <td style="text-align: right; font-weight: 700;">₹${summary.firstFarmerNetPayable.toLocaleString()}</td>
            </tr>
            <tr style="height: 28px;">
              <td><strong>Bank Payment Execution:</strong></td>
              <td style="text-align: right;"><span class="badge badge-settled">${summary.paymentStatus}</span></td>
            </tr>
          </table>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button onclick="closeModal('acceptance-modal'); navigateTo('settlement');" class="btn btn-outline btn-sm">
            View Settlement Ledger 🧾
          </button>
          <button onclick="closeModal('acceptance-modal'); navigateTo('audit');" class="btn btn-primary btn-sm">
            Inspect Audit Trail 🛡️
          </button>
        </div>
      </div>
    `;

    showToast('Acceptance test passed! All 14 steps executed cleanly.', 'success');
  } catch (err) {
    showToast('Acceptance test failed: ' + err.message, 'error');
    if (btn) btn.disabled = false;
    if (progress) progress.style.display = 'none';
  }
}
