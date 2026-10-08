// public/js/components/pilot.js - Phase 1 Pilot Dashboard Component
async function renderPilotDashboard() {
  const statsRes = await api.getStats();
  const kpis = statsRes.kpis;
  const milestones = statsRes.pilotMilestones;
  const recentLots = await api.getLots({ limit: 5 });
  const recentPools = await api.getPools();

  return `
    <div class="pilot-dashboard">
      <!-- Top Pilot Status Banner -->
      <div style="background: linear-gradient(135deg, #0F5132 0%, #1e4620 100%); color: #ffffff; padding: 22px 28px; border-radius: var(--radius-lg); margin-bottom: 26px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; box-shadow: var(--shadow-md);">
        <div>
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 700;">Phase 1 Pilot Execution • Month 0–3</div>
          <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 800; margin: 4px 0;">Kisan Vikas Farmers Producer Co. Ltd.</h2>
          <p style="font-size: 13.5px; color: #d1fae5;">Cluster: Kankipadu & Gudivada, Krishna & Guntur Districts, Andhra Pradesh</p>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button onclick="openModal('onboard-farmer-modal')" class="btn btn-accent btn-sm">
            ➕ Assisted Farmer Onboard
          </button>
          <button onclick="openModal('create-lot-modal')" class="btn btn-primary btn-sm" style="background: #ffffff; color: #0f5132; font-weight: 700;">
            🏷️ Create Produce Lot
          </button>
          <button onclick="navigateTo('pooling')" class="btn btn-outline btn-sm" style="color: #ffffff; border-color: rgba(255, 255, 255, 0.4);">
            ⚖️ Pooling Engine
          </button>
        </div>
      </div>

      <!-- KPI Cards Grid (8 Cards as requested in Prompt Section 4) -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon-wrap green">👨‍🌾</div>
          <div class="kpi-content">
            <div class="kpi-label">Farmers Onboarded</div>
            <div class="kpi-value">${kpis.farmersOnboarded}</div>
            <div class="kpi-subtext">Target: 50–100 Farmers (${Math.round((kpis.farmersOnboarded/100)*100)}% reached)</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap blue">🏷️</div>
          <div class="kpi-content">
            <div class="kpi-label">Active Lots</div>
            <div class="kpi-value">${kpis.activeLots}</div>
            <div class="kpi-subtext">${kpis.totalLots} total digital lot passports</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap amber">⚖️</div>
          <div class="kpi-content">
            <div class="kpi-label">Total Quantity</div>
            <div class="kpi-value">${kpis.totalQuantityQuintals} Qtl</div>
            <div class="kpi-subtext">${kpis.totalQuantityKg.toLocaleString()} kg aggregated</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap purple">📦</div>
          <div class="kpi-content">
            <div class="kpi-label">Active Pools</div>
            <div class="kpi-value">${kpis.activePools}</div>
            <div class="kpi-subtext">${kpis.totalPools} total clusters formed</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap amber">🚚</div>
          <div class="kpi-content">
            <div class="kpi-label">Pending Pickups</div>
            <div class="kpi-value">${kpis.pendingPickups}</div>
            <div class="kpi-subtext">Scheduled shared routes</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap rose">🏭</div>
          <div class="kpi-content">
            <div class="kpi-label">Storage Utilization</div>
            <div class="kpi-value">${kpis.storageUtilizationPct}%</div>
            <div class="kpi-subtext">${kpis.storageUsedMt} / ${kpis.storageTotalMt} MT utilized</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap blue">🏢</div>
          <div class="kpi-content">
            <div class="kpi-label">Buyer Orders</div>
            <div class="kpi-value">${kpis.buyerOrders}</div>
            <div class="kpi-subtext">Verified corporate contracts</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap green">💰</div>
          <div class="kpi-content">
            <div class="kpi-label">Settlement Volume</div>
            <div class="kpi-value">₹${Math.round(kpis.netSettledRs).toLocaleString()}</div>
            <div class="kpi-subtext">${kpis.completedSettlements} cycle completed, ${kpis.pendingSettlements} pending</div>
          </div>
        </div>
      </div>

      <!-- Pilot Target Progress Tracker (Prompt Section 4 Requirement) -->
      <div class="card" style="margin-bottom: 26px;">
        <div class="card-header">
          <div>
            <h3 class="card-title">🎯 Phase 1 Pilot Targets & Milestone Tracker</h3>
            <div class="card-subtitle">Validation metrics for local FPO trust and commercial operational proof</div>
          </div>
          <button onclick="runAcceptanceDemoPrompt()" class="btn btn-accent btn-sm">
            ⚡ 1-Click Validation Test
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          ${milestones.map(m => {
            const pct = Math.min(100, Math.round((m.current / m.target) * 100));
            const isDone = m.status === 'achieved';
            return `
              <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 13.5px; font-weight: 700;">${m.label}</span>
                  <span class="badge ${isDone ? 'badge-settled' : 'badge-weighed'}">${isDone ? 'COMPLETED' : `${pct}%`}</span>
                </div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
                  Current: <strong>${m.current}</strong> / Target: <strong>${m.target} ${m.unit}</strong>
                </div>
                <div style="height: 7px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                  <div style="width: ${pct}%; height: 100%; background: ${isDone ? '#16a34a' : 'var(--primary-light)'}; border-radius: 4px;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Quick Action Operations & Recent Aggregations -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
        <!-- Recent Digital Lots -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">🏷️ Recent Produce Lots</h3>
              <div class="card-subtitle">Digital lot passports generated at FPO collection points</div>
            </div>
            <button onclick="navigateTo('lots')" class="btn btn-outline btn-sm">View All Lots</button>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Lot ID</th>
                  <th>Farmer</th>
                  <th>Produce</th>
                  <th>Weight</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${recentLots.map(l => `
                  <tr>
                    <td><strong>${l.lot_code}</strong></td>
                    <td>${l.farmer_name} (${l.farmer_code})</td>
                    <td>${l.produce}</td>
                    <td>${l.actual_weight ? `${l.actual_weight} kg` : `~${l.estimated_quantity} kg (Est)`}</td>
                    <td><span class="badge badge-${l.current_status.toLowerCase()}">${l.current_status}</span></td>
                    <td>
                      <button onclick="viewLotPassport(${l.id})" class="btn btn-outline btn-sm" style="padding: 4px 8px; font-size: 11px;">
                        Passport 🔍
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Active Pools Quick View -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">📦 Active Pools</h3>
              <div class="card-subtitle">Aggregated clusters</div>
            </div>
            <button onclick="navigateTo('pooling')" class="btn btn-outline btn-sm">Manage</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${recentPools.map(p => `
              <div style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px; background: #fafafa;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="font-size: 13.5px; color: var(--primary);">${p.pool_code}</strong>
                  <span class="badge badge-${p.status.toLowerCase()}">${p.status}</span>
                </div>
                <div style="font-size: 12.5px; font-weight: 600; margin-bottom: 2px;">${p.produce} (${p.variety || 'Standard'})</div>
                <div style="font-size: 11.5px; color: var(--text-secondary); display: flex; justify-content: space-between;">
                  <span>🌾 ${p.farmer_count} Farmers</span>
                  <span>⚖️ ${p.total_weight} kg Total</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}
