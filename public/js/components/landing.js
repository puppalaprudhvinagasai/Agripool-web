// public/js/components/landing.js - Public Landing Page Component
function renderLandingPage() {
  return `
    <div class="landing-container">
      <!-- Hero Section -->
      <section class="landing-hero" style="background: linear-gradient(135deg, #071e12 0%, #0f5132 50%, #1a744b 100%); color: #ffffff; padding: 80px 32px; border-radius: var(--radius-lg); margin-bottom: 40px; position: relative; overflow: hidden; box-shadow: var(--shadow-xl);">
        <div style="max-width: 860px; margin: 0 auto; text-align: center; position: relative; z-index: 2;">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(224, 169, 38, 0.2); border: 1px solid rgba(224, 169, 38, 0.4); padding: 6px 16px; border-radius: var(--radius-full); font-size: 13px; font-weight: 700; color: #fde68a; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.8px;">
            🌾 Phase 1 Live Pilot • Kisan Vikas FPO (AP)
          </div>
          <h1 style="font-family: var(--font-display); font-size: 46px; font-weight: 800; line-height: 1.15; margin-bottom: 20px; letter-spacing: -1px;">
            Turning Small Farm Lots into Stronger Market Access
          </h1>
          <p style="font-size: 19px; color: #d1fae5; line-height: 1.6; margin-bottom: 36px; max-width: 740px; margin-left: auto; margin-right: auto;">
            Digitally aggregate, manage, move and settle fragmented agricultural produce through trusted local networks.
          </p>
          <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
            <button onclick="navigateTo('pilot')" class="btn btn-accent btn-lg" style="font-size: 16px; padding: 14px 32px;">
              🚀 Start Pilot Dashboard
            </button>
            <button onclick="navigateTo('pooling')" class="btn btn-outline btn-lg" style="background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.3); color: #ffffff;">
              ⚖️ Explore Pooling Engine
            </button>
          </div>
        </div>
      </section>

      <!-- The Core Problem Solved -->
      <section style="margin-bottom: 50px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text-primary);">
            Why Smallholder Produce Aggregation Fails Today
          </h2>
          <p style="color: var(--text-secondary); max-width: 650px; margin: 8px auto 0;">
            Small farmers face structural disincentives when selling individually to local village aggregators.
          </p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
          <div class="card" style="margin-bottom: 0;">
            <div style="font-size: 32px; margin-bottom: 12px;">📉</div>
            <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 8px;">Fragmented Small Lots</h3>
            <p style="font-size: 13.5px; color: var(--text-secondary);">Individual farmers produce 150–350 kg, too small for institutional corporate buyers, forcing distress sales to village moneylenders.</p>
          </div>
          <div class="card" style="margin-bottom: 0;">
            <div style="font-size: 32px; margin-bottom: 12px;">🚚</div>
            <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 8px;">High Transportation Costs</h3>
            <p style="font-size: 13.5px; color: var(--text-secondary);">Individual auto/tempo rentals cost up to 18% of crop value. Aggregating 10–20 lots into a single scheduled truck reduces logistics by 40%.</p>
          </div>
          <div class="card" style="margin-bottom: 0;">
            <div style="font-size: 32px; margin-bottom: 12px;">🏭</div>
            <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 8px;">Lack of Affordable Storage</h3>
            <p style="font-size: 13.5px; color: var(--text-secondary);">Cold stores refuse unverified micro-lots. Pooled lots unlock certified warehouse bays with warehouse receipt financing.</p>
          </div>
          <div class="card" style="margin-bottom: 0;">
            <div style="font-size: 32px; margin-bottom: 12px;">🧾</div>
            <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 8px;">Hidden Deductions & Cheating</h3>
            <p style="font-size: 13.5px; color: var(--text-secondary);">Manual scale manipulation, arbitrary moisture cuts, and opaque mandi fees. Our Digital Lot Passport ensures 100% auditability.</p>
          </div>
        </div>
      </section>

      <!-- The Core Concept Pipeline -->
      <section class="card" style="padding: 36px; background: #ffffff; border: 1px solid var(--border); margin-bottom: 50px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--primary); letter-spacing: 1px;">Operating Model</span>
          <h2 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; margin-top: 4px;">
            The Complete Digital Aggregation Lifecycle
          </h2>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 20px 0;">
          <div style="text-align: center; flex: 1; min-width: 120px;">
            <div style="width: 54px; height: 54px; border-radius: 50%; background: #e8f5e9; color: #198754; font-size: 22px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">👨‍🌾</div>
            <div style="font-weight: 700; font-size: 14px;">1. Farmer</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Assisted Onboarding</div>
          </div>
          <div style="color: var(--text-muted); font-size: 20px;">➜</div>
          <div style="text-align: center; flex: 1; min-width: 120px;">
            <div style="width: 54px; height: 54px; border-radius: 50%; background: #e0f2fe; color: #0284c7; font-size: 22px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">🏷️</div>
            <div style="font-weight: 700; font-size: 14px;">2. Digital Lot</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Weight & Grade Passport</div>
          </div>
          <div style="color: var(--text-muted); font-size: 20px;">➜</div>
          <div style="text-align: center; flex: 1; min-width: 120px;">
            <div style="width: 54px; height: 54px; border-radius: 50%; background: #f3e8ff; color: #7c3aed; font-size: 22px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">⚖️</div>
            <div style="font-weight: 700; font-size: 14px;">3. Pooling</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Multi-Lot Aggregation</div>
          </div>
          <div style="color: var(--text-muted); font-size: 20px;">➜</div>
          <div style="text-align: center; flex: 1; min-width: 120px;">
            <div style="width: 54px; height: 54px; border-radius: 50%; background: #fef3c7; color: #d97706; font-size: 22px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">🚚</div>
            <div style="font-weight: 700; font-size: 14px;">4. Logistics</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Shared Routes / Cold Bay</div>
          </div>
          <div style="color: var(--text-muted); font-size: 20px;">➜</div>
          <div style="text-align: center; flex: 1; min-width: 120px;">
            <div style="width: 54px; height: 54px; border-radius: 50%; background: #ccfbf1; color: #0f766e; font-size: 22px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">🏢</div>
            <div style="font-weight: 700; font-size: 14px;">5. Bulk Buyer</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Verified Escrow Order</div>
          </div>
          <div style="color: var(--text-muted); font-size: 20px;">➜</div>
          <div style="text-align: center; flex: 1; min-width: 120px;">
            <div style="width: 54px; height: 54px; border-radius: 50%; background: #d1fae5; color: #047857; font-size: 22px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">💰</div>
            <div style="font-weight: 700; font-size: 14px;">6. Settlement</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Direct NEFT to Bank</div>
          </div>
        </div>
      </section>

      <!-- Digital Lot Passport Feature Callout -->
      <section style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 50px; align-items: center;">
        <div>
          <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--primary); letter-spacing: 1px;">Traceability Standard</span>
          <h2 style="font-family: var(--font-display); font-size: 28px; font-weight: 800; margin: 6px 0 16px;">
            Digital Lot ID Passport
          </h2>
          <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
            Every bag and crate receives a unique identifier (e.g. <code>LOT-2026-AP-000042</code>) linking farmer identity, calibrated electronic scale weight, moisture assays, and exact geolocation.
          </p>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 14px; color: var(--text-primary);">
            <li style="display: flex; align-items: center; gap: 8px;">✅ Calibrated digital scale gross, tare & net weight slips</li>
            <li style="display: flex; align-items: center; gap: 8px;">✅ Assay inspector grade, moisture % & foreign matter certification</li>
            <li style="display: flex; align-items: center; gap: 8px;">✅ Live 9-stage lifecycle tracking from harvest to bank credit</li>
            <li style="display: flex; align-items: center; gap: 8px;">✅ QR-coded physical receipt printable for non-smartphone farmers</li>
          </ul>
        </div>
        <div class="passport-card" style="box-shadow: var(--shadow-lg);">
          <div class="passport-stamp">VERIFIED PILOT</div>
          <div style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); font-weight: 700;">Government & FPO Recognized</div>
          <div class="passport-id">LOT-2026-AP-000021</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; margin: 16px 0;">
            <div><strong>Farmer:</strong> Venkata Reddy</div>
            <div><strong>FPO:</strong> Kisan Vikas PC Ltd.</div>
            <div><strong>Produce:</strong> Guntur Sannam Chilli</div>
            <div><strong>Weight:</strong> 265.0 kg Net</div>
            <div><strong>Grade:</strong> Grade A (11.2% Moisture)</div>
            <div><strong>Status:</strong> <span class="badge badge-settled">SETTLED</span></div>
          </div>
          <div style="border-top: 1px dashed var(--border); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: var(--text-secondary);">Direct Bank Credit UTR: HDFC20260928001239</span>
            <span style="font-size: 20px;">📱</span>
          </div>
        </div>
      </section>

      <!-- Transparent Settlement Waterfall Showcase -->
      <section class="card" style="padding: 36px; margin-bottom: 50px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="font-family: var(--font-display); font-size: 26px; font-weight: 800;">
            Transparent Settlement Waterfall
          </h2>
          <p style="color: var(--text-secondary); max-width: 600px; margin: 6px auto 0;">
            Never silently overwrite deductions. Farmers and FPOs see exactly how every rupee was accounted for.
          </p>
        </div>
        <div style="max-width: 580px; margin: 0 auto;" class="waterfall-box">
          <div class="waterfall-row">
            <span><strong>Gross Sale Value (Bulk Buyer PO)</strong></span>
            <span style="font-weight: 700; color: #16a34a;">₹1,00,000.00</span>
          </div>
          <div class="waterfall-row deduction">
            <span>− Consolidated Logistics (Shared Route)</span>
            <span>− ₹5,000.00</span>
          </div>
          <div class="waterfall-row deduction">
            <span>− Certified Cold Storage Charges (7 Days)</span>
            <span>− ₹2,000.00</span>
          </div>
          <div class="waterfall-row deduction">
            <span>− FPO Platform & Assaying Fee (1.0%)</span>
            <span>− ₹1,000.00</span>
          </div>
          <div class="waterfall-row deduction">
            <span>− Mandi Cess & Handling</span>
            <span>− ₹500.00</span>
          </div>
          <div class="waterfall-row total">
            <span>Net Disbursed to Farmers (Pro-Rata Bank Credit)</span>
            <span>₹91,500.00</span>
          </div>
        </div>
      </section>

      <!-- Impact Metrics -->
      <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 50px;">
        <div class="card" style="text-align: center; padding: 24px;">
          <div style="font-size: 32px; font-weight: 800; color: var(--primary);">+22.4%</div>
          <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-top: 4px;">Higher Price Realization</div>
        </div>
        <div class="card" style="text-align: center; padding: 24px;">
          <div style="font-size: 32px; font-weight: 800; color: #0284c7;">-38.5%</div>
          <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-top: 4px;">Logistics Cost Reduction</div>
        </div>
        <div class="card" style="text-align: center; padding: 24px;">
          <div style="font-size: 32px; font-weight: 800; color: #7c3aed;">100%</div>
          <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-top: 4px;">Digital Audit Trail</div>
        </div>
        <div class="card" style="text-align: center; padding: 24px;">
          <div style="font-size: 32px; font-weight: 800; color: #d97706;">48 hrs</div>
          <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-top: 4px;">Average Settlement Time</div>
        </div>
      </section>

      <!-- Footer Call to Action -->
      <section style="text-align: center; padding: 40px; background: #ffffff; border-radius: var(--radius-lg); border: 1px solid var(--border);">
        <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 10px;">Ready to Deploy in Your FPO or Cluster?</h3>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">Experience the end-to-end aggregation, pooling, and settlement flow right now.</p>
        <button onclick="navigateTo('pilot')" class="btn btn-primary btn-lg">Launch FPO Pilot Console</button>
      </section>
    </div>
  `;
}
