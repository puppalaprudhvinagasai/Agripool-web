// public/js/components/seller_dashboard.js - Dedicated Seller Dashboard (Section 13, 14, 15)
async function renderSellerDashboard() {
  const sellers = await api.getSellers();
  const listings = await api.getListings();
  const offers = await api.getOffers();
  const orders = await api.getOrders();
  const settlements = await api.getSettlements();

  const totalInventoryKg = listings.reduce((sum, l) => sum + (l.available_quantity || 0), 0);
  const activeListings = listings.filter(l => l.status === 'ACTIVE');
  const reservedListings = listings.filter(l => l.status === 'RESERVED');
  const soldListings = listings.filter(l => l.status === 'SOLD');

  return `
    <div class="seller-dashboard">
      <!-- Header with Primary + Add Button -->
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 700;">
            Seller Portal • Associated with Kisan Vikas FPO
          </div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary); margin: 4px 0;">
            🏢 Seller Dashboard
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary);">
            Manage commercial lots, published sell listings, buyer offers, and sales settlements.
          </p>
        </div>
        <button onclick="openModal('create-listing-modal')" class="btn btn-primary" style="font-size: 14px; padding: 10px 20px;">
          + Create Selling Listing
        </button>
      </div>

      <!-- Seller KPI Grid (Section 13) -->
      <div class="kpi-grid" style="margin-bottom: 24px;">
        <div class="kpi-card">
          <div class="kpi-icon-wrap green">📦</div>
          <div class="kpi-content">
            <div class="kpi-label">Available Inventory</div>
            <div class="kpi-value">${(totalInventoryKg / 100).toFixed(1)} Qtl</div>
            <div class="kpi-subtext">${totalInventoryKg.toLocaleString()} kg active listings</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap amber">⏳</div>
          <div class="kpi-content">
            <div class="kpi-label">Reserved Quantity</div>
            <div class="kpi-value">${reservedListings.length} Lots</div>
            <div class="kpi-subtext">Under buyer negotiation</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap blue">✅</div>
          <div class="kpi-content">
            <div class="kpi-label">Sold Quantity</div>
            <div class="kpi-value">${soldListings.length} Lots</div>
            <div class="kpi-subtext">Completed sales contracts</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap purple">💬</div>
          <div class="kpi-content">
            <div class="kpi-label">Active Offers</div>
            <div class="kpi-value">${offers.length}</div>
            <div class="kpi-subtext">Buyer bids awaiting response</div>
          </div>
        </div>
      </div>

      <!-- Active Selling Listings (Section 14) -->
      <div class="card" style="margin-bottom: 28px;">
        <div class="card-header">
          <div>
            <h3 class="card-title">Commercial Selling Listings</h3>
            <div class="card-subtitle">Active produce lots published to verified corporate off-takers</div>
          </div>
          <button onclick="openModal('create-listing-modal')" class="btn btn-outline btn-sm">+ Add Listing</button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Listing ID</th>
                <th>Commodity / Variety</th>
                <th>Available Quantity</th>
                <th>Min Order Qty</th>
                <th>Expected Price</th>
                <th>Quality Grade</th>
                <th>Location</th>
                <th>Storage Bay</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${listings.map(l => `
                <tr>
                  <td><strong style="color: var(--primary); font-family: monospace;">LST-2026-${String(l.id).padStart(4, '0')}</strong></td>
                  <td><strong>${l.crop_name || 'Guntur Sannam Chilli'}</strong></td>
                  <td><strong>${l.available_quantity ? l.available_quantity.toLocaleString() : '1,000'} kg</strong></td>
                  <td>${l.min_order_quantity ? l.min_order_quantity.toLocaleString() : '500'} kg</td>
                  <td><strong style="color: #059669;">₹${l.expected_price_per_kg || '165'}/kg</strong></td>
                  <td><span class="badge badge-accent">${l.quality_grade || 'Grade A'}</span></td>
                  <td>📍 ${l.location || 'Kankipadu Cluster'}</td>
                  <td><span class="badge badge-storage">${l.storage_status || 'Cold Storage Bay B-04'}</span></td>
                  <td>
                    <span class="badge ${l.status === 'ACTIVE' ? 'badge-settled' : l.status === 'RESERVED' ? 'badge-pool' : 'badge-draft'}">
                      ${l.status}
                    </span>
                  </td>
                  <td>
                    <button onclick="showToast('Listing LST-2026-${String(l.id).padStart(4, '0')} details', 'info')" class="btn btn-outline btn-sm">Edit</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Buyer Offers & Negotiations (Section 15) -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Buyer Offers & Bids</h3>
            <div class="card-subtitle">Review incoming pricing bids, counter-offer, or accept into formal PO</div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Offer ID</th>
                <th>Buyer Company</th>
                <th>Listing / Pool Ref</th>
                <th>Offered Rate</th>
                <th>Requested Qty</th>
                <th>Total Value</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${offers.map(o => `
                <tr>
                  <td><strong style="color: var(--primary); font-family: monospace;">OFF-2026-${String(o.id).padStart(4, '0')}</strong></td>
                  <td><strong>${o.buyer_name || 'ITC Agri Business'}</strong></td>
                  <td><span class="badge badge-pool">${o.listing_id ? 'LST-' + o.listing_id : 'POOL-0001'}</span></td>
                  <td><strong style="color: #047857;">₹${o.offered_price_per_kg}/kg</strong></td>
                  <td>${o.quantity_requested ? o.quantity_requested.toLocaleString() : '900'} kg</td>
                  <td><strong>₹${Math.round((o.offered_price_per_kg || 160) * (o.quantity_requested || 900)).toLocaleString()}</strong></td>
                  <td>${o.created_at ? o.created_at.split('T')[0] : '2026-10-06'}</td>
                  <td>
                    <span class="badge ${o.status === 'ACCEPTED' ? 'badge-settled' : o.status === 'OFFER_SENT' ? 'badge-pool' : 'badge-draft'}">
                      ${o.status}
                    </span>
                  </td>
                  <td>
                    ${o.status === 'OFFER_SENT' || o.status === 'SUBMITTED' ? `
                      <button onclick="respondOfferAction(${o.id}, 'ACCEPTED')" class="btn btn-primary btn-sm" style="background: #10b981;">Accept</button>
                      <button onclick="respondOfferAction(${o.id}, 'REJECTED')" class="btn btn-outline btn-sm" style="color: #dc2626;">Reject</button>
                    ` : `
                      <span style="font-size: 12px; color: var(--text-muted);">Decided</span>
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

async function respondOfferAction(offerId, status) {
  try {
    await api.updateOfferStatus(offerId, { status });
    showToast(`Offer #${offerId} ${status.toLowerCase()}!`, 'success');
    navigateTo('seller');
  } catch (err) {
    showToast('Failed to update offer: ' + err.message, 'error');
  }
}

async function handleCreateListingSubmit(e) {
  e.preventDefault();
  const cropName = document.getElementById('listing-form-crop').value;
  const quantity = Number(document.getElementById('listing-form-qty').value);
  const minQty = Number(document.getElementById('listing-form-minqty').value);
  const price = Number(document.getElementById('listing-form-price').value);
  const quality = document.getElementById('listing-form-quality').value;
  const location = document.getElementById('listing-form-location').value;

  try {
    await api.createListing({
      seller_id: 1,
      crop_name: cropName,
      available_quantity: quantity,
      min_order_quantity: minQty,
      expected_price_per_kg: price,
      quality_grade: quality,
      location: location,
      status: 'ACTIVE'
    });
    closeModal('create-listing-modal');
    showToast('Listing published successfully to buyers!', 'success');
    navigateTo('seller');
  } catch (err) {
    showToast('Failed to create listing: ' + err.message, 'error');
  }
}

window.renderSellerDashboard = renderSellerDashboard;
window.respondOfferAction = respondOfferAction;
window.handleCreateListingSubmit = handleCreateListingSubmit;
