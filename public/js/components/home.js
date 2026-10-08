// public/js/components/home.js - Home & Platform Overview
function renderHomePage() {
  return `
    <div class="home-page">
      <!-- Hero Section -->
      <section style="background: linear-gradient(135deg, #071e12 0%, #0f5132 50%, #1a744b 100%); color: #ffffff; padding: 60px 32px; border-radius: var(--radius-lg); margin-bottom: 32px; position: relative; overflow: hidden; box-shadow: var(--shadow-lg);">
        <div style="max-width: 860px; margin: 0 auto; text-align: center; position: relative; z-index: 2;">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(224, 169, 38, 0.2); border: 1px solid rgba(224, 169, 38, 0.4); padding: 6px 16px; border-radius: var(--radius-full); font-size: 13px; font-weight: 700; color: #fde68a; margin-bottom: 20px; text-transform: uppercase;">
            🌾 AgriPool Pilot Organization: Kisan Vikas FPO
          </div>
          <h1 style="font-family: var(--font-display); font-size: 42px; font-weight: 800; line-height: 1.2; margin-bottom: 16px; letter-spacing: -0.5px;">
            Turn Small Farm Lots into Stronger Market Opportunities.
          </h1>
          <p style="font-size: 18px; color: #d1fae5; line-height: 1.6; margin-bottom: 28px; max-width: 740px; margin-left: auto; margin-right: auto;">
            Helping Farmers Pool Produce, Reach Better Markets, and Track Every Settlement.
          </p>
          <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
            <button onclick="navigateTo('fpo')" class="btn btn-accent btn-lg" style="font-size: 15px; padding: 12px 28px;">
              📊 Open FPO Dashboard
            </button>
            <button onclick="navigateTo('pools')" class="btn btn-outline btn-lg" style="background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.4); color: #ffffff;">
              🤝 Explore Pools
            </button>
            <button onclick="runAcceptanceDemoPrompt()" class="btn btn-primary btn-lg" style="background: #ffffff; color: #0f5132; font-weight: 700;">
              ⚡ 20-Step Demo Workflow
            </button>
          </div>
        </div>
      </section>

      <!-- The Core Flow -->
      <section class="card" style="margin-bottom: 32px; padding: 30px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 800;">
            The AgriPool Produce Aggregation Journey
          </h2>
          <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">
            Every single lot is verified, pooled, moved, sold, and settled with complete transparency.
          </p>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 14px 0;">
          <div style="text-align: center; flex: 1; min-width: 100px; cursor: pointer;" onclick="navigateTo('farmers')">
            <div style="width: 52px; height: 52px; border-radius: 50%; background: #e8f5e9; color: #198754; font-size: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;">👨‍🌾</div>
            <div style="font-weight: 700; font-size: 13.5px;">1. Farmers</div>
            <div style="font-size: 11.5px; color: var(--text-secondary);">Register & Crops</div>
          </div>
          <div style="color: var(--text-muted); font-size: 18px;">➔</div>
          <div style="text-align: center; flex: 1; min-width: 100px; cursor: pointer;" onclick="navigateTo('lots')">
            <div style="width: 52px; height: 52px; border-radius: 50%; background: #e0f2fe; color: #0284c7; font-size: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;">🏷️</div>
            <div style="font-weight: 700; font-size: 13.5px;">2. Digital Lots</div>
            <div style="font-size: 11.5px; color: var(--text-secondary);">Weight & Quality</div>
          </div>
          <div style="color: var(--text-muted); font-size: 18px;">➔</div>
          <div style="text-align: center; flex: 1; min-width: 100px; cursor: pointer;" onclick="navigateTo('pools')">
            <div style="width: 52px; height: 52px; border-radius: 50%; background: #f3e8ff; color: #7c3aed; font-size: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;">🤝</div>
            <div style="font-weight: 700; font-size: 13.5px;">3. Pooling</div>
            <div style="font-size: 11.5px; color: var(--text-secondary);">Combine Lots</div>
          </div>
          <div style="color: var(--text-muted); font-size: 18px;">➔</div>
          <div style="text-align: center; flex: 1; min-width: 100px; cursor: pointer;" onclick="navigateTo('pickup')">
            <div style="width: 52px; height: 52px; border-radius: 50%; background: #fef3c7; color: #d97706; font-size: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;">🚚</div>
            <div style="font-weight: 700; font-size: 13.5px;">4. Pickup / Store</div>
            <div style="font-size: 11.5px; color: var(--text-secondary);">Route & Bay</div>
          </div>
          <div style="color: var(--text-muted); font-size: 18px;">➔</div>
          <div style="text-align: center; flex: 1; min-width: 100px; cursor: pointer;" onclick="navigateTo('buyers')">
            <div style="width: 52px; height: 52px; border-radius: 50%; background: #ccfbf1; color: #0f766e; font-size: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;">🏢</div>
            <div style="font-weight: 700; font-size: 13.5px;">5. Bulk Buyers</div>
            <div style="font-size: 11.5px; color: var(--text-secondary);">Orders & Sale</div>
          </div>
          <div style="color: var(--text-muted); font-size: 18px;">➔</div>
          <div style="text-align: center; flex: 1; min-width: 100px; cursor: pointer;" onclick="navigateTo('payments')">
            <div style="width: 52px; height: 52px; border-radius: 50%; background: #d1fae5; color: #047857; font-size: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;">💰</div>
            <div style="font-weight: 700; font-size: 13.5px;">6. Payments</div>
            <div style="font-size: 11.5px; color: var(--text-secondary);">Net Bank Settlement</div>
          </div>
        </div>
      </section>

      <!-- Quick Module Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 32px;">
        <div class="card" style="margin-bottom: 0; cursor: pointer;" onclick="navigateTo('farmers')">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 28px;">👨‍🌾</span>
            <span class="badge badge-weighed">Manage</span>
          </div>
          <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 4px;">Farmers Directory</h3>
          <p style="font-size: 13px; color: var(--text-secondary);">Assisted registration, land holdings, and direct bank account linkages.</p>
        </div>

        <div class="card" style="margin-bottom: 0; cursor: pointer;" onclick="navigateTo('crops')">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 28px;">🌾</span>
            <span class="badge badge-settled">Inventory</span>
          </div>
          <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 4px;">Crops Declared</h3>
          <p style="font-size: 13px; color: var(--text-secondary);">Track farmer harvest expectations, categories, and field lots.</p>
        </div>

        <div class="card" style="margin-bottom: 0; cursor: pointer;" onclick="navigateTo('buyers')">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 28px;">🏢</span>
            <span class="badge badge-storage">Marketplace</span>
          </div>
          <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 4px;">Bulk Buyers & Market</h3>
          <p style="font-size: 13px; color: var(--text-secondary);">Verified corporate agro-processors, trade contracts, and purchase offers.</p>
        </div>

        <div class="card" style="margin-bottom: 0; cursor: pointer;" onclick="navigateTo('payments')">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 28px;">💰</span>
            <span class="badge badge-settled">Ledger</span>
          </div>
          <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 4px;">Transparent Payments</h3>
          <p style="font-size: 13px; color: var(--text-secondary);">Itemized waterfall deduction accounting with direct farmer NEFT records.</p>
        </div>
      </div>
    </div>
  `;
}

window.renderHomePage = renderHomePage;
