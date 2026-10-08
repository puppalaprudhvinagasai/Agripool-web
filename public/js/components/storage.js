// public/js/components/storage.js - Storage & Warehousing Module (Section 21)
async function renderStoragePage() {
  const facilities = await api.getStorageFacilities();
  const pools = await api.getPools();

  const totalCap = facilities.reduce((sum, f) => sum + (f.total_capacity_mt || 0), 0);
  const usedCap = facilities.reduce((sum, f) => sum + (f.used_capacity_mt || 0), 0);
  const availCap = (totalCap - usedCap).toFixed(1);
  const overallUsedPct = Math.round((usedCap / totalCap) * 100) || 0;

  return `
    <div class="storage-page">
      <!-- Header with Primary + Add Button -->
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary);">
            🏭 Storage
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Certified cold stores, hermetic silos, and dry warehouses with real-time capacity and lot tracking.
          </p>
        </div>
        <button onclick="openModal('add-storage-modal')" class="btn btn-primary" style="font-size: 14px; padding: 10px 20px;">
          + Add Storage Facility
        </button>
      </div>

      <!-- Section 21 Dashboard: Total Capacity, Used Capacity, Available Capacity -->
      <div class="kpi-grid" style="margin-bottom: 24px;">
        <div class="kpi-card">
          <div class="kpi-icon-wrap blue">🏭</div>
          <div class="kpi-content">
            <div class="kpi-label">Total Capacity</div>
            <div class="kpi-value">${totalCap.toLocaleString()} MT</div>
            <div class="kpi-subtext">Across ${facilities.length} certified partner hubs</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap amber">📦</div>
          <div class="kpi-content">
            <div class="kpi-label">Used Capacity</div>
            <div class="kpi-value">${usedCap.toFixed(1)} MT</div>
            <div class="kpi-subtext">${overallUsedPct}% facility utilization</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap green">✨</div>
          <div class="kpi-content">
            <div class="kpi-label">Available Capacity</div>
            <div class="kpi-value">${availCap} MT</div>
            <div class="kpi-subtext">Ready for immediate intake</div>
          </div>
        </div>
      </div>

      <!-- Facilities Capacity Overview Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 28px;">
        ${facilities.map(f => {
          const usedPct = Math.round((f.used_capacity_mt / f.total_capacity_mt) * 100);
          const availMt = (f.total_capacity_mt - f.used_capacity_mt).toFixed(1);
          return `
            <div class="card" style="margin-bottom: 0;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                  <span class="badge ${f.facility_type === 'Cold Storage' ? 'badge-storage' : 'badge-verified'}">${f.facility_type || 'Cold Store'}</span>
                  <h3 style="font-size: 17px; font-weight: 700; margin-top: 6px;">${f.name}</h3>
                  <div style="font-size: 12px; color: var(--text-secondary);">📍 ${f.location || ''}, ${f.district || ''}</div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Owner: ${f.owner_name || 'Partner Facility'}</div>
                </div>
                <span class="badge badge-settled">VERIFIED</span>
              </div>

              <div style="margin: 16px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                  <span>Capacity Utilization</span>
                  <strong>${f.used_capacity_mt} / ${f.total_capacity_mt} MT (${usedPct}%)</strong>
                </div>
                <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                  <div style="width: ${usedPct}%; height: 100%; background: ${usedPct > 80 ? '#dc2626' : 'var(--primary-light)'};"></div>
                </div>
                <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 6px; display: flex; justify-content: space-between;">
                  <span>Available: <strong>${availMt} MT</strong></span>
                  <span>Rate: <strong>₹${f.rate_per_month_per_quintal || 65}/Qtl/mo</strong></span>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                  Commodities: ${f.commodity_types || 'Chilli, Turmeric, Maize, Pulses'}
                </div>
              </div>

              <div style="border-top: 1px dashed var(--border); padding-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                <span>📞 ${f.contact_phone || '+91 866 288 4120'}</span>
                <button onclick="openAssignStorageModalWithFacility(${f.id})" class="btn btn-primary btn-sm">Assign Pooled Lot</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Active Storage Assignments -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Assigned Lots & Warehouse Receipts</h3>
            <div class="card-subtitle">Digitally verified lot intake certificates and storage locations</div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Storage Facility</th>
                <th>Pool / Lot Ref</th>
                <th>Commodity</th>
                <th>Stored Weight</th>
                <th>Bay / Pallet Slot</th>
                <th>In-Date</th>
                <th>Est. Monthly Fee</th>
                <th>Intake Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong style="font-family: monospace; color: var(--primary);">WR-2026-0041</strong></td>
                <td>Sri Krishna Cold Chain</td>
                <td><span class="badge badge-pool">POOL-0001</span></td>
                <td>Guntur Sannam Chilli Grade A</td>
                <td><strong>900.0 kg (9.0 Qtl)</strong></td>
                <td><span class="badge badge-accent">Bay B-04 / Pallet 12</span></td>
                <td>2026-10-02</td>
                <td>₹585 / mo</td>
                <td><span class="badge badge-settled">VERIFIED IN-STORE</span></td>
              </tr>
              <tr>
                <td><strong style="font-family: monospace; color: var(--primary);">WR-2026-0042</strong></td>
                <td>Vijayawada Central Agri Warehouse</td>
                <td><span class="badge badge-pool">POOL-0002</span></td>
                <td>Nizamabad Turmeric Standard</td>
                <td><strong>1,200.0 kg (12.0 Qtl)</strong></td>
                <td><span class="badge badge-accent">Chamber 2 / Row 08</span></td>
                <td>2026-10-04</td>
                <td>₹540 / mo</td>
                <td><span class="badge badge-settled">VERIFIED IN-STORE</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function openAssignStorageModalWithFacility(facilityId) {
  openModal('storage-assign-modal');
  const sel = document.getElementById('storage-form-facility');
  if (sel) sel.value = String(facilityId);
}

async function handleAddStorageFacilitySubmit(e) {
  e.preventDefault();
  const name = document.getElementById('storage-name-input').value;
  const ownerName = document.getElementById('storage-owner-input').value;
  const facilityType = document.getElementById('storage-type-select').value;
  const location = document.getElementById('storage-location-input').value;
  const district = document.getElementById('storage-district-input').value;
  const totalCapacityMt = Number(document.getElementById('storage-capacity-input').value);
  const ratePerMonth = Number(document.getElementById('storage-rate-input').value);
  const contactPhone = document.getElementById('storage-phone-input').value;
  const commodityTypes = document.getElementById('storage-commodities-input').value;

  try {
    await api.createStorageFacility({
      name,
      owner_name: ownerName,
      facility_type: facilityType,
      location,
      district,
      total_capacity_mt: totalCapacityMt,
      used_capacity_mt: 0,
      rate_per_month_per_quintal: ratePerMonth,
      contact_phone: contactPhone,
      commodity_types: commodityTypes
    });
    closeModal('add-storage-modal');
    showToast(`Storage facility ${name} added successfully!`, 'success');
    navigateTo('storage');
  } catch (err) {
    showToast('Failed to create storage facility: ' + err.message, 'error');
  }
}

window.renderStoragePage = renderStoragePage;
window.openAssignStorageModalWithFacility = openAssignStorageModalWithFacility;
window.handleAddStorageFacilitySubmit = handleAddStorageFacilitySubmit;
