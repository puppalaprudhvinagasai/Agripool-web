// test_navigation.js - Test client side routing and navigation transitions
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function testNavigation() {
  console.log('Testing client-side routing transitions across all 15 routes...\n');

  let historyStack = [{ url: 'http://localhost:3000/' }];
  let currentPath = '/';

  const mainContent = { innerHTML: '' };
  const pageTitle = { textContent: '' };
  const navItems = [
    { dataset: { route: 'home' }, classList: new Set() },
    { dataset: { route: 'farmers' }, classList: new Set() },
    { dataset: { route: 'crops' }, classList: new Set() },
    { dataset: { route: 'lots' }, classList: new Set() },
    { dataset: { route: 'pools' }, classList: new Set() },
    { dataset: { route: 'pickup' }, classList: new Set() },
    { dataset: { route: 'storage' }, classList: new Set() },
    { dataset: { route: 'buyers' }, classList: new Set() },
    { dataset: { route: 'orders' }, classList: new Set() },
    { dataset: { route: 'payments' }, classList: new Set() },
    { dataset: { route: 'reports' }, classList: new Set() },
    { dataset: { route: 'notifications' }, classList: new Set() },
    { dataset: { route: 'activity' }, classList: new Set() },
    { dataset: { route: 'growth-plan' }, classList: new Set() },
    { dataset: { route: 'settings' }, classList: new Set() }
  ];

  const sandbox = {
    console,
    window: {
      location: {
        get pathname() { return currentPath; },
        hash: ''
      },
      history: {
        pushState: (state, title, url) => {
          currentPath = url;
          historyStack.push({ state, url });
        }
      },
      scrollTo: () => {},
      addEventListener: () => {}
    },
    document: {
      addEventListener: () => {},
      querySelectorAll: (sel) => {
        if (sel === '.nav-item') {
          return navItems.map(item => ({
            dataset: item.dataset,
            classList: {
              add: (cls) => item.classList.add(cls),
              remove: (cls) => item.classList.delete(cls),
              contains: (cls) => item.classList.has(cls)
            }
          }));
        }
        return [];
      },
      getElementById: (id) => {
        if (id === 'app-main-content') return mainContent;
        if (id === 'header-page-title') return pageTitle;
        return {
          value: '',
          textContent: '',
          style: {},
          innerHTML: '',
          classList: { add: () => {}, remove: () => {} }
        };
      }
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {}
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
    parseInt: globalThis.parseInt
  };
  sandbox.localStorage = {
    getItem: (key) => key === 'agripool_auth_user' ? JSON.stringify({ id: 1, name: 'FPO Admin', role: 'fpo', roleDisplayName: 'FPO Admin' }) : null,
    setItem: () => {},
    removeItem: () => {}
  };
  sandbox.window.localStorage = sandbox.localStorage;
  sandbox.window.window = sandbox.window;

  const context = vm.createContext(sandbox);

  // Load api.js & auth.js
  const apiCode = fs.readFileSync(path.join(__dirname, 'public', 'js', 'api.js'), 'utf8');
  vm.runInContext(apiCode, context);
  const authCode = fs.readFileSync(path.join(__dirname, 'public', 'js', 'auth.js'), 'utf8');
  vm.runInContext(authCode, context);

  // Load components
  const componentFiles = [
    'public_landing.js', 'auth_pages.js', 'live_stock.js', 'market_prices.js', 'crop_details.js',
    'field_dashboard.js', 'admin_dashboard.js', 'acceptance.js',
    'home.js', 'farmers.js', 'crops.js', 'lots.js', 'pooling.js',
    'pickup.js', 'storage.js', 'buyers.js', 'orders.js', 'payments.js',
    'reports.js', 'notifications.js', 'activity.js', 'growth_plan.js', 'settings.js',
    'fpo.js', 'farmer.js', 'seller_dashboard.js', 'buyer_dashboard.js', 'finance.js'
  ];
  for (const f of componentFiles) {
    const code = fs.readFileSync(path.join(__dirname, 'public', 'js', 'components', f), 'utf8');
    vm.runInContext(code, context);
  }

  // Load app.js
  const appCode = fs.readFileSync(path.join(__dirname, 'public', 'js', 'app.js'), 'utf8');
  vm.runInContext(appCode, context);

  const routesToTest = [
    { target: 'home', expectedPath: '/', expectedTitle: '🎯 FPO Dashboard — Kisan Vikas FPO' },
    { target: 'farmers', expectedPath: '/farmers', expectedTitle: '👨‍🌾 Farmer Directory' },
    { target: 'crops', expectedPath: '/crops', expectedTitle: '🌾 Crop Declarations' },
    { target: 'lots', expectedPath: '/lots', expectedTitle: '🏷️ Digital Lot Passports' },
    { target: 'pools', expectedPath: '/pools', expectedTitle: '🤝 Produce Pooling Engine' },
    { target: 'pickup', expectedPath: '/pickup', expectedTitle: '🚚 Logistics & Pickup Dispatch' },
    { target: 'storage', expectedPath: '/storage', expectedTitle: '🏭 Storage & Warehousing Facilities' },
    { target: 'buyers', expectedPath: '/buyers', expectedTitle: '🏢 Verified Bulk Buyers & Marketplace' },
    { target: 'orders', expectedPath: '/orders', expectedTitle: '🛒 Purchase Orders & Contracts' },
    { target: 'payments', expectedPath: '/payments', expectedTitle: '💰 Transparent Settlement Ledger & Payments' },
    { target: 'reports', expectedPath: '/reports', expectedTitle: '📊 Operational Reports & Analytics' },
    { target: 'notifications', expectedPath: '/notifications', expectedTitle: '🔔 Role-Targeted Notifications' },
    { target: 'activity', expectedPath: '/activity', expectedTitle: '🛡️ Activity & Immutable Audit Trail' },
    { target: 'growth-plan', expectedPath: '/growth-plan', expectedTitle: '🗺️ Growth Plan & Scaling Roadmap' },
    { target: 'settings', expectedPath: '/settings', expectedTitle: '⚙️ Pilot Settings & Configuration' }
  ];

  for (const r of routesToTest) {
    await context.navigateTo(r.target);
    const activeNav = navItems.find(n => n.classList.has('active'));
    console.log(`➡️  Navigated to "${r.target}"`);
    console.log(`   Path: ${currentPath} (expected: ${r.expectedPath})`);
    console.log(`   Header Title: "${pageTitle.textContent}" (expected: "${r.expectedTitle}")`);
    console.log(`   Content rendered: ${mainContent.innerHTML.length} characters`);
    console.log(`   Sidebar active: ${activeNav?.dataset.route}`);

    if (currentPath !== r.expectedPath) throw new Error(`Path mismatch on ${r.target}: ${currentPath} vs ${r.expectedPath}`);
    if (pageTitle.textContent !== r.expectedTitle) throw new Error(`Title mismatch on ${r.target}`);
    if (mainContent.innerHTML.length < 500) throw new Error(`Content not rendered properly for ${r.target}`);
    console.log('   ✅ PASSED\n');
  }

  console.log('🎉 ALL 15 ROUTE TRANSITIONS, URL UPDATES, HEADERS, AND PAGE RENDERS VERIFIED 100%!');
}

testNavigation().catch(e => {
  console.error('Navigation test error:', e);
  process.exit(1);
});
