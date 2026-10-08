// public/js/components/fpo.js - FPO Admin Dashboard (Section 4)
async function renderFpoDashboard() {
  const statsRes = await api.getStats();
  const kpis = statsRes.kpis;
  const milestones = statsRes.pilotMilestones;
  const recentLots = await api.getLots({ limit: 5 });
  const recentPools = await api.getPools();

  return `
    <div class="fpo-dashboard">
      <!-- Title & Organization Banner -->
      <div style="background: linear-gradient(135deg, #0F5132 0%, #157347 100%); color: #ffffff; padding: 24px 28px; border-radius: var(--radius-lg); margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; box-shadow: var(--shadow-md);">
        <div>
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 700;">
            Primary Pilot Organization • Krishna & Guntur Districts
          </div>
          <h1 style="font-family: var(--font-display); font-size: 28px; font-weight: 800; margin: 4px 0;">
            FPO Dashboard
          </h1>
          <p style="font-size: 14px; color: #d1fae5;">
            Manage farmers, produce, pools, buyers and payments.
          </p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button onclick="openModal('onboard-farmer-modal')" class="btn btn-accent btn-sm">
            + Add Farmer
          </button>
          <button onclick="openModal('create-crop-modal')" class="btn btn-outline btn-sm" style="color: #ffffff; border-color: rgba(255, 255, 255, 0.4);">
            + Add Crop
          </button>
          <button onclick="openModal('create-lot-modal')" class="btn btn-primary btn-sm" style="background: #ffffff; color: #0f5132; font-weight: 700;">
            + Create Lot
          </button>
          <button onclick="navigateTo('pools')" class="btn btn-outline btn-sm" style="color: #ffffff; border-color: rgba(255, 255, 255, 0.4);">
            + Create Pool
          </button>
        </div>
      </div>

      <!-- 8 KPI Cards (Section 4 Exact Requirement) -->
      <div class="kpi-grid">
        <div class="kpi-card" onclick="navigateTo('farmers')" style="cursor: pointer;">
          <div class="kpi-icon-wrap green">👨‍🌾</div>
          <div class="kpi-content">
            <div class="kpi-label">Total Farmers</div>
            <div class="kpi-value">${kpis.totalFarmers}</div>
            <div class="kpi-subtext">Registered smallholders</div>
          </div>
        </div>

        <div class="kpi-card" onclick="navigateTo('crops')" style="cursor: pointer;">
          <div class="kpi-icon-wrap amber">🌾</div>
          <div class="kpi-content">
            <div class="kpi-label">Total Crops</div>
            <div class="kpi-value">${kpis.totalCrops}</div>
            <div class="kpi-subtext">Harvest declarations</div>
          </div>
        </div>

        <div class="kpi-card" onclick="navigateTo('lots')" style="cursor: pointer;">
          <div class="kpi-icon-wrap blue">🏷️</div>
          <div class="kpi-content">
            <div class="kpi-label">Active Lots</div>
            <div class="kpi-value">${kpis.activeLots}</div>
            <div class="kpi-subtext">${kpis.totalLots} total issued</div>
          </div>
        </div>

        <div class="kpi-card" onclick="navigateTo('pools')" style="cursor: pointer;">
          <div class="kpi-icon-wrap purple">⚖️</div>
          <div class="kpi-content">
            <div class="kpi-label">Total Pooled Quantity</div>
            <div class="kpi-value">${kpis.totalPooledQuantityQuintals} Qtl</div>
            <div class="kpi-subtext">${kpis.totalPooledQuantityKg.toLocaleString()} kg aggregated</div>
          </div>
        </div>

        <div class="kpi-card" onclick="navigateTo('pools')" style="cursor: pointer;">
          <div class="kpi-icon-wrap purple">🤝</div>
          <div class="kpi-content">
            <div class="kpi-label">Active Pools</div>
            <div class="kpi-value">${kpis.activePools}</div>
            <div class="kpi-subtext">Clusters formed</div>
          </div>
        </div>

        <div class="kpi-card" onclick="navigateTo('buyers')" style="cursor: pointer;">
          <div class="kpi-icon-wrap blue">🏢</div>
          <div class="kpi-content">
            <div class="kpi-label">Active Buyers</div>
            <div class="kpi-value">${kpis.activeBuyers}</div>
            <div class="kpi-subtext">Verified corporate buyers</div>
          </div>
        </div>

        <div class="kpi-card" onclick="navigateTo('orders')" style="cursor: pointer;">
          <div class="kpi-icon-wrap amber">🛒</div>
          <div class="kpi-content">
            <div class="kpi-label">Open Orders</div>
            <div class="kpi-value">${kpis.openOrders}</div>
            <div class="kpi-subtext">PO contracts in progress</div>
          </div>
        </div>

        <div class="kpi-card" onclick="navigateTo('payments')" style="cursor: pointer;">
          <div class="kpi-icon-wrap green">💰</div>
          <div class="kpi-content">
            <div class="kpi-label">Pending Payments</div>
            <div class="kpi-value">${kpis.pendingPayments}</div>
            <div class="kpi-subtext">Awaiting NEFT dispatch</div>
          </div>
        </div>
      </div>

      <!-- Pilot Progress Section (Section 4 Requirement) -->
      <div class="card" style="margin-bottom: 24px;">
        <div class="card-header">
          <div>
            <h3 class="card-title">🚀 Pilot Progress — Phase 1 Pilot</h3>
            <div class="card-subtitle">Local trust and operational validation milestones with Kisan Vikas FPO</div>
          </div>
          <button onclick="runAcceptanceDemoPrompt()" class="btn btn-accent btn-sm">
            ⚡ Run 20-Step Demo Workflow
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          <!-- Target 1: 50-100 Farmers -->
          <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 13.5px; font-weight: 700;">Target: 50–100 Farmers</span>
              <span class="badge ${kpis.totalFarmers >= 50 ? 'badge-settled' : 'badge-weighed'}">
                ${kpis.totalFarmers >= 50 ? 'TARGET MET' : 'IN PROGRESS'}
              </span>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
              Onboarded: <strong>${kpis.totalFarmers}</strong> / 100 Farmers (${Math.min(100, Math.round((kpis.totalFarmers/100)*100))}%)
            </div>
            <div style="height: 7px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
              <div style="width: ${Math.min(100, Math.round((kpis.totalFarmers/100)*100))}%; height: 100%; background: #16a34a;"></div>
            </div>
          </div>

          <!-- Target 2: 1 FPO / SHG -->
          <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 13.5px; font-weight: 700;">Target: 1 FPO / SHG</span>
              <span class="badge badge-settled">ACHIEVED</span>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
              Active: <strong>Kisan Vikas FPO</strong> + 5 Village SHGs
            </div>
            <div style="height: 7px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
              <div style="width: 100%; height: 100%; background: #16a34a;"></div>
            </div>
          </div>

          <!-- Target 3: First Live Pooled Transaction -->
          <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 13.5px; font-weight: 700;">Target: First Live Pooled Transaction</span>
              <span class="badge ${kpis.completedSettlements >= 1 ? 'badge-settled' : 'badge-weighed'}">
                ${kpis.completedSettlements >= 1 ? 'COMPLETED' : 'IN PROGRESS'}
              </span>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
              Settled Volume: <strong>₹${Math.round(kpis.netSettledRs).toLocaleString()}</strong> (${kpis.completedSettlements} cycle closed)
            </div>
            <div style="height: 7px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
              <div style="width: ${kpis.completedSettlements >= 1 ? 100 : 50}%; height: 100%; background: #16a34a;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Operations Tables -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
        <!-- Recent Lots -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">🏷️ Recent Produce Lots</h3>
              <div class="card-subtitle">Latest lots created and weighed at field centers</div>
            </div>
            <button onclick="navigateTo('lots')" class="btn btn-outline btn-sm">View All</button>
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
                    <td>${l.farmer_name}</td>
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

        <!-- Active Pools -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">🤝 Active Pools</h3>
              <div class="card-subtitle">Aggregated farmer clusters</div>
            </div>
            <button onclick="navigateTo('pools')" class="btn btn-outline btn-sm">View All</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${recentPools.map(p => `
              <div style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px; background: #fafafa;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="color: var(--primary); font-size: 13.5px;">${p.pool_code}</strong>
                  <span class="badge badge-${p.status.toLowerCase()}">${p.status}</span>
                </div>
                <div style="font-size: 13px; font-weight: 600;">${p.produce}</div>
                <div style="font-size: 11.5px; color: var(--text-secondary); display: flex; justify-content: space-between; margin-top: 4px;">
                  <span>🌾 ${p.farmer_count} Farmers</span>
                  <span>⚖️ ${p.total_weight} kg</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

window.renderFpoDashboard = renderFpoDashboard;
window.renderFpoConsole = renderFpoDashboard;
