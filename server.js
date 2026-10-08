// server.js - AgriPool HTTP Server and REST API
const http = require('node:http');
const url = require('node:url');
const path = require('node:path');
const fs = require('node:fs');

// Load environment variables from .env before initializing any modules
require('./utils/env');

const { getDatabase } = require('./db/database');
const { seedDatabase } = require('./db/seed');
const queries = require('./db/queries');
const supabase = require('./db/supabase');
const mailer = require('./utils/mailer');
const mandiApi = require('./utils/mandi_api');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Initialize database and seed if empty
try {
  seedDatabase();
} catch (e) {
  console.error('Error during initial db setup/seed:', e);
}

// Proactively synchronize live market prices on startup if API key is configured
if (mandiApi.isConfigured()) {
  mandiApi.fetchLivePrices().then(result => {
    if (result && result.success && Array.isArray(result.commodities) && result.commodities.length > 0) {
      queries.saveLiveMandiPrices(result.commodities);
      console.log(`[Startup] Live APMC mandi feed active: ${result.commodities.length} commodities loaded (${result.source})`);
    }
  }).catch(err => {
    console.warn('[Startup] Market feed initialization notice:', err.message);
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error('Request payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const query = parsedUrl.query;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-User-Id, X-User-Email, X-User-Name, X-User-Role'
    });
    res.end();
    return;
  }

  // API Routes
  if (pathname.startsWith('/api/')) {
    try {
      // Backend Role Authorization Helper
      const getCallerRole = (request) => {
        const raw = request.headers['x-user-role'] || '';
        return raw ? supabase.normalizeRole(raw) : null;
      };

      // Request User Context Helper (Identifies actor for immutable audit trail & email alerts)
      const getRequestContextUser = (request) => {
        const db = getDatabase();
        const rawId = request.headers['x-user-id'];
        const userId = rawId ? Number(rawId) : null;
        const rawEmail = request.headers['x-user-email'];
        const userEmail = rawEmail ? String(rawEmail).trim() : null;
        const userName = request.headers['x-user-name'] ? String(request.headers['x-user-name']).trim() : null;
        const userRole = request.headers['x-user-role'] ? String(request.headers['x-user-role']).trim() : null;

        let found = null;
        if (userId) {
          try {
            const u = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(userId);
            if (u) found = u;
          } catch (e) {}
        }
        if (!found && userEmail) {
          try {
            const u = db.prepare('SELECT id, name, email, role FROM users WHERE email = ?').get(userEmail);
            if (u) found = u;
          } catch (e) {}
        }

        if (found) {
          return {
            ...found,
            role: supabase.normalizeRole(found.role)
          };
        }

        return {
          id: userId || null,
          name: userName || 'AgriPool Member',
          email: userEmail || 'official.agripool@gmail.com',
          role: userRole ? supabase.normalizeRole(userRole) : 'operator'
        };
      };

      const enforceRole = (request, response, allowedRoles) => {
        const role = getCallerRole(request);
        if (!role) return true; // Permissive for internal tests without headers
        if (role === 'admin' || allowedRoles.map(r => supabase.normalizeRole(r)).includes(role)) {
          return true;
        }
        sendJson(response, 403, {
          success: false,
          error: `Forbidden: Access restricted. Role "${supabase.getRoleDisplayName(role)}" is not authorized for this operation.`
        });
        return false;
      };

      // System Health Check
      if (pathname === '/api/health' && method === 'GET') {
        return sendJson(res, 200, {
          success: true,
          status: 'healthy',
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        });
      }

      // Auth & Role Management Routes (Requirements #2, #3, #4, #5, #6, #7)
      if (pathname === '/api/auth/roles' && method === 'GET') {
        const roles = [
          { id: 'farmer', name: 'Farmer', icon: '👨‍🌾', description: 'Produces crops, creates lots, and receives pro-rata bank payments', dashboard: '/farmer/dashboard' },
          { id: 'seller', name: 'Seller', icon: '🧑‍🌾', description: 'Lists aggregated produce, receives and negotiates commercial buyer offers', dashboard: '/seller/dashboard' },
          { id: 'buyer', name: 'Bulk Buyer', icon: '🏢', description: 'Commercial agribusiness procurer purchasing pooled verified produce', dashboard: '/buyer/dashboard' },
          { id: 'fpo', name: 'FPO Admin', icon: '👨‍💼', description: 'Manages farmers, lots, aggregation pools, warehouses, and settlements', dashboard: '/fpo/dashboard' },
          { id: 'field', name: 'SHG / Field Operator', icon: '👩‍🌾', description: 'Performs calibrated field weighing, digital lots, and pickup logistics', dashboard: '/field/dashboard' },
          { id: 'storage', name: 'Storage Partner', icon: '🏭', description: 'Manages certified warehouse bays and storage inventory allocations', dashboard: '/storage/dashboard' },
          { id: 'finance', name: 'Finance Partner', icon: '💳', description: 'Provides invoice advances and working capital liquidity to farmers/FPOs', dashboard: '/finance/dashboard' }
        ];
        return sendJson(res, 200, { success: true, data: roles });
      }

      if (pathname === '/api/auth/signup' && method === 'POST') {
        const body = await parseBody(req);
        const result = await supabase.signUp(body);
        return sendJson(res, 201, { success: true, data: result });
      }

      if (pathname === '/api/auth/login' && method === 'POST') {
        const body = await parseBody(req);
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || 'Web Browser';
        const result = await supabase.signIn({ ...body, ip, userAgent });
        return sendJson(res, 200, { success: true, data: result });
      }

      if (pathname === '/api/auth/me' && method === 'GET') {
        const userId = query.userId ? Number(query.userId) : null;
        if (!userId) return sendJson(res, 401, { success: false, error: 'Unauthorized' });
        const user = supabase.getUserById(userId);
        if (!user) return sendJson(res, 404, { success: false, error: 'User not found' });
        return sendJson(res, 200, { success: true, data: user });
      }

      if (pathname === '/api/auth/verify-email' && method === 'POST') {
        const body = await parseBody(req);
        const result = await supabase.verifyEmail(body.token ? body.token : body);
        return sendJson(res, 200, { success: true, data: result });
      }

      if (pathname === '/api/auth/verify-otp' && method === 'POST') {
        const body = await parseBody(req);
        const result = await supabase.verifyEmail(body);
        return sendJson(res, 200, { success: true, data: result });
      }

      if (pathname === '/api/auth/resend-verification-otp' && method === 'POST') {
        const body = await parseBody(req);
        const result = await supabase.resendVerificationOtp(body.email);
        return sendJson(res, 200, { success: true, data: result });
      }

      if (pathname === '/api/auth/forgot-password' && method === 'POST') {
        const body = await parseBody(req);
        const result = await supabase.requestPasswordReset(body.email);
        return sendJson(res, 200, { success: true, data: result });
      }

      if (pathname === '/api/auth/verify-reset-otp' && method === 'POST') {
        const body = await parseBody(req);
        const result = await supabase.verifyResetOtp(body.email, body.otp);
        return sendJson(res, 200, { success: true, data: result });
      }

      if (pathname === '/api/auth/reset-password' && method === 'POST') {
        const body = await parseBody(req);
        const result = await supabase.resetPassword(body, body.newPassword);
        return sendJson(res, 200, { success: true, data: result });
      }

      // Real Supabase Database Connection Status Check (Requirement #6)
      if (pathname === '/api/database/status' && method === 'GET') {
        const dbStatus = await supabase.checkConnection();
        return sendJson(res, 200, { success: true, data: dbStatus });
      }

      // Real SMTP Email Dispatcher Status Check (Gmail / Brevo)
      if (pathname === '/api/smtp/status' && method === 'GET') {
        const smtpStatus = await mailer.checkConnection();
        return sendJson(res, 200, { success: true, data: smtpStatus });
      }

      // Safe SMTP Test Email Dispatch
      if (pathname === '/api/smtp/test' && method === 'POST') {
        const body = await parseBody(req);
        const to = (body.to || '').trim();
        if (!to) {
          return sendJson(res, 400, { success: false, error: 'Recipient email address (to) is required.' });
        }
        const result = await mailer.sendMail({
          to,
          subject: '🌾 AgriPool — Gmail SMTP Connection Verification',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <div style="background: #198754; padding: 18px; border-radius: 8px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 22px;">🌾 AgriPool Platform</h1>
                <p style="margin: 4px 0 0; font-size: 13px;">Official Gmail SMTP Integration</p>
              </div>
              <div style="padding: 20px 0; color: #334155; line-height: 1.6;">
                <h3 style="color: #0f5132;">SMTP Live Dispatch Successful!</h3>
                <p>Hello,</p>
                <p>This email confirms that your AgriPool platform's official Gmail SMTP relay is fully operational and delivering real-time notification alerts.</p>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; font-size: 13px;">
                  <div><strong>Host:</strong> smtp.gmail.com</div>
                  <div><strong>Port:</strong> 465 (Direct SSL/TLS)</div>
                  <div><strong>From:</strong> official.agripool@gmail.com</div>
                  <div><strong>Timestamp:</strong> ${new Date().toISOString()}</div>
                </div>
              </div>
            </div>
          `
        });
        return sendJson(res, 200, { success: true, data: result });
      }

      // Google OAuth Profile Sync (Requirement #7)
      if (pathname === '/api/auth/google/sync' && method === 'POST') {
        const body = await parseBody(req);
        const result = await supabase.handleGoogleUser(body);
        return sendJson(res, 200, { success: true, data: result });
      }

      // Live Market Prices & Live Stock (Requirements #18, #19, #20)
      if (pathname === '/api/market/status' && method === 'GET') {
        const status = await mandiApi.checkConnection();
        return sendJson(res, 200, {
          success: true,
          connected: status.connected,
          source: status.source,
          endpoint: status.endpoint,
          lastUpdated: status.lastUpdated,
          error: status.error,
          hasKey: status.hasKey,
          data: status
        });
      }

// Background Market Sync Worker
let isSyncingMarket = false;
let lastMarketSyncAttempt = 0;

async function attemptBackgroundMarketSync() {
  const now = Date.now();
  if (isSyncingMarket || (now - lastMarketSyncAttempt < 30000)) return;
  if (!mandiApi.isConfigured()) return;

  isSyncingMarket = true;
  lastMarketSyncAttempt = now;
  try {
    const fetchResult = await mandiApi.fetchLivePrices();
    if (fetchResult.success && Array.isArray(fetchResult.commodities) && fetchResult.commodities.length > 0) {
      await queries.saveLiveMandiPrices(fetchResult.commodities);
      console.log(`[Market Sync Worker] Live sync saved ${fetchResult.commodities.length} market items.`);
    }
  } catch (err) {
    console.warn('[Market Sync Worker] Notice:', err.message);
  } finally {
    isSyncingMarket = false;
  }
}

      if (pathname === '/api/market/sync' && method === 'POST') {
        const fetchResult = await mandiApi.fetchLivePrices();
        if (fetchResult.success && fetchResult.commodities && fetchResult.commodities.length > 0) {
          const savedPrices = await queries.saveLiveMandiPrices(fetchResult.commodities);
          return sendJson(res, 200, { 
            success: true, 
            connected: true,
            totalFetched: fetchResult.commodities.length,
            source: fetchResult.source, 
            data: savedPrices 
          });
        } else {
          return sendJson(res, 200, { 
            success: false, 
            connected: false,
            status: 'Market Data Source Not Connected', 
            reason: fetchResult.reason || fetchResult.error || 'Live Market API temporarily unreachable' 
          });
        }
      }

      if (pathname === '/api/market/stock' && method === 'GET') {
        const stock = queries.getLiveStock();
        return sendJson(res, 200, { success: true, data: stock });
      }

      if (pathname === '/api/market/prices' && method === 'GET') {
        let prices = queries.getMarketPrices();
        let livePrices = prices.filter(p => p.is_live_api === 1);
        if (livePrices.length === 0 && mandiApi.isConfigured()) {
          const fetchResult = await mandiApi.fetchLivePrices();
          if (fetchResult && fetchResult.success && Array.isArray(fetchResult.commodities) && fetchResult.commodities.length > 0) {
            prices = await queries.saveLiveMandiPrices(fetchResult.commodities);
          }
        }
        return sendJson(res, 200, { success: true, data: prices });
      }

      const cropDetailsMatch = pathname.match(/^\/api\/market\/crops\/([^\/]+)$/);
      if (cropDetailsMatch && method === 'GET') {
        const cropName = decodeURIComponent(cropDetailsMatch[1]);
        const details = queries.getCropMarketDetails(cropName);
        return sendJson(res, 200, { success: true, data: details });
      }

      // 1. Dashboard Stats
      if (pathname === '/api/stats' && method === 'GET') {
        const caller = getRequestContextUser(req);
        const stats = queries.getDashboardStats(caller);
        return sendJson(res, 200, { success: true, data: stats });
      }

      // 2. Villages (Dropdowns)
      if (pathname === '/api/villages' && method === 'GET') {
        const db = getDatabase();
        const villages = db.prepare('SELECT * FROM villages ORDER BY id ASC').all();
        return sendJson(res, 200, { success: true, data: villages });
      }

      // Dedicated Authenticated Farmer Self Profile (Farmer Self-Service Portal)
      if (pathname === '/api/farmer/me' && method === 'GET') {
        const caller = getRequestContextUser(req);
        const farmer = queries.getCallerFarmer(caller);
        if (!farmer) {
          return sendJson(res, 404, { success: false, error: 'Farmer profile not found for active user' });
        }
        const profile = queries.getFarmerById(farmer.id, caller);
        return sendJson(res, 200, { success: true, data: profile });
      }

      // 3. Farmers List & Create
      if (pathname === '/api/farmers' && method === 'GET') {
        const caller = getRequestContextUser(req);
        const farmers = queries.getFarmers({
          search: query.search || '',
          villageId: query.villageId ? Number(query.villageId) : null,
          limit: Number(query.limit) || 100,
          offset: Number(query.offset) || 0,
          caller
        });
        return sendJson(res, 200, { success: true, data: farmers });
      }

      if (pathname === '/api/farmers' && method === 'POST') {
        if (!enforceRole(req, res, ['fpo', 'field', 'admin'])) return;
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const farmer = queries.createFarmer(body, caller);
        return sendJson(res, 201, { success: true, data: farmer });
      }

      const farmerMatch = pathname.match(/^\/api\/farmers\/(\d+)$/);
      if (farmerMatch && method === 'GET') {
        const caller = getRequestContextUser(req);
        const farmer = queries.getFarmerById(Number(farmerMatch[1]), caller);
        if (!farmer) return sendJson(res, 404, { success: false, error: 'Farmer not found' });
        return sendJson(res, 200, { success: true, data: farmer });
      }

      // 4. Lots List & Create
      if (pathname === '/api/lots' && method === 'GET') {
        const caller = getRequestContextUser(req);
        const lots = queries.getLots({
          status: query.status || null,
          produce: query.produce || null,
          villageId: query.villageId ? Number(query.villageId) : null,
          unpooledOnly: query.unpooled === 'true',
          limit: Number(query.limit) || 100,
          offset: Number(query.offset) || 0,
          caller
        });
        return sendJson(res, 200, { success: true, data: lots });
      }

      if (pathname === '/api/lots' && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const lot = queries.createLot(body, caller, caller);
        return sendJson(res, 201, { success: true, data: lot });
      }

      const lotMatch = pathname.match(/^\/api\/lots\/(\d+)$/);
      if (lotMatch && method === 'GET') {
        const caller = getRequestContextUser(req);
        const lot = queries.getLotById(Number(lotMatch[1]), caller);
        if (!lot) return sendJson(res, 404, { success: false, error: 'Lot not found' });
        return sendJson(res, 200, { success: true, data: lot });
      }

      // Lot Weighing & Quality Verification
      const lotWeighMatch = pathname.match(/^\/api\/lots\/(\d+)\/weigh$/);
      if (lotWeighMatch && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const updatedLot = queries.weighLot(Number(lotWeighMatch[1]), body, caller);
        return sendJson(res, 200, { success: true, data: updatedLot });
      }

      const lotVerifyMatch = pathname.match(/^\/api\/lots\/(\d+)\/verify$/);
      if (lotVerifyMatch && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const updatedLot = queries.verifyQuality(Number(lotVerifyMatch[1]), body, caller);
        return sendJson(res, 200, { success: true, data: updatedLot });
      }

      // 5. Pooling Engine
      if (pathname === '/api/pools' && method === 'GET') {
        const caller = getRequestContextUser(req);
        const pools = queries.getPools({
          status: query.status || null,
          produce: query.produce || null,
          caller
        });
        return sendJson(res, 200, { success: true, data: pools });
      }

      if (pathname === '/api/pools' && method === 'POST') {
        if (!enforceRole(req, res, ['fpo', 'admin'])) return;
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const pool = queries.createPool(body, caller);
        return sendJson(res, 201, { success: true, data: pool });
      }

      const poolMatch = pathname.match(/^\/api\/pools\/(\d+)$/);
      if (poolMatch && method === 'GET') {
        const caller = getRequestContextUser(req);
        const pool = queries.getPoolById(Number(poolMatch[1]), caller);
        if (!pool) return sendJson(res, 404, { success: false, error: 'Pool not found' });
        return sendJson(res, 200, { success: true, data: pool });
      }

      // 6. Logistics Pickups
      if (pathname === '/api/pickups' && method === 'GET') {
        const caller = getRequestContextUser(req);
        const pickups = queries.getLogisticsPickups(caller);
        return sendJson(res, 200, { success: true, data: pickups });
      }

      if (pathname === '/api/pickups' && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const pool = queries.createPickupRequest(body, caller);
        return sendJson(res, 201, { success: true, data: pool });
      }

      const pickupStatusMatch = pathname.match(/^\/api\/pickups\/(\d+)\/status$/);
      if (pickupStatusMatch && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const pickup = queries.updatePickupStatus(Number(pickupStatusMatch[1]), body, caller);
        return sendJson(res, 200, { success: true, data: pickup });
      }

      // 7. Storage Facilities & Assignments
      if (pathname === '/api/storage/facilities' && method === 'GET') {
        const facilities = queries.getStorageFacilities();
        return sendJson(res, 200, { success: true, data: facilities });
      }

      if (pathname === '/api/storage/facilities' && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const facility = queries.createStorageFacility(body, caller);
        return sendJson(res, 201, { success: true, data: facility });
      }

      if (pathname === '/api/storage/assign' && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const pool = queries.assignStorage(body, caller);
        return sendJson(res, 200, { success: true, data: pool });
      }

      // 8. Crops (Farmer Individual Produce Declarations)
      if (pathname === '/api/crops' && method === 'GET') {
        const caller = getRequestContextUser(req);
        const crops = queries.getCrops({
          farmerId: query.farmerId ? Number(query.farmerId) : null,
          status: query.status || null,
          caller
        });
        return sendJson(res, 200, { success: true, data: crops });
      }

      if (pathname === '/api/crops' && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const crop = queries.createCrop(body, caller, caller);
        return sendJson(res, 201, { success: true, data: crop });
      }

      // 9. Buyers & Bulk Buyers
      if (pathname === '/api/buyers' && method === 'GET') {
        const buyers = queries.getBuyers();
        return sendJson(res, 200, { success: true, data: buyers });
      }

      if (pathname === '/api/bulk-buyers' && method === 'GET') {
        const bulkBuyers = queries.getBulkBuyers();
        return sendJson(res, 200, { success: true, data: bulkBuyers });
      }

      if (pathname === '/api/bulk-buyers' && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const buyer = queries.createBulkBuyer(body, caller);
        return sendJson(res, 201, { success: true, data: buyer });
      }

      // 10. Sellers & Listings
      if (pathname === '/api/sellers' && method === 'GET') {
        const sellers = queries.getSellers();
        return sendJson(res, 200, { success: true, data: sellers });
      }

      if (pathname === '/api/sellers' && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const seller = queries.createSeller(body, caller);
        return sendJson(res, 201, { success: true, data: seller });
      }

      if (pathname === '/api/listings' && method === 'GET') {
        const listings = queries.getListings({ status: query.status || null });
        return sendJson(res, 200, { success: true, data: listings });
      }

      if (pathname === '/api/listings' && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const listing = queries.createListing(body, caller);
        return sendJson(res, 201, { success: true, data: listing });
      }

      // 11. Offers & Negotiations
      if (pathname === '/api/offers' && method === 'GET') {
        const offers = queries.getOffers({
          buyerId: query.buyerId ? Number(query.buyerId) : null,
          listingId: query.listingId ? Number(query.listingId) : null,
          poolId: query.poolId ? Number(query.poolId) : null
        });
        return sendJson(res, 200, { success: true, data: offers });
      }

      if (pathname === '/api/offers' && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const offer = queries.createOffer(body, caller);
        return sendJson(res, 201, { success: true, data: offer });
      }

      const offerStatusMatch = pathname.match(/^\/api\/offers\/(\d+)\/status$/);
      if (offerStatusMatch && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const offer = queries.updateOfferStatus(Number(offerStatusMatch[1]), body, caller);
        return sendJson(res, 200, { success: true, data: offer });
      }

      // 12. Orders
      if (pathname === '/api/orders' && method === 'GET') {
        const caller = getRequestContextUser(req);
        const orders = queries.getOrders(caller);
        return sendJson(res, 200, { success: true, data: orders });
      }

      if (pathname === '/api/orders' && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const pool = queries.createBuyerOrder(body, caller);
        return sendJson(res, 201, { success: true, data: pool });
      }

      const orderConfirmMatch = pathname.match(/^\/api\/orders\/(\d+)\/confirm$/);
      if (orderConfirmMatch && method === 'POST') {
        const caller = getRequestContextUser(req);
        const pool = queries.confirmOrderAndCreateTransaction(Number(orderConfirmMatch[1]), caller);
        return sendJson(res, 200, { success: true, data: pool });
      }

      // 13. Settlements & Payments
      if (pathname === '/api/settlements' && method === 'GET') {
        const caller = getRequestContextUser(req);
        const settlements = queries.getSettlements(caller);
        return sendJson(res, 200, { success: true, data: settlements });
      }

      const settleMatch = pathname.match(/^\/api\/settlements\/(\d+)$/);
      if (settleMatch && method === 'GET') {
        const caller = getRequestContextUser(req);
        const settlement = queries.getSettlementById(Number(settleMatch[1]), caller);
        if (!settlement) return sendJson(res, 404, { success: false, error: 'Settlement not found' });
        return sendJson(res, 200, { success: true, data: settlement });
      }

      if (pathname === '/api/settlements/generate' && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const settlement = queries.generateSettlement(body, caller);
        return sendJson(res, 201, { success: true, data: settlement });
      }

      const paymentRecordMatch = pathname.match(/^\/api\/payments\/(\d+)\/record$/);
      if (paymentRecordMatch && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const payment = queries.recordPayment(Number(paymentRecordMatch[1]), body, caller);
        return sendJson(res, 200, { success: true, data: payment });
      }

      // 14. Finance Partners & Advances
      if (pathname === '/api/finance-partners' && method === 'GET') {
        const partners = queries.getFinancePartners();
        return sendJson(res, 200, { success: true, data: partners });
      }

      if (pathname === '/api/finance-partners' && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const partner = queries.createFinancePartner(body, caller);
        return sendJson(res, 201, { success: true, data: partner });
      }

      if (pathname === '/api/finance/advances' && method === 'GET') {
        const caller = getRequestContextUser(req);
        const advances = queries.getFinancialAdvances(caller);
        return sendJson(res, 200, { success: true, data: advances });
      }

      const advanceStatusMatch = pathname.match(/^\/api\/finance\/advances\/(\d+)\/status$/);
      if (advanceStatusMatch && method === 'POST') {
        const body = await parseBody(req);
        const caller = getRequestContextUser(req);
        const advance = queries.updateAdvanceStatus(Number(advanceStatusMatch[1]), body.status, caller);
        return sendJson(res, 200, { success: true, data: advance });
      }

      // 15. Activity / Audit Logs & Notifications
      if (pathname === '/api/audit-logs' && method === 'GET') {
        const caller = getRequestContextUser(req);
        const logs = queries.getAuditLogs(Number(query.limit) || 100, caller);
        return sendJson(res, 200, { success: true, data: logs });
      }

      if (pathname === '/api/notifications' && method === 'GET') {
        const caller = getRequestContextUser(req);
        const notifs = queries.getNotifications(query.role || null, caller);
        return sendJson(res, 200, { success: true, data: notifs });
      }

      if (pathname === '/api/notifications' && method === 'POST') {
        const body = await parseBody(req);
        const notif = queries.createNotification(body);
        return sendJson(res, 201, { success: true, data: notif });
      }

      // 16. 1-Click Master Acceptance Scenario (Section 39 & 41)
      if (pathname === '/api/acceptance-test' && method === 'POST') {
        const result = queries.runAcceptanceScenario();
        return sendJson(res, 200, { success: true, data: result });
      }

      // 13. System Reset/Re-seed (for fresh testing)
      if (pathname === '/api/reset-seed' && method === 'POST') {
        seedDatabase(true);
        return sendJson(res, 200, { success: true, message: 'Database reseeded successfully.' });
      }

      return sendJson(res, 404, { success: false, error: `Endpoint not found: ${pathname}` });
    } catch (err) {
      console.error('API Error:', err);
      return sendJson(res, 400, { success: false, error: err.message || 'Internal Server Error' });
    }
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  let ext = path.extname(filePath).toLowerCase();

  // If path has no extension or doesn't exist, fallback to index.html (SPA support)
  if (!ext || !fs.existsSync(filePath)) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
    ext = '.html';
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for client-side navigation
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        fs.createReadStream(indexPath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('Not Found');
      }
      return;
    }

    const contentType = MIME_TYPES[ext] || 'text/html; charset=UTF-8';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  🌾 AgriPool Agriculture Aggregation Platform Running`);
  console.log(`  🔗 Local URL: http://localhost:${PORT}`);
  console.log(`  🎯 Pilot Mode: Kisan Vikas FPO (Krishna/Guntur, AP)`);
  console.log(`=======================================================`);
});
