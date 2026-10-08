// public/js/components/live_stock.js - Platform-wide Live Commodity Stock Dashboard (Requirement #18)
async function renderLiveStockPage() {
  let stockData = [];
  try {
    stockData = await api.getLiveStock();
  } catch (err) {
    console.error('Error fetching live stock:', err);
    stockData = [];
  }

  const totalAvailableKg = stockData.reduce((sum, s) => sum + (s.availableQuantityKg || 0), 0);
  const totalPooledKg = stockData.reduce((sum, s) => sum + (s.pooledQuantityKg || 0), 0);
  const totalReservedKg = stockData.reduce((sum, s) => sum + (s.reservedQuantityKg || 0), 0);
  const totalSoldKg = stockData.reduce((sum, s) => sum + (s.soldQuantityKg || 0), 0);

  return `
    <div class="livestock-page-container">
      <!-- Page Header -->
      <div class="page-header" style="margin-bottom: 24px;">
        <div class="page-title-wrap">
          <h2 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; display: flex; align-items: center; gap: 10px;">
            <span>📦</span> Platform-Wide Live Stock System
          </h2>
          <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">
            Real-time crop-by-crop aggregation inventory tracked across certified regional warehouse bays & digital pools.
          </p>
        </div>
        <div class="header-actions">
          <button onclick="navigateTo('market-prices')" class="btn btn-outline btn-sm">
            📈 View Market Prices
          </button>
          <button onclick="navigateTo('pools')" class="btn btn-primary btn-sm">
            🤝 View Active Pools
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin-bottom: 28px;">
        <div class="card" style="margin-bottom: 0; padding: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px;">Total Available Stock</div>
          <div style="font-size: 28px; font-weight: 800; color: var(--primary); margin-top: 4px;">${totalAvailableKg.toLocaleString()} kg</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">(${(totalAvailableKg / 100).toFixed(1)} Quintals)</div>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px;">Currently Pooled</div>
          <div style="font-size: 28px; font-weight: 800; color: #7c3aed; margin-top: 4px;">${totalPooledKg.toLocaleString()} kg</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Assigned to Buyer Contracts</div>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px;">Reserved for Orders</div>
          <div style="font-size: 28px; font-weight: 800; color: #d97706; margin-top: 4px;">${totalReservedKg.toLocaleString()} kg</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Pending Escrow Dispatch</div>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px;">Total Sold & Settled</div>
          <div style="font-size: 28px; font-weight: 800; color: #16a34a; margin-top: 4px;">${totalSoldKg.toLocaleString()} kg</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Successfully Fulfilled</div>
        </div>
      </div>

      <!-- Commodity Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 32px;">
        ${stockData.map(item => `
          <div class="card" style="margin-bottom: 0; padding: 24px; border-left: 4px solid var(--primary); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                  <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">${item.category || 'Commodity'}</span>
                  <h3 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${item.crop}</h3>
                </div>
                <span class="badge badge-weighed" style="font-size: 12px;">${item.quality}</span>
              </div>

              <!-- Metrics -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 13px; color: var(--text-secondary);">Available Stock:</span>
                  <strong style="font-size: 15px; color: var(--primary);">${(item.availableQuantityKg || 0).toLocaleString()} kg</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 13px; color: var(--text-secondary);">Pooled Quantity:</span>
                  <span style="font-size: 13px; font-weight: 600; color: #7c3aed;">${(item.pooledQuantityKg || 0).toLocaleString()} kg</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 13px; color: var(--text-secondary);">Reserved in POs:</span>
                  <span style="font-size: 13px; font-weight: 600; color: #d97706;">${(item.reservedQuantityKg || 0).toLocaleString()} kg</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-size: 13px; color: var(--text-secondary);">Delivered & Sold:</span>
                  <span style="font-size: 13px; font-weight: 600; color: #16a34a;">${(item.soldQuantityKg || 0).toLocaleString()} kg</span>
                </div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">
                <span>📍 ${item.location}</span>
                <span>Updated: ${new Date(item.lastUpdated).toLocaleDateString()}</span>
              </div>
              <div style="display: flex; gap: 8px;">
                <button onclick="navigateTo('market/${item.crop.toLowerCase()}')" class="btn btn-outline btn-sm" style="flex: 1;">
                  📊 Market Details
                </button>
                <button onclick="navigateTo('pools')" class="btn btn-primary btn-sm" style="flex: 1;">
                  🤝 View Batches
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Comprehensive Stock Ledger Table -->
      <div class="card" style="padding: 24px;">
        <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 16px;">📋 Consolidated Physical Stock Ledger</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Crop / Commodity</th>
                <th>Category</th>
                <th>Available Quantity</th>
                <th>In Active Pools</th>
                <th>Reserved in PO</th>
                <th>Sold / Settled</th>
                <th>Certified Location</th>
                <th>Quality Grade</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${stockData.map(row => `
                <tr>
                  <td><strong>${row.crop}</strong></td>
                  <td><span class="badge">${row.category}</span></td>
                  <td><strong style="color: var(--primary);">${(row.availableQuantityKg || 0).toLocaleString()} kg</strong></td>
                  <td>${(row.pooledQuantityKg || 0).toLocaleString()} kg</td>
                  <td>${(row.reservedQuantityKg || 0).toLocaleString()} kg</td>
                  <td>${(row.soldQuantityKg || 0).toLocaleString()} kg</td>
                  <td>📍 ${row.location}</td>
                  <td><span class="badge badge-verified">${row.quality}</span></td>
                  <td>
                    <button onclick="navigateTo('market/${row.crop.toLowerCase()}')" class="btn btn-outline btn-xs">
                      Details →
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

window.renderLiveStockPage = renderLiveStockPage;
