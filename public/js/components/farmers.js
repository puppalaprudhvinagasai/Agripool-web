// public/js/components/farmers.js - Farmer Management Module (Section 7)
async function renderFarmersPage() {
  const farmers = await api.getFarmers({ limit: 100 });

  return `
    <div class="farmers-page">
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary);">
            👨‍🌾 Farmers
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Manage smallholder farmer profiles, land holdings, harvest declarations, and direct bank links.
          </p>
        </div>
        <button onclick="openModal('onboard-farmer-modal')" class="btn btn-primary" style="font-size: 14px; padding: 10px 20px;">
          + Add Farmer
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="card" style="padding: 16px 20px; margin-bottom: 20px;">
        <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center;">
          <input type="text" id="farmers-search-input" placeholder="Search by name, code, phone or village..." class="form-control" style="width: 280px; font-size: 13px;" oninput="filterFarmersView(this.value)">
          <select id="farmers-village-filter" class="form-control" style="width: 180px; font-size: 13px;" onchange="filterFarmersVillage(this.value)">
            <option value="">All Villages</option>
            <option value="Kankipadu">Kankipadu</option>
            <option value="Thotlavalluru">Thotlavalluru</option>
            <option value="Gudivada Rural">Gudivada Rural</option>
            <option value="Mangalagiri Rural">Mangalagiri Rural</option>
            <option value="Tenali North">Tenali North</option>
          </select>
          <span style="font-size: 13px; color: var(--text-muted); margin-left: auto;">
            Showing <strong>${farmers.length}</strong> Farmers
          </span>
        </div>
      </div>

      <!-- Farmers Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="data-table" id="farmers-master-table">
            <thead>
              <tr>
                <th>Farmer ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Village</th>
                <th>FPO / SHG</th>
                <th>Land (Acres)</th>
                <th>Active Lots</th>
                <th>Total Quantity</th>
                <th>Payment Status</th>
                <th>Verification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${farmers.length === 0 ? `
                <tr>
                  <td colspan="11" style="text-align: center; padding: 28px; color: var(--text-secondary);">
                    No farmer records found.
                  </td>
                </tr>
              ` : farmers.map(f => `
                <tr data-village="${f.village_name || ''}">
                  <td><strong style="color: var(--primary); font-family: var(--font-display);">${f.farmer_code}</strong></td>
                  <td><strong>${f.name}</strong></td>
                  <td>${f.mobile}</td>
                  <td>${f.village_name || 'Kankipadu'}</td>
                  <td>${f.fpo_name || 'Kisan Vikas FPO'}</td>
                  <td>${f.farm_size_acres} Acres</td>
                  <td><span class="badge badge-weighed">${f.lot_count || 0} Lots</span></td>
                  <td><strong>${f.total_produce_kg ? `${f.total_produce_kg} kg` : '0 kg'}</strong></td>
                  <td><span class="badge badge-settled">Bank Linked</span></td>
                  <td><span class="badge badge-settled">${f.status || 'Verified'}</span></td>
                  <td>
                    <button onclick="viewFarmerDetails(${f.id})" class="btn btn-outline btn-sm" style="padding: 4px 8px; font-size: 11px;">
                      View 🔍
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

function filterFarmersView(query) {
  const q = query.toLowerCase();
  const rows = document.querySelectorAll('#farmers-master-table tbody tr');
  rows.forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function filterFarmersVillage(village) {
  const rows = document.querySelectorAll('#farmers-master-table tbody tr');
  rows.forEach(r => {
    r.style.display = (!village || r.dataset.village.includes(village)) ? '' : 'none';
  });
}

async function viewFarmerDetails(farmerId) {
  const f = await api.getFarmerById(farmerId);
  if (!f) return;
  alert(`Farmer Profile:\n\nName: ${f.name} (${f.farmer_code})\nMobile: ${f.mobile}\nVillage: ${f.village_name}, ${f.district}\nBank A/C: ${f.bank_account_no} (${f.ifsc_code})\nLots Created: ${f.lots ? f.lots.length : 0}`);
}

window.renderFarmersPage = renderFarmersPage;
window.filterFarmersView = filterFarmersView;
window.filterFarmersVillage = filterFarmersVillage;
window.viewFarmerDetails = viewFarmerDetails;
