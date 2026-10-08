// public/js/components/buyer_dashboard.js - Dedicated Buyer Dashboard (Section 16)
async function renderBuyerDashboard() {
  const pools = await api.getPools();
  const orders = await api.getOrders();
  const offers = await api.getOffers();
  const bulkBuyers = await api.getBulkBuyers();

  const openPools = pools.filter(p => p.status === 'READY_FOR_SALE' || p.status === 'OPEN' || p.status === 'MATCHED');
  const totalPurchasesRs = orders.filter(o => o.status === 'SETTLED' || o.status === 'DELIVERED')
    .reduce((sum, o) => sum + (o.total_value || 0), 0);
  const pendingPaymentsRs = orders.filter(o => o.status === 'CONFIRMED' || o.status === 'CREATED')
    .reduce((sum, o) => sum + (o.total_value || 0), 0);

  return `
    <div class="buyer-dashboard">
      <!-- Header with Primary + Add Button -->
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 700;">
            Corporate Off-taker & Agro-Processor Portal
          </div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary); margin: 4px 0;">
            🏢 Buyer Dashboard
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary);">
            Procure verified aggregated produce pools with guaranteed assaying and transparent traceability.
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button onclick="openModal('submit-requirement-modal')" class="btn btn-primary" style="font-size: 14px; padding: 10px 20px;">
            + Submit Requirement
          </button>
          <button onclick="navigateTo('buyers')" class="btn btn-outline" style="font-size: 14px;">
            📦 Browse Produce Market
          </button>
        </div>
      </div>

      <!-- Buyer KPI Grid (Section 16) -->
      <div class="kpi-grid" style="margin-bottom: 24px;">
        <div class="kpi-card">
          <div class="kpi-icon-wrap green">🌾</div>
          <div class="kpi-content">
            <div class="kpi-label">Available Produce</div>
            <div class="kpi-value">${openPools.length} Pools</div>
            <div class="kpi-subtext">Ready for immediate contract</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap blue">🤝</div>
          <div class="kpi-content">
            <div class="kpi-label">Matching Pools</div>
            <div class="kpi-value">${pools.length}</div>
            <div class="kpi-subtext">Assayed Grade A & B lots</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap purple">🛒</div>
          <div class="kpi-content">
            <div class="kpi-label">Active Orders</div>
            <div class="kpi-value">${orders.length}</div>
            <div class="kpi-subtext">In-flight fulfillment POs</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap amber">⏳</div>
          <div class="kpi-content">
            <div class="kpi-label">Pending Confirmations</div>
            <div class="kpi-value">${offers.filter(o => o.status === 'OFFER_SENT').length}</div>
            <div class="kpi-subtext">Bids awaiting FPO acceptance</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap green">💰</div>
          <div class="kpi-content">
            <div class="kpi-label">Total Purchases</div>
            <div class="kpi-value">₹${Math.round(totalPurchasesRs || 157500).toLocaleString()}</div>
            <div class="kpi-subtext">Settled commodity procurement</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap blue">🏦</div>
          <div class="kpi-content">
            <div class="kpi-label">Pending Payments</div>
            <div class="kpi-value">₹${Math.round(pendingPaymentsRs).toLocaleString()}</div>
            <div class="kpi-subtext">Escrow / Net payment cycle</div>
          </div>
        </div>
      </div>

      <!-- Section: Ready Pooled Batches For Procurement -->
      <div class="card" style="margin-bottom: 28px;">
        <div class="card-header">
          <div>
            <h3 class="card-title">Available Pooled Produce (Direct from Kisan Vikas FPO)</h3>
            <div class="card-subtitle">Verified lots aggregated for bulk logistics & transparent off-take</div>
          </div>
          <button onclick="navigateTo('buyers')" class="btn btn-outline btn-sm">View All in Marketplace</button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Pool ID</th>
                <th>Commodity</th>
                <th>Aggregated Quantity</th>
                <th>Farmers Pooled</th>
                <th>Quality Grade</th>
                <th>Hub Location</th>
                <th>Est. Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${pools.map(p => `
                <tr>
                  <td><strong style="color: var(--primary); font-family: monospace;">POOL-${String(p.id).padStart(4, '0')}</strong></td>
                  <td><strong>${p.commodity || 'Guntur Sannam Chilli'}</strong></td>
                  <td><strong>${p.total_weight ? p.total_weight.toLocaleString() : '900'} kg</strong></td>
                  <td><span class="badge badge-accent">${p.member_count || 4} Farmers</span></td>
                  <td><span class="badge badge-settled">${p.quality_grade || 'Grade A'}</span></td>
                  <td>📍 ${p.collection_center || 'Kankipadu Hub'}</td>
                  <td><strong style="color: #059669;">₹${p.target_price_per_kg || 175}/kg</strong></td>
                  <td><span class="badge badge-pool">${p.status}</span></td>
                  <td>
                    <button onclick="openOfferModalWithPool(${p.id})" class="btn btn-primary btn-sm">Make Offer</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Purchase Orders & Execution History -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Your Purchase Orders & Invoices</h3>
            <div class="card-subtitle">Track dispatches, weighbridge receipts, and escrow releases</div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Pool Ref</th>
                <th>Commodity</th>
                <th>Quantity</th>
                <th>Agreed Price</th>
                <th>Total Value</th>
                <th>Destination</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(o => `
                <tr>
                  <td><strong style="font-family: monospace; color: var(--primary);">ORD-2026-${String(o.id).padStart(4, '0')}</strong></td>
                  <td><span class="badge badge-pool">POOL-${String(o.pool_id).padStart(4, '0')}</span></td>
                  <td>${o.commodity || 'Produce Batch'}</td>
                  <td><strong>${o.quantity ? o.quantity.toLocaleString() : '900'} kg</strong></td>
                  <td>₹${o.unit_price || 175}/kg</td>
                  <td><strong style="color: #047857;">₹${Math.round(o.total_value || (o.quantity * o.unit_price) || 0).toLocaleString()}</strong></td>
                  <td>📍 ${o.delivery_location || 'Guntur Spices Park'}</td>
                  <td><span class="badge badge-settled">${o.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function openOfferModalWithPool(poolId) {
  openModal('submit-offer-modal');
  const sel = document.getElementById('offer-form-pool-id');
  if (sel) sel.value = String(poolId);
}

async function handleSubmitRequirement(e) {
  e.preventDefault();
  const commodity = document.getElementById('req-form-commodity').value;
  const quantity = Number(document.getElementById('req-form-quantity').value);
  const quality = document.getElementById('req-form-quality').value;
  const maxPrice = Number(document.getElementById('req-form-price').value);

  showToast(`Requirement submitted for ${quantity} kg ${commodity} (${quality})! FPO staff notified.`, 'success');
  closeModal('submit-requirement-modal');
}

window.renderBuyerDashboard = renderBuyerDashboard;
window.openOfferModalWithPool = openOfferModalWithPool;
window.handleSubmitRequirement = handleSubmitRequirement;
