// public/js/components/orders.js - Purchase Orders Module (Section 19)
async function renderOrdersPage() {
  const orders = await api.getOrders();
  const buyers = await api.getBulkBuyers();
  const pools = await api.getPools();

  return `
    <div class="orders-page">
      <!-- Header with Primary + Add Button -->
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary);">
            🛒 Orders
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Institutional purchase contracts, buyer purchase orders (POs), and fulfillment lifecycles.
          </p>
        </div>
        <button onclick="openModal('create-order-modal')" class="btn btn-primary" style="font-size: 14px; padding: 10px 20px;">
          + Create Order
        </button>
      </div>

      <!-- Lifecycle Flow Indicator -->
      <div class="card" style="padding: 16px 20px; margin-bottom: 24px; background: #f8fafc; border: 1px solid var(--border);">
        <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
          Traceable Order Lifecycle
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 12px; font-weight: 600;">
          <span style="color: #64748b;">INTERESTED</span>
          <span>➔</span>
          <span style="color: #d97706;">OFFER SENT</span>
          <span>➔</span>
          <span style="color: #0284c7;">ACCEPTED</span>
          <span>➔</span>
          <span style="color: #10b981; font-weight: 700;">ORDER CREATED</span>
          <span>➔</span>
          <span style="color: #6366f1;">PICKUP / DELIVERY</span>
          <span>➔</span>
          <span style="color: #8b5cf6;">RECEIVED</span>
          <span>➔</span>
          <span style="color: #059669; font-weight: 700;">SETTLED</span>
        </div>
      </div>

      <!-- Orders KPI Grid -->
      <div class="kpi-grid" style="margin-bottom: 24px;">
        <div class="kpi-card">
          <div class="kpi-icon-wrap blue">🛒</div>
          <div class="kpi-content">
            <div class="kpi-label">Total Purchase Orders</div>
            <div class="kpi-value">${orders.length}</div>
            <div class="kpi-subtext">Buyer contracts generated</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap green">💰</div>
          <div class="kpi-content">
            <div class="kpi-label">Total Contract Value</div>
            <div class="kpi-value">₹${Math.round(orders.reduce((sum, o) => sum + (o.total_value || 0), 0)).toLocaleString()}</div>
            <div class="kpi-subtext">Escrow & payment secured</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap amber">⚖️</div>
          <div class="kpi-content">
            <div class="kpi-label">Contracted Produce</div>
            <div class="kpi-value">${(orders.reduce((sum, o) => sum + (o.quantity || 0), 0) / 100).toFixed(1)} Qtl</div>
            <div class="kpi-subtext">Aggregated produce</div>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">All Purchase Orders</h3>
            <div class="card-subtitle">Showing active and completed institutional supply contracts</div>
          </div>
          <div style="display: flex; gap: 10px;">
            <input type="text" placeholder="Search orders..." class="form-control" style="width: 200px; font-size: 13px;" oninput="filterOrdersTable(this.value)">
            <select class="form-control" style="width: 160px; font-size: 13px;" onchange="filterOrdersStatus(this.value)">
              <option value="">All Statuses</option>
              <option value="CREATED">CREATED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="IN_TRANSIT">IN_TRANSIT</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="SETTLED">SETTLED</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="orders-master-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Buyer Company</th>
                <th>Seller / FPO</th>
                <th>Pool / Lot Ref</th>
                <th>Commodity</th>
                <th>Quantity</th>
                <th>Agreed Rate</th>
                <th>Total Value</th>
                <th>Delivery Destination</th>
                <th>Payment Terms</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(o => `
                <tr data-status="${o.status}">
                  <td><strong style="color: var(--primary); font-family: monospace;">ORD-2026-${String(o.id).padStart(4, '0')}</strong></td>
                  <td>
                    <strong>${o.buyer_name || 'Verified Bulk Buyer'}</strong>
                    <div style="font-size: 11px; color: var(--text-secondary);">${o.buyer_type || 'Agro-Processor'}</div>
                  </td>
                  <td><span class="badge badge-accent">Kisan Vikas FPO</span></td>
                  <td><span class="badge badge-verified">POOL-${String(o.pool_id).padStart(4, '0')}</span></td>
                  <td><strong>${o.commodity || o.pool_commodity || 'Guntur Sannam Chilli'}</strong></td>
                  <td><strong>${o.quantity ? o.quantity.toLocaleString() : '1,000'} kg</strong></td>
                  <td>₹${o.unit_price ? o.unit_price.toFixed(2) : '160.00'}/kg</td>
                  <td><strong style="color: var(--primary);">₹${Math.round(o.total_value || (o.quantity * o.unit_price) || 0).toLocaleString()}</strong></td>
                  <td>📍 ${o.delivery_location || 'Guntur Spices Park'}</td>
                  <td><span style="font-size: 11.5px; color: var(--text-secondary);">${o.payment_terms || '100% Escrow on Dispatch'}</span></td>
                  <td>
                    <span class="badge ${
                      o.status === 'SETTLED' ? 'badge-settled' :
                      o.status === 'DELIVERED' ? 'badge-verified' :
                      o.status === 'CONFIRMED' ? 'badge-pool' : 'badge-draft'
                    }">${o.status}</span>
                  </td>
                  <td>
                    ${o.status === 'CREATED' ? `
                      <button onclick="confirmOrderAction(${o.id})" class="btn btn-primary btn-sm">Confirm Order</button>
                    ` : o.status === 'CONFIRMED' ? `
                      <button onclick="navigateTo('pickup')" class="btn btn-accent btn-sm">Schedule Pickup</button>
                    ` : o.status === 'DELIVERED' ? `
                      <button onclick="navigateTo('payments')" class="btn btn-outline btn-sm">View Settlement</button>
                    ` : `
                      <button onclick="viewOrderDetails(${o.id})" class="btn btn-outline btn-sm">View Details</button>
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

async function confirmOrderAction(orderId) {
  try {
    await api.confirmOrder(orderId);
    showToast(`Order ORD-2026-${String(orderId).padStart(4, '0')} confirmed! Transaction recorded in ledger.`, 'success');
    navigateTo('orders');
  } catch (err) {
    showToast('Failed to confirm order: ' + err.message, 'error');
  }
}

function filterOrdersTable(val) {
  const query = (val || '').toLowerCase();
  document.querySelectorAll('#orders-master-table tbody tr').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
}

function filterOrdersStatus(status) {
  document.querySelectorAll('#orders-master-table tbody tr').forEach(tr => {
    if (!status || tr.dataset.status === status) {
      tr.style.display = '';
    } else {
      tr.style.display = 'none';
    }
  });
}

function viewOrderDetails(id) {
  showToast(`Viewing details for Order ORD-2026-${String(id).padStart(4, '0')}`, 'info');
}

async function handleCreateOrderSubmit(e) {
  e.preventDefault();
  const buyerId = Number(document.getElementById('order-form-buyer-id').value);
  const poolId = Number(document.getElementById('order-form-pool-id').value);
  const agreedPrice = Number(document.getElementById('order-form-price').value);
  const deliveryLocation = document.getElementById('order-form-delivery-location').value;
  const paymentTerms = document.getElementById('order-form-payment-terms').value;

  try {
    await api.createBuyerOrder({
      buyer_id: buyerId,
      pool_id: poolId,
      offered_price_per_kg: agreedPrice,
      delivery_terms: deliveryLocation,
      payment_terms: paymentTerms
    });
    closeModal('create-order-modal');
    showToast('Purchase Order created successfully!', 'success');
    navigateTo('orders');
  } catch (err) {
    showToast('Failed to create order: ' + err.message, 'error');
  }
}

window.renderOrdersPage = renderOrdersPage;
window.confirmOrderAction = confirmOrderAction;
window.filterOrdersTable = filterOrdersTable;
window.filterOrdersStatus = filterOrdersStatus;
window.viewOrderDetails = viewOrderDetails;
window.handleCreateOrderSubmit = handleCreateOrderSubmit;
