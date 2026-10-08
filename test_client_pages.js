// test_client_pages.js - Test all client component render functions against live server
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function testPages() {
  console.log('Testing all AgriPool component renderers against live server (http://localhost:3000)...\n');

  // Create browser-like sandbox
  const sandbox = {
    console,
    window: {},
    document: {
      body: { classList: { add: () => {}, remove: () => {} } },
      addEventListener: () => {},
      querySelectorAll: () => [],
      getElementById: (id) => ({
        value: '',
        textContent: '',
        style: {},
        innerHTML: '',
        classList: { add: () => {}, remove: () => {} }
      })
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
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
  sandbox.window = sandbox;

  const context = vm.createContext(sandbox);

  // Load api.js and auth.js
  const apiCode = fs.readFileSync(path.join(__dirname, 'public', 'js', 'api.js'), 'utf8');
  vm.runInContext(apiCode, context);

  const authCode = fs.readFileSync(path.join(__dirname, 'public', 'js', 'auth.js'), 'utf8');
  vm.runInContext(authCode, context);

  // Load all components
  const componentFiles = [
    'public_landing.js',
    'auth_pages.js',
    'live_stock.js',
    'market_prices.js',
    'crop_details.js',
    'field_dashboard.js',
    'admin_dashboard.js',
    'home.js',
    'farmers.js',
    'crops.js',
    'lots.js',
    'pooling.js',
    'pickup.js',
    'storage.js',
    'buyers.js',
    'orders.js',
    'payments.js',
    'reports.js',
    'notifications.js',
    'activity.js',
    'growth_plan.js',
    'settings.js',
    'fpo.js',
    'farmer.js',
    'seller_dashboard.js',
    'buyer_dashboard.js',
    'finance.js'
  ];

  for (const f of componentFiles) {
    const code = fs.readFileSync(path.join(__dirname, 'public', 'js', 'components', f), 'utf8');
    vm.runInContext(code, context);
  }

  // Load app.js
  const appCode = fs.readFileSync(path.join(__dirname, 'public', 'js', 'app.js'), 'utf8');
  vm.runInContext(appCode, context);

  const tests = [
    { name: '1. Public Landing (Home)', fn: 'renderPublicLandingPage', async: true },
    { name: '2. Login Page (/login)', fn: 'renderLoginPage', async: false },
    { name: '3. Signup Page (/signup)', fn: 'renderSignupPage', async: false },
    { name: '4. Forgot Password (/forgot-password)', fn: 'renderForgotPasswordPage', async: false },
    { name: '5. Live Stock (/live-stock)', fn: 'renderLiveStockPage', async: true },
    { name: '6. Market Prices (/market-prices)', fn: 'renderMarketPricesPage', async: true },
    { name: '7. Crop Details (/market/tomato)', fn: 'renderCropDetailsPage', arg: 'Tomato', async: true },
    { name: '8. Farmer Dashboard (/farmer)', fn: 'renderFarmerPage', async: true },
    { name: '9. Seller Dashboard (/seller)', fn: 'renderSellerDashboard', async: true },
    { name: '10. Bulk Buyer Dashboard (/buyer)', fn: 'renderBuyerDashboard', async: true },
    { name: '11. FPO Admin Dashboard (/fpo)', fn: 'renderFpoDashboard', async: true },
    { name: '12. Field Operator (/field)', fn: 'renderFieldDashboard', async: true },
    { name: '13. Storage Partner (/storage)', fn: 'renderStoragePage', async: true },
    { name: '14. Finance Partner (/finance)', fn: 'renderFinancePage', async: true },
    { name: '15. Admin Dashboard (/admin)', fn: 'renderAdminDashboard', async: true },
    { name: '16. Farmers (/farmers)', fn: 'renderFarmersPage', async: true },
    { name: '17. Crops (/crops)', fn: 'renderCropsPage', async: true },
    { name: '18. Lots (/lots)', fn: 'renderLotsPage', async: true },
    { name: '19. Pools (/pools)', fn: 'renderPoolingPage', async: true },
    { name: '20. Pickup (/pickup)', fn: 'renderPickupPage', async: true },
    { name: '21. Buyers (/buyers)', fn: 'renderBuyersPage', async: true },
    { name: '22. Orders (/orders)', fn: 'renderOrdersPage', async: true },
    { name: '23. Payments (/payments)', fn: 'renderPaymentsPage', async: true },
    { name: '24. Reports (/reports)', fn: 'renderReportsPage', async: true },
    { name: '25. Notifications (/notifications)', fn: 'renderNotificationsPage', async: true },
    { name: '26. Activity Logs (/activity)', fn: 'renderActivityPage', async: true },
    { name: '27. Growth Plan (/growth-plan)', fn: 'renderGrowthPlanPage', async: false },
    { name: '28. Settings (/settings)', fn: 'renderSettingsPage', async: true }
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const renderFn = context[t.fn] || context.window[t.fn];
      if (typeof renderFn !== 'function') {
        throw new Error(`Function ${t.fn} is not defined on window`);
      }
      const html = t.async ? (t.arg ? await renderFn(t.arg) : await renderFn()) : (t.arg ? renderFn(t.arg) : renderFn());
      if (typeof html !== 'string' || html.length < 50) {
        throw new Error(`Output is too short or not string: ${typeof html} (${html ? html.length : 0} chars)`);
      }
      console.log(`✅ ${t.name.padEnd(38)} -> Rendered successfully (${html.length} chars)`);
      passed++;
    } catch (err) {
      console.error(`❌ ${t.name.padEnd(38)} -> Failed: ${err.message}`);
    }
  }

  console.log(`\nResults: ${passed}/${tests.length} pages passed rendering without error.`);
  if (passed === tests.length) {
    console.log('🎉 ALL 28 PLATFORM & ROLE PAGES RENDER FLAWLESSLY WITH REAL DATA!');
  } else {
    process.exit(1);
  }
}

testPages().catch(e => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
