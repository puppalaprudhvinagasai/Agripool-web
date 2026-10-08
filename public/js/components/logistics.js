// public/js/components/logistics.js - Logistics Partner Dashboard
async function renderLogisticsPage() {
  const pickups = await api.getPickups();

  return `
    <div class="logistics-page">
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 800;">
            🚚 Logistics & Shared-Route Transportation Module
          </h2>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Consolidated vehicle dispatches across multi-village farmer clusters, cutting individual transport expense by 40%.
          </p>
        </div>
      </div>

      <!-- Logistics Fleet & Route Metrics -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon-wrap amber">🚚</div>
          <div class="kpi-content">
            <div class="kpi-label">Active Dispatches</div>
            <div class="kpi-value">${pickups.length}</div>
            <div class="kpi-subtext">Scheduled & in-transit routes</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap blue">🛣️</div>
          <div class="kpi-content">
            <div class="kpi-label">Primary Corridors</div>
            <div class="kpi-value">3</div>
            <div class="kpi-subtext">Krishna–Guntur Mirchi Corridor</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap green">⚖️</div>
          <div class="kpi-content">
            <div class="kpi-label">Aggregated Cargo</div>
            <div class="kpi-value">${(pickups.reduce((sum, p) => sum + (p.total_weight || 0), 0) / 100).toFixed(1)} Qtl</div>
            <div class="kpi-subtext">Pooled farm produce</div>
          </div>
        </div>
      </div>

      <!-- Pickups Dispatches Table -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">📦 Consolidated Pickup Schedule</h3>
            <div class="card-subtitle">Village cluster pickup routes & status tracking</div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Pickup ID</th>
                <th>Pool Ref</th>
                <th>Cargo / Weight</th>
                <th>Shared Route</th>
                <th>Vehicle Type</th>
                <th>Vehicle & Driver</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${pickups.map(p => `
                <tr>
                  <td><strong>${p.pickup_code}</strong></td>
                  <td><span style="color: #7c3aed; font-weight: 600;">${p.pool_code}</span></td>
                  <td>
                    <div><strong>${p.produce}</strong></div>
                    <div style="font-size: 11.5px; color: var(--text-secondary);">${p.total_weight} kg (${p.farmer_count} Farmers)</div>
                  </td>
                  <td>
                    <div style="font-size: 13px;">${p.route_villages || 'Cluster Shared Pickup'}</div>
                  </td>
                  <td><span class="badge badge-weighed">${p.vehicle_type || 'Tata 407 (2.5 MT)'}</span></td>
                  <td>
                    ${p.vehicle_number ? `
                      <div style="font-weight: 600;">${p.vehicle_number}</div>
                      <div style="font-size: 11px; color: var(--text-secondary);">${p.driver_name} (${p.driver_phone})</div>
                    ` : `<span style="color: var(--text-muted); font-size: 12px;">Unassigned</span>`}
                  </td>
                  <td>${p.scheduled_date || 'Today'}</td>
                  <td>
                    <span class="badge badge-${p.status.toLowerCase()}">${p.status}</span>
                  </td>
                  <td>
                    <button onclick="openUpdatePickupModal(${p.id}, '${p.status}', '${p.vehicle_number || ''}', '${p.driver_name || ''}', '${p.driver_phone || ''}')" class="btn btn-outline btn-sm">
                      Update 🚚
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

function openUpdatePickupModal(pickupId, currentStatus, vehicleNo, driver, phone) {
  const modalContent = document.getElementById('pickup-update-content');
  modalContent.innerHTML = `
    <form onsubmit="handleUpdatePickupSubmit(event, ${pickupId})">
      <div class="form-group">
        <label class="form-label">Update Dispatch Status</label>
        <select class="form-control" id="pickup-modal-status" required>
          <option value="REQUESTED" ${currentStatus === 'REQUESTED' ? 'selected' : ''}>REQUESTED</option>
          <option value="ASSIGNED" ${currentStatus === 'ASSIGNED' ? 'selected' : ''}>ASSIGNED</option>
          <option value="SCHEDULED" ${currentStatus === 'SCHEDULED' ? 'selected' : ''}>SCHEDULED</option>
          <option value="PICKED_UP" ${currentStatus === 'PICKED_UP' ? 'selected' : ''}>PICKED_UP</option>
          <option value="DELIVERED" ${currentStatus === 'DELIVERED' ? 'selected' : ''}>DELIVERED</option>
          <option value="CANCELLED" ${currentStatus === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Vehicle Registration Number</label>
          <input type="text" class="form-control" id="pickup-modal-vehicle" value="${vehicleNo || 'AP 16 TE 4821'}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Driver Name</label>
          <input type="text" class="form-control" id="pickup-modal-driver" value="${driver || 'K. Venkat Rao'}" required>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Driver Contact Mobile</label>
        <input type="text" class="form-control" id="pickup-modal-phone" value="${phone || '+91 97000 88123'}" required>
      </div>

      <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
        <button type="button" onclick="closeModal('pickup-update-modal')" class="btn btn-outline btn-sm">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm">Save Logistics Status</button>
      </div>
    </form>
  `;
  openModal('pickup-update-modal');
}

async function handleUpdatePickupSubmit(e, pickupId) {
  e.preventDefault();
  const status = document.getElementById('pickup-modal-status').value;
  const vehicleNumber = document.getElementById('pickup-modal-vehicle').value;
  const driverName = document.getElementById('pickup-modal-driver').value;
  const driverPhone = document.getElementById('pickup-modal-phone').value;

  try {
    await api.updatePickupStatus(pickupId, { status, vehicleNumber, driverName, driverPhone });
    closeModal('pickup-update-modal');
    showToast(`Pickup updated to status ${status}`, 'success');
    navigateTo('logistics');
  } catch (err) {
    showToast('Failed to update pickup: ' + err.message, 'error');
  }
}
