// public/js/components/activity.js - Activity & Audit Trail (Section 26)
async function renderActivityPage() {
  const logs = await api.getAuditLogs(100);

  return `
    <div class="activity-page">
      <!-- Header -->
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary);">
            🛡️ Activity
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Every important action is recorded for transparency across farmers, lots, pools, buyers, and settlements.
          </p>
        </div>
        <div>
          <span class="badge badge-settled" style="font-size: 13px; padding: 6px 14px;">
            🔒 IMMUTABLE SYSTEM TRAIL
          </span>
        </div>
      </div>

      <!-- Section 26 Explanation Banner -->
      <div class="card" style="padding: 16px 20px; margin-bottom: 24px; background: #f0fdf4; border: 1px solid #bbf7d0;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 24px;">🛡️</div>
          <div>
            <strong style="color: #166534; font-size: 14.5px;">Every important action is recorded for transparency.</strong>
            <p style="color: #15803d; font-size: 13px; margin: 2px 0 0 0;">
              AgriPool automatically creates non-repudiable audit logs whenever farmers register, lots are weighed/verified, pools are assembled, buyer contracts are executed, or bank payments are disbursed.
            </p>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="card" style="padding: 16px 20px; margin-bottom: 20px;">
        <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center;">
          <input type="text" id="activity-search-input" placeholder="Search activity, entity or user..." class="form-control" style="width: 280px; font-size: 13px;" oninput="filterActivityTable(this.value)">
          <select id="activity-entity-filter" class="form-control" style="width: 180px; font-size: 13px;" onchange="filterActivityEntity(this.value)">
            <option value="">All Entities</option>
            <option value="farmer">Farmer</option>
            <option value="crop">Crop</option>
            <option value="lot">Lot</option>
            <option value="pool">Pool</option>
            <option value="buyer">Buyer</option>
            <option value="order">Order</option>
            <option value="payment">Payment</option>
          </select>
          <span style="font-size: 13px; color: var(--text-muted); margin-left: auto;">
            Showing <strong>${logs.length}</strong> Audit Events
          </span>
        </div>
      </div>

      <!-- Activity Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="data-table" id="activity-master-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Actor User</th>
                <th>Email Dispatch</th>
                <th>Action Recorded</th>
                <th>Entity Type</th>
                <th>Entity Ref</th>
                <th>Previous Value</th>
                <th>New Value</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => {
                const status = (l.mail_status || 'LOCAL_LOG').toUpperCase();
                let badgeClass = 'badge-accent';
                let statusLabel = '📝 Logged';
                if (status === 'SENT') {
                  badgeClass = 'badge-success';
                  statusLabel = '✉️ Sent';
                } else if (status === 'FAILED') {
                  badgeClass = 'badge-danger';
                  statusLabel = '⚠️ Failed';
                } else if (status === 'QUEUED') {
                  badgeClass = 'badge-warning';
                  statusLabel = '⏳ Queued';
                }

                return `
                <tr data-entity="${(l.entity_type || '').toLowerCase()}">
                  <td><code style="color: var(--primary);">#${String(l.id).padStart(5, '0')}</code></td>
                  <td><span style="font-size: 12px; color: var(--text-secondary);">${l.created_at || '2026-10-06 14:20:00'}</span></td>
                  <td>
                    <strong>${l.user_name || 'System Operator'}</strong>
                    <div style="font-size: 11px; color: var(--text-muted);">${l.user_email || l.role || 'FPO Admin'}</div>
                  </td>
                  <td>
                    <span class="badge ${badgeClass}" title="${l.user_email ? 'Sent to: ' + l.user_email : 'No email address registered'}">
                      ${statusLabel}
                    </span>
                  </td>
                  <td><strong style="color: var(--text-primary);">${l.action}</strong></td>
                  <td><span class="badge badge-accent">${(l.entity_type || 'SYSTEM').toUpperCase()}</span></td>
                  <td><code>${l.entity_id ? '#' + l.entity_id : 'N/A'}</code></td>
                  <td><span style="font-size: 11.5px; color: var(--text-muted);">${formatJsonSummary(l.old_values)}</span></td>
                  <td><strong style="font-size: 11.5px; color: var(--primary);">${formatJsonSummary(l.new_values)}</strong></td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function formatJsonSummary(val) {
  if (!val) return '—';
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed);
    } catch (e) {
      return val;
    }
  }
  return JSON.stringify(val);
}

function filterActivityTable(val) {
  const query = (val || '').toLowerCase();
  document.querySelectorAll('#activity-master-table tbody tr').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
}

function filterActivityEntity(entity) {
  const ent = (entity || '').toLowerCase();
  document.querySelectorAll('#activity-master-table tbody tr').forEach(tr => {
    if (!ent || tr.dataset.entity === ent) {
      tr.style.display = '';
    } else {
      tr.style.display = 'none';
    }
  });
}

window.renderActivityPage = renderActivityPage;
window.renderAuditPage = renderActivityPage; // backward compatibility
window.filterActivityTable = filterActivityTable;
window.filterActivityEntity = filterActivityEntity;
