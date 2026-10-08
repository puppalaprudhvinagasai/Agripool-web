// public/js/auth.js - AgriPool Master Authentication & Role-Based Access Control (RBAC) Client
(function (window) {
  const SESSION_USER_KEY = 'agripool_auth_user';
  const SESSION_TOKEN_KEY = 'agripool_auth_token';

  // Master role configuration and permitted routes
  const ROLE_CONFIGS = {
    'farmer': {
      id: 'farmer',
      name: 'Farmer',
      badge: '👨‍🌾 Farmer',
      dashboardRoute: 'farmer',
      dashboardPath: '/farmer/dashboard',
      permittedRoutes: [
        'home', 'farmer', 'farmer/dashboard', 'crops', 'lots', 'pools', 'pickup', 
        'sales', 'payments', 'market', 'market-prices', 'live-stock', 'notifications', 'settings', 'help'
      ],
      sidebarItems: [
        { route: 'farmer', icon: '🏠', label: 'Home' },
        { route: 'crops', icon: '🌾', label: 'My Crops' },
        { route: 'lots', icon: '🏷️', label: 'My Lots' },
        { route: 'pools', icon: '🤝', label: 'My Pools' },
        { route: 'pickup', icon: '🚚', label: 'My Pickup' },
        { route: 'sales', icon: '🛒', label: 'My Sales' },
        { route: 'payments', icon: '💰', label: 'My Payments' },
        { route: 'market-prices', icon: '📈', label: 'Market Prices' },
        { route: 'live-stock', icon: '📦', label: 'Live Stock' },
        { route: 'notifications', icon: '🔔', label: 'Notifications' },
        { route: 'help', icon: '❓', label: 'Help' },
        { route: 'settings', icon: '⚙️', label: 'Settings' }
      ]
    },
    'seller': {
      id: 'seller',
      name: 'Seller',
      badge: '🧑‍🌾 Seller',
      dashboardRoute: 'seller',
      dashboardPath: '/seller/dashboard',
      permittedRoutes: [
        'home', 'seller', 'seller/dashboard', 'inventory', 'listings', 'offers', 
        'orders', 'settlements', 'reports', 'notifications', 'settings'
      ],
      sidebarItems: [
        { route: 'seller', icon: '🏠', label: 'Home' },
        { route: 'inventory', icon: '📦', label: 'Inventory' },
        { route: 'listings', icon: '🌾', label: 'Listings' },
        { route: 'offers', icon: '💬', label: 'Offers' },
        { route: 'orders', icon: '🛒', label: 'Orders' },
        { route: 'settlements', icon: '💰', label: 'Settlements' },
        { route: 'reports', icon: '📊', label: 'Sales Reports' },
        { route: 'notifications', icon: '🔔', label: 'Notifications' },
        { route: 'settings', icon: '⚙️', label: 'Settings' }
      ]
    },
    'buyer': {
      id: 'buyer',
      name: 'Bulk Buyer',
      badge: '🏢 Bulk Buyer',
      dashboardRoute: 'buyer',
      dashboardPath: '/buyer/dashboard',
      permittedRoutes: [
        'home', 'buyer', 'buyer/dashboard', 'browse', 'live-stock', 'market-prices',
        'pools', 'offers', 'orders', 'payments', 'history', 'reports', 'notifications', 'settings'
      ],
      sidebarItems: [
        { route: 'buyer', icon: '🏠', label: 'Home' },
        { route: 'browse', icon: '🌾', label: 'Browse Produce' },
        { route: 'live-stock', icon: '📦', label: 'Live Stock' },
        { route: 'pools', icon: '🤝', label: 'Available Pools' },
        { route: 'offers', icon: '💬', label: 'Offers' },
        { route: 'orders', icon: '🛒', label: 'Orders' },
        { route: 'payments', icon: '💰', label: 'Payments' },
        { route: 'history', icon: '📜', label: 'Purchase History' },
        { route: 'reports', icon: '📊', label: 'Purchase Reports' },
        { route: 'notifications', icon: '🔔', label: 'Notifications' },
        { route: 'settings', icon: '⚙️', label: 'Settings' }
      ]
    },
    'fpo': {
      id: 'fpo',
      name: 'FPO Admin',
      badge: '👨‍💼 FPO Admin',
      dashboardRoute: 'fpo',
      dashboardPath: '/fpo/dashboard',
      permittedRoutes: [
        'home', 'fpo', 'fpo/dashboard', 'farmers', 'crops', 'lots', 'pools', 'pickup',
        'storage', 'buyers', 'orders', 'payments', 'reports', 'notifications', 'activity',
        'growth-plan', 'settings', 'live-stock', 'market-prices'
      ],
      sidebarItems: [
        { route: 'home', icon: '🏠', label: 'Home' },
        { route: 'fpo', icon: '🎯', label: 'FPO Dashboard', badge: 'Pilot' },
        { route: 'farmers', icon: '👨‍🌾', label: 'Farmers' },
        { route: 'crops', icon: '🌾', label: 'Crops' },
        { route: 'lots', icon: '🏷️', label: 'Lots' },
        { route: 'pools', icon: '🤝', label: 'Pools' },
        { route: 'pickup', icon: '🚚', label: 'Pickup' },
        { route: 'storage', icon: '🏭', label: 'Storage' },
        { route: 'buyers', icon: '🏢', label: 'Buyers' },
        { route: 'orders', icon: '🛒', label: 'Orders' },
        { route: 'payments', icon: '💰', label: 'Payments' },
        { route: 'reports', icon: '📊', label: 'Reports' },
        { route: 'notifications', icon: '🔔', label: 'Notifications' },
        { route: 'activity', icon: '🛡️', label: 'Activity' },
        { route: 'growth-plan', icon: '🗺️', label: 'Growth Plan' },
        { route: 'settings', icon: '⚙️', label: 'Settings' }
      ]
    },
    'field': {
      id: 'field',
      name: 'SHG / Field Operator',
      badge: '👩‍🌾 SHG / Field Operator',
      dashboardRoute: 'field',
      dashboardPath: '/field/dashboard',
      permittedRoutes: [
        'home', 'field', 'field/dashboard', 'farmers', 'crops', 'lots', 'pools', 'pickup',
        'notifications', 'settings'
      ],
      sidebarItems: [
        { route: 'field', icon: '🏠', label: 'Home' },
        { route: 'farmers', icon: '👨‍🌾', label: 'Farmers' },
        { route: 'crops', icon: '🌾', label: 'Crops' },
        { route: 'lots', icon: '🏷️', label: 'Lots' },
        { route: 'pools', icon: '🤝', label: 'Pools' },
        { route: 'pickup', icon: '🚚', label: 'Pickup' },
        { route: 'notifications', icon: '🔔', label: 'Notifications' },
        { route: 'settings', icon: '⚙️', label: 'Settings' }
      ]
    },
    'storage': {
      id: 'storage',
      name: 'Storage Partner',
      badge: '🏭 Storage Partner',
      dashboardRoute: 'storage',
      dashboardPath: '/storage/dashboard',
      permittedRoutes: [
        'home', 'storage', 'storage/dashboard', 'inventory', 'allocations', 'incoming',
        'outgoing', 'payments', 'notifications', 'settings'
      ],
      sidebarItems: [
        { route: 'storage', icon: '🏠', label: 'Home' },
        { route: 'storage', icon: '🏭', label: 'Storage Facilities' },
        { route: 'inventory', icon: '📦', label: 'Inventory' },
        { route: 'allocations', icon: '📥', label: 'Allocations' },
        { route: 'incoming', icon: '🚚', label: 'Incoming' },
        { route: 'outgoing', icon: '📤', label: 'Outgoing' },
        { route: 'payments', icon: '💰', label: 'Storage Payments' },
        { route: 'notifications', icon: '🔔', label: 'Notifications' },
        { route: 'settings', icon: '⚙️', label: 'Settings' }
      ]
    },
    'finance': {
      id: 'finance',
      name: 'Finance Partner',
      badge: '💳 Finance Partner',
      dashboardRoute: 'finance',
      dashboardPath: '/finance/dashboard',
      permittedRoutes: [
        'home', 'finance', 'finance/dashboard', 'advances', 'settlements', 'reports',
        'transactions', 'notifications', 'settings'
      ],
      sidebarItems: [
        { route: 'finance', icon: '🏠', label: 'Home' },
        { route: 'finance', icon: '💳', label: 'Advance Requests' },
        { route: 'settlements', icon: '💰', label: 'Settlements' },
        { route: 'reports', icon: '📊', label: 'Finance Reports' },
        { route: 'transactions', icon: '📜', label: 'Transactions' },
        { route: 'notifications', icon: '🔔', label: 'Notifications' },
        { route: 'settings', icon: '⚙️', label: 'Settings' }
      ]
    },
    'admin': {
      id: 'admin',
      name: 'Platform Admin',
      badge: '🛡️ Platform Admin',
      dashboardRoute: 'admin',
      dashboardPath: '/admin/dashboard',
      permittedRoutes: [
        'home', 'admin', 'admin/dashboard', 'users', 'farmers', 'sellers', 'buyers',
        'fpo', 'field', 'storage', 'finance', 'crops', 'lots', 'pools', 'orders',
        'payments', 'reports', 'activity', 'settings', 'live-stock', 'market-prices'
      ],
      sidebarItems: [
        { route: 'admin', icon: '🏠', label: 'Home' },
        { route: 'users', icon: '👥', label: 'Users' },
        { route: 'farmers', icon: '👨‍🌾', label: 'Farmers' },
        { route: 'seller', icon: '🧑‍🌾', label: 'Sellers' },
        { route: 'buyers', icon: '🏢', label: 'Buyers' },
        { route: 'fpo', icon: '🎯', label: 'FPOs' },
        { route: 'field', icon: '👩‍🌾', label: 'Field Operators' },
        { route: 'storage', icon: '🏭', label: 'Storage Partners' },
        { route: 'finance', icon: '💳', label: 'Finance Partners' },
        { route: 'crops', icon: '🌾', label: 'Crops' },
        { route: 'lots', icon: '🏷️', label: 'Lots' },
        { route: 'pools', icon: '🤝', label: 'Pools' },
        { route: 'orders', icon: '🛒', label: 'Orders' },
        { route: 'payments', icon: '💰', label: 'Payments' },
        { route: 'reports', icon: '📊', label: 'Analytics' },
        { route: 'activity', icon: '🛡️', label: 'Audit Logs' },
        { route: 'settings', icon: '⚙️', label: 'System Settings' }
      ]
    }
  };

  class AuthService {
    constructor() {
      this.currentUser = this.loadStoredUser();
      this.token = localStorage.getItem(SESSION_TOKEN_KEY);
      this.listeners = [];
    }

    loadStoredUser() {
      try {
        const stored = localStorage.getItem(SESSION_USER_KEY);
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    }

    onAuthChange(cb) {
      this.listeners.push(cb);
    }

    notifyAuthChange() {
      this.listeners.forEach(cb => cb(this.currentUser));
    }

    isAuthenticated() {
      return Boolean(this.currentUser && this.currentUser.id);
    }

    getUser() {
      return this.currentUser;
    }

    getRole() {
      if (!this.currentUser) return null;
      const raw = String(this.currentUser.role || '').toLowerCase();
      if (raw.includes('super admin') || raw.includes('platform admin') || raw === 'admin') return 'admin';
      if (raw.includes('fpo')) return 'fpo';
      if (raw.includes('farmer')) return 'farmer';
      if (raw.includes('seller')) return 'seller';
      if (raw.includes('buyer')) return 'buyer';
      if (raw.includes('field') || raw.includes('shg')) return 'field';
      if (raw.includes('storage')) return 'storage';
      if (raw.includes('finance')) return 'finance';
      return 'farmer';
    }

    getRoleConfig(roleKey = null) {
      const key = roleKey || this.getRole();
      return ROLE_CONFIGS[key] || ROLE_CONFIGS['farmer'];
    }

    getDefaultRoute() {
      if (!this.isAuthenticated()) return 'home';
      const cfg = this.getRoleConfig();
      return cfg ? cfg.dashboardRoute : 'home';
    }

    canAccessRoute(route) {
      if (!this.isAuthenticated()) {
        // Public pages
        const publicRoutes = ['home', 'landing', 'login', 'signup', 'forgot-password', 'reset-password', 'verify-email', 'market-prices', 'live-stock', 'market'];
        return publicRoutes.some(p => route === p || route.startsWith(p + '/'));
      }

      const role = this.getRole();
      if (role === 'admin') return true; // Platform Admin has complete access

      // Role specific route check
      const cfg = this.getRoleConfig(role);
      if (!cfg) return false;

      // Allow exact matches or sub-routes
      const cleanRoute = String(route).toLowerCase().replace(/^\/+/, '');
      return cfg.permittedRoutes.some(p => cleanRoute === p || cleanRoute.startsWith(p + '/'));
    }

    async login(identifier, password, expectedRole = null) {
      const response = await api.login({ identifier, password, expectedRole });
      this.currentUser = response;
      this.token = response.token || 'demo_token_' + Date.now();
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(this.currentUser));
      localStorage.setItem(SESSION_TOKEN_KEY, this.token);
      localStorage.setItem('agripool_role', response.roleDisplayName || response.role);
      this.notifyAuthChange();
      return response;
    }

    async signup(data) {
      return api.signup(data);
    }

    async verifyEmail(tokenOrData) {
      return api.verifyEmail(tokenOrData);
    }

    async verifyEmailOtp(email, otp) {
      return api.verifyEmailOtp(email, otp);
    }

    async resendVerificationOtp(email) {
      return api.resendVerificationOtp(email);
    }

    async forgotPassword(email) {
      return api.forgotPassword(email);
    }

    async verifyResetOtp(email, otp) {
      return api.verifyResetOtp(email, otp);
    }

    async resetPassword(tokenOrData, newPassword = null) {
      return api.resetPassword(tokenOrData, newPassword);
    }

    logout() {
      this.currentUser = null;
      this.token = null;
      localStorage.removeItem(SESSION_USER_KEY);
      localStorage.removeItem(SESSION_TOKEN_KEY);
      this.notifyAuthChange();
    }
  }

  const auth = new AuthService();
  window.auth = auth;
  window.ROLE_CONFIGS = ROLE_CONFIGS;
})(window);
