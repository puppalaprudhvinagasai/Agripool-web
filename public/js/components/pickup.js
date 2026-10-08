// public/js/components/pickup.js - Logistics & Pickup Module (Section 20)
async function renderPickupPage() {
  const pickups = await api.getPickups();
  const pools = await api.getPools();

  return `
    <div class="pickup-page">
      <!-- Header with Primary + Add Button -->
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary);">
            🚚 Pickup
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Consolidated vehicle pickups across village farmer clusters, scheduled routes, and delivery tracking.
          </p>
        </div>
        <button onclick="openModal('add-pickup-modal')" class="btn btn-primary" style="font-size: 14px; padding: 10px 20px;">
          + Add Pickup
        </button>
      </div>

      <!-- Lifecycle Status Bar -->
      <div class="card" style="padding: 16px 20px; margin-bottom: 24px; background: #f8fafc; border: 1px solid var(--border);">
        <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
          Pickup & Dispatch Flow
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 12px; font-weight: 600;">
          <span style="color: #64748b;">REQUESTED</span>
          <span>➔</span>
          <span style="color: #0284c7;">ASSIGNED</span>
          <span>➔</span>
          <span style="color: #f59e0b;">SCHEDULED</span>
          <span>➔</span>
          <span style="color: #8b5cf6;">PICKED UP</span>
          <span>➔</span>
          <span style="color: #10b981; font-weight: 700;">DELIVERED</span>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="kpi-grid" style="margin-bottom: 24px;">
        <div class="kpi-card">
          <div class="kpi-icon-wrap amber">🚚</div>
          <div class="kpi-content">
            <div class="kpi-label">Active Pickups</div>
            <div class="kpi-value">${pickups.length}</div>
            <div class="kpi-subtext">Scheduled & in-transit routes</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap blue">🛣️</div>
          <div class="kpi-content">
            <div class="kpi-label">Primary Corridors</div>
            <div class="kpi-value">3</div>
            <div class="kpi-subtext">Krishna & Guntur Agri Corridors</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap green">⚖️</div>
          <div class="kpi-content">
            <div class="kpi-label">Aggregated Cargo</div>
            <div class="kpi-value">${(pickups.reduce((sum, p) => sum + (p.total_weight || 0), 0) / 100).toFixed(1)} Qtl</div>
            <div class="kpi-subtext">${pickups.reduce((sum, p) => sum + (p.total_weight || 0), 0).toLocaleString()} kg aggregated</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap purple">💰</div>
          <div class="kpi-content">
            <div class="kpi-label">Transport Savings</div>
            <div class="kpi-value">38.4%</div>
            <div class="kpi-subtext">Saved via consolidated pooling</div>
          </div>
        </div>
      </div>

      <!-- Pickups Schedule Table -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Consolidated Pickup Schedule</h3>
            <div class="card-subtitle">Village cluster pickup routes & status tracking</div>
          </div>
          <input type="text" placeholder="Search pickups..." class="form-control" style="width: 200px; font-size: 13px;" oninput="filterPickupsTable(this.value)">
        </div>

        <div class="table-responsive">
          <table class="data-table" id="pickups-master-table">
            <thead>
              <tr>
                <th>Pickup ID</th>
                <th>Pool / Lot Ref</th>
                <th>Farmer / FPO</th>
                <th>Location / Cluster</th>
                <th>Quantity</th>
                <th>Pickup Date</th>
                <th>Vehicle</th>
                <th>Driver / Partner</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${pickups.map(p => `
                <tr>
                  <td><strong style="color: var(--primary); font-family: monospace;">PKP-2026-${String(p.id).padStart(4, '0')}</strong></td>
                  <td><span class="badge badge-verified">POOL-${String(p.pool_id).padStart(4, '0')}</span></td>
                  <td><strong>Kisan Vikas FPO</strong><div style="font-size: 11px; color: var(--text-secondary);">${p.pool_commodity || 'Produce'}</div></td>
                  <td>📍 ${p.origin_village || 'Kankipadu Cluster'}</td>
                  <td><strong>${p.total_weight ? p.total_weight.toLocaleString() : '900'} kg</strong></td>
                  <td>${p.scheduled_pickup_date || '2026-10-09'}</td>
                  <td><span class="badge badge-accent">${p.vehicle_type || 'Eicher Pro 2049 3.5T'}</span></td>
                  <td>
                    <strong>${p.transporter_name || 'Andhra Agro Express'}</strong>
                    <div style="font-size: 11px; color: var(--text-secondary);">${p.driver_phone || '+91 98481 22334'}</div>
                  </td>
                  <td>📍 ${p.destination || 'Sri Krishna Cold Chain'}</td>
                  <td>
                    <span class="badge ${
                      p.status === 'DELIVERED' ? 'badge-settled' :
                      p.status === 'PICKED UP' ? 'badge-verified' :
                      p.status === 'SCHEDULED' ? 'badge-pool' : 'badge-draft'
                    }">${p.status}</span>
                  </td>
                  <td>
                    ${p.status === 'REQUESTED' ? `
                      <button onclick="advancePickupStatus(${p.id}, 'ASSIGNED')" class="btn btn-outline btn-sm">Assign Driver</button>
                    ` : p.status === 'ASSIGNED' ? `
                      <button onclick="advancePickupStatus(${p.id}, 'SCHEDULED')" class="btn btn-accent btn-sm">Schedule</button>
                    ` : p.status === 'SCHEDULED' ? `
                      <button onclick="advancePickupStatus(${p.id}, 'PICKED UP')" class="btn btn-primary btn-sm">Pick Up</button>
                    ` : p.status === 'PICKED UP' ? `
                      <button onclick="advancePickupStatus(${p.id}, 'DELIVERED')" class="btn btn-primary btn-sm" style="background: #10b981;">Deliver</button>
                    ` : `
                      <span style="font-size: 12px; color: #10b981; font-weight: 700;">✓ Completed</span>
                    `}
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

async function advancePickupStatus(pickupId, nextStatus) {
  try {
    await api.updatePickupStatus(pickupId, { status: nextStatus });
    showToast(`Pickup PKP-2026-${String(pickupId).padStart(4, '0')} updated to ${nextStatus}!`, 'success');
    navigateTo('pickup');
  } catch (err) {
    showToast('Failed to update pickup status: ' + err.message, 'error');
  }
}

function filterPickupsTable(val) {
  const query = (val || '').toLowerCase();
  document.querySelectorAll('#pickups-master-table tbody tr').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
}

async function handleAddPickupSubmit(e) {
  e.preventDefault();
  const poolId = Number(document.getElementById('pickup-form-pool-id').value);
  const scheduledDate = document.getElementById('pickup-form-date').value;
  const transporterName = document.getElementById('pickup-form-transporter').value;
  const vehicleType = document.getElementById('pickup-form-vehicle').value;
  const vehicleNumber = document.getElementById('pickup-form-vehicleno').value;
  const driverPhone = document.getElementById('pickup-form-driverphone').value;
  const estimatedCost = Number(document.getElementById('pickup-form-cost').value);

  try {
    await api.createPickup({
      pool_id: poolId,
      scheduled_date: scheduledDate,
      transporter_name: transporterName,
      vehicle_type: vehicleType,
      vehicle_number: vehicleNumber,
      driver_phone: driverPhone,
      estimated_cost: estimatedCost
    });
    closeModal('add-pickup-modal');
    showToast('Pickup dispatch scheduled successfully!', 'success');
    navigateTo('pickup');
  } catch (err) {
    showToast('Failed to create pickup: ' + err.message, 'error');
  }
}

window.renderPickupPage = renderPickupPage;
window.advancePickupStatus = advancePickupStatus;
window.filterPickupsTable = filterPickupsTable;
window.handleAddPickupSubmit = handleAddPickupSubmit;
