// db/database.js - SQLite Database Initialization and Schema
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

function getDbPath() {
  const defaultPath = path.join(__dirname, '..', 'agripool.db');
  if (process.env.VERCEL) {
    const tmpPath = path.join('/tmp', 'agripool.db');
    if (!fs.existsSync(tmpPath) && fs.existsSync(defaultPath)) {
      try {
        fs.copyFileSync(defaultPath, tmpPath);
        console.log('[Vercel Serverless] Initialized /tmp/agripool.db from deployment bundle');
      } catch (e) {
        console.warn('[Vercel Serverless] Could not copy bundle DB:', e.message);
      }
    }
    return tmpPath;
  }
  return defaultPath;
}

let dbInstance = null;

function getDatabase() {
  if (!dbInstance) {
    const dbPath = getDbPath();
    dbInstance = new DatabaseSync(dbPath);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db) {
  db.exec(`
    -- 1. FPOs (Farmer Producer Organizations)
    CREATE TABLE IF NOT EXISTS fpos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      contact_person TEXT,
      phone TEXT,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      bank_account TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Villages
    CREATE TABLE IF NOT EXISTS villages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      mandal TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      pin_code TEXT,
      fpo_id INTEGER REFERENCES fpos(id)
    );

    -- 3. SHGs (Self Help Groups)
    CREATE TABLE IF NOT EXISTS shgs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      fpo_id INTEGER REFERENCES fpos(id),
      village_id INTEGER REFERENCES villages(id),
      leader_name TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Users (RBAC)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      role TEXT NOT NULL, -- Super Admin, FPO Admin, SHG Operator, Field Operator, Farmer, Logistics Partner, Storage Partner, Buyer, Finance Partner
      password_hash TEXT,
      fpo_id INTEGER REFERENCES fpos(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Farmers
    CREATE TABLE IF NOT EXISTS farmers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      village_id INTEGER REFERENCES villages(id),
      fpo_id INTEGER REFERENCES fpos(id),
      shg_id INTEGER REFERENCES shgs(id),
      preferred_language TEXT DEFAULT 'en', -- en, te (Telugu), hi (Hindi)
      farm_size_acres REAL DEFAULT 2.0,
      bank_account_no TEXT,
      ifsc_code TEXT,
      status TEXT DEFAULT 'VERIFIED', -- PENDING, VERIFIED, INACTIVE
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. Farms
    CREATE TABLE IF NOT EXISTS farms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
      survey_no TEXT,
      area_acres REAL,
      soil_type TEXT,
      irrigation_source TEXT
    );

    -- 7. Pools (Aggregation Groups)
    CREATE TABLE IF NOT EXISTS pools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pool_code TEXT UNIQUE NOT NULL,
      produce TEXT NOT NULL,
      variety TEXT,
      target_quantity REAL NOT NULL,
      total_weight REAL DEFAULT 0.0,
      farmer_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'OPEN', -- OPEN, LOCKED, PICKUP_REQUESTED, IN_STORAGE, BUYER_MATCHED, SOLD, SETTLED, CLOSED
      fpo_id INTEGER REFERENCES fpos(id),
      estimated_price_per_kg REAL DEFAULT 0.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME
    );

    -- 8. Digital Lots
    CREATE TABLE IF NOT EXISTS lots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lot_code TEXT UNIQUE NOT NULL,
      farmer_id INTEGER REFERENCES farmers(id),
      fpo_id INTEGER REFERENCES fpos(id),
      produce TEXT NOT NULL,
      variety TEXT,
      estimated_quantity REAL NOT NULL,
      actual_weight REAL,
      grade TEXT DEFAULT 'GRADE_A',
      moisture_percentage REAL DEFAULT 11.5,
      harvest_date TEXT,
      village_id INTEGER REFERENCES villages(id),
      current_status TEXT DEFAULT 'CREATED', 
      -- CREATED -> WEIGHED -> VERIFIED -> POOLED -> PICKUP_SCHEDULED -> STORED -> BUYER_MATCHED -> SOLD -> SETTLED
      storage_status TEXT DEFAULT 'NONE', -- NONE, ASSIGNED, STORED, RELEASED
      pickup_status TEXT DEFAULT 'PENDING', -- PENDING, SCHEDULED, IN_TRANSIT, COMPLETED
      pool_id INTEGER REFERENCES pools(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 9. Lot Weights (Scale calibration and digital weighing records)
    CREATE TABLE IF NOT EXISTS lot_weights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lot_id INTEGER REFERENCES lots(id) ON DELETE CASCADE,
      gross_weight REAL NOT NULL,
      tare_weight REAL NOT NULL,
      net_weight REAL NOT NULL,
      weighing_scale_id TEXT,
      operator_id INTEGER REFERENCES users(id),
      weighed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      slip_url TEXT
    );

    -- 10. Lot Qualities (Inspection and assay certificates)
    CREATE TABLE IF NOT EXISTS lot_qualities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lot_id INTEGER REFERENCES lots(id) ON DELETE CASCADE,
      grade TEXT NOT NULL,
      moisture REAL,
      foreign_matter_pct REAL,
      inspection_notes TEXT,
      inspector_id INTEGER REFERENCES users(id),
      inspected_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 11. Pool Members (Mapping lots to pools with exact contribution weight)
    CREATE TABLE IF NOT EXISTS pool_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pool_id INTEGER REFERENCES pools(id) ON DELETE CASCADE,
      lot_id INTEGER REFERENCES lots(id),
      farmer_id INTEGER REFERENCES farmers(id),
      weight_kg REAL NOT NULL,
      share_pct REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 12. Logistics Pickups
    CREATE TABLE IF NOT EXISTS pickups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pickup_code TEXT UNIQUE NOT NULL,
      pool_id INTEGER REFERENCES pools(id),
      logistics_partner_id INTEGER REFERENCES users(id),
      vehicle_type TEXT, -- Mini Truck 1T, Tata 407 2.5T, Eicher 4T, 10-Wheeler 16T
      vehicle_number TEXT,
      driver_name TEXT,
      driver_phone TEXT,
      scheduled_date TEXT,
      status TEXT DEFAULT 'REQUESTED', -- REQUESTED, ASSIGNED, SCHEDULED, PICKED_UP, DELIVERED, CANCELLED
      route_villages TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 13. Storage Facilities
    CREATE TABLE IF NOT EXISTS storage_facilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      facility_type TEXT NOT NULL, -- Cold Storage, Dry Warehouse, Silo, Assaying Depo
      location TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      total_capacity_mt REAL NOT NULL,
      used_capacity_mt REAL DEFAULT 0.0,
      rate_per_month_per_quintal REAL NOT NULL,
      contact_phone TEXT,
      is_verified INTEGER DEFAULT 1
    );

    -- 14. Storage Assignments
    CREATE TABLE IF NOT EXISTS storage_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pool_id INTEGER REFERENCES pools(id),
      storage_facility_id INTEGER REFERENCES storage_facilities(id),
      assigned_weight_mt REAL NOT NULL,
      bay_number TEXT,
      entry_date TEXT,
      exit_date TEXT,
      status TEXT DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, RELEASED
      total_charges REAL DEFAULT 0.0
    );

    -- 15. Buyers
    CREATE TABLE IF NOT EXISTS buyers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      gst_number TEXT,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      buyer_type TEXT, -- Agro Processor, Spice Exporter, Retail Chain, FMCG Manufacturer
      credit_rating TEXT DEFAULT 'A+',
      is_verified INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 16. Buyer Orders
    CREATE TABLE IF NOT EXISTS buyer_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT UNIQUE NOT NULL,
      buyer_id INTEGER REFERENCES buyers(id),
      pool_id INTEGER REFERENCES pools(id),
      requested_weight_kg REAL NOT NULL,
      agreed_price_per_kg REAL NOT NULL,
      gross_amount REAL NOT NULL,
      status TEXT DEFAULT 'INTEREST', -- INTEREST, PO_CREATED, CONFIRMED, FULFILLED, CANCELLED
      payment_terms TEXT DEFAULT 'ESCROW_ON_DELIVERY',
      delivery_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 17. Transactions
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_code TEXT UNIQUE NOT NULL,
      order_id INTEGER REFERENCES buyer_orders(id),
      pool_id INTEGER REFERENCES pools(id),
      buyer_id INTEGER REFERENCES buyers(id),
      gross_amount REAL NOT NULL,
      status TEXT DEFAULT 'CONFIRMED', -- CONFIRMED, COMPLETED, DISPUTED
      contract_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_date DATETIME
    );

    -- 18. Settlements
    CREATE TABLE IF NOT EXISTS settlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      settlement_code TEXT UNIQUE NOT NULL,
      transaction_id INTEGER REFERENCES transactions(id),
      pool_id INTEGER REFERENCES pools(id),
      gross_sale_amount REAL NOT NULL,
      logistics_cost REAL DEFAULT 0.0,
      storage_cost REAL DEFAULT 0.0,
      platform_fee REAL DEFAULT 0.0,
      mandi_cess REAL DEFAULT 0.0,
      net_settlement_amount REAL NOT NULL,
      status TEXT DEFAULT 'GENERATED', -- GENERATED, APPROVED, DISBURSED, SETTLED
      settlement_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 19. Payments (Farmer level individual bank credits)
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_code TEXT UNIQUE NOT NULL,
      settlement_id INTEGER REFERENCES settlements(id),
      farmer_id INTEGER REFERENCES farmers(id),
      gross_share REAL NOT NULL,
      deductions REAL NOT NULL,
      net_payable REAL NOT NULL,
      payment_mode TEXT DEFAULT 'NEFT_DIRECT',
      reference_utr TEXT,
      status TEXT DEFAULT 'PENDING', -- PENDING, PROCESSING, PAID, FAILED
      paid_at DATETIME
    );

    -- 20. Financial Advances (Working Capital Liquidity Partner)
    CREATE TABLE IF NOT EXISTS financial_advances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      advance_code TEXT UNIQUE NOT NULL,
      pool_id INTEGER REFERENCES pools(id),
      farmer_id INTEGER REFERENCES farmers(id),
      lender_partner TEXT NOT NULL,
      requested_amount REAL NOT NULL,
      approved_amount REAL DEFAULT 0.0,
      interest_rate_pct REAL DEFAULT 8.5,
      status TEXT DEFAULT 'REQUESTED', -- REQUESTED, UNDER_REVIEW, APPROVED, DISBURSED, SETTLED, REJECTED
      disbursed_at DATETIME,
      settled_at DATETIME
    );

    -- 21. Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      role TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      channel TEXT DEFAULT 'IN_APP', -- IN_APP, SMS_MOCK, WHATSAPP_MOCK
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 22. Audit Logs (Immutable audit trail / Activity)
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      previous_value TEXT,
      new_value TEXT,
      ip_address TEXT DEFAULT '127.0.0.1',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 23. Crops (Farmer Individual Crop Declarations)
    CREATE TABLE IF NOT EXISTS crops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
      crop_name TEXT NOT NULL,
      crop_category TEXT DEFAULT 'Commercial Spices',
      quantity REAL NOT NULL,
      expected_harvest_date TEXT,
      quality_grade TEXT DEFAULT 'GRADE_A',
      village TEXT,
      storage_status TEXT DEFAULT 'On Farm',
      crop_images TEXT,
      status TEXT DEFAULT 'Ready', -- Draft, Ready, Harvested, Added to Lot, Sold
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 24. Sellers (FPO Selling Units / SHGs)
    CREATE TABLE IF NOT EXISTS sellers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      location TEXT,
      seller_type TEXT DEFAULT 'FPO Aggregator',
      verification_status TEXT DEFAULT 'Verified',
      fpo_id INTEGER REFERENCES fpos(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 25. Selling Listings
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_code TEXT UNIQUE NOT NULL,
      seller_id INTEGER REFERENCES sellers(id),
      crop_name TEXT NOT NULL,
      available_quantity REAL NOT NULL,
      min_order_quantity REAL DEFAULT 100.0,
      quality_grade TEXT DEFAULT 'GRADE_A',
      harvest_date TEXT,
      location TEXT,
      expected_price REAL NOT NULL,
      availability_period TEXT DEFAULT 'Immediate',
      storage_status TEXT DEFAULT 'Warehouse Stored',
      status TEXT DEFAULT 'Active', -- Draft, Active, Reserved, Partially Sold, Sold, Expired
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 26. Offers (Buyer Offers and Counter-Offers)
    CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      offer_code TEXT UNIQUE NOT NULL,
      buyer_id INTEGER REFERENCES buyers(id),
      pool_id INTEGER REFERENCES pools(id),
      listing_id INTEGER REFERENCES listings(id),
      quantity REAL NOT NULL,
      offer_price REAL NOT NULL,
      total_amount REAL NOT NULL,
      counter_price REAL,
      status TEXT DEFAULT 'Offer Sent', -- Interest Sent, Offer Sent, Counter Offer, Accepted, Rejected, Withdrawn
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 27. Finance Partners
    CREATE TABLE IF NOT EXISTS finance_partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      partner_name TEXT NOT NULL,
      partner_type TEXT DEFAULT 'Agri NBFC',
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      max_facility_amount REAL DEFAULT 5000000.0,
      interest_rate_range TEXT DEFAULT '7.5% - 9.5%',
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 28. Live Market Prices
    CREATE TABLE IF NOT EXISTS crop_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_name TEXT UNIQUE NOT NULL,
      market TEXT NOT NULL,
      price_per_kg REAL NOT NULL,
      unit TEXT DEFAULT 'kg',
      price_trend TEXT DEFAULT 'STABLE',
      change_pct REAL DEFAULT 0.0,
      source TEXT DEFAULT 'Demo Agmarknet / APMC Data',
      is_live_api INTEGER DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 29. Crop Price History
    CREATE TABLE IF NOT EXISTS crop_price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_name TEXT NOT NULL,
      market TEXT NOT NULL,
      price_per_kg REAL NOT NULL,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Non-destructive migrations for users authentication & profile columns
  const userColumns = [
    "ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'ACTIVE'",
    "ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 1",
    "ALTER TABLE users ADD COLUMN verification_token TEXT",
    "ALTER TABLE users ADD COLUMN reset_token TEXT",
    "ALTER TABLE users ADD COLUMN reset_expires_at TEXT",
    "ALTER TABLE users ADD COLUMN verification_otp TEXT",
    "ALTER TABLE users ADD COLUMN verification_otp_expires_at TEXT",
    "ALTER TABLE users ADD COLUMN reset_otp TEXT",
    "ALTER TABLE users ADD COLUMN reset_otp_expires_at TEXT",
    "ALTER TABLE users ADD COLUMN last_login_at DATETIME",
    "ALTER TABLE users ADD COLUMN last_login_ip TEXT",
    "ALTER TABLE users ADD COLUMN role_details TEXT",
    "ALTER TABLE farmers ADD COLUMN user_id INTEGER",
    "ALTER TABLE audit_logs ADD COLUMN user_email TEXT",
    "ALTER TABLE audit_logs ADD COLUMN mail_status TEXT",
    // Official data.gov.in Mandi dataset fields
    "ALTER TABLE crop_prices ADD COLUMN commodity TEXT",
    "ALTER TABLE crop_prices ADD COLUMN state TEXT",
    "ALTER TABLE crop_prices ADD COLUMN district TEXT",
    "ALTER TABLE crop_prices ADD COLUMN variety TEXT",
    "ALTER TABLE crop_prices ADD COLUMN grade TEXT",
    "ALTER TABLE crop_prices ADD COLUMN min_price REAL",
    "ALTER TABLE crop_prices ADD COLUMN max_price REAL",
    "ALTER TABLE crop_prices ADD COLUMN modal_price REAL",
    "ALTER TABLE crop_prices ADD COLUMN market_date TEXT",
    "ALTER TABLE crop_prices ADD COLUMN fetched_at DATETIME",
    "ALTER TABLE crop_price_history ADD COLUMN commodity TEXT",
    "ALTER TABLE crop_price_history ADD COLUMN state TEXT",
    "ALTER TABLE crop_price_history ADD COLUMN district TEXT",
    "ALTER TABLE crop_price_history ADD COLUMN variety TEXT",
    "ALTER TABLE crop_price_history ADD COLUMN grade TEXT",
    "ALTER TABLE crop_price_history ADD COLUMN min_price REAL",
    "ALTER TABLE crop_price_history ADD COLUMN max_price REAL",
    "ALTER TABLE crop_price_history ADD COLUMN modal_price REAL",
    "ALTER TABLE crop_price_history ADD COLUMN market_date TEXT",
    "ALTER TABLE crop_price_history ADD COLUMN source TEXT"
  ];
  for (const alterSql of userColumns) {
    try {
      db.exec(alterSql);
    } catch (e) {
      // Column already exists or error ignored
    }
  }
}

module.exports = {
  getDatabase,
  initSchema,
  get db() {
    return getDatabase();
  }
};
