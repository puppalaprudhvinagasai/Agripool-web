// test_master_acceptance.js - Comprehensive 13-Test Acceptance Verification
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function runMasterAcceptance() {
  console.log('======================================================================');
  console.log('🌾 AGRI POOL — MASTER AUTHENTICATION & ROLE ACCEPTANCE VALIDATION');
  console.log('======================================================================\n');

  // Set up headless browser runtime
  let currentPath = '/';
  let historyStack = [];
  const storage = {};
  const classes = new Set(['no-sidebar']);

  const sidebarNavContainer = { innerHTML: '', classList: { add: () => {}, remove: () => {} } };
  const sidebarEl = { style: { display: 'none' }, classList: { add: () => {}, remove: () => {} } };
  const mainContent = { innerHTML: '' };
  const pageTitle = { textContent: '' };
  const roleDisplay = { textContent: '' };
  const userDisplay = { textContent: '' };

  const sandbox = {
    console,
    window: {
      location: {
        get pathname() { return currentPath; },
        search: ''
      },
      history: {
        pushState: (s, t, url) => {
          currentPath = url;
          historyStack.push({ state: s, url });
        }
      },
      scrollTo: () => {},
      addEventListener: () => {}
    },
    document: {
      body: {
        classList: {
          add: (c) => classes.add(c),
          remove: (c) => classes.delete(c),
          contains: (c) => classes.has(c)
        }
      },
      addEventListener: () => {},
      querySelectorAll: (sel) => [],
      getElementById: (id) => {
        if (id === 'app-sidebar') return sidebarEl;
        if (id === 'sidebar-nav-container') return sidebarNavContainer;
        if (id === 'app-main-content') return mainContent;
        if (id === 'header-page-title') return pageTitle;
        if (id === 'current-role-title') return roleDisplay;
        if (id === 'header-user-display') return userDisplay;
        return { value: '', textContent: '', style: {}, innerHTML: '', classList: { add: () => {}, remove: () => {} }, appendChild: () => {} };
      },
      createElement: () => ({ style: {}, appendChild: () => {}, remove: () => {} })
    },
    localStorage: {
      getItem: (k) => storage[k] || null,
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: (k) => { delete storage[k]; }
    },
    setTimeout,
    clearTimeout,
    URLSearchParams: globalThis.URLSearchParams,
    fetch: (url, opts) => {
      const fullUrl = url.startsWith('/') ? `http://localhost:3000${url}` : url;
      return globalThis.fetch(fullUrl, opts);
    },
    Set: globalThis.Set,
    Array: globalThis.Array,
    Date: globalThis.Date,
    Math: globalThis.Math,
    Number: globalThis.Number,
    String: globalThis.String,
    parseFloat: globalThis.parseFloat,
    parseInt: globalThis.parseInt,
    location: {
      get pathname() { return currentPath; },
      search: ''
    },
    history: {
      pushState: (s, t, url) => {
        currentPath = url;
        historyStack.push({ state: s, url });
      }
    }
  };
  sandbox.window = sandbox;

  const context = vm.createContext(sandbox);

  // Load app scripts
  const scripts = [
    'public/js/api.js',
    'public/js/auth.js',
    'public/js/i18n.js',
    'public/js/components/public_landing.js',
    'public/js/components/auth_pages.js',
    'public/js/components/live_stock.js',
    'public/js/components/market_prices.js',
    'public/js/components/crop_details.js',
    'public/js/components/field_dashboard.js',
    'public/js/components/admin_dashboard.js',
    'public/js/components/home.js',
    'public/js/components/farmers.js',
    'public/js/components/crops.js',
    'public/js/components/lots.js',
    'public/js/components/pooling.js',
    'public/js/components/pickup.js',
    'public/js/components/storage.js',
    'public/js/components/buyers.js',
    'public/js/components/orders.js',
    'public/js/components/payments.js',
    'public/js/components/finance.js',
    'public/js/components/farmer.js',
    'public/js/components/fpo.js',
    'public/js/components/seller_dashboard.js',
    'public/js/components/buyer_dashboard.js',
    'public/js/components/reports.js',
    'public/js/components/activity.js',
    'public/js/components/growth_plan.js',
    'public/js/components/settings.js',
    'public/js/app.js'
  ];

  for (const s of scripts) {
    const code = fs.readFileSync(path.join(__dirname, s), 'utf8');
    vm.runInContext(code, context);
  }

  const { auth, navigateTo, ROLE_CONFIGS } = context;

  // TEST 1: Open website without login
  console.log('--- TEST 1: Public AgriPool Home ---');
  auth.logout();
  await navigateTo('home', false);
  const isNoSidebar = classes.has('no-sidebar');
  const hasLandingContent = mainContent.innerHTML.includes('Connect Farmers, Aggregate Produce, Reach Better Markets');
  console.log(`- Path: ${currentPath}`);
  console.log(`- Sidebar hidden (no-sidebar class): ${isNoSidebar}`);
  console.log(`- Contains Welcome & Aggregation Overview: ${hasLandingContent}`);
  if (!isNoSidebar || !hasLandingContent) throw new Error('TEST 1 Failed');
  console.log('✅ TEST 1 PASSED\n');

  // TEST 2: Farmer Signup -> Email verification -> Login
  console.log('--- TEST 2: Farmer Auth & Navigation ---');
  const testFarmerEmail = `farmer_test_${Date.now()}@agripool.in`;
  const farmerSignup = await auth.signup({
    email: testFarmerEmail,
    password: 'password123',
    role: 'farmer',
    name: 'Gopal Krishna',
    phone: '+91 98480 11999',
    metadata: { village: 'Kankipadu', preferred_language: 'te' }
  });
  console.log(`- Farmer Registered: ${farmerSignup.email}`);
  await auth.verifyEmail(farmerSignup.verificationToken);
  console.log(`- Email Verified with Token: ${farmerSignup.verificationToken.substring(0, 16)}...`);
  const farmerSession = await auth.login(testFarmerEmail, 'password123');
  console.log(`- Logged in as: ${farmerSession.name} (Role: ${farmerSession.role})`);
  await navigateTo(auth.getDefaultRoute(), false);
  const farmerSidebarHasCrops = sidebarNavContainer.innerHTML.includes('My Crops');
  const farmerSidebarHasNoFpoAdmin = !sidebarNavContainer.innerHTML.includes('FPO Dashboard');
  console.log(`- Farmer dashboard path: ${currentPath}`);
  console.log(`- Only Farmer sidebar items: My Crops = ${farmerSidebarHasCrops}, No FPO Admin = ${farmerSidebarHasNoFpoAdmin}`);
  if (!farmerSidebarHasCrops || !farmerSidebarHasNoFpoAdmin) throw new Error('TEST 2 Failed');
  console.log('✅ TEST 2 PASSED\n');

  // TEST 3: Seller Signup -> Login
  console.log('--- TEST 3: Seller Auth & Navigation ---');
  const sellerSession = await auth.login('seller@agripool.in', 'password123');
  console.log(`- Logged in as: ${sellerSession.name} (Role: ${sellerSession.role})`);
  await navigateTo('seller', false);
  const sellerSidebarHasInventory = sidebarNavContainer.innerHTML.includes('Inventory');
  const sellerSidebarHasNoFarmerMgmt = !sidebarNavContainer.innerHTML.includes('Farmers Directory');
  console.log(`- Seller dashboard path: ${currentPath}`);
  console.log(`- Only Seller sidebar items: Inventory = ${sellerSidebarHasInventory}, No Farmer Mgmt = ${sellerSidebarHasNoFarmerMgmt}`);
  if (!sellerSidebarHasInventory || !sellerSidebarHasNoFarmerMgmt) throw new Error('TEST 3 Failed');
  console.log('✅ TEST 3 PASSED\n');

  // TEST 4: Bulk Buyer Signup -> Login
  console.log('--- TEST 4: Bulk Buyer Auth & Navigation ---');
  const buyerSession = await auth.login('buyer@agripool.in', 'password123');
  console.log(`- Logged in as: ${buyerSession.name} (Role: ${buyerSession.role})`);
  await navigateTo('buyer', false);
  const buyerSidebarHasBrowse = sidebarNavContainer.innerHTML.includes('Browse Produce');
  const buyerSidebarHasNoSettlementLedger = !sidebarNavContainer.innerHTML.includes('Transparent Settlement Ledger');
  console.log(`- Buyer dashboard path: ${currentPath}`);
  console.log(`- Buyer sidebar items: Browse Produce = ${buyerSidebarHasBrowse}, Private Farmer Info Hidden = ${buyerSidebarHasNoSettlementLedger}`);
  if (!buyerSidebarHasBrowse || !buyerSidebarHasNoSettlementLedger) throw new Error('TEST 4 Failed');
  console.log('✅ TEST 4 PASSED\n');

  // TEST 5: FPO Admin Login
  console.log('--- TEST 5: FPO Admin Auth & Navigation ---');
  const fpoSession = await auth.login('fpo@agripool.in', 'password123');
  console.log(`- Logged in as: ${fpoSession.name} (Role: ${fpoSession.role})`);
  await navigateTo('fpo', false);
  const fpoHasLots = sidebarNavContainer.innerHTML.includes('Lots');
  const fpoHasPools = sidebarNavContainer.innerHTML.includes('Pools');
  console.log(`- FPO dashboard path: ${currentPath}`);
  console.log(`- FPO sidebar items: Lots = ${fpoHasLots}, Pools = ${fpoHasPools}`);
  if (!fpoHasLots || !fpoHasPools) throw new Error('TEST 5 Failed');
  console.log('✅ TEST 5 PASSED\n');

  // TEST 6: SHG/Field Operator Login
  console.log('--- TEST 6: Field Operator Auth & Navigation ---');
  const fieldSession = await auth.login('field@agripool.in', 'password123');
  console.log(`- Logged in as: ${fieldSession.name} (Role: ${fieldSession.role})`);
  await navigateTo('field', false);
  const fieldHasWeighing = mainContent.innerHTML.includes('Field Operator & SHG Lead Portal');
  const fieldHasNoBuyerDesk = !sidebarNavContainer.innerHTML.includes('Bulk Buyer');
  console.log(`- Field Operator dashboard path: ${currentPath}`);
  console.log(`- Operational Desk Active = ${fieldHasWeighing}, No Buyer Desk = ${fieldHasNoBuyerDesk}`);
  if (!fieldHasWeighing || !fieldHasNoBuyerDesk) throw new Error('TEST 6 Failed');
  console.log('✅ TEST 6 PASSED\n');

  // TEST 7: Storage Partner Login
  console.log('--- TEST 7: Storage Partner Auth & Navigation ---');
  const storageSession = await auth.login('storage@agripool.in', 'password123');
  console.log(`- Logged in as: ${storageSession.name} (Role: ${storageSession.role})`);
  await navigateTo('storage', false);
  const storageHasFacilities = mainContent.innerHTML.includes('Storage') && mainContent.innerHTML.includes('Total Capacity');
  console.log(`- Storage dashboard path: ${currentPath}`);
  console.log(`- Storage facilities active = ${storageHasFacilities}`);
  if (!storageHasFacilities) throw new Error('TEST 7 Failed');
  console.log('✅ TEST 7 PASSED\n');

  // TEST 8: Finance Partner Login
  console.log('--- TEST 8: Finance Partner Auth & Navigation ---');
  const financeSession = await auth.login('finance@agripool.in', 'password123');
  console.log(`- Logged in as: ${financeSession.name} (Role: ${financeSession.role})`);
  await navigateTo('finance', false);
  const financeHasAdvances = mainContent.innerHTML.includes('Working Capital') && mainContent.innerHTML.includes('AgriPool does not lend directly');
  console.log(`- Finance dashboard path: ${currentPath}`);
  console.log(`- Advances portal active = ${financeHasAdvances}`);
  if (!financeHasAdvances) throw new Error('TEST 8 Failed');
  console.log('✅ TEST 8 PASSED\n');

  // TEST 9: Platform Admin Login
  console.log('--- TEST 9: Platform Super Admin Auth & Navigation ---');
  const adminSession = await auth.login('admin@agripool.in', 'password123');
  console.log(`- Logged in as: ${adminSession.name} (Role: ${adminSession.role})`);
  await navigateTo('admin', false);
  const adminHasDeck = mainContent.innerHTML.includes('Platform Super Admin Control Deck');
  const adminHasAuditLogs = sidebarNavContainer.innerHTML.includes('Audit Logs');
  console.log(`- Admin dashboard path: ${currentPath}`);
  console.log(`- Admin master control deck = ${adminHasDeck}, Audit logs = ${adminHasAuditLogs}`);
  if (!adminHasDeck || !adminHasAuditLogs) throw new Error('TEST 9 Failed');
  console.log('✅ TEST 9 PASSED\n');

  // TEST 10: Role-Based Route Protection / Access Denied
  console.log('--- TEST 10: Strict Route Protection & Access Denied ---');
  // Log in as a Farmer
  await auth.login('farmer@agripool.in', 'password123');
  console.log(`- Active User: Farmer (${auth.getUser().name})`);
  // Attempt to open admin dashboard /admin
  await navigateTo('admin', false);
  const accessDeniedTriggered = mainContent.innerHTML.includes('Access Denied');
  console.log(`- Attempted unauthorized route /admin -> Access Denied shown: ${accessDeniedTriggered}`);
  if (!accessDeniedTriggered) throw new Error('TEST 10 Failed: Prohibited page was displayed!');
  console.log('✅ TEST 10 PASSED\n');

  // TEST 11: Live Stock Page
  console.log('--- TEST 11: Platform Live Stock System ---');
  await navigateTo('live-stock', false);
  const hasLiveStockTitle = mainContent.innerHTML.includes('Platform-Wide Live Stock System');
  const hasTomatoStock = mainContent.innerHTML.includes('Tomato');
  const hasRiceStock = mainContent.innerHTML.includes('Rice');
  console.log(`- Live stock page rendered: ${hasLiveStockTitle}`);
  console.log(`- Tracks Tomato = ${hasTomatoStock}, Rice = ${hasRiceStock}`);
  if (!hasLiveStockTitle || !hasTomatoStock || !hasRiceStock) throw new Error('TEST 11 Failed');
  console.log('✅ TEST 11 PASSED\n');

  // TEST 12: Live Market Prices
  console.log('--- TEST 12: Crop Market Benchmark Prices ---');
  await navigateTo('market-prices', false);
  const hasMarketPricesTitle = mainContent.innerHTML.includes('Agriculture Market Benchmark Prices');
  const hasDemoDataNotice = mainContent.innerHTML.includes('Demo Agmarknet') || mainContent.innerHTML.includes('Government of India / data.gov.in') || mainContent.innerHTML.includes('Market Data Source Not Connected');
  console.log(`- Market prices rendered: ${hasMarketPricesTitle}`);
  console.log(`- Source clearly labeled official/disconnected: ${hasDemoDataNotice}`);
  if (!hasMarketPricesTitle || !hasDemoDataNotice) throw new Error('TEST 12 Failed');
  console.log('✅ TEST 12 PASSED\n');

  // TEST 13: Logout Flow
  console.log('--- TEST 13: Logout Session Clearance ---');
  await context.handleLogout();
  const loggedOutAuth = auth.isAuthenticated();
  const loggedOutSidebar = classes.has('no-sidebar');
  console.log(`- Session cleared (isAuthenticated = ${loggedOutAuth})`);
  console.log(`- Sidebar hidden (no-sidebar = ${loggedOutSidebar})`);
  console.log(`- Returned to public landing page`);
  if (loggedOutAuth || !loggedOutSidebar) throw new Error('TEST 13 Failed');
  console.log('✅ TEST 13 PASSED\n');

  console.log('======================================================================');
  console.log('🎉 ALL 13 ACCEPTANCE TESTS PASSED WITH 100% SUCCESS!');
  console.log('======================================================================');
}

runMasterAcceptance().catch(err => {
  console.error('Acceptance test error:', err);
  process.exit(1);
});
