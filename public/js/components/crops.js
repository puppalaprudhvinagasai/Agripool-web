// public/js/components/crops.js - Crops Management Module (Section 9)
async function renderCropsPage() {
  const crops = await api.getCrops();

  return `
    <div class="crops-page">
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary);">
            🌾 Crops
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Farmer crop declarations, harvest expectations, and produce ready for lot creation.
          </p>
        </div>
        <button onclick="openModal('create-crop-modal')" class="btn btn-primary" style="font-size: 14px; padding: 10px 20px;">
          + Add Crop
        </button>
      </div>

      <!-- Filters -->
      <div class="card" style="padding: 16px 20px; margin-bottom: 20px;">
        <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center;">
          <input type="text" id="crops-search" placeholder="Search crop or farmer..." class="form-control" style="width: 240px; font-size: 13px;" oninput="filterCropsTable()">
          <select id="crops-status-filter" class="form-control" style="width: 180px; font-size: 13px;" onchange="filterCropsTable()">
            <option value="">All Crop Statuses</option>
            <option value="Ready">Ready</option>
            <option value="Harvested">Harvested</option>
            <option value="Added to Lot">Added to Lot</option>
            <option value="Draft">Draft</option>
            <option value="Sold">Sold</option>
          </select>
          <span style="font-size: 13px; color: var(--text-muted); margin-left: auto;">
            Total: <strong>${crops.length}</strong> Crops Registered
          </span>
        </div>
      </div>

      <!-- Crops Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="data-table" id="crops-table">
            <thead>
              <tr>
                <th>Crop ID</th>
                <th>Crop Name</th>
                <th>Farmer</th>
                <th>Village</th>
                <th>Quantity (kg)</th>
                <th>Harvest Date</th>
                <th>Quality Grade</th>
                <th>Storage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${crops.length === 0 ? `
                <tr>
                  <td colspan="10" style="text-align: center; padding: 28px; color: var(--text-secondary);">
                    No crops declared yet. Click "+ Add Crop" to record your harvest expectations.
                  </td>
                </tr>
              ` : crops.map(c => `
                <tr data-status="${c.status}" data-name="${c.crop_name}">
                  <td><strong>CRP-${String(c.id).padStart(4, '0')}</strong></td>
                  <td><strong>${c.crop_name}</strong></td>
                  <td>
                    <div>${c.farmer_name}</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">${c.farmer_code}</div>
                  </td>
                  <td>${c.village || 'Kankipadu'}</td>
                  <td><strong>${c.quantity} kg</strong></td>
                  <td>${c.expected_harvest_date || 'Harvested'}</td>
                  <td><span class="badge ${c.quality_grade === 'GRADE_A' ? 'badge-settled' : 'badge-weighed'}">${c.quality_grade}</span></td>
                  <td>${c.storage_status || 'On Farm'}</td>
                  <td><span class="badge badge-${c.status.toLowerCase().replace(/\s+/g, '-')}">${c.status}</span></td>
                  <td>
                    ${c.status === 'Ready' || c.status === 'Harvested' ? `
                      <button onclick="openCreateLotFromCrop(${c.farmer_id}, '${c.crop_name}', ${c.quantity})" class="btn btn-primary btn-sm" style="padding: 4px 10px; font-size: 11px;">
                        Issue Lot 🏷️
                      </button>
                    ` : `
                      <span style="font-size: 11px; color: var(--text-muted);">Assigned</span>
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

function filterCropsTable() {
  const q = document.getElementById('crops-search')?.value.toLowerCase() || '';
  const status = document.getElementById('crops-status-filter')?.value || '';
  const rows = document.querySelectorAll('#crops-table tbody tr');
  rows.forEach(r => {
    const textMatch = !q || r.textContent.toLowerCase().includes(q);
    const statusMatch = !status || r.dataset.status === status;
    r.style.display = (textMatch && statusMatch) ? '' : 'none';
  });
}

function openCreateLotFromCrop(farmerId, cropName, qty) {
  openModal('create-lot-modal');
  const selFarmer = document.getElementById('lot-form-farmer-id');
  const selProduce = document.getElementById('lot-form-produce');
  const inpQty = document.getElementById('lot-form-quantity');
  if (selFarmer) selFarmer.value = farmerId;
  if (selProduce) selProduce.value = cropName;
  if (inpQty) inpQty.value = qty;
}

async function handleCreateCropSubmit(e) {
  e.preventDefault();
  const farmerId = Number(document.getElementById('crop-form-farmer-id').value);
  const cropName = document.getElementById('crop-form-name').value;
  const category = document.getElementById('crop-form-category').value;
  const quantity = Number(document.getElementById('crop-form-quantity').value);
  const harvestDate = document.getElementById('crop-form-harvest-date').value;
  const qualityGrade = document.getElementById('crop-form-quality').value;
  const village = document.getElementById('crop-form-village').value;
  const storageStatus = document.getElementById('crop-form-storage').value;

  try {
    await api.createCrop({
      farmer_id: farmerId,
      crop_name: cropName,
      category,
      quantity,
      expected_harvest_date: harvestDate,
      quality_grade: qualityGrade,
      village,
      storage_status: storageStatus,
      status: 'Ready'
    });
    closeModal('create-crop-modal');
    showToast(`Crop "${cropName}" (${quantity} kg) registered successfully!`, 'success');
    navigateTo('crops');
  } catch (err) {
    showToast('Failed to add crop: ' + err.message, 'error');
  }
}

window.renderCropsPage = renderCropsPage;
window.filterCropsTable = filterCropsTable;
window.openCreateLotFromCrop = openCreateLotFromCrop;
window.handleCreateCropSubmit = handleCreateCropSubmit;
