// public/js/components/market_prices.js - Live Agriculture Market Prices Module
async function renderMarketPricesPage() {
  let prices = [];
  try {
    const raw = await api.getMarketPrices();
    prices = Array.isArray(raw) ? raw : (raw?.data || []);
  } catch (err) {
    console.error('Error fetching market prices:', err);
    prices = [];
  }

  const livePrices = prices.filter(p => p.is_live_api === 1);
  const isConnected = livePrices.length > 0;

  // Extract unique states for filter
  const states = Array.from(new Set(livePrices.map(p => p.state).filter(Boolean))).sort();

  return `
    <div class="market-prices-page">
      <!-- Page Header -->
      <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div class="page-title-wrap">
          <h2 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; display: flex; align-items: center; gap: 10px; margin: 0 0 6px 0;">
            <span>📈</span> Live Agriculture Market Benchmark Prices
          </h2>
          <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
            Real-time wholesale APMC Mandi commodity rates streamed via official Government of India / data.gov.in Agmarknet feed.
          </p>
        </div>
        <div class="header-actions" style="display: flex; gap: 10px;">
          <button onclick="handleLiveMarketRefresh()" class="btn btn-primary btn-sm" id="btn-refresh-market" style="gap: 6px;">
            🔄 Refresh Live Feed
          </button>
          <button onclick="navigateTo('live-stock')" class="btn btn-outline btn-sm">
            📦 Live Produce Stock
          </button>
        </div>
      </div>

      <!-- Data Source Status Banner -->
      ${isConnected ? `
        <div class="data-source-banner" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 22px;">✅</span>
            <div>
              <div style="font-weight: 700; color: #166534; font-size: 13.5px;">Live National APMC Mandi Feed Active</div>
              <div style="font-size: 12.5px; color: #15803d;">
                Displaying <strong>${livePrices.length} live commodity benchmark prices</strong> synchronized from <strong>Government of India / data.gov.in</strong>.
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge" style="background: #dcfce7; color: #166534; font-weight: 700; padding: 6px 12px;">
              ● LIVE STREAMING
            </span>
          </div>
        </div>
      ` : `
        <div class="data-source-banner" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 22px;">⚠️</span>
            <div>
              <div style="font-weight: 700; color: #991b1b; font-size: 13.5px;">Live Market Feed: Connecting...</div>
              <div style="font-size: 12.5px; color: #b91c1c;">
                Official data.gov.in Mandi API key is configured. If upstream government server is busy, click <strong>Refresh Live Feed</strong> to pull the latest feed.
              </div>
            </div>
          </div>
          <button onclick="handleLiveMarketRefresh()" class="btn btn-outline btn-sm" style="border-color: #fca5a5; color: #991b1b;">
            ⚡ Connect / Sync Feed
          </button>
        </div>
      `}

      <!-- Search & Filters Toolbar -->
      ${isConnected ? `
        <div class="card" style="padding: 16px 20px; margin-bottom: 24px;">
          <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center;">
            <input type="text" id="market-filter-search" placeholder="Search commodity, market, or district..." class="form-control" style="width: 280px; font-size: 13px;" oninput="filterLiveMarketView()">
            
            <select id="market-state-filter" class="form-control" style="width: 200px; font-size: 13px;" onchange="filterLiveMarketView()">
              <option value="">All States (${states.length})</option>
              ${states.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>

            <select id="market-trend-filter" class="form-control" style="width: 150px; font-size: 13px;" onchange="filterLiveMarketView()">
              <option value="">All Trends</option>
              <option value="UP">Trending UP ▲</option>
              <option value="DOWN">Trending DOWN ▼</option>
              <option value="STABLE">Stable ■</option>
            </select>

            <span style="font-size: 13px; color: var(--text-muted); margin-left: auto;">
              Showing <strong id="market-shown-count">${livePrices.length}</strong> of ${livePrices.length} Market Items
            </span>
          </div>
        </div>
      ` : ''}

      <!-- Empty State when no live prices are available -->
      ${!isConnected ? `
        <div class="card" style="padding: 48px 24px; text-align: center; margin-bottom: 32px; background: #fafafa; border: 1px dashed #cbd5e1;">
          <div style="font-size: 44px; margin-bottom: 12px;">📡</div>
          <h3 style="font-size: 19px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Awaiting Live Market Feed</h3>
          <p style="color: var(--text-secondary); max-width: 540px; margin: 0 auto 20px; font-size: 14px;">
            The application is wired to the official Government of India / data.gov.in Agmarknet endpoint. Click the button below to initiate synchronization.
          </p>
          <button onclick="handleLiveMarketRefresh()" class="btn btn-primary" style="padding: 10px 24px;">
            ⚡ Fetch Real Mandi Data Now
          </button>
        </div>
      ` : `
        <!-- Market Price Cards Grid (Top Spotlight) -->
        <div class="market-cards-grid" id="market-cards-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; margin-bottom: 32px;">
          ${livePrices.slice(0, 12).map(p => {
            const trendClass = p.price_trend === 'UP' ? 'badge-settled' : (p.price_trend === 'DOWN' ? 'badge-rejected' : 'badge-weighed');
            const trendIcon = p.price_trend === 'UP' ? '▲' : (p.price_trend === 'DOWN' ? '▼' : '■');
            const commodityName = p.commodity || p.crop_name;
            return `
              <div class="card market-item-card" data-commodity="${(commodityName || '').toLowerCase()}" data-market="${(p.market || '').toLowerCase()}" data-state="${(p.state || '').toLowerCase()}" data-trend="${p.price_trend}" style="margin-bottom: 0; padding: 20px; transition: transform 0.15s, box-shadow 0.15s;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                  <div>
                    <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">${p.state || 'National Mandi'}</span>
                    <h3 style="font-size: 19px; font-weight: 800; color: var(--text-primary); margin: 2px 0 0 0;">${commodityName}</h3>
                  </div>
                  <span class="badge ${trendClass}" style="font-size: 11.5px; font-weight: 700;">
                    ${trendIcon} ${p.change_pct ? p.change_pct + '%' : p.price_trend}
                  </span>
                </div>

                <div style="margin: 14px 0; background: #f8fafc; border-radius: 8px; padding: 14px; text-align: center; border: 1px solid var(--border);">
                  <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Modal Wholesale Rate</span>
                  <div style="font-size: 28px; font-weight: 800; color: var(--primary); font-family: var(--font-display); line-height: 1.1; margin-top: 4px;">
                    ₹${Number(p.price_per_kg).toFixed(2)} <span style="font-size: 14px; font-weight: 500; color: var(--text-secondary);">/ ${p.unit || 'kg'}</span>
                  </div>
                  <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 4px;">
                    ₹${Math.round(Number(p.price_per_kg) * 100).toLocaleString()} per Quintal
                  </div>
                </div>

                <div style="font-size: 12.5px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 5px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span>Mandi / Market:</span>
                    <strong style="color: var(--text-primary);">📍 ${p.market}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>Variety / Grade:</span>
                    <span>${p.variety || 'Standard'} • ${p.grade || 'FAQ'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>Min – Max Rate:</span>
                    <span>₹${Number(p.min_price || p.price_per_kg).toFixed(2)} – ₹${Number(p.max_price || p.price_per_kg).toFixed(2)} / kg</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 4px; padding-top: 6px; border-top: 1px dashed var(--border);">
                    <span>Arrival Date:</span>
                    <span>${p.market_date || 'Today'}</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Full Mandi Wholesale Price Comparison Board Table -->
        <div class="card" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
            <div>
              <h3 style="font-size: 18px; font-weight: 800; margin: 0;">📊 Complete Mandi Wholesale Price Ledger (${livePrices.length} Items)</h3>
              <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">All available commodity items received from official data.gov.in stream</div>
            </div>
          </div>
          
          <div class="table-responsive" style="max-height: 580px; overflow-y: auto;">
            <table class="data-table" id="market-ledger-table">
              <thead style="position: sticky; top: 0; background: #ffffff; z-index: 2;">
                <tr>
                  <th>Commodity</th>
                  <th>Mandi / Market</th>
                  <th>State & District</th>
                  <th>Variety</th>
                  <th>Grade</th>
                  <th>Modal Price / kg</th>
                  <th>Price / Quintal</th>
                  <th>Min – Max Range</th>
                  <th>Trend</th>
                  <th>Arrival Date</th>
                  <th>Feed Source</th>
                </tr>
              </thead>
              <tbody>
                ${livePrices.map(p => {
                  const trendClass = p.price_trend === 'UP' ? 'badge-settled' : (p.price_trend === 'DOWN' ? 'badge-rejected' : 'badge-weighed');
                  const trendIcon = p.price_trend === 'UP' ? '▲' : (p.price_trend === 'DOWN' ? '▼' : '■');
                  const commodityName = p.commodity || p.crop_name;
                  return `
                    <tr class="market-table-row" data-commodity="${(commodityName || '').toLowerCase()}" data-market="${(p.market || '').toLowerCase()}" data-state="${(p.state || '').toLowerCase()}" data-trend="${p.price_trend}">
                      <td><strong>${commodityName}</strong></td>
                      <td>📍 ${p.market}</td>
                      <td>${p.district ? p.district + ', ' : ''}${p.state || 'National'}</td>
                      <td>${p.variety || 'Standard'}</td>
                      <td>${p.grade || 'FAQ'}</td>
                      <td><strong style="color: var(--primary); font-size: 15px;">₹${Number(p.price_per_kg).toFixed(2)}</strong></td>
                      <td>₹${Math.round(Number(p.price_per_kg) * 100).toLocaleString()}</td>
                      <td style="font-size: 12px; color: var(--text-secondary);">₹${Number(p.min_price || p.price_per_kg).toFixed(2)} – ₹${Number(p.max_price || p.price_per_kg).toFixed(2)}</td>
                      <td><span class="badge ${trendClass}">${trendIcon} ${p.price_trend}</span></td>
                      <td style="font-size: 12px;">${p.market_date || 'Today'}</td>
                      <td><span class="badge badge-verified">LIVE API</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `}
    </div>
  `;
}

// Client-side instant filter function
function filterLiveMarketView() {
  const q = (document.getElementById('market-filter-search')?.value || '').toLowerCase().trim();
  const state = (document.getElementById('market-state-filter')?.value || '').toLowerCase().trim();
  const trend = (document.getElementById('market-trend-filter')?.value || '').toUpperCase().trim();

  let visibleCount = 0;

  // Filter Cards
  const cards = document.querySelectorAll('.market-item-card');
  cards.forEach(card => {
    const cardComm = card.dataset.commodity || '';
    const cardMkt = card.dataset.market || '';
    const cardState = card.dataset.state || '';
    const cardTrend = card.dataset.trend || '';

    const matchesQ = !q || cardComm.includes(q) || cardMkt.includes(q) || cardState.includes(q);
    const matchesState = !state || cardState.includes(state);
    const matchesTrend = !trend || cardTrend === trend;

    if (matchesQ && matchesState && matchesTrend) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });

  // Filter Table Rows
  const rows = document.querySelectorAll('.market-table-row');
  rows.forEach(row => {
    const comm = row.dataset.commodity || '';
    const mkt = row.dataset.market || '';
    const rState = row.dataset.state || '';
    const rTrend = row.dataset.trend || '';

    const matchesQ = !q || comm.includes(q) || mkt.includes(q) || rState.includes(q);
    const matchesState = !state || rState.includes(state);
    const matchesTrend = !trend || rTrend === trend;

    if (matchesQ && matchesState && matchesTrend) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  const countEl = document.getElementById('market-shown-count');
  if (countEl) countEl.textContent = visibleCount;
}

// Live refresh action handler
async function handleLiveMarketRefresh() {
  const btn = document.getElementById('btn-refresh-market');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Syncing Mandi Feed...';
  }

  showToast('Connecting to data.gov.in Live Market API...', 'info');

  try {
    const res = await api.syncMarketPrices();
    if (res && res.success) {
      showToast(`Synchronized ${res.totalFetched || ''} live commodity records from data.gov.in!`, 'success');
    } else {
      showToast(res?.reason || 'Live API sync notice: connection timed out or busy. Retrying in background.', 'warning');
    }
    // Re-render
    navigateTo('market-prices');
    // Also refresh ticker
    if (typeof initMarketTicker === 'function') initMarketTicker();
  } catch (err) {
    showToast('Failed to sync live prices: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🔄 Refresh Live Feed';
    }
  }
}

window.renderMarketPricesPage = renderMarketPricesPage;
window.filterLiveMarketView = filterLiveMarketView;
window.handleLiveMarketRefresh = handleLiveMarketRefresh;
