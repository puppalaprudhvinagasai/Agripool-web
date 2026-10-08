// public/js/components/crop_details.js - Commodity Market In-Depth Analysis (Requirement #20)
async function renderCropDetailsPage(cropName) {
  let details = null;
  const targetCrop = cropName || 'Tomato';

  try {
    details = await api.getCropMarketDetails(targetCrop);
  } catch (err) {
    console.error('Error fetching crop details:', err);
    details = {
      crop: targetCrop,
      currentPrice: 38.00,
      unit: 'kg',
      market: 'Madanapalle APMC',
      priceTrend: 'UP',
      changePct: 4.2,
      availableStockKg: 18500,
      pooledStockKg: 14200,
      reservedStockKg: 3100,
      soldStockKg: 4500,
      quality: 'Grade A',
      location: 'Madanapalle Hub',
      demand: 'HIGH DEMAND',
      recentOffers: [],
      priceHistory: [],
      relevantMarkets: [],
      lastUpdated: new Date().toISOString(),
      dataSource: 'Demo Data (Data source not connected)'
    };
  }

  return `
    <div class="crop-details-page">
      <!-- Breadcrumb Navigation -->
      <div style="margin-bottom: 16px; font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
        <a href="javascript:void(0)" onclick="navigateTo('market-prices')" style="color: var(--primary); text-decoration: none;">Market Prices</a>
        <span>/</span>
        <span style="color: var(--text-primary); font-weight: 600;">${details.crop} Details</span>
      </div>

      <!-- Main Header -->
      <div class="page-header" style="margin-bottom: 24px;">
        <div class="page-title-wrap">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 36px;">🌾</span>
            <div>
              <h2 style="font-family: var(--font-display); font-size: 28px; font-weight: 800; margin: 0;">
                ${details.crop} Commodity Intelligence
              </h2>
              <div style="display: flex; gap: 10px; align-items: center; margin-top: 4px;">
                <span class="badge badge-weighed">${details.quality}</span>
                <span class="badge ${details.demand === 'HIGH DEMAND' ? 'badge-settled' : 'badge-storage'}">${details.demand}</span>
                <span style="font-size: 12px; color: var(--text-muted);">📍 ${details.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <button onclick="navigateTo('live-stock')" class="btn btn-outline btn-sm">
            📦 Live Stock
          </button>
          <button onclick="navigateTo('market-prices')" class="btn btn-primary btn-sm">
            ← All Market Prices
          </button>
        </div>
      </div>

      <!-- Crop Selector Tabs -->
      <div class="crop-quick-tabs" style="display: flex; gap: 8px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px;">
        ${['Tomato', 'Rice', 'Chilli', 'Cotton', 'Turmeric', 'Maize'].map(c => `
          <button onclick="navigateTo('market/${c.toLowerCase()}')" 
                  class="btn btn-sm ${details.crop.toLowerCase().includes(c.toLowerCase()) ? 'btn-primary' : 'btn-outline'}" 
                  style="border-radius: var(--radius-full); padding: 6px 16px; white-space: nowrap;">
            ${c}
          </button>
        `).join('')}
      </div>

      <!-- Data Source Status Banner -->
      ${!details.isLiveApi ? `
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span>⚠️</span>
            <span style="font-weight: 700; color: #991b1b; font-size: 13.5px;">Market Data Source Not Connected</span>
            <span style="font-size: 12.5px; color: #b91c1c;">— Live commodity rates require active Government of India / data.gov.in Mandi API</span>
          </div>
          <button onclick="api.syncMarketPrices().then(() => renderPage('market/' + '${targetCrop.toLowerCase()}'))" class="btn btn-primary btn-xs">
            Connect / Sync Feed
          </button>
        </div>
      ` : `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span>✅</span>
            <span style="font-weight: 700; color: #166534; font-size: 13.5px;">Government of India / data.gov.in</span>
            <span style="font-size: 12.5px; color: #15803d;">— Verified official Mandi spot prices</span>
          </div>
          <span class="badge" style="background: #dcfce7; color: #166534; font-weight: 700;">Live Feed Active</span>
        </div>
      `}

      <!-- 4 Key Pillars: Price, Available Stock, Pooled Stock, Demand -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px;">
        <!-- 1. Current Price -->
        <div class="card" style="margin-bottom: 0; padding: 20px; border-top: 4px solid var(--primary);">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Current Benchmark Price</div>
          ${details.isLiveApi && details.currentPrice ? `
            <div style="font-size: 30px; font-weight: 800; color: var(--primary); font-family: var(--font-display); margin-top: 4px;">
              ₹${Number(details.currentPrice).toFixed(2)} <span style="font-size: 14px; font-weight: 500; color: var(--text-secondary);">/ ${details.unit}</span>
            </div>
            <div style="font-size: 12px; color: ${details.priceTrend === 'UP' ? '#16a34a' : '#dc2626'}; font-weight: 600; margin-top: 4px;">
              ${details.priceTrend === 'UP' ? '▲ +' : '▼ '}${details.changePct}% (24h Trend)
            </div>
          ` : `
            <div style="font-size: 17px; font-weight: 700; color: #991b1b; margin-top: 8px;">
              Market Data Source Not Connected
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              Awaiting Government of India / data.gov.in Mandi API feed
            </div>
          `}
        </div>

        <!-- 2. Available Stock -->
        <div class="card" style="margin-bottom: 0; padding: 20px; border-top: 4px solid #0284c7;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Available Stock</div>
          <div style="font-size: 30px; font-weight: 800; color: #0284c7; margin-top: 4px;">
            ${(details.availableStockKg || 0).toLocaleString()} kg
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            (${(details.availableStockKg / 100).toFixed(1)} Quintals ready)
          </div>
        </div>

        <!-- 3. Pooled Stock -->
        <div class="card" style="margin-bottom: 0; padding: 20px; border-top: 4px solid #7c3aed;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Pooled Aggregation Stock</div>
          <div style="font-size: 30px; font-weight: 800; color: #7c3aed; margin-top: 4px;">
            ${(details.pooledStockKg || 0).toLocaleString()} kg
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            Multi-farmer pooled lots
          </div>
        </div>

        <!-- 4. Demand Status -->
        <div class="card" style="margin-bottom: 0; padding: 20px; border-top: 4px solid #d97706;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Market Demand</div>
          <div style="font-size: 26px; font-weight: 800; color: #d97706; margin-top: 8px;">
            ${details.demand}
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            ${(details.reservedStockKg || 0).toLocaleString()} kg reserved in buyer POs
          </div>
        </div>
      </div>

      <!-- Price History Trend & Relevant Regional Markets -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 28px;">
        <!-- Price History Table -->
        <div class="card" style="padding: 24px; margin-bottom: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 18px; font-weight: 800;">📈 7-Day Spot Price History</h3>
            <span class="badge badge-outline">APMC Benchmark</span>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Observation Date</th>
                  <th>Wholesale Price / kg</th>
                  <th>Estimated Daily Volume</th>
                  <th>Variance</th>
                </tr>
              </thead>
              <tbody>
                ${(details.priceHistory || []).map((h, i) => `
                  <tr>
                    <td><strong>${h.date}</strong></td>
                    <td><strong style="color: var(--primary);">₹${h.price}</strong></td>
                    <td>${h.volume}</td>
                    <td><span class="badge ${i >= 3 ? 'badge-settled' : 'badge-weighed'}">${i >= 3 ? '+ Steady' : 'Base'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Relevant Mandi Markets -->
        <div class="card" style="padding: 24px; margin-bottom: 0;">
          <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 16px;">📍 Relevant APMC Markets</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${(details.relevantMarkets || []).map(m => `
              <div style="padding: 12px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 700; font-size: 13.5px;">${m.name}</div>
                  <div style="font-size: 11.5px; color: var(--text-muted);">${m.state}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 800; color: var(--primary); font-size: 15px;">₹${m.currentRate}/kg</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Active Trading</div>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top: 20px; padding-top: 14px; border-top: 1px dashed var(--border); font-size: 12px; color: var(--text-muted);">
            <div><strong>Data Source:</strong> ${details.dataSource}</div>
            <div style="margin-top: 4px;"><strong>Last Updated:</strong> ${new Date(details.lastUpdated).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <!-- Recent Buyer Offers for this commodity -->
      <div class="card" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 18px; font-weight: 800;">💬 Recent Commercial Buyer Sourcing Offers</h3>
          <button onclick="navigateTo('buyers')" class="btn btn-outline btn-xs">Browse All Buyers →</button>
        </div>
        ${details.recentOffers && details.recentOffers.length > 0 ? `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Offer Code</th>
                  <th>Buyer Organization</th>
                  <th>Offered Price</th>
                  <th>Quantity Requested</th>
                  <th>Total Valuation</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${details.recentOffers.map(o => `
                  <tr>
                    <td><code>${o.offer_code}</code></td>
                    <td><strong>${o.buyer_name || 'Verified Bulk Buyer'}</strong></td>
                    <td><strong style="color: var(--primary);">₹${o.offer_price}/kg</strong></td>
                    <td>${(o.quantity || 0).toLocaleString()} kg</td>
                    <td>₹${(o.total_amount || 0).toLocaleString()}</td>
                    <td><span class="badge badge-settled">${o.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div style="padding: 30px; text-align: center; color: var(--text-secondary); background: #f8fafc; border-radius: 8px;">
            <p>No open commercial buyer offers active for this specific crop today.</p>
            <button onclick="navigateTo('buyers')" class="btn btn-primary btn-sm" style="margin-top: 10px;">
              Submit Buyer Sourcing Demand
            </button>
          </div>
        `}
      </div>
    </div>
  `;
}

window.renderCropDetailsPage = renderCropDetailsPage;
