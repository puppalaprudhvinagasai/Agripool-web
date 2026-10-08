// public/js/components/lots.js - Digital Lot Passports List and Passport Inspector
async function renderLotsPage() {
  const lots = await api.getLots({ limit: 100 });
  const villages = await api.getVillages();

  return `
    <div class="lots-page">
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary);">
            🏷️ Lots
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Every produce lot receives a tamper-evident digital identity connecting farmer, scale, assay certificates, and final settlement.
          </p>
        </div>
        <button onclick="openModal('create-lot-modal')" class="btn btn-primary" style="font-size: 14px; padding: 10px 20px;">
          + Create Lot
        </button>
      </div>

      <!-- Filters Bar -->
      <div class="card" style="padding: 16px 20px; margin-bottom: 20px;">
        <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center;">
          <input type="text" id="lots-search" placeholder="Search lot ID or farmer..." class="form-control" style="width: 240px; padding: 7px 12px; font-size: 13px;" oninput="applyLotFilters()">
          
          <select id="lots-filter-status" class="form-control" style="width: 180px; padding: 7px 12px; font-size: 13px;" onchange="applyLotFilters()">
            <option value="">All Lifecycle Stages</option>
            <option value="CREATED">CREATED</option>
            <option value="WEIGHED">WEIGHED</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="POOLED">POOLED</option>
            <option value="STORED">STORED</option>
            <option value="BUYER_MATCHED">BUYER_MATCHED</option>
            <option value="SOLD">SOLD</option>
            <option value="SETTLED">SETTLED</option>
          </select>

          <select id="lots-filter-produce" class="form-control" style="width: 200px; padding: 7px 12px; font-size: 13px;" onchange="applyLotFilters()">
            <option value="">All Commodities</option>
            <option value="Guntur Sannam Chilli">Guntur Sannam Chilli</option>
            <option value="Nizamabad Turmeric">Nizamabad Turmeric</option>
            <option value="Maize (Hybrid)">Maize (Hybrid)</option>
            <option value="Black Gram (Urad)">Black Gram (Urad)</option>
            <option value="Cotton (Bt-II)">Cotton (Bt-II)</option>
            <option value="BPT 5204 Paddy">BPT 5204 Paddy</option>
          </select>

          <button onclick="clearLotFilters()" class="btn btn-outline btn-sm">Reset</button>
        </div>
      </div>

      <!-- Lots Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="data-table" id="lots-table">
            <thead>
              <tr>
                <th>Lot Passport ID</th>
                <th>Farmer</th>
                <th>Produce / Variety</th>
                <th>Net Weight</th>
                <th>Quality Grade</th>
                <th>Moisture</th>
                <th>Lifecycle Status</th>
                <th>Pool Assignment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${lots.length === 0 ? `
                <tr>
                  <td colspan="9" style="text-align: center; padding: 28px; color: var(--text-secondary);">
                    No digital lot passports found. Click "+ Create Lot" to issue your first passport.
                  </td>
                </tr>
              ` : lots.map(l => `
                <tr data-status="${l.current_status}" data-produce="${l.produce}">
                  <td>
                    <div style="font-family: var(--font-display); font-weight: 700; color: var(--primary);">
                      ${l.lot_code}
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted);">${l.created_at.split(' ')[0]}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600;">${l.farmer_name}</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">${l.farmer_code} • ${l.village_name || 'Kankipadu'}</div>
                  </td>
                  <td>
                    <div><strong>${l.produce}</strong></div>
                    <div style="font-size: 11.5px; color: var(--text-secondary);">${l.variety || 'Standard'}</div>
                  </td>
                  <td>
                    ${l.actual_weight ? `<strong>${l.actual_weight} kg</strong>` : `<span style="color: var(--text-muted);">~${l.estimated_quantity} kg (Est)</span>`}
                  </td>
                  <td>
                    <span class="badge ${l.grade === 'GRADE_A' ? 'badge-settled' : 'badge-weighed'}">${l.grade || 'PENDING'}</span>
                  </td>
                  <td>${l.moisture_percentage ? `${l.moisture_percentage}%` : 'N/A'}</td>
                  <td>
                    <span class="badge badge-${l.current_status.toLowerCase()}">${l.current_status}</span>
                  </td>
                  <td>
                    ${l.pool_code ? `<span style="font-weight: 600; color: #7c3aed;">${l.pool_code}</span>` : `<span style="color: var(--text-muted); font-size: 12px;">Unpooled</span>`}
                  </td>
                  <td>
                    <button onclick="viewLotPassport(${l.id})" class="btn btn-outline btn-sm" style="padding: 4px 10px; font-size: 12px; gap: 4px;">
                      🔍 Passport
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

function applyLotFilters() {
  const q = document.getElementById('lots-search').value.toLowerCase();
  const status = document.getElementById('lots-filter-status').value;
  const produce = document.getElementById('lots-filter-produce').value;

  const rows = document.querySelectorAll('#lots-table tbody tr');
  rows.forEach(r => {
    const textMatch = !q || r.textContent.toLowerCase().includes(q);
    const statusMatch = !status || r.dataset.status === status;
    const produceMatch = !produce || r.dataset.produce === produce;

    r.style.display = (textMatch && statusMatch && produceMatch) ? '' : 'none';
  });
}

function clearLotFilters() {
  document.getElementById('lots-search').value = '';
  document.getElementById('lots-filter-status').value = '';
  document.getElementById('lots-filter-produce').value = '';
  applyLotFilters();
}

async function viewLotPassport(lotId) {
  try {
    const lot = await api.getLotById(lotId);
    if (!lot) return;

    const modalBody = document.getElementById('passport-modal-content');
    modalBody.innerHTML = `
      <div class="passport-card">
        <div class="passport-stamp">DIGITAL PASSPORT</div>
        <div style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); font-weight: 700;">Government of AP / FPO Certified Lot</div>
        <div class="passport-id">${lot.lot_code}</div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 18px 0; font-size: 13.5px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 14px 0;">
          <div>
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Farmer Details</div>
            <strong>${lot.farmer_name}</strong> (${lot.farmer_code})<br>
            <span>📱 ${lot.farmer_mobile}</span><br>
            <span>📍 ${lot.village_name}, ${lot.mandal}, ${lot.district}</span>
          </div>
          <div>
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Produce & Quality</div>
            <strong>${lot.produce}</strong> — ${lot.variety}<br>
            <span>⚖️ Certified Net Weight: <strong>${lot.actual_weight || '~' + lot.estimated_quantity} kg</strong></span><br>
            <span>🔬 Grade: <strong>${lot.grade}</strong> (Moisture: ${lot.moisture_percentage}%)</span>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 10px; color: var(--text-secondary);">
            Full Lifecycle Journey
          </div>
          <div class="timeline">
            ${lot.timeline.map(t => `
              <div class="timeline-item ${t.isCompleted ? 'completed' : ''} ${t.isCurrent ? 'current' : ''}">
                <div class="timeline-dot"></div>
                <div class="timeline-title">${t.stage}</div>
                <div class="timeline-desc">
                  ${t.isCompleted ? (t.date ? `Completed on ${t.date}` : 'Verified & Completed') : 'Pending next operation'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border); padding-top: 14px;">
          <div>
            <div style="font-size: 11px; color: var(--text-muted);">Direct Bank Account on Record</div>
            <code style="font-size: 12px; font-weight: 700;">${lot.bank_account_no} (${lot.ifsc_code})</code>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="window.print()" class="btn btn-outline btn-sm">🖨️ Print Receipt Slip</button>
            <button onclick="closeModal('passport-modal')" class="btn btn-primary btn-sm">Close</button>
          </div>
        </div>
      </div>
    `;

    openModal('passport-modal');
  } catch (err) {
    showToast('Failed to load lot passport: ' + err.message, 'error');
  }
}

window.renderLotsPage = renderLotsPage;
window.viewLotPassport = viewLotPassport;
