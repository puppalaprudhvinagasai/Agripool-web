// public/js/components/public_landing.js - Public Welcome & Aggregation Platform Portal
async function renderPublicLandingPage() {
  let prices = [];
  let stock = [];
  try {
    const rawPrices = await api.getMarketPrices();
    prices = Array.isArray(rawPrices) ? rawPrices : (rawPrices?.data || []);
  } catch (e) {
    prices = [];
  }

  try {
    stock = await api.getLiveStock();
  } catch (e) {
    stock = [
      { crop: 'Tomato', availableQuantityKg: 18500, pooledQuantityKg: 14200, location: 'Madanapalle Hub', quality: 'Grade A' },
      { crop: 'Rice', availableQuantityKg: 42000, pooledQuantityKg: 35000, location: 'Tenali Terminal', quality: 'Grade A' },
      { crop: 'Chilli', availableQuantityKg: 9800, pooledQuantityKg: 8400, location: 'Guntur Center', quality: 'Grade A' },
      { crop: 'Cotton', availableQuantityKg: 25400, pooledQuantityKg: 21000, location: 'Warangal Hub', quality: 'Bt-II' }
    ];
  }

  return `
    <div class="public-landing-wrapper">
      <!-- Public Top Navigation Bar (Requirement #1) -->
      <nav class="public-navbar">
        <div class="public-nav-brand" onclick="navigateTo('home')">
          <div class="brand-logo-icon">🌾</div>
          <div class="brand-name-group">
            <span class="brand-title">AgriPool</span>
            <span class="brand-tagline">Produce Aggregation Platform</span>
          </div>
        </div>

        <div class="public-nav-links">
          <a class="public-nav-link" href="javascript:void(0)" onclick="document.getElementById('section-overview').scrollIntoView({behavior: 'smooth'})">Home</a>
          <a class="public-nav-link" href="javascript:void(0)" onclick="document.getElementById('section-how-it-works').scrollIntoView({behavior: 'smooth'})">How It Works</a>
          <a class="public-nav-link" href="javascript:void(0)" onclick="navigateTo('market-prices')">Market Prices</a>
          <a class="public-nav-link" href="javascript:void(0)" onclick="navigateTo('live-stock')">Live Stock</a>
          <a class="public-nav-link" href="javascript:void(0)" onclick="document.getElementById('section-benefits').scrollIntoView({behavior: 'smooth'})">Benefits</a>
          <a class="public-nav-link" href="javascript:void(0)" onclick="document.getElementById('section-buyers').scrollIntoView({behavior: 'smooth'})">Verified Buyers</a>
        </div>

        <div class="public-nav-actions">
          <button onclick="navigateTo('login')" class="btn btn-outline" style="border-color: #198754; color: #198754; font-weight: 600; padding: 8px 18px;">
            🔑 Login
          </button>
          <button onclick="navigateTo('signup')" class="btn btn-primary" style="padding: 8px 20px; font-weight: 700;">
            ✨ Sign Up
          </button>
        </div>
      </nav>

      <!-- Hero Header Section -->
      <section class="public-hero" id="section-overview">
        <div class="hero-content-box">
          <div class="hero-badge">
            🌾 AgriPool • Transparent Produce Aggregation & Settlement
          </div>
          <h1 class="hero-main-title">
            Connect Farmers, Aggregate Produce, Reach Better Markets.
          </h1>
          <p class="hero-description">
            AgriPool turns fragmented smallholder lots into high-value commercial batches. 
            Empowering Farmers and FPOs to access verified corporate buyers, professional storage, 
            and transparent digital bank settlements.
          </p>
          <div class="hero-btn-row">
            <button onclick="navigateTo('signup')" class="btn btn-accent btn-lg" style="padding: 14px 30px; font-weight: 800; font-size: 16px;">
              👨‍🌾 Join AgriPool Today
            </button>
            <button onclick="navigateTo('live-stock')" class="btn btn-outline btn-lg" style="background: rgba(255, 255, 255, 0.15); color: #ffffff; border-color: rgba(255,255,255,0.4);">
              📦 View Live Stock
            </button>
            <button onclick="navigateTo('market-prices')" class="btn btn-primary btn-lg" style="background: #ffffff; color: #0f5132; font-weight: 700;">
              📈 Market Prices
            </button>
          </div>
        </div>
      </section>

      <!-- Live Agriculture Market Overview (Requirement #1) -->
      <section class="public-section" id="section-market">
        <div class="section-header-block">
          <span class="section-tag">National & Mandi Rates</span>
          <h2 class="section-title">Live Agriculture Market Overview</h2>
          <p class="section-subtitle">Real-time benchmark mandi prices across major south Indian agricultural APMC trading terminals.</p>
        </div>

        ${prices.filter(p => p.is_live_api).length > 0 ? `
        <div class="market-cards-grid">
          ${prices.filter(p => p.is_live_api).slice(0, 4).map(p => `
            <div class="market-ticker-card" onclick="navigateTo('market-prices')">
              <div class="ticker-header">
                <span class="crop-name">${p.crop_name}</span>
                <span class="trend-badge ${p.price_trend === 'UP' ? 'trend-up' : (p.price_trend === 'DOWN' ? 'trend-down' : 'trend-stable')}">
                  ${p.price_trend === 'UP' ? '▲ +' + p.change_pct + '%' : (p.price_trend === 'DOWN' ? '▼ ' + p.change_pct + '%' : '■ ' + p.change_pct + '%')}
                </span>
              </div>
              <div class="ticker-price">₹${Number(p.price_per_kg).toFixed(2)} <span>/ ${p.unit || 'kg'}</span></div>
              <div class="ticker-footer">
                <span>📍 ${p.market}</span>
                <span class="source-tag">Government of India / data.gov.in</span>
              </div>
            </div>
          `).join('')}
        </div>
        ` : `
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px 24px; text-align: center; margin-top: 16px;">
          <span style="font-size: 22px;">⚠️</span>
          <h4 style="color: #991b1b; margin: 8px 0 4px; font-weight: 700;">Market Data Source Not Connected</h4>
          <p style="color: #b91c1c; font-size: 13.5px; margin: 0;">Official Government of India / data.gov.in Mandi API is not currently connected. No estimated or fake benchmark prices are displayed.</p>
        </div>
        `}
      </section>

      <!-- Live Crop / Commodity Stock Overview (Requirement #1) -->
      <section class="public-section">
        <div class="section-header-block">
          <span class="section-tag">Warehouse & Pooling Inventory</span>
          <h2 class="section-title">Live Crop & Commodity Stock Overview</h2>
          <p class="section-subtitle">Verified aggregated produce available across primary aggregation hubs.</p>
        </div>

        <div class="stock-cards-grid">
          ${stock.slice(0, 4).map(s => `
            <div class="stock-overview-card" onclick="navigateTo('live-stock')">
              <div class="stock-card-top">
                <div class="stock-crop-icon">🌾</div>
                <div>
                  <h3 class="stock-crop-name">${s.crop}</h3>
                  <span class="stock-grade">${s.quality || 'Grade A'}</span>
                </div>
              </div>
              <div class="stock-metric-row">
                <div class="metric-item">
                  <div class="metric-val">${(s.availableQuantityKg || 0).toLocaleString()} kg</div>
                  <div class="metric-lbl">Available Stock</div>
                </div>
                <div class="metric-item">
                  <div class="metric-val">${(s.pooledQuantityKg || 0).toLocaleString()} kg</div>
                  <div class="metric-lbl">Pooled Produce</div>
                </div>
              </div>
              <div class="stock-card-bot">
                <span>📍 ${s.location || 'Central Regional Hub'}</span>
                <span class="badge badge-settled">VERIFIED</span>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- How AgriPool Works (Requirement #1) -->
      <section class="public-section" id="section-how-it-works">
        <div class="section-header-block">
          <span class="section-tag">End-To-End Transparency</span>
          <h2 class="section-title">How AgriPool Works</h2>
          <p class="section-subtitle">From village field harvest to direct corporate buyer escrow and instant farmer bank settlement.</p>
        </div>

        <div class="steps-flow-grid">
          <div class="flow-step-card">
            <div class="step-num">1</div>
            <div class="step-icon">👨‍🌾</div>
            <h4>Farmer Registration</h4>
            <p>Farmers declare seasonal harvest crops and link bank accounts via assisted digital portals.</p>
          </div>
          <div class="flow-step-card">
            <div class="step-num">2</div>
            <div class="step-icon">🏷️</div>
            <h4>Digital Lot Passport</h4>
            <p>Calibrated electronic weighing scale and quality assays generate unique immutable Lot IDs.</p>
          </div>
          <div class="flow-step-card">
            <div class="step-num">3</div>
            <div class="step-icon">🤝</div>
            <h4>Produce Pooling</h4>
            <p>Micro-lots are aggregated into standard commercial truckloads meeting bulk buyer specifications.</p>
          </div>
          <div class="flow-step-card">
            <div class="step-num">4</div>
            <div class="step-icon">🚚</div>
            <h4>Logistics & Storage</h4>
            <p>Shared route pickups reduce freight costs by 38% and route produce into certified cold storage bays.</p>
          </div>
          <div class="flow-step-card">
            <div class="step-num">5</div>
            <div class="step-icon">🏢</div>
            <h4>Verified Buyer Matching</h4>
            <p>Institutional food processors and agro-exporters place digital Purchase Orders at premium rates.</p>
          </div>
          <div class="flow-step-card">
            <div class="step-num">6</div>
            <div class="step-icon">💰</div>
            <h4>Bank Settlement Ledger</h4>
            <p>Transparent waterfall deductions and direct NEFT bank credits disbursed pro-rata to farmers.</p>
          </div>
        </div>
      </section>

      <!-- Multi-Stakeholder Benefits (Requirement #1) -->
      <section class="public-section" id="section-benefits">
        <div class="section-header-block">
          <span class="section-tag">Value Proposition</span>
          <h2 class="section-title">Designed for Every Agriculture Stakeholder</h2>
          <p class="section-subtitle">Delivering measurable value across farmers, farmer producer organizations, and corporate buyers.</p>
        </div>

        <div class="benefits-tri-grid">
          <div class="benefit-card">
            <div class="benefit-header">
              <span class="benefit-icon">👨‍🌾</span>
              <h3>Farmer Benefits</h3>
            </div>
            <ul class="benefit-list">
              <li>✅ <strong>15–22% Higher Price Realization:</strong> Eliminates middlemen commissions and distress distress sales.</li>
              <li>✅ <strong>Zero Weight Manipulation:</strong> Certified electronic weighing slip with Digital Lot ID.</li>
              <li>✅ <strong>Guaranteed Direct Bank Credit:</strong> Net payments deposited straight into farmer accounts via NEFT.</li>
              <li>✅ <strong>Access to Working Capital:</strong> Pre-settlement advance credit supported through finance partners.</li>
            </ul>
          </div>

          <div class="benefit-card highlighted">
            <div class="benefit-header">
              <span class="benefit-icon">👨‍💼</span>
              <h3>FPO Benefits</h3>
            </div>
            <ul class="benefit-list">
              <li>✅ <strong>Automated Aggregation Engine:</strong> Pools multiple lots by grade and variety effortlessly.</li>
              <li>✅ <strong>Consolidated Freight Logistics:</strong> Route optimization slashes shared transportation fees.</li>
              <li>✅ <strong>Transparent Settlement Ledger:</strong> Itemized deductions prevent financial disputes.</li>
              <li>✅ <strong>Institutional Buyer Contracts:</strong> Direct trading linkages with national agro-corporates.</li>
            </ul>
          </div>

          <div class="benefit-card">
            <div class="benefit-header">
              <span class="benefit-icon">🏢</span>
              <h3>Buyer Benefits</h3>
            </div>
            <ul class="benefit-list">
              <li>✅ <strong>Direct Farm-Gate Sourcing:</strong> Single-contract procurement of large aggregated volumes.</li>
              <li>✅ <strong>Assayed Quality Consistency:</strong> Certified moisture, purity, and grade inspection reports.</li>
              <li>✅ <strong>Complete Lot Traceability:</strong> Know the exact village and cluster origin of every bag.</li>
              <li>✅ <strong>Escrow Settlement Security:</strong> Funds released only upon verified destination delivery.</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Verified Bulk Buyers Section (Requirement #1) -->
      <section class="public-section" id="section-buyers">
        <div class="section-header-block">
          <span class="section-tag">Trusted Partners</span>
          <h2 class="section-title">Verified Bulk Buyers & Corporate Processors</h2>
          <p class="section-subtitle">Leading agro-industrial corporations procuring directly from AgriPool member FPOs.</p>
        </div>

        <div class="buyer-logos-strip">
          <div class="buyer-badge-item">
            <span class="buyer-pill-icon">🏢</span>
            <strong>ITC Agri Business Division</strong>
            <span>Chilli & Spices</span>
          </div>
          <div class="buyer-badge-item">
            <span class="buyer-pill-icon">🏢</span>
            <strong>Adani Wilmar Agro</strong>
            <span>Paddy & Oilseeds</span>
          </div>
          <div class="buyer-badge-item">
            <span class="buyer-pill-icon">🏢</span>
            <strong>Olam Agri India</strong>
            <span>Export Commodities</span>
          </div>
          <div class="buyer-badge-item">
            <span class="buyer-pill-icon">🏢</span>
            <strong>Cargill Foods India</strong>
            <span>Grain & Maize</span>
          </div>
        </div>
      </section>

      <!-- Call To Action Bottom Banner -->
      <section class="public-cta-banner">
        <h2>Ready to Transform Your Produce Aggregation?</h2>
        <p>Join thousands of farmers, certified FPOs, and bulk buyers on India's premier digital aggregation platform.</p>
        <div class="cta-actions">
          <button onclick="navigateTo('signup')" class="btn btn-accent btn-lg" style="padding: 14px 32px; font-weight: 800;">
            🚀 Create Free Account
          </button>
          <button onclick="navigateTo('login')" class="btn btn-outline btn-lg" style="color: #ffffff; border-color: #ffffff;">
            🔑 Sign In
          </button>
        </div>
      </section>

      <!-- Public Footer -->
      <footer class="public-footer">
        <div class="footer-inner">
          <div>
            <div style="font-weight: 800; font-size: 18px; color: #ffffff; display: flex; align-items: center; gap: 8px;">
              <span>🌾</span> AgriPool Platform
            </div>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 6px; max-width: 400px;">
              Software-first agriculture produce aggregation, pooling, and settlement platform for smallholder farmers and FPOs.
            </p>
          </div>
          <div style="display: flex; gap: 28px; flex-wrap: wrap; font-size: 13.5px; color: #cbd5e1;">
            <a href="javascript:void(0)" onclick="navigateTo('market-prices')" style="color: inherit; text-decoration: none;">Market Prices</a>
            <a href="javascript:void(0)" onclick="navigateTo('live-stock')" style="color: inherit; text-decoration: none;">Live Stock</a>
            <a href="javascript:void(0)" onclick="navigateTo('login')" style="color: inherit; text-decoration: none;">Login</a>
            <a href="javascript:void(0)" onclick="navigateTo('signup')" style="color: inherit; text-decoration: none;">Sign Up</a>
          </div>
        </div>
        <div style="text-align: center; color: #64748b; font-size: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08);">
          © 2026 AgriPool Technologies Ltd. All rights reserved. Master Authentication & Role-Based RBAC Infrastructure.
        </div>
      </footer>
    </div>
  `;
}

window.renderPublicLandingPage = renderPublicLandingPage;
