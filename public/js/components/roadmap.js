// public/js/components/roadmap.js - Phase 1 vs Phase 2 Product Roadmap & Scale Architecture
function renderRoadmapPage() {
  return `
    <div class="roadmap-page">
      <div class="card-header" style="margin-bottom: 24px;">
        <div>
          <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 800;">
            🗺️ Platform Scaling Roadmap & Multi-Cluster Architecture
          </h2>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            Structured from local assisted pilot execution to regional multi-state produce aggregation corridors.
          </p>
        </div>
      </div>

      <!-- Phase 1 vs Phase 2 Comparison Cards -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 36px;">
        <!-- Phase 1 Card -->
        <div class="card" style="border: 2px solid var(--primary); background: #fbfdfb;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span class="badge badge-settled" style="font-size: 13px;">ACTIVE PHASE • MONTH 0–3</span>
            <span style="font-weight: 700; color: var(--primary);">Pilot Execution</span>
          </div>
          <h3 style="font-family: var(--font-display); font-size: 22px; font-weight: 800; margin-bottom: 8px;">
            Phase 1: Foundation & Local Trust
          </h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 20px;">
            Validate the end-to-end aggregation, pooling, and settlement workflow with one FPO/SHG and 50–100 smallholders.
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13.5px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #16a34a; font-size: 16px;">✓</span>
              <span><strong>1 FPO / SHG Association:</strong> Kisan Vikas Farmers PC Ltd.</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #16a34a; font-size: 16px;">✓</span>
              <span><strong>50–100 Smallholder Farmers:</strong> 75 profiles onboarded in Krishna & Guntur</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #16a34a; font-size: 16px;">✓</span>
              <span><strong>Digital Lot IDs:</strong> Tamper-evident passports with scale weighing slips</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #16a34a; font-size: 16px;">✓</span>
              <span><strong>Pooling Engine:</strong> Multi-lot compatibility matching & weight aggregation</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #16a34a; font-size: 16px;">✓</span>
              <span><strong>First Live Pooled Transaction:</strong> ₹4,73,000 corporate purchase order</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #16a34a; font-size: 16px;">✓</span>
              <span><strong>Settlement Tracking:</strong> Pro-rata waterfall deductions & direct NEFT bank credits</span>
            </div>
          </div>
        </div>

        <!-- Phase 2 Card -->
        <div class="card" style="border: 2px solid #0284c7; background: #f8fafc;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span class="badge badge-weighed" style="font-size: 13px;">SCALING PHASE • MONTH 3–12+</span>
            <span style="font-weight: 700; color: #0284c7;">Commercial Scale</span>
          </div>
          <h3 style="font-family: var(--font-display); font-size: 22px; font-weight: 800; margin-bottom: 8px;">
            Phase 2: Commercial Integration & Scale
          </h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 20px;">
            Scale across regional clusters, integrated cold chain logistics, verified bulk buyers, and partner working capital.
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13.5px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #0284c7; font-size: 16px;">➜</span>
              <span><strong>Logistics Transporter Network:</strong> Multi-village shared-route pickup fleets</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #0284c7; font-size: 16px;">➜</span>
              <span><strong>Storage Facility Network:</strong> Certified cold stores, dry warehouses & silos</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #0284c7; font-size: 16px;">➜</span>
              <span><strong>Verified Institutional Buyers:</strong> Agro-processors, FMCG & spice exporters</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #0284c7; font-size: 16px;">➜</span>
              <span><strong>Partner Liquidity:</strong> Working capital & warehouse receipt advances (Samunnati/NBFC)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #0284c7; font-size: 16px;">➜</span>
              <span><strong>Farmer Self-Service:</strong> Low-literacy multilingual portal with voice synthesis</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #0284c7; font-size: 16px;">➜</span>
              <span><strong>Corridor Scale:</strong> Andhra Pradesh – Telangana – Karnataka Agricultural Corridors</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Multi-Cluster Scale Hierarchy Diagram -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">🌐 Multi-Cluster Scale Architecture (Section 11)</h3>
            <div class="card-subtitle">Non hard-coded hierarchical scaling entity model</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 20px 10px; background: #f8fafc; border-radius: var(--radius-md);">
          <div style="text-align: center; flex: 1; min-width: 110px;">
            <div style="font-size: 26px;">🏡</div>
            <strong style="font-size: 13.5px;">Village Level</strong>
            <div style="font-size: 11px; color: var(--text-secondary);">Farmer & Farm Land</div>
          </div>
          <div style="color: var(--text-muted);">➜</div>
          <div style="text-align: center; flex: 1; min-width: 110px;">
            <div style="font-size: 26px;">🤝</div>
            <strong style="font-size: 13.5px;">FPO / SHG</strong>
            <div style="font-size: 11px; color: var(--text-secondary);">Assisted Field Operators</div>
          </div>
          <div style="color: var(--text-muted);">➜</div>
          <div style="text-align: center; flex: 1; min-width: 110px;">
            <div style="font-size: 26px;">📦</div>
            <strong style="font-size: 13.5px;">Cluster Hub</strong>
            <div style="font-size: 11px; color: var(--text-secondary);">Weighing & Assaying</div>
          </div>
          <div style="color: var(--text-muted);">➜</div>
          <div style="text-align: center; flex: 1; min-width: 110px;">
            <div style="font-size: 26px;">🏛️</div>
            <strong style="font-size: 13.5px;">District Level</strong>
            <div style="font-size: 11px; color: var(--text-secondary);">Krishna & Guntur Hubs</div>
          </div>
          <div style="color: var(--text-muted);">➜</div>
          <div style="text-align: center; flex: 1; min-width: 110px;">
            <div style="font-size: 26px;">🛣️</div>
            <strong style="font-size: 13.5px;">State Corridor</strong>
            <div style="font-size: 11px; color: var(--text-secondary);">AP & Telangana Corridors</div>
          </div>
          <div style="color: var(--text-muted);">➜</div>
          <div style="text-align: center; flex: 1; min-width: 110px;">
            <div style="font-size: 26px;">🏢</div>
            <strong style="font-size: 13.5px;">Institutional Buyers</strong>
            <div style="font-size: 11px; color: var(--text-secondary);">ITC, Patanjali, Olam</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
