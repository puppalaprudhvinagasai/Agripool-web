// public/js/components/admin_dashboard.js - Platform Administrator Master Control Deck (Requirement #16)
async function renderAdminDashboard() {
  const statsRes = await api.getStats();
  const kpis = statsRes.kpis;
  const auditLogs = await api.getAuditLogs(10);
  const roles = await api.getRoles();

  return `
    <div class="admin-dashboard-page">
      <!-- Admin Super Banner -->
      <div style="background: linear-gradient(135deg, #090e11 0%, #17242b 100%); color: #ffffff; padding: 26px 30px; border-radius: var(--radius-lg); margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.1); box-shadow: var(--shadow-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--accent); font-weight: 800;">
              🛡️ Master Administration Console • Full System Privileges
            </div>
            <h1 style="font-family: var(--font-display); font-size: 28px; font-weight: 800; margin: 4px 0;">
              Platform Super Admin Control Deck
            </h1>
            <p style="font-size: 14px; color: #94a3b8;">
              Comprehensive oversight across all 8 ecosystem roles, produce contracts, settlements, and audit security.
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button onclick="promptResetSeed()" class="btn btn-outline btn-sm" style="color: #ffffff; border-color: rgba(255,255,255,0.3);">
              🔄 Reset Database
            </button>
          </div>
        </div>
      </div>

      <!-- Super KPIs Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin-bottom: 28px;">
        <div class="card" style="margin-bottom: 0; padding: 20px;" onclick="navigateTo('farmers')" style="cursor: pointer;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Enrolled Farmers</div>
          <div style="font-size: 28px; font-weight: 800; color: var(--primary); margin-top: 4px;">${kpis.totalFarmers}</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Across 5 village clusters</div>
        </div>

        <div class="card" style="margin-bottom: 0; padding: 20px;" onclick="navigateTo('buyers')" style="cursor: pointer;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Verified Bulk Buyers</div>
          <div style="font-size: 28px; font-weight: 800; color: #0284c7; margin-top: 4px;">${kpis.activeBuyers} Active</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Corporate processors</div>
        </div>

        <div class="card" style="margin-bottom: 0; padding: 20px;" onclick="navigateTo('pools')" style="cursor: pointer;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Aggregated Quantity</div>
          <div style="font-size: 28px; font-weight: 800; color: #7c3aed; margin-top: 4px;">${kpis.totalPooledQuantityKg.toLocaleString()} kg</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${kpis.activePools} Active Batches</div>
        </div>

        <div class="card" style="margin-bottom: 0; padding: 20px;" onclick="navigateTo('payments')" style="cursor: pointer;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Gross Trade GMV</div>
          <div style="font-size: 28px; font-weight: 800; color: #16a34a; margin-top: 4px;">₹${(kpis.grossVolumeRs || 0).toLocaleString()}</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">₹${(kpis.netSettledRs || 0).toLocaleString()} net settled</div>
        </div>
      </div>

      <!-- Ecosystem Roles Oversight -->
      <div class="card" style="padding: 24px; margin-bottom: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 18px; font-weight: 800;">👥 Platform Role RBAC Matrix & Access Control</h3>
          <span class="badge badge-settled">8 Active Roles</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
          ${roles.map(r => `
            <div style="padding: 14px; background: #f8fafc; border: 1px solid var(--border); border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="font-size: 20px;">${r.icon}</span>
                <strong style="font-size: 14px;">${r.name}</strong>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; line-height: 1.4;">${r.description}</p>
              <button onclick="navigateTo('${r.dashboard.replace('/', '')}')" class="btn btn-outline btn-xs btn-block">
                Manage ${r.name} Modules →
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- System Security Audit Logs -->
      <div class="card" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 18px; font-weight: 800;">🛡️ Immutable System Activity & Security Logs</h3>
          <button onclick="navigateTo('activity')" class="btn btn-outline btn-xs">View Full Audit Trail →</button>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator</th>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Entity ID</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              ${auditLogs.slice(0, 8).map(log => `
                <tr>
                  <td><code style="font-size: 11px;">${new Date(log.timestamp).toLocaleString()}</code></td>
                  <td><strong>${log.user_name}</strong></td>
                  <td><span class="badge badge-weighed">${log.action}</span></td>
                  <td>${log.entity_type}</td>
                  <td><code>${log.entity_id}</code></td>
                  <td>${log.ip_address}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

window.renderAdminDashboard = renderAdminDashboard;
