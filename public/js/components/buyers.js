// public/js/components/buyers.js - Bulk Buyers Management & Marketplace (Section 6, 17, 18)
async function renderBuyersPage() {
  const bulkBuyers = await api.getBulkBuyers();
  const pools = await api.getPools();
  const offers = await api.getOffers();

  return `
    <div class="buyers-page">
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary);">
            🏢 Buyers
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Verified bulk buyers, institutional corporate procurement contracts, and produce marketplace.
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button onclick="openModal('add-bulk-buyer-modal')" class="btn btn-primary" style="font-size: 14px; padding: 10px 20px;">
            + Add Bulk Buyer
          </button>
        </div>
      </div>

      <!-- Navigation Tabs Inside Buyers -->
      <div style="display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
        <button onclick="switchBuyerTab('directory')" id="tab-btn-directory" class="btn btn-outline btn-sm active" style="font-weight: 700;">
          🏢 Bulk Buyers Directory (${bulkBuyers.length})
        </button>
        <button onclick="switchBuyerTab('marketplace')" id="tab-btn-marketplace" class="btn btn-outline btn-sm">
          📦 Browse Pooled Produce (${pools.length})
        </button>
        <button onclick="switchBuyerTab('offers')" id="tab-btn-offers" class="btn btn-outline btn-sm">
          💬 Buyer Offers & Negotiations (${offers.length})
        </button>
      </div>

      <!-- TAB 1: Bulk Buyers Directory (Section 6) -->
      <div id="buyer-tab-directory">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">🏢 Institutional Bulk Buyers</h3>
              <div class="card-subtitle">Verified agro-processors, FMCG brands, and spice exporters</div>
            </div>
            <button onclick="openModal('add-bulk-buyer-modal')" class="btn btn-primary btn-sm">+ Add Bulk Buyer</button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Buyer ID</th>
                  <th>Company / Organization</th>
                  <th>Contact Person</th>
                  <th>Phone / Email</th>
                  <th>Buyer Type</th>
                  <th>Commodity Interest</th>
                  <th>Verification Status</th>
                  <th>Active Orders</th>
                  <th>Total Purchases</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${bulkBuyers.map(b => `
                  <tr>
                    <td><strong>BYR-${String(b.id).padStart(4, '0')}</strong></td>
                    <td>
                      <div><strong>${b.company_name}</strong></div>
                      <div style="font-size: 11px; color: var(--text-secondary);">GST: ${b.gst_number || '37AAACI1681G1Z0'}</div>
                    </td>
                    <td>${b.contact_person || 'Procurement Head'}</td>
                    <td>
                      <div>${b.phone}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">${b.email}</div>
                    </td>
                    <td><span class="badge badge-weighed">${b.buyer_type || 'Agro Processor'}</span></td>
                    <td><strong>Chilli, Turmeric, Maize</strong></td>
                    <td>
                      <span class="badge ${b.is_verified ? 'badge-settled' : 'badge-created'}">
                        ${b.is_verified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </td>
                    <td><span class="badge badge-weighed">${b.active_orders || 0} Orders</span></td>
                    <td><strong style="color: #16a34a;">₹${Math.round(b.total_purchases || 473000).toLocaleString()}</strong></td>
                    <td>
                      <button onclick="openBuyerOfferModalForBuyer(${b.id}, '${b.company_name}')" class="btn btn-outline btn-sm" style="padding: 4px 8px; font-size: 11px;">
                        Make Offer 📝
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: Browse Produce Marketplace (Section 17) -->
      <div id="buyer-tab-marketplace" style="display: none;">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">📦 Browse Pooled Produce</h3>
              <div class="card-subtitle">Verified multi-farmer clusters ready for corporate purchase</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
            ${pools.map(p => `
              <div class="card" style="margin-bottom: 0; border: 2px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                  <div>
                    <span class="badge badge-${p.status.toLowerCase()}">${p.status}</span>
                    <h3 style="font-size: 18px; font-weight: 800; color: var(--primary); margin-top: 4px;">${p.produce}</h3>
                    <div style="font-size: 12px; color: var(--text-secondary);">${p.variety || 'Certified Commercial Grade'}</div>
                  </div>
                  <strong style="font-family: var(--font-display); font-size: 16px;">${p.pool_code}</strong>
                </div>

                <div style="background: #f8fafc; border-radius: var(--radius-md); padding: 12px; margin-bottom: 14px; font-size: 13px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <div>Quantity: <strong>${p.total_weight} kg</strong></div>
                  <div>Farmers: <strong>${p.farmer_count}</strong></div>
                  <div>Quality: <span class="badge badge-settled">Grade A</span></div>
                  <div>Location: <strong>Krishna District</strong></div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border); padding-top: 12px;">
                  <div>
                    <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted);">Reserve Benchmark</div>
                    <div style="font-size: 16px; font-weight: 800; color: #047857;">₹${p.estimated_price_per_kg || 220}/kg</div>
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <button onclick="viewPoolDetails(${p.id})" class="btn btn-outline btn-sm">View Pool</button>
                    <button onclick="openSubmitBuyerOfferModal(${p.id}, '${p.produce}', ${p.total_weight}, ${p.estimated_price_per_kg || 220})" class="btn btn-primary btn-sm">Make Offer</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- TAB 3: Buyer Offers & Negotiations (Section 18) -->
      <div id="buyer-tab-offers" style="display: none;">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">💬 Buyer Offers & Negotiations</h3>
              <div class="card-subtitle">Trade offers submitted by corporate procurement teams</div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Offer ID</th>
                  <th>Buyer Name</th>
                  <th>Target Produce / Pool</th>
                  <th>Quantity (kg)</th>
                  <th>Offer Price (₹/kg)</th>
                  <th>Total Amount</th>
                  <th>Counter Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${offers.map(o => `
                  <tr>
                    <td><strong>${o.offer_code}</strong></td>
                    <td><strong>${o.buyer_name}</strong></td>
                    <td><span style="color: var(--primary); font-weight: 600;">${o.pool_code || o.listing_crop || 'Produce Lot'}</span></td>
                    <td><strong>${o.quantity} kg</strong></td>
                    <td><strong>₹${o.offer_price}/kg</strong></td>
                    <td><strong style="color: #16a34a;">₹${o.total_amount.toLocaleString()}</strong></td>
                    <td>${o.counter_price ? `<span style="color: #d97706; font-weight: 700;">₹${o.counter_price}/kg</span>` : '-'}</td>
                    <td><span class="badge ${o.status === 'Accepted' ? 'badge-settled' : (o.status === 'Counter Offer' ? 'badge-pickup' : 'badge-weighed')}">${o.status}</span></td>
                    <td>
                      ${o.status === 'Offer Sent' || o.status === 'Counter Offer' ? `
                        <div style="display: flex; gap: 4px;">
                          <button onclick="handleAcceptOffer(${o.id})" class="btn btn-primary btn-sm" style="padding: 2px 8px; font-size: 11px;">Accept</button>
                          <button onclick="handleRejectOffer(${o.id})" class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 11px; color: #dc2626;">Reject</button>
                        </div>
                      ` : `
                        <span style="font-size: 12px; color: var(--text-muted);">Completed</span>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function switchBuyerTab(tab) {
  document.getElementById('buyer-tab-directory').style.display = tab === 'directory' ? 'block' : 'none';
  document.getElementById('buyer-tab-marketplace').style.display = tab === 'marketplace' ? 'block' : 'none';
  document.getElementById('buyer-tab-offers').style.display = tab === 'offers' ? 'block' : 'none';

  document.getElementById('tab-btn-directory').classList.toggle('active', tab === 'directory');
  document.getElementById('tab-btn-marketplace').classList.toggle('active', tab === 'marketplace');
  document.getElementById('tab-btn-offers').classList.toggle('active', tab === 'offers');
}

function openSubmitBuyerOfferModal(poolId, produce, weight, price) {
  const modalContent = document.getElementById('buyer-offer-submit-content');
  modalContent.innerHTML = `
    <form onsubmit="handleBuyerOfferSubmit(event, ${poolId})">
      <div style="background: #f8fafc; padding: 12px; border-radius: var(--radius-md); margin-bottom: 14px;">
        <div>Target Pool: <strong>${produce} (Pool #${poolId})</strong></div>
        <div>Available Weight: <strong>${weight} kg</strong></div>
      </div>

      <div class="form-group">
        <label class="form-label">Procuring Corporate Buyer</label>
        <select class="form-control" id="submit-offer-buyer-id" required>
          <option value="1">ITC Agri Business Division (Rating: AAA)</option>
          <option value="2">Patanjali Foods Agro Direct (Rating: AA+)</option>
          <option value="3">Everest Spices Procurement (Rating: AAA)</option>
          <option value="4">Olam Agri India Pvt Ltd (Rating: AAA)</option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Offered Quantity (kg)</label>
          <input type="number" step="0.1" class="form-control" id="submit-offer-qty" value="${weight}" required oninput="calcOfferTotal()">
        </div>
        <div class="form-group">
          <label class="form-label">Offer Unit Price (₹/kg)</label>
          <input type="number" step="0.5" class="form-control" id="submit-offer-price" value="${price}" required oninput="calcOfferTotal()">
        </div>
      </div>

      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px; border-radius: var(--radius-md); margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 13px; font-weight: 600; color: #065f46;">Total Offer Value</span>
        <strong id="submit-offer-total-display" style="font-size: 18px; color: #047857;">₹${(weight * price).toLocaleString()}</strong>
      </div>

      <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
        <button type="button" onclick="closeModal('buyer-offer-submit-modal')" class="btn btn-outline btn-sm">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm">Submit Buyer Offer</button>
      </div>
    </form>
  `;
  openModal('buyer-offer-submit-modal');
}

function calcOfferTotal() {
  const q = parseFloat(document.getElementById('submit-offer-qty')?.value) || 0;
  const p = parseFloat(document.getElementById('submit-offer-price')?.value) || 0;
  const display = document.getElementById('submit-offer-total-display');
  if (display) display.textContent = `₹${(q * p).toLocaleString()}`;
}

async function handleBuyerOfferSubmit(e, poolId) {
  e.preventDefault();
  const buyer_id = Number(document.getElementById('submit-offer-buyer-id').value);
  const quantity = parseFloat(document.getElementById('submit-offer-qty').value);
  const offer_price = parseFloat(document.getElementById('submit-offer-price').value);

  try {
    const offer = await api.createOffer({ buyer_id, poolId, quantity, offer_price });
    closeModal('buyer-offer-submit-modal');
    showToast(`Offer ${offer.offer_code} submitted for ₹${offer.total_amount}!`, 'success');
    navigateTo('buyers');
    switchBuyerTab('offers');
  } catch (err) {
    showToast('Failed to submit offer: ' + err.message, 'error');
  }
}

async function handleAcceptOffer(offerId) {
  try {
    await api.updateOfferStatus(offerId, { status: 'Accepted' });
    showToast('Offer accepted! You can now create a formal Purchase Order.', 'success');
    navigateTo('buyers');
    switchBuyerTab('offers');
  } catch (err) {
    showToast('Failed to accept offer: ' + err.message, 'error');
  }
}

async function handleRejectOffer(offerId) {
  try {
    await api.updateOfferStatus(offerId, { status: 'Rejected' });
    showToast('Offer rejected.', 'info');
    navigateTo('buyers');
    switchBuyerTab('offers');
  } catch (err) {
    showToast('Failed to reject offer: ' + err.message, 'error');
  }
}

function openBuyerOfferModalForBuyer(buyerId, companyName) {
  openSubmitBuyerOfferModal(1, 'Guntur Sannam Chilli', 2150, 220);
  const sel = document.getElementById('submit-offer-buyer-id');
  if (sel) sel.value = buyerId;
}

async function handleAddBulkBuyerSubmit(e, createOrderAfter = false) {
  if (e && e.preventDefault) e.preventDefault();
  const companyName = document.getElementById('buyer-form-company')?.value || 'Agri Corporate Buyer';
  const contactPerson = document.getElementById('buyer-form-contact')?.value || 'Procurement Lead';
  const phone = document.getElementById('buyer-form-phone')?.value || '+91 98480 00000';
  const email = document.getElementById('buyer-form-email')?.value || 'trade@corporate.com';
  const address = document.getElementById('buyer-form-address')?.value || '';
  const city = document.getElementById('buyer-form-city')?.value || 'Hyderabad';
  const state = document.getElementById('buyer-form-state')?.value || 'Telangana';
  const buyerType = document.getElementById('buyer-form-type')?.value || 'Agro-Processor';
  const commodities = document.getElementById('buyer-form-commodities')?.value || 'Chilli, Turmeric';
  const minQty = parseFloat(document.getElementById('buyer-form-minqty')?.value) || 500;
  const maxQty = parseFloat(document.getElementById('buyer-form-maxqty')?.value) || 10000;
  const qualityReq = document.getElementById('buyer-form-quality')?.value || 'GRADE_A';
  const deliveryLocation = document.getElementById('buyer-form-location')?.value || 'Guntur Spices Hub';
  const paymentTerms = document.getElementById('buyer-form-payment-terms')?.value || '100% Escrow on Dispatch';
  const verificationStatus = document.getElementById('buyer-form-status')?.value || 'Verified';

  try {
    const isVerified = verificationStatus === 'Verified' ? 1 : 0;
    const buyer = await api.createBulkBuyer({
      company_name: companyName,
      contact_person: contactPerson,
      phone: phone,
      email: email,
      address: `${address}, ${city}, ${state}`,
      city: city,
      state: state,
      buyer_type: buyerType,
      commodities: commodities,
      min_quantity: minQty,
      max_quantity: maxQty,
      quality_requirement: qualityReq,
      delivery_location: deliveryLocation,
      payment_terms: paymentTerms,
      verification_status: verificationStatus,
      is_verified: isVerified
    });

    closeModal('add-bulk-buyer-modal');
    showToast(`Bulk Buyer "${companyName}" registered (${verificationStatus})!`, 'success');

    if (createOrderAfter) {
      navigateTo('orders');
      setTimeout(() => openModal('create-order-modal'), 200);
    } else {
      navigateTo('buyers');
      switchBuyerTab('directory');
    }
  } catch (err) {
    showToast('Failed to save buyer: ' + err.message, 'error');
  }
}

function filterBuyersTable(query) {
  const q = (query || '').toLowerCase();
  const rows = document.querySelectorAll('#buyer-tab-directory tbody tr');
  rows.forEach(r => {
    r.style.display = (!q || r.textContent.toLowerCase().includes(q)) ? '' : 'none';
  });
}

function filterBuyersType(type) {
  const t = (type || '').toLowerCase();
  const rows = document.querySelectorAll('#buyer-tab-directory tbody tr');
  rows.forEach(r => {
    r.style.display = (!t || r.textContent.toLowerCase().includes(t)) ? '' : 'none';
  });
}

function filterMarketplaceCommodity(commodity) {
  const c = (commodity || '').toLowerCase();
  const cards = document.querySelectorAll('#buyer-tab-marketplace .marketplace-card');
  cards.forEach(card => {
    card.style.display = (!c || card.textContent.toLowerCase().includes(c)) ? '' : 'none';
  });
}

function viewBulkBuyerDetails(id) {
  alert(`Bulk Buyer Profile ID BYR-${String(id).padStart(4, '0')}`);
}

window.renderBuyersPage = renderBuyersPage;
window.switchBuyerTab = switchBuyerTab;
window.filterBuyersTable = filterBuyersTable;
window.filterBuyersType = filterBuyersType;
window.filterMarketplaceCommodity = filterMarketplaceCommodity;
window.viewBulkBuyerDetails = viewBulkBuyerDetails;
window.openSubmitBuyerOfferModal = openSubmitBuyerOfferModal;
window.calcOfferTotal = calcOfferTotal;
window.handleBuyerOfferSubmit = handleBuyerOfferSubmit;
window.handleAcceptOffer = handleAcceptOffer;
window.handleRejectOffer = handleRejectOffer;
window.openBuyerOfferModalForBuyer = openBuyerOfferModalForBuyer;
window.handleAddBulkBuyerSubmit = handleAddBulkBuyerSubmit;


