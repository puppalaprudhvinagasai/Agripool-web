// public/js/components/field_dashboard.js - SHG & Field Operator Operational Portal (Requirement #13)
async function renderFieldDashboard() {
  const farmers = await api.getFarmers({ limit: 10 });
  const lots = await api.getLots({ limit: 10 });
  const pickups = await api.getPickups();

  const unweighedLots = lots.filter(l => !l.actual_weight || l.current_status === 'CREATED');
  const unverifiedLots = lots.filter(l => l.current_status === 'WEIGHED');

  return `
    <div class="field-operator-dashboard">
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: #ffffff; padding: 24px 28px; border-radius: var(--radius-lg); margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #93c5fd; font-weight: 700;">
            Village Operational Desk • Krishna / Guntur Field Cluster
          </div>
          <h1 style="font-family: var(--font-display); font-size: 28px; font-weight: 800; margin: 4px 0;">
            👩‍🌾 Field Operator & SHG Lead Portal
          </h1>
          <p style="font-size: 14px; color: #dbeafe;">
            Manage assisted farmer enrollment, calibrated electronic weighing, quality assays, and pickup routing.
          </p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button onclick="openModal('onboard-farmer-modal')" class="btn btn-accent btn-sm">
            + Onboard Farmer
          </button>
          <button onclick="openModal('create-lot-modal')" class="btn btn-outline btn-sm" style="color: #ffffff; border-color: rgba(255, 255, 255, 0.4);">
            + Issue Lot Passport
          </button>
          <button onclick="openModal('schedule-pickup-modal')" class="btn btn-primary btn-sm" style="background: #ffffff; color: #1e3a8a; font-weight: 700;">
            🚚 Schedule Pickup
          </button>
        </div>
      </div>

      <!-- Operational Action Counters -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin-bottom: 28px;">
        <div class="card" style="margin-bottom: 0; padding: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Assisted Farmers Enrolled</div>
          <div style="font-size: 28px; font-weight: 800; color: #1e3a8a; margin-top: 4px;">${farmers.length} Active</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">In your assigned cluster</div>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Pending Digital Weighing</div>
          <div style="font-size: 28px; font-weight: 800; color: #d97706; margin-top: 4px;">${unweighedLots.length} Lots</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Calibrated electronic scale needed</div>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Pending Quality Assay</div>
          <div style="font-size: 28px; font-weight: 800; color: #7c3aed; margin-top: 4px;">${unverifiedLots.length} Lots</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Moisture assay inspection</div>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Scheduled Pickups</div>
          <div style="font-size: 28px; font-weight: 800; color: #16a34a; margin-top: 4px;">${pickups.length} Dispatches</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Consolidated shared routes</div>
        </div>
      </div>

      <!-- Quick Action Operations -->
      <div class="card" style="padding: 24px; margin-bottom: 28px;">
        <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 16px;">⚡ Field Operations Shortcuts</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
          <button onclick="navigateTo('farmers')" class="btn btn-outline" style="padding: 14px; text-align: left; display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">👨‍🌾</span>
            <div>
              <div style="font-weight: 700;">Farmer Enrollment</div>
              <div style="font-size: 12px; color: var(--text-muted);">Onboard & survey land</div>
            </div>
          </button>
          <button onclick="navigateTo('lots')" class="btn btn-outline" style="padding: 14px; text-align: left; display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">🏷️</span>
            <div>
              <div style="font-weight: 700;">Weigh & Verify Lots</div>
              <div style="font-size: 12px; color: var(--text-muted);">Calibrated scale slips</div>
            </div>
          </button>
          <button onclick="navigateTo('pools')" class="btn btn-outline" style="padding: 14px; text-align: left; display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">🤝</span>
            <div>
              <div style="font-weight: 700;">Produce Pooling</div>
              <div style="font-size: 12px; color: var(--text-muted);">Batch micro-lots</div>
            </div>
          </button>
          <button onclick="navigateTo('pickup')" class="btn btn-outline" style="padding: 14px; text-align: left; display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">🚚</span>
            <div>
              <div style="font-weight: 700;">Logistics Dispatch</div>
              <div style="font-size: 12px; color: var(--text-muted);">Truck pickup status</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Actionable Recent Lots Table -->
      <div class="card" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 18px; font-weight: 800;">🏷️ Village Produce Lots Requiring Immediate Action</h3>
          <button onclick="navigateTo('lots')" class="btn btn-outline btn-xs">View All Lots →</button>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Lot Code</th>
                <th>Farmer Name</th>
                <th>Produce</th>
                <th>Weight (Est / Act)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${lots.slice(0, 6).map(l => `
                <tr>
                  <td><code>${l.lot_code}</code></td>
                  <td><strong>${l.farmer_name}</strong></td>
                  <td>${l.produce}</td>
                  <td>${l.actual_weight ? l.actual_weight + ' kg (Net)' : l.estimated_quantity + ' kg (Est)'}</td>
                  <td><span class="badge ${l.current_status === 'SETTLED' ? 'badge-settled' : 'badge-weighed'}">${l.current_status}</span></td>
                  <td>
                    ${!l.actual_weight ? `
                      <button onclick="openWeighModal(${l.id})" class="btn btn-sm btn-primary">⚖️ Weigh Now</button>
                    ` : (l.current_status === 'WEIGHED' ? `
                      <button onclick="openVerifyModal(${l.id})" class="btn btn-sm btn-accent">🔬 Assay Quality</button>
                    ` : `
                      <button onclick="navigateTo('lots')" class="btn btn-sm btn-outline">View Passport</button>
                    `)}
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

window.renderFieldDashboard = renderFieldDashboard;
