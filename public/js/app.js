// public/js/app.js - AgriPool Master Application Controller, RBAC Routing & Sidebar Engine
const ROLES = [
  { id: 'Super Admin', label: 'Super Admin (Platform Overseer)' },
  { id: 'FPO Admin', label: 'FPO Admin (Kisan Vikas FPO)' },
  { id: 'SHG Operator', label: 'SHG Operator (Village Lead)' },
  { id: 'Field Operator', label: 'Field Operator (Weighing & Assay)' },
  { id: 'Farmer', label: 'Farmer (Self-Service View)' },
  { id: 'Logistics Partner', label: 'Logistics Partner (Andhra Agro Express)' },
  { id: 'Storage Partner', label: 'Storage Partner (Sri Krishna Cold Chain)' },
  { id: 'Buyer', label: 'Verified Bulk Buyer (ITC Agri / Corporate)' },
  { id: 'Finance Partner', label: 'Finance Partner (Samunnati Agri Fin)' }
];

let currentRole = localStorage.getItem('agripool_role') || 'FPO Admin';
let currentRoute = 'home';

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️')}</span>
    <span style="flex: 1;">${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

const ROUTE_PATH_MAP = {
  'home': '/',
  'login': '/login',
  'signup': '/signup',
  'forgot-password': '/forgot-password',
  'reset-password': '/reset-password',
  'live-stock': '/live-stock',
  'market-prices': '/market-prices',
  'farmers': '/farmers',
  'crops': '/crops',
  'lots': '/lots',
  'pools': '/pools',
  'pickup': '/pickup',
  'storage': '/storage',
  'buyers': '/buyers',
  'orders': '/orders',
  'payments': '/payments',
  'reports': '/reports',
  'notifications': '/notifications',
  'activity': '/activity',
  'growth-plan': '/growth-plan',
  'settings': '/settings',
  'fpo': '/fpo/dashboard',
  'farmer': '/farmer/dashboard',
  'seller': '/seller/dashboard',
  'buyer': '/buyer/dashboard',
  'field': '/field/dashboard',
  'finance': '/finance/dashboard',
  'admin': '/admin/dashboard',
  'help': '/help'
};

function getCanonicalRoute(raw) {
  if (!raw) return 'home';
  const clean = String(raw).toLowerCase().replace(/^\/+/, '').replace(/\/+$/, '').trim();
  if (!clean || clean === 'index.html' || clean === 'home' || clean === 'landing') return 'home';
  if (clean === 'login' || clean === 'signin') return 'login';
  if (clean === 'signup' || clean === 'register') return 'signup';
  if (clean === 'forgot-password') return 'forgot-password';
  if (clean === 'reset-password') return 'reset-password';
  if (clean === 'verify-email') return 'verify-email';
  if (clean === 'live-stock' || clean === 'livestock' || clean === 'stock') return 'live-stock';
  if (clean === 'market-prices' || clean === 'market' || clean === 'prices') return 'market-prices';
  if (clean.startsWith('market/')) return clean;

  if (clean === 'farmers' || clean === 'farmer-directory') return 'farmers';
  if (clean === 'crops' || clean === 'crop') return 'crops';
  if (clean === 'lots' || clean === 'lot') return 'lots';
  if (clean === 'pools' || clean === 'pooling' || clean === 'pool') return 'pools';
  if (clean === 'pickup' || clean === 'pickups' || clean === 'logistics') return 'pickup';
  if (clean === 'storage' || clean === 'warehousing') return 'storage';
  if (clean === 'buyers' || clean === 'bulk-buyers' || clean === 'browse') return 'buyers';
  if (clean === 'orders' || clean === 'order' || clean === 'sales' || clean === 'history') return 'orders';
  if (clean === 'payments' || clean === 'settlement' || clean === 'settlements') return 'payments';
  if (clean === 'reports' || clean === 'analytics') return 'reports';
  if (clean === 'notifications' || clean === 'alerts') return 'notifications';
  if (clean === 'activity' || clean === 'audit') return 'activity';
  if (clean === 'growth-plan' || clean === 'growth' || clean === 'roadmap') return 'growth-plan';
  if (clean === 'settings' || clean === 'config') return 'settings';
  if (clean === 'help' || clean === 'support') return 'help';

  if (clean === 'fpo' || clean === 'pilot' || clean === 'fpo/dashboard' || clean === 'fpo-dashboard') return 'fpo';
  if (clean === 'farmer' || clean === 'farmer/dashboard' || clean === 'farmer-dashboard') return 'farmer';
  if (clean === 'seller' || clean === 'seller/dashboard' || clean === 'seller-dashboard' || clean === 'inventory' || clean === 'listings' || clean === 'offers') return 'seller';
  if (clean === 'buyer' || clean === 'buyer/dashboard' || clean === 'buyer-dashboard') return 'buyer';
  if (clean === 'field' || clean === 'field/dashboard' || clean === 'field-dashboard' || clean === 'shg') return 'field';
  if (clean === 'finance' || clean === 'finance/dashboard' || clean === 'finance-dashboard') return 'finance';
  if (clean === 'admin' || clean === 'admin/dashboard' || clean === 'admin-dashboard' || clean === 'users') return 'admin';

  return clean;
}

// Update Sidebar Visibility and Items (Requirements #1, #8 - #16)
function updateSidebarUI() {
  const isAuth = window.auth ? window.auth.isAuthenticated() : false;
  const sidebarEl = document.getElementById('app-sidebar');
  const roleDisplay = document.getElementById('current-role-title');
  const userDisplay = document.getElementById('header-user-display');
  const roleSelect = document.getElementById('role-switcher-select');
  const navContainer = document.getElementById('sidebar-nav-container');

  // Before login: NO internal sidebar! (Requirement #8)
  if (!isAuth) {
    if (document.body) document.body.classList.add('no-sidebar');
    if (sidebarEl) sidebarEl.style.display = 'none';
    return;
  }

  // After login: Show sidebar belonging ONLY to user's role (Requirements #8 - #16)
  if (document.body) document.body.classList.remove('no-sidebar');
  if (sidebarEl) sidebarEl.style.display = 'flex';

  const user = window.auth.getUser();
  const roleKey = window.auth.getRole();
  const roleCfg = window.auth.getRoleConfig(roleKey);

  if (roleDisplay) roleDisplay.textContent = roleCfg ? roleCfg.name : 'User';
  if (userDisplay && user) {
    userDisplay.textContent = `${user.name} (${roleCfg ? roleCfg.name : ''})`;
  }
  if (roleSelect && roleSelect.options && roleKey) {
    for (const opt of Array.from(roleSelect.options)) {
      if (opt.value && opt.value.toLowerCase().includes(roleKey)) {
        opt.selected = true;
        break;
      }
    }
  }

  // Dynamically populate role-specific sidebar navigation items
  if (navContainer && roleCfg && roleCfg.sidebarItems) {
    navContainer.innerHTML = roleCfg.sidebarItems.map(item => `
      <a class="nav-item ${currentRoute === item.route ? 'active' : ''}" data-route="${item.route}" onclick="navigateTo('${item.route}')">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
        ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
      </a>
    `).join('');
  }
}

// Navigation Router with Role-Based Route Protection (Requirement #17)
async function navigateTo(route, updateHistory = true) {
  const canonical = getCanonicalRoute(route);
  currentRoute = canonical;

  const targetPath = ROUTE_PATH_MAP[canonical] || ('/' + canonical);
  if (updateHistory && typeof window !== 'undefined' && window.location?.pathname !== targetPath && window.history?.pushState) {
    window.history.pushState({ route: canonical }, '', targetPath);
  }

  // Sync Sidebar UI
  updateSidebarUI();

  // Update active class on sidebar items
  document.querySelectorAll('.nav-item').forEach(el => {
    if (el.dataset.route === canonical || (canonical === 'home' && el.dataset.route === 'home')) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  const contentArea = document.getElementById('app-main-content');
  const pageTitle = document.getElementById('header-page-title');
  if (!contentArea) return;

  // Scroll to top
  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Route Guard Check (Requirement #17)
  const isAuth = window.auth ? window.auth.isAuthenticated() : false;
  const isPublicPage = ['home', 'login', 'signup', 'forgot-password', 'reset-password', 'verify-email', 'live-stock', 'market-prices'].some(p => canonical === p || canonical.startsWith('market/'));

  if (!isAuth && !isPublicPage) {
    showToast('Please sign in to access protected platform areas.', 'info');
    navigateTo('login');
    return;
  }

  if (isAuth && !window.auth.canAccessRoute(canonical) && !isPublicPage) {
    if (pageTitle) pageTitle.textContent = 'Access Denied';
    contentArea.innerHTML = renderAccessDeniedPage(canonical, window.auth.getRole());
    return;
  }

  // Render View
  try {
    // 1. Check crop details dynamic route (/market/:crop)
    if (canonical.startsWith('market/')) {
      const cropName = canonical.replace('market/', '').replace(/-/g, ' ');
      if (pageTitle) pageTitle.textContent = `${cropName.toUpperCase()} Market Intelligence`;
      contentArea.innerHTML = await renderCropDetailsPage(cropName);
      return;
    }

    switch (canonical) {
      case 'home':
        if (!isAuth) {
          // Public AgriPool Welcome Page (Requirement #1)
          if (pageTitle) pageTitle.textContent = 'AgriPool • Welcome';
          contentArea.innerHTML = await renderPublicLandingPage();
        } else {
          // Logged-in user sees their own role dashboard!
          const defaultRoleRoute = window.auth.getDefaultRoute();
          if (defaultRoleRoute !== 'home') {
            await navigateTo(defaultRoleRoute, false);
            return;
          }
          if (pageTitle) pageTitle.textContent = 'AgriPool Overview';
          contentArea.innerHTML = renderHomePage();
        }
        break;

      case 'login':
        if (pageTitle) pageTitle.textContent = 'AgriPool Sign In';
        contentArea.innerHTML = renderLoginPage();
        break;

      case 'signup':
        if (pageTitle) pageTitle.textContent = 'AgriPool Registration';
        contentArea.innerHTML = renderSignupPage();
        break;

      case 'forgot-password':
        if (pageTitle) pageTitle.textContent = 'Password Recovery';
        contentArea.innerHTML = renderForgotPasswordPage();
        break;

      case 'reset-password':
        const urlParams = new URLSearchParams(window.location.search);
        const resetToken = urlParams.get('token') || '';
        if (pageTitle) pageTitle.textContent = 'Reset Password';
        contentArea.innerHTML = renderResetPasswordPage(resetToken);
        break;

      case 'verify-email':
        const verifyParams = new URLSearchParams(window.location.search);
        const vToken = verifyParams.get('token');
        if (vToken) {
          await handleAutoVerifyToken(vToken);
        } else {
          navigateTo('login');
        }
        break;

      case 'live-stock':
        if (pageTitle) pageTitle.textContent = '📦 Live Commodity Stock';
        contentArea.innerHTML = await renderLiveStockPage();
        break;

      case 'market-prices':
        if (pageTitle) pageTitle.textContent = '📈 Market Benchmark Prices';
        contentArea.innerHTML = await renderMarketPricesPage();
        break;

      case 'farmer':
        if (pageTitle) pageTitle.textContent = '👨‍🌾 Farmer Self-Service Portal';
        contentArea.innerHTML = await renderFarmerPage();
        break;

      case 'seller':
        if (pageTitle) pageTitle.textContent = '🏢 Seller Inventory & Listings';
        contentArea.innerHTML = await renderSellerDashboard();
        break;

      case 'buyer':
        if (pageTitle) pageTitle.textContent = '🏢 Bulk Buyer Procurement Desk';
        contentArea.innerHTML = await renderBuyerDashboard();
        break;

      case 'fpo':
        if (pageTitle) pageTitle.textContent = '🎯 FPO Dashboard — Kisan Vikas FPO';
        contentArea.innerHTML = await renderFpoDashboard();
        break;

      case 'field':
        if (pageTitle) pageTitle.textContent = '👩‍🌾 SHG & Field Operator Portal';
        contentArea.innerHTML = await renderFieldDashboard();
        break;

      case 'storage':
        if (pageTitle) pageTitle.textContent = '🏭 Storage & Warehousing Facilities';
        contentArea.innerHTML = await renderStoragePage();
        break;

      case 'finance':
        if (pageTitle) pageTitle.textContent = '💳 Partner Working Capital Liquidity';
        contentArea.innerHTML = await renderFinancePage();
        break;

      case 'admin':
        if (pageTitle) pageTitle.textContent = '🛡️ Platform Super Admin Control Deck';
        contentArea.innerHTML = await renderAdminDashboard();
        break;

      case 'farmers':
        if (pageTitle) pageTitle.textContent = '👨‍🌾 Farmer Directory';
        contentArea.innerHTML = await renderFarmersPage();
        break;

      case 'crops':
        if (pageTitle) pageTitle.textContent = '🌾 Crop Declarations';
        contentArea.innerHTML = await renderCropsPage();
        break;

      case 'lots':
        if (pageTitle) pageTitle.textContent = '🏷️ Digital Lot Passports';
        contentArea.innerHTML = await renderLotsPage();
        break;

      case 'pools':
        if (pageTitle) pageTitle.textContent = '🤝 Produce Pooling Engine';
        contentArea.innerHTML = await renderPoolingPage();
        break;

      case 'pickup':
        if (pageTitle) pageTitle.textContent = '🚚 Logistics & Pickup Dispatch';
        contentArea.innerHTML = await renderPickupPage();
        break;

      case 'buyers':
        if (pageTitle) pageTitle.textContent = '🏢 Verified Bulk Buyers & Marketplace';
        contentArea.innerHTML = await renderBuyersPage();
        break;

      case 'orders':
        if (pageTitle) pageTitle.textContent = '🛒 Purchase Orders & Contracts';
        contentArea.innerHTML = await renderOrdersPage();
        break;

      case 'payments':
        if (pageTitle) pageTitle.textContent = '💰 Transparent Settlement Ledger & Payments';
        contentArea.innerHTML = await renderPaymentsPage();
        break;

      case 'reports':
        if (pageTitle) pageTitle.textContent = '📊 Operational Reports & Analytics';
        contentArea.innerHTML = await renderReportsPage();
        break;

      case 'notifications':
        if (pageTitle) pageTitle.textContent = '🔔 Role-Targeted Notifications';
        contentArea.innerHTML = await renderNotificationsPage();
        break;

      case 'activity':
        if (pageTitle) pageTitle.textContent = '🛡️ Activity & Immutable Audit Trail';
        contentArea.innerHTML = await renderActivityPage();
        break;

      case 'growth-plan':
        if (pageTitle) pageTitle.textContent = '🗺️ Growth Plan & Scaling Roadmap';
        contentArea.innerHTML = renderGrowthPlanPage();
        break;

      case 'settings':
        if (pageTitle) pageTitle.textContent = '⚙️ Pilot Settings & Configuration';
        contentArea.innerHTML = await renderSettingsPage();
        break;

      case 'help':
        if (pageTitle) pageTitle.textContent = '❓ Farmer Support & Help Center';
        contentArea.innerHTML = renderHelpPage();
        break;

      default:
        if (!isAuth) {
          contentArea.innerHTML = await renderPublicLandingPage();
        } else {
          contentArea.innerHTML = renderHomePage();
        }
    }
  } catch (err) {
    console.error('Error rendering page:', err);
    contentArea.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px;">
        <div style="font-size: 40px; margin-bottom: 12px;">⚠️</div>
        <h3>Failed to load view</h3>
        <p style="color: var(--text-secondary); margin-bottom: 16px;">${err.message}</p>
        <button onclick="navigateTo('home')" class="btn btn-primary">Return to Home</button>
      </div>
    `;
  }
}

// Help Center Renderer
function renderHelpPage() {
  return `
    <div class="card" style="padding: 32px; max-width: 800px; margin: 0 auto;">
      <h2 style="font-family: var(--font-display); font-size: 26px; font-weight: 800; margin-bottom: 8px;">❓ Farmer Support & Help Center</h2>
      <p style="color: var(--text-secondary); margin-bottom: 24px;">Need assistance with digital lot creation, scale weighing, pooling, or bank settlements?</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
          <strong style="color: #15803d; font-size: 15px;">📞 Kisan Vikas FPO Toll-Free:</strong>
          <div style="font-size: 18px; font-weight: 800; margin-top: 4px;">1800-425-9988</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Mon - Sat, 8:00 AM - 7:00 PM (Telugu, Hindi, English)</div>
        </div>
        <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
          <strong style="color: #1d4ed8; font-size: 15px;">📱 Field Officer Assigned:</strong>
          <div style="font-size: 16px; font-weight: 800; margin-top: 4px;">Ravi Teja (+91 98480 12345)</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Kankipadu Hub & Weighing Center</div>
        </div>
      </div>
      <div style="border-top: 1px solid var(--border); padding-top: 16px;">
        <h4 style="margin-bottom: 8px;">Frequently Asked Questions</h4>
        <details style="margin-bottom: 8px; cursor: pointer;"><summary style="font-weight: 600;">How is my net bank payment calculated?</summary><p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Through transparent waterfall accounting: Gross Buyer Value minus shared logistics, certified cold storage, and 1% FPO cess. The net balance is credited directly via NEFT.</p></details>
        <details style="margin-bottom: 8px; cursor: pointer;"><summary style="font-weight: 600;">When do I receive my electronic scale weighing slip?</summary><p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Immediately upon field weighing. Your Digital Lot Passport with Gross, Tare, and Net weight is timestamped and recorded.</p></details>
      </div>
    </div>
  `;
}

// Role Switcher Handler (For Demo/Testing Persona Transitions)
function switchUserRole(newRole) {
  let roleKey = 'fpo';
  const clean = String(newRole).toLowerCase();
  if (clean.includes('farmer')) roleKey = 'farmer';
  else if (clean.includes('seller')) roleKey = 'seller';
  else if (clean.includes('buyer')) roleKey = 'buyer';
  else if (clean.includes('field') || clean.includes('shg')) roleKey = 'field';
  else if (clean.includes('storage')) roleKey = 'storage';
  else if (clean.includes('finance')) roleKey = 'finance';
  else if (clean.includes('admin') || clean.includes('super')) roleKey = 'admin';

  const demoAccounts = {
    'farmer': { id: 5, name: 'Verified Farmer', role: 'farmer', roleDisplayName: 'Farmer', email: 'farmer@agripool.in' },
    'seller': { id: 10, name: 'Krishna Agri Trading Co.', role: 'seller', roleDisplayName: 'Seller', email: 'seller@agripool.in' },
    'buyer': { id: 8, name: 'ITC Agri Business Bulk Buyer', role: 'buyer', roleDisplayName: 'Bulk Buyer', email: 'buyer@agripool.in' },
    'fpo': { id: 2, name: 'Chaitanya Varma (FPO Manager)', role: 'fpo', roleDisplayName: 'FPO Admin', email: 'fpo@agripool.in' },
    'field': { id: 4, name: 'Ravi Teja (Field Weighing Officer)', role: 'field', roleDisplayName: 'SHG / Field Operator', email: 'field@agripool.in' },
    'storage': { id: 7, name: 'Sri Krishna Cold Chain Storage', role: 'storage', roleDisplayName: 'Storage Partner', email: 'storage@agripool.in' },
    'finance': { id: 9, name: 'Samunnati Agri Financial Services', role: 'finance', roleDisplayName: 'Finance Partner', email: 'finance@agripool.in' },
    'admin': { id: 1, name: 'System Administrator', role: 'admin', roleDisplayName: 'Platform Admin', email: 'admin@agripool.in' }
  };

  const targetUser = demoAccounts[roleKey] || demoAccounts['fpo'];
  if (window.auth) {
    window.auth.currentUser = targetUser;
    localStorage.setItem('agripool_auth_user', JSON.stringify(targetUser));
    localStorage.setItem('agripool_role', targetUser.roleDisplayName);
  }

  showToast(`Switched active persona to ${targetUser.roleDisplayName}`, 'info');
  updateSidebarUI();

  // Role based navigation to appropriate dashboard
  if (roleKey === 'farmer') navigateTo('farmer');
  else if (roleKey === 'seller') navigateTo('seller');
  else if (roleKey === 'buyer') navigateTo('buyer');
  else if (roleKey === 'field') navigateTo('field');
  else if (roleKey === 'storage') navigateTo('storage');
  else if (roleKey === 'finance') navigateTo('finance');
  else if (roleKey === 'admin') navigateTo('admin');
  else navigateTo('fpo');
}

// Ensure Farmer modal dropdowns always match current isolated user
async function refreshFarmerSelectDropdowns() {
  try {
    const farmers = await api.getFarmers({ limit: 100 });
    const selectFarmer = document.getElementById('lot-form-farmer-id');
    if (selectFarmer && Array.isArray(farmers) && farmers.length > 0) {
      selectFarmer.innerHTML = farmers.map(f => `
        <option value="${f.id}">${f.name} (${f.farmer_code || ''} - ${f.village_name || 'Village'})</option>
      `).join('');
    }
    const cropFarmer = document.getElementById('crop-form-farmer-id');
    if (cropFarmer && Array.isArray(farmers) && farmers.length > 0) {
      cropFarmer.innerHTML = farmers.map(f => `
        <option value="${f.id}">${f.name} (${f.farmer_code || ''})</option>
      `).join('');
    }
  } catch (e) {}
}

// Logout Handler (Requirement #24)
function handleLogout() {
  if (window.auth) {
    window.auth.logout();
  }
  updateSidebarUI();
  showToast('You have signed out successfully.', 'info');
  navigateTo('home');
}

// Modal System
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
  if (id === 'create-lot-modal' || id === 'create-crop-modal') {
    refreshFarmerSelectDropdowns();
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// Assisted Farmer Onboarding Submit Handler
async function handleOnboardFarmerSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('farmer-form-name').value;
  const mobile = document.getElementById('farmer-form-mobile').value;
  const village_id = Number(document.getElementById('farmer-form-village').value);
  const farm_size_acres = parseFloat(document.getElementById('farmer-form-acres').value) || 2.0;
  const survey_no = document.getElementById('farmer-form-survey').value;
  const bank_account_no = document.getElementById('farmer-form-bank').value;
  const ifsc_code = document.getElementById('farmer-form-ifsc').value;

  try {
    const farmer = await api.createFarmer({
      name,
      mobile,
      village_id,
      farm_size_acres,
      survey_no,
      bank_account_no,
      ifsc_code
    });

    closeModal('onboard-farmer-modal');
    showToast(`Farmer ${farmer.name} onboarded! Code: ${farmer.farmer_code}`, 'success');
    navigateTo(currentRoute);
  } catch (err) {
    showToast('Failed to onboard farmer: ' + err.message, 'error');
  }
}

// Create Lot Submit Handler
async function handleCreateLotSubmit(e) {
  e.preventDefault();
  const farmer_id = Number(document.getElementById('lot-form-farmer-id').value);
  const produce = document.getElementById('lot-form-produce').value;
  const variety = document.getElementById('lot-form-variety').value;
  const estimated_quantity = parseFloat(document.getElementById('lot-form-quantity').value);
  const actual_weight = parseFloat(document.getElementById('lot-form-actual-weight')?.value) || null;
  const grade = document.getElementById('lot-form-grade').value;

  try {
    const lot = await api.createLot({
      farmer_id,
      produce,
      variety,
      estimated_quantity,
      actual_weight,
      grade
    });

    closeModal('create-lot-modal');
    showToast(`Digital Lot Passport ${lot.lot_code} created!`, 'success');
    navigateTo(currentRoute);
  } catch (err) {
    showToast('Failed to create lot: ' + err.message, 'error');
  }
}

// Weigh Modal & Verify Handlers
function openWeighModal(lotId, estimated = 250) {
  const modal = document.getElementById('weigh-lot-modal');
  if (!modal) return;
  document.getElementById('weigh-modal-lot-id').value = lotId;
  const grossInput = document.getElementById('weigh-gross');
  if (grossInput) grossInput.value = estimated + 15;
  calculateNetWeight();
  openModal('weigh-lot-modal');
}

function calculateNetWeight() {
  const gross = parseFloat(document.getElementById('weigh-gross')?.value) || 0;
  const tare = parseFloat(document.getElementById('weigh-tare')?.value) || 0;
  const net = Math.max(0, gross - tare);
  const netEl = document.getElementById('weigh-net');
  if (netEl) netEl.value = net.toFixed(1);
}

async function handleWeighSubmit(e) {
  e.preventDefault();
  const lotId = Number(document.getElementById('weigh-modal-lot-id').value);
  const gross_weight = parseFloat(document.getElementById('weigh-gross').value);
  const tare_weight = parseFloat(document.getElementById('weigh-tare').value);
  const scale_device_id = document.getElementById('weigh-device').value;

  try {
    const lot = await api.weighLot(lotId, { gross_weight, tare_weight, scale_device_id });
    closeModal('weigh-lot-modal');
    showToast(`Lot ${lot.lot_code} calibrated net weight: ${lot.actual_weight} kg!`, 'success');
    navigateTo(currentRoute);
  } catch (err) {
    showToast('Weighing failed: ' + err.message, 'error');
  }
}

function openVerifyModal(lotId) {
  const modal = document.getElementById('verify-quality-modal');
  if (!modal) return;
  document.getElementById('verify-modal-lot-id').value = lotId;
  openModal('verify-quality-modal');
}

async function handleVerifySubmit(e) {
  e.preventDefault();
  const lotId = Number(document.getElementById('verify-modal-lot-id').value);
  const moisture_pct = parseFloat(document.getElementById('verify-moisture').value);
  const foreign_matter_pct = parseFloat(document.getElementById('verify-foreign').value);
  const quality_grade = document.getElementById('verify-grade').value;
  const assay_officer = document.getElementById('verify-officer').value;

  try {
    const lot = await api.verifyLot(lotId, { moisture_pct, foreign_matter_pct, quality_grade, assay_officer });
    closeModal('verify-quality-modal');
    showToast(`Lot ${lot.lot_code} quality assayed: ${lot.grade}!`, 'success');
    navigateTo(currentRoute);
  } catch (err) {
    showToast('Assaying failed: ' + err.message, 'error');
  }
}

// 1-Click Acceptance Demo
async function runAcceptanceDemoPrompt() {
  if (confirm('Run 1-Click Master Acceptance Workflow (Complete Farm-to-Bank Cycle)?')) {
    try {
      showToast('Executing 20-step master acceptance scenario...', 'info');
      const res = await api.runAcceptanceScenario();
      showToast(`Acceptance passed! Settlement: ${res.step15_settlementCode}`, 'success');
      navigateTo('payments');
    } catch (err) {
      showToast('Acceptance failed: ' + err.message, 'error');
    }
  }
}

// Reset Database Confirmation
async function promptResetSeed() {
  if (confirm('Reset database to clean seed state (75 farmers, 55 lots, 3 pools)?')) {
    try {
      await api.resetSeed();
      showToast('Database reset and seeded successfully!', 'success');
      navigateTo('home');
    } catch (err) {
      showToast('Reset failed: ' + err.message, 'error');
    }
  }
}

// Initialize Real Database Status (Requirement #6)
async function initDatabaseStatusCheck() {
  try {
    const res = await api.getDatabaseStatus();
    if (window.updateDbIndicatorUI) {
      window.updateDbIndicatorUI(res);
    }
  } catch (err) {
    const pill = document.getElementById('db-status-indicator');
    const text = document.getElementById('db-status-text');
    if (pill && text) {
      pill.className = 'db-status-pill disconnected';
      text.textContent = 'Database: Disconnected';
    }
  }
}

// Initialize Live Market Scrolling Ticker (Requirement #10 & Live Market Integration)
let marketTickerInterval = null;
let lastTickerDataHash = '';

async function initMarketTicker() {
  const containerEl = document.getElementById('ticker-track-container');
  const trackEl = document.getElementById('ticker-track-content');
  const sourceTag = document.getElementById('ticker-source-tag');
  if (!trackEl) return;

  // Add interactive horizontal wheel scrolling for fast browsing through items
  if (containerEl && !containerEl._wheelAttached) {
    containerEl._wheelAttached = true;
    containerEl.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0 || e.deltaX !== 0) {
        e.preventDefault();
        containerEl.scrollLeft += (e.deltaY || e.deltaX) * 1.5;
      }
    }, { passive: false });
  }

  try {
    const rawPrices = await api.getMarketPrices();
    const prices = Array.isArray(rawPrices) ? rawPrices : (rawPrices?.data || []);
    const livePrices = prices.filter(p => p.is_live_api === 1);

    if (livePrices.length === 0) {
      if (sourceTag) {
        sourceTag.textContent = 'Market Data Source Not Connected';
        sourceTag.style.background = '#fee2e2';
        sourceTag.style.color = '#991b1b';
      }
      trackEl.innerHTML = '<span class="ticker-item"><span style="color: #94a3b8; font-weight: 600;">⚠️ Live Market Feed: Connecting to official feed...</span></span>';
      
      // Auto-trigger background sync if not connected
      api.syncMarketPrices().catch(() => {});
      return;
    }

    // Check if data changed to prevent unnecessary re-renders
    const currentHash = `${livePrices.length}_${livePrices[0]?.price_per_kg}_${livePrices[0]?.last_updated}`;
    if (currentHash === lastTickerDataHash && trackEl.children.length > 1) {
      return;
    }
    lastTickerDataHash = currentHash;

    if (sourceTag) {
      sourceTag.textContent = `Government of India / data.gov.in • ${livePrices.length} Items Live`;
      sourceTag.style.background = '#dcfce7';
      sourceTag.style.color = '#166534';
    }

    // Dynamically adjust animation speed for a smooth, readable, and comfortable browsing pace
    const animationDuration = Math.max(60, Math.min(160, Math.round(livePrices.length * 4.2)));
    trackEl.style.animationDuration = `${animationDuration}s`;

    // Build ticker HTML with all available market items
    const renderItems = (items) => items.map(p => {
      const trendIcon = p.price_trend === 'UP' ? '▲' : p.price_trend === 'DOWN' ? '▼' : '■';
      const trendClass = p.price_trend === 'UP' ? 'up' : p.price_trend === 'DOWN' ? 'down' : 'stable';
      const pct = p.change_pct ? `${Math.abs(p.change_pct)}%` : '';
      const commodityName = p.commodity || p.crop_name;
      const marketName = p.market || 'APMC';
      return `
        <a href="javascript:void(0)" onclick="navigateTo('market-prices')" class="ticker-item" title="${commodityName} at ${marketName} (${p.state || ''}): ₹${Number(p.price_per_kg).toFixed(2)}/kg">
          <span class="ticker-crop-name">${commodityName}</span>
          <span style="font-size: 11px; color: #64748b; background: rgba(0,0,0,0.05); padding: 1px 6px; border-radius: 4px; font-weight: 500;">📍 ${marketName}</span>
          <span class="ticker-price">₹${Number(p.price_per_kg).toFixed(2)}</span>
          <span class="ticker-unit">/${p.unit || 'kg'}</span>
          <span class="ticker-trend ${trendClass}">${trendIcon} ${pct}</span>
        </a>
      `;
    }).join('');

    // Double items for seamless continuous infinite loop
    trackEl.innerHTML = renderItems(livePrices) + renderItems(livePrices);
  } catch (err) {
    if (sourceTag) {
      sourceTag.textContent = 'Market Data Source Not Connected';
      sourceTag.style.background = '#fee2e2';
      sourceTag.style.color = '#991b1b';
    }
    trackEl.innerHTML = '<span class="ticker-item"><span style="color: #94a3b8;">Market Data Source Not Connected</span></span>';
  }

  // Periodic Live Updates (Every 60s)
  if (!marketTickerInterval) {
    marketTickerInterval = setInterval(() => {
      initMarketTicker();
    }, 60000);
  }
}

// Initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
  // Sync Status Listener
  api.onSyncChange((status, count) => {
    const pill = document.getElementById('sync-status-indicator');
    if (pill) {
      if (status === 'synced') {
        pill.className = 'sync-status-pill';
        pill.innerHTML = `<span class="sync-dot"></span><span>SYNCED</span>`;
      } else {
        pill.className = 'sync-status-pill pending';
        pill.innerHTML = `<span class="sync-dot"></span><span>PENDING SYNC (${count})</span>`;
      }
    }
  });

  // Populate Dropdown Farmers for lot creation
  try {
    const farmers = await api.getFarmers({ limit: 100 });
    const selectFarmer = document.getElementById('lot-form-farmer-id');
    if (selectFarmer) {
      selectFarmer.innerHTML = farmers.map(f => `
        <option value="${f.id}">${f.name} (${f.farmer_code} - ${f.village_name || 'Kankipadu'})</option>
      `).join('');
    }
  } catch (e) {}

  // Update initial Sidebar UI based on auth state
  updateSidebarUI();

  // Test live Supabase connection status
  initDatabaseStatusCheck();

  // Launch Live Market Ticker
  initMarketTicker();

  // Browser Back/Forward navigation support
  window.addEventListener('popstate', (e) => {
    const route = getCanonicalRoute(window.location.pathname);
    navigateTo(route, false);
  });

  // Initial Route from pathname or hash
  let initialRoute = getCanonicalRoute(window.location.pathname);
  if (initialRoute === 'home' && window.location.hash) {
    const hashClean = window.location.hash.replace('#', '');
    if (hashClean) initialRoute = getCanonicalRoute(hashClean);
  }

  await navigateTo(initialRoute, false);
});

// Explicit window exports for onclick bindings
window.navigateTo = navigateTo;
window.getCanonicalRoute = getCanonicalRoute;
window.switchUserRole = switchUserRole;
window.updateSidebarUI = updateSidebarUI;
window.handleLogout = handleLogout;
window.openModal = openModal;
window.closeModal = closeModal;
window.showToast = showToast;
window.promptResetSeed = promptResetSeed;
window.runAcceptanceDemoPrompt = runAcceptanceDemoPrompt;
window.openWeighModal = openWeighModal;
window.calculateNetWeight = calculateNetWeight;
window.handleWeighSubmit = handleWeighSubmit;
window.openVerifyModal = openVerifyModal;
window.handleVerifySubmit = handleVerifySubmit;
window.handleOnboardFarmerSubmit = handleOnboardFarmerSubmit;
window.handleCreateLotSubmit = handleCreateLotSubmit;
window.initDatabaseStatusCheck = initDatabaseStatusCheck;
window.initMarketTicker = initMarketTicker;
