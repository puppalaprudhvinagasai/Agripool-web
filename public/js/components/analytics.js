// public/js/components/analytics.js - Platform Analytics & Cluster Performance
async function renderAnalyticsPage() {
  const statsRes = await api.getStats();
  const kpis = statsRes.kpis;
  const pools = await api.getPools();

  return `
    <div class="analytics-page">
      <div class="card-header" style="margin-bottom: 20px;">
        <div>
          <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 800;">
            📈 Operational Analytics & Cluster Performance
          </h2>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Real-time transparency into aggregation volumes, logistics savings, price realization uplifts, and settlement cycles.
          </p>
        </div>
      </div>

      <!-- High Level Efficiency KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon-wrap green">📈</div>
          <div class="kpi-content">
            <div class="kpi-label">Farmer Price Realization</div>
            <div class="kpi-value">+22.4%</div>
            <div class="kpi-subtext">Compared to local unorganized traders</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap blue">🚚</div>
          <div class="kpi-content">
            <div class="kpi-label">Logistics Cost Savings</div>
            <div class="kpi-value">38.5%</div>
            <div class="kpi-subtext">Saved through consolidated shared routes</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap amber">⏱️</div>
          <div class="kpi-content">
            <div class="kpi-label">Avg. Settlement Turnaround</div>
            <div class="kpi-value">48 Hours</div>
            <div class="kpi-subtext">Direct to farmer bank accounts</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap purple">⚖️</div>
          <div class="kpi-content">
            <div class="kpi-label">Avg. Lot Aggregation Scale</div>
            <div class="kpi-value">1,623 kg</div>
            <div class="kpi-subtext">7.2x larger than individual smallholder lots</div>
          </div>
        </div>
      </div>

      <!-- Visual Comparison & Crop Distribution Charts -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px;">
        <!-- Price Realization Comparison Chart (SVG) -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">📊 Price Realization Comparison (₹/kg)</h3>
              <div class="card-subtitle">Village Middlemen vs. AgriPool Aggregated Sale</div>
            </div>
          </div>

          <div style="padding: 10px 0;">
            <svg viewBox="0 0 450 200" style="width: 100%; height: auto;">
              <!-- Grid lines -->
              <line x1="50" y1="20" x2="420" y2="20" stroke="#e2e8f0" stroke-width="1" />
              <line x1="50" y1="60" x2="420" y2="60" stroke="#e2e8f0" stroke-width="1" />
              <line x1="50" y1="100" x2="420" y2="100" stroke="#e2e8f0" stroke-width="1" />
              <line x1="50" y1="140" x2="420" y2="140" stroke="#e2e8f0" stroke-width="1" />
              <line x1="50" y1="170" x2="420" y2="170" stroke="#94a3b8" stroke-width="2" />

              <!-- Y-Axis Labels -->
              <text x="15" y="25" font-size="11" fill="#64748b">₹250</text>
              <text x="15" y="65" font-size="11" fill="#64748b">₹200</text>
              <text x="15" y="105" font-size="11" fill="#64748b">₹150</text>
              <text x="15" y="145" font-size="11" fill="#64748b">₹100</text>

              <!-- Crop 1: Chilli -->
              <text x="95" y="188" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">Sannam Chilli</text>
              <!-- Middleman bar -->
              <rect x="70" y="70" width="22" height="100" fill="#94a3b8" rx="3" />
              <text x="81" y="64" font-size="10" fill="#64748b" text-anchor="middle">₹175</text>
              <!-- AgriPool bar -->
              <rect x="96" y="38" width="22" height="132" fill="#16a34a" rx="3" />
              <text x="107" y="32" font-size="10" font-weight="bold" fill="#16a34a" text-anchor="middle">₹220</text>

              <!-- Crop 2: Turmeric -->
              <text x="215" y="188" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">Turmeric</text>
              <!-- Middleman bar -->
              <rect x="190" y="105" width="22" height="65" fill="#94a3b8" rx="3" />
              <text x="201" y="99" font-size="10" fill="#64748b" text-anchor="middle">₹110</text>
              <!-- AgriPool bar -->
              <rect x="216" y="75" width="22" height="95" fill="#16a34a" rx="3" />
              <text x="227" y="69" font-size="10" font-weight="bold" fill="#16a34a" text-anchor="middle">₹145</text>

              <!-- Crop 3: Black Gram -->
              <text x="335" y="188" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">Black Gram</text>
              <!-- Middleman bar -->
              <rect x="310" y="125" width="22" height="45" fill="#94a3b8" rx="3" />
              <text x="321" y="119" font-size="10" fill="#64748b" text-anchor="middle">₹72</text>
              <!-- AgriPool bar -->
              <rect x="336" y="108" width="22" height="62" fill="#16a34a" rx="3" />
              <text x="347" y="102" font-size="10" font-weight="bold" fill="#16a34a" text-anchor="middle">₹95</text>
            </svg>
            <div style="display: flex; justify-content: center; gap: 24px; font-size: 12px; margin-top: 8px;">
              <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 12px; height: 12px; background: #94a3b8; border-radius: 2px;"></span> Village Intermediary</span>
              <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 12px; height: 12px; background: #16a34a; border-radius: 2px;"></span> AgriPool Verified Sale (+22% Avg)</span>
            </div>
          </div>
        </div>

        <!-- Village Cluster Aggregation Distribution -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">🗺️ Cluster Volume Distribution</h3>
              <div class="card-subtitle">Produce aggregated by pilot mandal & village</div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                <strong>Kankipadu Mandal (Krishna)</strong>
                <span>4,120 kg (36%)</span>
              </div>
              <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="width: 36%; height: 100%; background: var(--primary);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                <strong>Thotlavalluru Mandal (Krishna)</strong>
                <span>3,250 kg (28%)</span>
              </div>
              <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="width: 28%; height: 100%; background: #0284c7;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                <strong>Mangalagiri Rural (Guntur)</strong>
                <span>2,480 kg (22%)</span>
              </div>
              <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="width: 22%; height: 100%; background: #7c3aed;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                <strong>Tenali North (Guntur)</strong>
                <span>1,620 kg (14%)</span>
              </div>
              <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="width: 14%; height: 100%; background: #d97706;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
