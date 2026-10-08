// public/js/components/pooling.js - Aggregation & Pooling Engine
let selectedLotIds = new Set();
let unpooledLotsCache = [];

async function renderPoolingPage() {
  selectedLotIds.clear();
  unpooledLotsCache = await api.getLots({ unpooled: true });
  const existingPools = await api.getPools();

  return `
    <div class="pooling-page">
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary);">
            🤝 Pools
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Select compatible farmer lots, aggregate produce quantity, and unlock bulk buyer contracts.
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button onclick="document.getElementById('unpooled-workbench-sec').scrollIntoView({ behavior: 'smooth' })" class="btn btn-primary" style="font-size: 14px; padding: 10px 20px;">
            + Create Pool
          </button>
        </div>
      </div>

      <!-- Real-Time Pool Creation Workbench -->
      <div id="unpooled-workbench-sec" style="display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 24px; margin-bottom: 30px;">
        <!-- Left: Selectable Verified Lots -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">📦 Available Unpooled Lots (${unpooledLotsCache.length})</h3>
              <div class="card-subtitle">Verified produce lots ready for aggregation</div>
            </div>
            <select id="pooling-produce-filter" class="form-control" style="width: 200px; padding: 6px 12px; font-size: 12.5px;" onchange="filterUnpooledLots(this.value)">
              <option value="">All Commodities</option>
              <option value="Guntur Sannam Chilli">Guntur Sannam Chilli</option>
              <option value="Nizamabad Turmeric">Nizamabad Turmeric</option>
              <option value="Maize (Hybrid)">Maize (Hybrid)</option>
              <option value="Black Gram (Urad)">Black Gram (Urad)</option>
            </select>
          </div>

          <div style="max-height: 480px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-md);">
            <table class="data-table" id="unpooled-table">
              <thead>
                <tr>
                  <th style="width: 40px; text-align: center;">
                    <input type="checkbox" id="select-all-lots-btn" onchange="toggleSelectAllLots(this.checked)">
                  </th>
                  <th>Lot Code</th>
                  <th>Farmer</th>
                  <th>Produce</th>
                  <th>Net Weight</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                ${unpooledLotsCache.map(l => `
                  <tr data-produce="${l.produce}">
                    <td style="text-align: center;">
                      <input type="checkbox" class="lot-pool-checkbox" value="${l.id}" data-produce="${l.produce}" data-weight="${l.actual_weight || l.estimated_quantity}" data-farmer="${l.farmer_name}" onchange="toggleLotSelection(${l.id})">
                    </td>
                    <td><strong>${l.lot_code}</strong></td>
                    <td>
                      <div>${l.farmer_name}</div>
                      <span style="font-size: 11px; color: var(--text-secondary);">${l.village_name || 'Kankipadu'}</span>
                    </td>
                    <td>${l.produce}</td>
                    <td><strong>${l.actual_weight || l.estimated_quantity} kg</strong></td>
                    <td><span class="badge ${l.grade === 'GRADE_A' ? 'badge-settled' : 'badge-weighed'}">${l.grade}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Aggregation Metrics & Incompatibility Guard -->
        <div class="card" style="background: linear-gradient(135deg, #ffffff 0%, #fbfdfb 100%); border: 2px solid var(--primary);">
          <div class="card-header">
            <div>
              <h3 class="card-title" style="color: var(--primary);">📊 Aggregation Calculator</h3>
              <div class="card-subtitle">Real-time pooling calculations</div>
            </div>
            <span class="badge badge-pooled" id="pool-selected-count">0 Lots Selected</span>
          </div>

          <div id="incompatibility-warning" style="display: none; background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-md); padding: 12px; margin-bottom: 16px; color: #991b1b; font-size: 13px;">
            ⚠️ <strong>Incompatible Lots Selected:</strong> You cannot pool different commodities together. Please select lots with matching produce.
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;">
            <div style="background: #f8fafc; padding: 14px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13.5px; color: var(--text-secondary);">Target Commodity</span>
              <strong id="calc-produce" style="font-size: 15px; color: var(--primary);">-</strong>
            </div>

            <div style="background: #f8fafc; padding: 14px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13.5px; color: var(--text-secondary);">Total Pooled Quantity</span>
              <strong id="calc-total-weight" style="font-family: var(--font-display); font-size: 22px; color: var(--primary);">0.0 kg</strong>
            </div>

            <div style="background: #f8fafc; padding: 14px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13.5px; color: var(--text-secondary);">Contributing Farmers</span>
              <strong id="calc-farmers" style="font-size: 15px;">0 Farmers</strong>
            </div>

            <div style="background: #f8fafc; padding: 14px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13.5px; color: var(--text-secondary);">Recommended Logistics</span>
              <strong id="calc-vehicle" style="font-size: 13.5px; color: #d97706;">Auto / Mini Truck</strong>
            </div>

            <div style="background: #f8fafc; padding: 14px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13.5px; color: var(--text-secondary);">Storage Facility Type</span>
              <strong id="calc-storage" style="font-size: 13.5px; color: #0284c7;">Dry Warehouse</strong>
            </div>

            <div class="form-group" style="margin-top: 6px;">
              <label class="form-label">Estimated Reserve Price (₹/kg)</label>
              <input type="number" id="calc-price-input" class="form-control" value="220" oninput="updateGrossValue()">
            </div>

            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 14px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13.5px; font-weight: 700; color: #065f46;">Estimated Gross Value</span>
              <strong id="calc-gross-value" style="font-family: var(--font-display); font-size: 20px; color: #047857;">₹0.00</strong>
            </div>
          </div>

          <button id="create-pool-btn" onclick="executeCreatePool()" class="btn btn-primary btn-lg" style="width: 100%;" disabled>
            🚀 Lock & Create Pooled Lot
          </button>
        </div>
      </div>

      <!-- Existing Active Pools Table -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">📦 Formed Pooled Lots (${existingPools.length})</h3>
            <div class="card-subtitle">Active and settled produce pools</div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Pool Code</th>
                <th>Produce / Variety</th>
                <th>Total Weight</th>
                <th>Farmers</th>
                <th>Lots</th>
                <th>Status</th>
                <th>Logistics Pickup</th>
                <th>Storage Bay</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${existingPools.map(p => `
                <tr>
                  <td><strong style="color: var(--primary); font-family: var(--font-display);">${p.pool_code}</strong></td>
                  <td>${p.produce} (${p.variety || 'Standard'})</td>
                  <td><strong>${p.total_weight} kg</strong> (${(p.total_weight/100).toFixed(1)} Qtl)</td>
                  <td>${p.farmer_count} Farmers</td>
                  <td>${p.lot_count || 0} Lots</td>
                  <td><span class="badge badge-${p.status.toLowerCase()}">${p.status}</span></td>
                  <td>${p.pickup_status ? `<span class="badge badge-weighed">${p.pickup_status}</span>` : `<button onclick="openPickupModal(${p.id})" class="btn btn-outline btn-sm">Schedule 🚚</button>`}</td>
                  <td>${p.storage_name || `<button onclick="openStorageModal(${p.id})" class="btn btn-outline btn-sm">Assign 🏭</button>`}</td>
                  <td>
                    <button onclick="viewPoolDetails(${p.id})" class="btn btn-primary btn-sm" style="padding: 4px 10px; font-size: 12px;">
                      Inspect 🔍
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

function toggleLotSelection(lotId) {
  if (selectedLotIds.has(lotId)) {
    selectedLotIds.delete(lotId);
  } else {
    selectedLotIds.add(lotId);
  }
  recomputePoolMetrics();
}

function toggleSelectAllLots(checked) {
  const checkboxes = document.querySelectorAll('.lot-pool-checkbox');
  checkboxes.forEach(cb => {
    const row = cb.closest('tr');
    if (row.style.display !== 'none') {
      cb.checked = checked;
      const id = Number(cb.value);
      if (checked) selectedLotIds.add(id);
      else selectedLotIds.delete(id);
    }
  });
  recomputePoolMetrics();
}

function filterUnpooledLots(produce) {
  const rows = document.querySelectorAll('#unpooled-table tbody tr');
  rows.forEach(r => {
    r.style.display = (!produce || r.dataset.produce === produce) ? '' : 'none';
  });
}

function recomputePoolMetrics() {
  const checkboxes = Array.from(document.querySelectorAll('.lot-pool-checkbox:checked'));
  const countBadge = document.getElementById('pool-selected-count');
  const produceEl = document.getElementById('calc-produce');
  const weightEl = document.getElementById('calc-total-weight');
  const farmersEl = document.getElementById('calc-farmers');
  const vehicleEl = document.getElementById('calc-vehicle');
  const storageEl = document.getElementById('calc-storage');
  const warningEl = document.getElementById('incompatibility-warning');
  const createBtn = document.getElementById('create-pool-btn');

  if (checkboxes.length === 0) {
    if (countBadge) countBadge.textContent = '0 Lots Selected';
    if (produceEl) produceEl.textContent = '-';
    if (weightEl) weightEl.textContent = '0.0 kg';
    if (farmersEl) farmersEl.textContent = '0 Farmers';
    if (vehicleEl) vehicleEl.textContent = 'Auto / Mini Truck';
    if (warningEl) warningEl.style.display = 'none';
    if (createBtn) createBtn.disabled = true;
    updateGrossValue();
    return;
  }

  const produces = new Set(checkboxes.map(cb => cb.dataset.produce));
  const isCompatible = produces.size === 1;

  if (!isCompatible) {
    warningEl.style.display = 'block';
    createBtn.disabled = true;
    produceEl.textContent = 'MIXED (INCOMPATIBLE)';
    produceEl.style.color = '#dc2626';
    return;
  }

  warningEl.style.display = 'none';
  createBtn.disabled = false;

  const targetProduce = Array.from(produces)[0];
  produceEl.textContent = targetProduce;
  produceEl.style.color = 'var(--primary)';

  const totalWeight = checkboxes.reduce((sum, cb) => sum + parseFloat(cb.dataset.weight || 0), 0);
  const uniqueFarmers = new Set(checkboxes.map(cb => cb.dataset.farmer)).size;

  countBadge.textContent = `${checkboxes.length} Lots Selected`;
  weightEl.textContent = `${totalWeight.toFixed(1)} kg`;
  farmersEl.textContent = `${uniqueFarmers} Farmers`;

  // Vehicle recommendation rule
  if (totalWeight <= 1000) vehicleEl.textContent = 'Mini Truck (1 MT)';
  else if (totalWeight <= 2500) vehicleEl.textContent = 'Tata 407 (2.5 MT)';
  else if (totalWeight <= 4500) vehicleEl.textContent = 'Eicher Pro (4 MT)';
  else vehicleEl.textContent = '10-Wheeler Truck (16 MT)';

  // Storage recommendation
  if (targetProduce.toLowerCase().includes('chilli') || targetProduce.toLowerCase().includes('fruit')) {
    storageEl.textContent = 'Integrated Cold Storage (0–4°C)';
  } else {
    storageEl.textContent = 'Dry Warehouse / Silo';
  }

  updateGrossValue();
}

function updateGrossValue() {
  const weightText = document.getElementById('calc-total-weight')?.textContent || '0';
  const weight = parseFloat(weightText) || 0;
  const price = parseFloat(document.getElementById('calc-price-input')?.value || 0);
  const gross = (weight * price).toFixed(2);
  const display = document.getElementById('calc-gross-value');
  if (display) display.textContent = `₹${parseFloat(gross).toLocaleString()}`;
}

async function executeCreatePool() {
  const checkboxes = Array.from(document.querySelectorAll('.lot-pool-checkbox:checked'));
  if (checkboxes.length === 0) return;

  const lotIds = checkboxes.map(cb => Number(cb.value));
  const produce = document.getElementById('calc-produce').textContent;
  const price = parseFloat(document.getElementById('calc-price-input').value) || 200;

  try {
    const pool = await api.createPool({
      produce,
      variety: 'Assorted Premium Standard',
      lotIds,
      estimatedPricePerKg: price
    });
    showToast(`Pool ${pool.pool_code} created with ${pool.total_weight} kg from ${pool.farmer_count} farmers!`, 'success');
    navigateTo('pooling');
  } catch (err) {
    showToast(`Pool creation failed: ${err.message}`, 'error');
  }
}

async function viewPoolDetails(poolId) {
  try {
    const pool = await api.getPoolById(poolId);
    if (!pool) return;

    const modalBody = document.getElementById('pool-details-content');
    modalBody.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 style="font-family: var(--font-display); font-size: 20px; color: var(--primary);">${pool.pool_code}</h3>
          <span class="badge badge-${pool.status.toLowerCase()}">${pool.status}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; font-size: 13.5px; background: #f8fafc; padding: 14px; border-radius: var(--radius-md);">
          <div><strong>Commodity:</strong> ${pool.produce}</div>
          <div><strong>Variety:</strong> ${pool.variety || 'Standard'}</div>
          <div><strong>Total Quantity:</strong> ${pool.total_weight} kg (${(pool.total_weight/100).toFixed(1)} Qtl)</div>
          <div><strong>Contributing Farmers:</strong> ${pool.farmer_count} Farmers</div>
        </div>

        <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 10px;">Contributing Farmer Lots & Pro-Rata Weight Share</h4>
        <div class="table-responsive" style="max-height: 250px; overflow-y: auto; margin-bottom: 18px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Lot ID</th>
                <th>Farmer Name</th>
                <th>Village</th>
                <th>Weight (kg)</th>
                <th>Share %</th>
              </tr>
            </thead>
            <tbody>
              ${pool.members.map(m => `
                <tr>
                  <td><strong>${m.lot_code}</strong></td>
                  <td>${m.farmer_name}</td>
                  <td>${m.village_name || 'Kankipadu'}</td>
                  <td>${m.weight_kg} kg</td>
                  <td><strong>${m.share_pct}%</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          ${pool.status === 'OPEN' ? `
            <button onclick="openPickupModal(${pool.id}); closeModal('pool-details-modal');" class="btn btn-accent btn-sm">Schedule Pickup 🚚</button>
            <button onclick="openStorageModal(${pool.id}); closeModal('pool-details-modal');" class="btn btn-outline btn-sm">Assign Storage 🏭</button>
          ` : ''}
          <button onclick="closeModal('pool-details-modal')" class="btn btn-primary btn-sm">Close</button>
        </div>
      </div>
    `;

    openModal('pool-details-modal');
  } catch (err) {
    showToast('Failed to load pool details: ' + err.message, 'error');
  }
}

window.renderPoolsPage = renderPoolingPage;
window.renderPoolingPage = renderPoolingPage;
window.viewPoolDetails = viewPoolDetails;
