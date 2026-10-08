// public/js/api.js - Frontend API Client & Offline Draft Sync Engine
const API_BASE = '/api';

class ApiService {
  constructor() {
    this.offlineQueueKey = 'agripool_offline_drafts';
    this.listeners = [];
  }

  onSyncChange(cb) {
    this.listeners.push(cb);
  }

  notifySync(status, count) {
    this.listeners.forEach(cb => cb(status, count));
  }

  getOfflineDrafts() {
    try {
      const data = localStorage.getItem(this.offlineQueueKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveOfflineDraft(endpoint, method, body, label) {
    const drafts = this.getOfflineDrafts();
    drafts.push({
      id: 'draft_' + Date.now(),
      endpoint,
      method,
      body,
      label,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(this.offlineQueueKey, JSON.stringify(drafts));
    this.notifySync('pending', drafts.length);
  }

  async syncPendingDrafts() {
    const drafts = this.getOfflineDrafts();
    if (drafts.length === 0) {
      this.notifySync('synced', 0);
      return { success: true, count: 0 };
    }

    let syncedCount = 0;
    const remaining = [];

    for (const draft of drafts) {
      try {
        await this.request(draft.endpoint, {
          method: draft.method,
          body: JSON.stringify(draft.body)
        });
        syncedCount++;
      } catch (e) {
        remaining.push(draft);
      }
    }

    localStorage.setItem(this.offlineQueueKey, JSON.stringify(remaining));
    if (remaining.length === 0) {
      this.notifySync('synced', 0);
    } else {
      this.notifySync('pending', remaining.length);
    }
    return { success: true, syncedCount, remaining: remaining.length };
  }

  async request(endpoint, options = {}) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {})
      };

      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('agripool_auth_token') : null;
      if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const role = typeof localStorage !== 'undefined' ? localStorage.getItem('agripool_role') : null;
      if (role && !headers['X-User-Role']) {
        headers['X-User-Role'] = role;
      }

      // Automatically attach authenticated user details to trace user actions
      try {
        const storedUser = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('agripool_auth_user') || 'null') : null;
        if (storedUser) {
          if (storedUser.id && !headers['X-User-Id']) headers['X-User-Id'] = String(storedUser.id);
          if (storedUser.email && !headers['X-User-Email']) headers['X-User-Email'] = storedUser.email;
          if (storedUser.name && !headers['X-User-Name']) headers['X-User-Name'] = storedUser.name;
        }
      } catch (e) {}

      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `HTTP error ${res.status}`);
      }
      return json.data;
    } catch (err) {
      console.warn(`API call to ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  // API Methods
  getStats() { return this.request('/stats'); }
  getVillages() { return this.request('/villages'); }
  
  getFarmers(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/farmers?${q}`);
  }
  getFarmerById(id) { return this.request(`/farmers/${id}`); }
  getMyFarmerProfile() { return this.request('/farmer/me'); }
  createFarmer(data) {
    return this.request('/farmers', { method: 'POST', body: JSON.stringify(data) });
  }

  getLots(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/lots?${q}`);
  }
  getLotById(id) { return this.request(`/lots/${id}`); }
  createLot(data) {
    return this.request('/lots', { method: 'POST', body: JSON.stringify(data) });
  }
  weighLot(lotId, data) {
    return this.request(`/lots/${lotId}/weigh`, { method: 'POST', body: JSON.stringify(data) });
  }
  verifyLot(lotId, data) {
    return this.request(`/lots/${lotId}/verify`, { method: 'POST', body: JSON.stringify(data) });
  }

  getPools(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/pools?${q}`);
  }
  getPoolById(id) { return this.request(`/pools/${id}`); }
  createPool(data) {
    return this.request('/pools', { method: 'POST', body: JSON.stringify(data) });
  }

  getPickups() { return this.request('/pickups'); }
  createPickup(data) {
    return this.request('/pickups', { method: 'POST', body: JSON.stringify(data) });
  }
  updatePickupStatus(pickupId, data) {
    return this.request(`/pickups/${pickupId}/status`, { method: 'POST', body: JSON.stringify(data) });
  }

  getStorageFacilities() { return this.request('/storage/facilities'); }
  createStorageFacility(data) {
    return this.request('/storage/facilities', { method: 'POST', body: JSON.stringify(data) });
  }
  assignStorage(data) {
    return this.request('/storage/assign', { method: 'POST', body: JSON.stringify(data) });
  }

  getCrops(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/crops?${q}`);
  }
  createCrop(data) {
    return this.request('/crops', { method: 'POST', body: JSON.stringify(data) });
  }

  getBuyers() { return this.request('/buyers'); }
  getBulkBuyers() { return this.request('/bulk-buyers'); }
  createBulkBuyer(data) {
    return this.request('/bulk-buyers', { method: 'POST', body: JSON.stringify(data) });
  }

  getSellers() { return this.request('/sellers'); }
  createSeller(data) {
    return this.request('/sellers', { method: 'POST', body: JSON.stringify(data) });
  }

  getListings(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/listings?${q}`);
  }
  createListing(data) {
    return this.request('/listings', { method: 'POST', body: JSON.stringify(data) });
  }

  getOffers(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/offers?${q}`);
  }
  createOffer(data) {
    return this.request('/offers', { method: 'POST', body: JSON.stringify(data) });
  }
  updateOfferStatus(offerId, data) {
    return this.request(`/offers/${offerId}/status`, { method: 'POST', body: JSON.stringify(data) });
  }

  getOrders() { return this.request('/orders'); }
  createBuyerOrder(data) {
    return this.request('/orders', { method: 'POST', body: JSON.stringify(data) });
  }
  confirmOrder(orderId) {
    return this.request(`/orders/${orderId}/confirm`, { method: 'POST' });
  }

  getSettlements() { return this.request('/settlements'); }
  getSettlementById(id) { return this.request(`/settlements/${id}`); }
  generateSettlement(data) {
    return this.request('/settlements/generate', { method: 'POST', body: JSON.stringify(data) });
  }
  recordPayment(paymentId, data = {}) {
    return this.request(`/payments/${paymentId}/record`, { method: 'POST', body: JSON.stringify(data) });
  }

  getFinancePartners() { return this.request('/finance-partners'); }
  createFinancePartner(data) {
    return this.request('/finance-partners', { method: 'POST', body: JSON.stringify(data) });
  }
  getAdvances() { return this.request('/finance/advances'); }
  updateAdvanceStatus(id, status) {
    return this.request(`/finance/advances/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) });
  }

  getAuditLogs(limit = 100) { return this.request(`/audit-logs?limit=${limit}`); }
  getNotifications(role = '') { return this.request(`/notifications?role=${encodeURIComponent(role)}`); }
  createNotification(data) {
    return this.request('/notifications', { method: 'POST', body: JSON.stringify(data) });
  }
  
  runAcceptanceScenario() {
    return this.request('/acceptance-test', { method: 'POST' });
  }
  resetSeed() {
    return this.request('/reset-seed', { method: 'POST' });
  }

  // Auth & Roles API
  getRoles() { return this.request('/auth/roles'); }
  signup(data) {
    return this.request('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
  }
  login(data) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) });
  }
  getCurrentUser(userId) {
    return this.request(`/auth/me?userId=${userId}`);
  }
  verifyEmail(tokenOrData) {
    const body = typeof tokenOrData === 'object' ? tokenOrData : { token: tokenOrData };
    return this.request('/auth/verify-email', { method: 'POST', body: JSON.stringify(body) });
  }
  verifyEmailOtp(email, otp) {
    return this.request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) });
  }
  resendVerificationOtp(email) {
    return this.request('/auth/resend-verification-otp', { method: 'POST', body: JSON.stringify({ email }) });
  }
  forgotPassword(email) {
    return this.request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  }
  verifyResetOtp(email, otp) {
    return this.request('/auth/verify-reset-otp', { method: 'POST', body: JSON.stringify({ email, otp }) });
  }
  resetPassword(tokenOrData, newPassword = null) {
    const body = typeof tokenOrData === 'object' ? tokenOrData : { token: tokenOrData, newPassword };
    return this.request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) });
  }

  // Database Connection Status (Requirement #6)
  getDatabaseStatus() { return this.request('/database/status'); }

  // SMTP Dispatcher Status
  getSmtpStatus() { return this.request('/smtp/status'); }

  // Google OAuth Sync (Requirement #7)
  syncGoogleUser(data) {
    return this.request('/auth/google/sync', { method: 'POST', body: JSON.stringify(data) });
  }

  // Live Stock & Market Prices
  getMarketStatus() { return this.request('/market/status'); }
  syncMarketPrices() { return this.request('/market/sync', { method: 'POST' }); }
  getLiveStock() { return this.request('/market/stock'); }
  getMarketPrices() { return this.request('/market/prices'); }
  getCropMarketDetails(cropName) {
    return this.request(`/market/crops/${encodeURIComponent(cropName)}`);
  }
}

const api = new ApiService();
window.api = api;
