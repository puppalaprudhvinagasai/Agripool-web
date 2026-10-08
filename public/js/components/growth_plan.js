// public/js/components/growth_plan.js - Growth Plan & Roadmap (Section 32)
function renderGrowthPlanPage() {
  return `
    <div class="growth-plan-page">
      <!-- Header -->
      <div class="card-header" style="margin-bottom: 24px;">
        <div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary);">
            🗺️ Growth Plan
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            The phased scaling roadmap from our pilot FPO validation to multi-state aggregation corridors.
          </p>
        </div>
        <div>
          <span class="badge badge-settled" style="font-size: 13px; padding: 6px 14px;">
            CURRENT: PHASE 1 PILOT ACTIVE
          </span>
        </div>
      </div>

      <!-- Section 32 Roadmap Progression -->
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 960px; margin: 0 auto;">
        <!-- PHASE 1 -->
        <div class="card" style="border-left: 6px solid #10b981; padding: 28px; position: relative; background: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div>
              <div style="display: inline-flex; align-items: center; gap: 6px; background: #ecfdf5; color: #047857; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase;">
                🚀 Phase 1 • 0–3 Months (Active Now)
              </div>
              <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 800; margin: 8px 0 4px 0;">
                Start the Pilot
              </h2>
              <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                Build local trust, validate digital lots, and complete the first live pooled transaction.
              </p>
            </div>
            <span class="badge badge-settled" style="font-size: 12px; font-weight: 700;">IN PROGRESS (75% TARGETS MET)</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
              <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">TARGET 1</div>
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">1 FPO / SHG</div>
              <div style="font-size: 12px; color: #10b981; font-weight: 600; margin-top: 4px;">✓ Kisan Vikas FPO Live</div>
            </div>
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
              <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">TARGET 2</div>
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">50–100 Farmers</div>
              <div style="font-size: 12px; color: #10b981; font-weight: 600; margin-top: 4px;">✓ 75 Farmers Registered</div>
            </div>
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
              <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">TARGET 3</div>
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">First Pool</div>
              <div style="font-size: 12px; color: #10b981; font-weight: 600; margin-top: 4px;">✓ POOL-0001 (900 kg) Assembled</div>
            </div>
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
              <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">TARGET 4</div>
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">First Buyer & Settlement</div>
              <div style="font-size: 12px; color: #10b981; font-weight: 600; margin-top: 4px;">✓ ₹1,48,150 Net Paid via NEFT</div>
            </div>
          </div>
        </div>

        <div style="text-align: center; color: var(--primary); font-size: 28px; line-height: 1;">
          ↓
        </div>

        <!-- PHASE 2 -->
        <div class="card" style="border-left: 6px solid #3b82f6; padding: 28px; position: relative; background: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div>
              <div style="display: inline-flex; align-items: center; gap: 6px; background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase;">
                🌱 Phase 2 • 3–12 Months
              </div>
              <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 800; margin: 8px 0 4px 0;">
                Grow the Network
              </h2>
              <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                Expand across Guntur and Krishna districts, integrating certified cold stores and logistics fleets.
              </p>
            </div>
            <span class="badge badge-accent" style="font-size: 12px; font-weight: 700;">UPCOMING</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
              <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">SCALE TARGET</div>
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">More FPOs & SHGs</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">5–10 FPOs onboarded</div>
            </div>
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
              <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">SCALE TARGET</div>
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">More Farmers</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">1,000+ active smallholders</div>
            </div>
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
              <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">PARTNERSHIPS</div>
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">Logistics & Storage</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">50+ verified trucks & cold bays</div>
            </div>
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
              <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">DEMAND</div>
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">Bulk Buyers</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">20+ corporate off-takers</div>
            </div>
          </div>
        </div>

        <div style="text-align: center; color: var(--primary); font-size: 28px; line-height: 1;">
          ↓
        </div>

        <!-- PHASE 3 -->
        <div class="card" style="border-left: 6px solid #8b5cf6; padding: 28px; position: relative; background: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div>
              <div style="display: inline-flex; align-items: center; gap: 6px; background: #f5f3ff; color: #6d28d9; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase;">
                🌐 Phase 3 • 12+ Months
              </div>
              <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 800; margin: 8px 0 4px 0;">
                Regional Scale
              </h2>
              <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                District clusters, multi-state agricultural trade corridors, and institutional buyer marketplace liquidity.
              </p>
            </div>
            <span class="badge" style="background: #ede9fe; color: #6d28d9; font-size: 12px; font-weight: 700;">VISION</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
              <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">CLUSTERS</div>
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">District Clusters</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">State-wide FPO federations</div>
            </div>
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
              <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">CORRIDORS</div>
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">Multi-State Network</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">AP, Telangana, Karnataka routes</div>
            </div>
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
              <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">INSTITUTIONS</div>
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">Institutional Buyers</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">National FMCG & Export contracts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.renderGrowthPlanPage = renderGrowthPlanPage;
window.renderRoadmapPage = renderGrowthPlanPage; // backward compatibility
