// public/js/components/audit.js - Immutable Audit Trail & Event Explorer
async function renderAuditPage() {
  const logs = await api.getAuditLogs(100);

  return `
    <div class="audit-page">
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 800;">
            🛡️ Immutable Platform Audit Trail & Traceability
          </h2>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Every lot creation, scale calibration, pool aggregation, order confirmation, and payment disbursement is cryptographically logged with user identity and timestamps.
          </p>
        </div>
      </div>

      <div class="card" style="padding: 16px 20px; margin-bottom: 20px;">
        <input type="text" id="audit-search" placeholder="Search audit actions, entity IDs or operators..." class="form-control" style="width: 320px; font-size: 13px;" oninput="filterAuditLogs(this.value)">
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="data-table" id="audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator</th>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Entity ID</th>
                <th>Audited Diff / Value</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td style="font-size: 12px; color: var(--text-muted);">${l.timestamp}</td>
                  <td><strong>${l.user_name}</strong></td>
                  <td><span class="badge badge-weighed">${l.action}</span></td>
                  <td><strong>${l.entity_type}</strong></td>
                  <td><code style="font-size: 12px; color: var(--primary); font-weight: 700;">${l.entity_id}</code></td>
                  <td style="font-size: 12px; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${l.new_value || l.previous_value || 'State transition recorded'}
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

function filterAuditLogs(query) {
  const q = query.toLowerCase();
  const rows = document.querySelectorAll('#audit-table tbody tr');
  rows.forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}
