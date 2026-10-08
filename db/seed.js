// db/seed.js - Realistic seed generator with 75 farmers, 50+ lots, pools, transactions, settlements
const { getDatabase } = require('./database');

function seedDatabase(force = false) {
  const db = getDatabase();

  const countRow = db.prepare('SELECT COUNT(*) as count FROM farmers').get();
  if (countRow.count > 0 && !force) {
    console.log(`Database already contains ${countRow.count} farmers. Skipping re-seed.`);
    return;
  }

  console.log('Seeding AgriPool database with realistic pilot data...');

  // Always clear cleanly whenever seeding
  db.exec(`
    DELETE FROM audit_logs;
    DELETE FROM notifications;
    DELETE FROM financial_advances;
    DELETE FROM payments;
    DELETE FROM settlements;
    DELETE FROM transactions;
    DELETE FROM buyer_orders;
    DELETE FROM finance_partners;
    DELETE FROM offers;
    DELETE FROM listings;
    DELETE FROM sellers;
    DELETE FROM crops;
    DELETE FROM buyers;
    DELETE FROM storage_assignments;
    DELETE FROM storage_facilities;
    DELETE FROM pickups;
    DELETE FROM pool_members;
    DELETE FROM lot_qualities;
    DELETE FROM lot_weights;
    DELETE FROM lots;
    DELETE FROM pools;
    DELETE FROM farms;
    DELETE FROM farmers;
    DELETE FROM users;
    DELETE FROM shgs;
    DELETE FROM villages;
    DELETE FROM fpos;
    DELETE FROM sqlite_sequence;
  `);

  // 1. FPO
  const insertFpo = db.prepare(`
    INSERT INTO fpos (name, code, contact_person, phone, district, state, bank_account)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const fpoResult = insertFpo.run(
    'Kisan Vikas Farmers Producer Co. Ltd.',
    'FPO-KVPC-01',
    'Chaitanya Varma',
    '+91 98480 12345',
    'Krishna',
    'Andhra Pradesh',
    'HDFC0001827 - A/C 50200019283741'
  );
  const fpoId = Number(fpoResult.lastInsertRowid);

  // 2. Villages
  const villagesData = [
    { name: 'Kankipadu', mandal: 'Kankipadu', district: 'Krishna', state: 'Andhra Pradesh', pin_code: '521151' },
    { name: 'Thotlavalluru', mandal: 'Thotlavalluru', district: 'Krishna', state: 'Andhra Pradesh', pin_code: '521163' },
    { name: 'Gudivada Rural', mandal: 'Gudivada', district: 'Krishna', state: 'Andhra Pradesh', pin_code: '521301' },
    { name: 'Mangalagiri Rural', mandal: 'Mangalagiri', district: 'Guntur', state: 'Andhra Pradesh', pin_code: '522503' },
    { name: 'Tenali North', mandal: 'Tenali', district: 'Guntur', state: 'Andhra Pradesh', pin_code: '522201' }
  ];
  const insertVillage = db.prepare(`
    INSERT INTO villages (name, mandal, district, state, pin_code, fpo_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const villageIds = [];
  villagesData.forEach(v => {
    const vRes = insertVillage.run(v.name, v.mandal, v.district, v.state, v.pin_code, fpoId);
    villageIds.push(Number(vRes.lastInsertRowid));
  });

  // 3. SHGs
  const shgsData = [
    { name: 'Annapurna Mahila Mandali', village_idx: 0, leader: 'Lakshmi Devi', phone: '+91 98481 11001' },
    { name: 'Pragathi Rythu Sangham', village_idx: 1, leader: 'Srinivasa Rao', phone: '+91 98481 11002' },
    { name: 'Sri Venkateswara SHG', village_idx: 2, leader: 'Koteswara Rao', phone: '+91 98481 11003' },
    { name: 'Chaitanya Farmers Group', village_idx: 3, leader: 'Radha Rani', phone: '+91 98481 11004' },
    { name: 'Jai Kisan Krishi Sangham', village_idx: 4, leader: 'Venkata Ramana', phone: '+91 98481 11005' }
  ];
  const insertShg = db.prepare(`
    INSERT INTO shgs (name, fpo_id, village_id, leader_name, phone)
    VALUES (?, ?, ?, ?, ?)
  `);
  const shgIds = [];
  shgsData.forEach(s => {
    const vId = villageIds[s.village_idx] || villageIds[0];
    const sRes = insertShg.run(s.name, fpoId, vId, s.leader, s.phone);
    shgIds.push(Number(sRes.lastInsertRowid));
  });

  // 4. Users (All 9 roles)
  const usersData = [
    { name: 'System Administrator', email: 'admin@agripool.in', phone: '+91 99000 00001', role: 'Super Admin' },
    { name: 'Chaitanya Varma (FPO Manager)', email: 'fpo@agripool.in', phone: '+91 99000 00002', role: 'FPO Admin' },
    { name: 'Lakshmi Devi (SHG Lead)', email: 'shg@agripool.in', phone: '+91 99000 00003', role: 'SHG Operator' },
    { name: 'Ravi Teja (Field Weighing Officer)', email: 'field@agripool.in', phone: '+91 99000 00004', role: 'Field Operator' },
    { name: 'Rama Rao Puppala (Sample Farmer)', email: 'farmer@agripool.in', phone: '+91 99000 00005', role: 'Farmer' },
    { name: 'Krishna Agri Trading Co. (Seller Unit)', email: 'seller@agripool.in', phone: '+91 99000 00010', role: 'Seller' },
    { name: 'Andhra Agro Express Logistics', email: 'logistics@agripool.in', phone: '+91 99000 00006', role: 'Logistics Partner' },
    { name: 'Sri Krishna Cold Chain Storage', email: 'storage@agripool.in', phone: '+91 99000 00007', role: 'Storage Partner' },
    { name: 'ITC Agri Business Bulk Buyer', email: 'buyer@agripool.in', phone: '+91 99000 00008', role: 'Buyer' },
    { name: 'Samunnati Agri Financial Services', email: 'finance@agripool.in', phone: '+91 99000 00009', role: 'Finance Partner' }
  ];
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, phone, role, password_hash, fpo_id)
    VALUES (?, ?, ?, ?, 'demo_hash_agripool', ?)
  `);
  usersData.forEach(u => {
    insertUser.run(u.name, u.email, u.phone, u.role, fpoId);
  });

  // 5. 75 Farmers
  const firstNames = ['Rama', 'Suresh', 'Venkata', 'Nageswara', 'Krishna', 'Appa', 'Subba', 'Chandra', 'Gopal', 'Satya', 'Samba', 'Anjaneya', 'Brahmaiah', 'Prasad', 'Kiran'];
  const lastNames = ['Rao', 'Reddy', 'Chowdary', 'Varma', 'Naidu', 'Murthy', 'Sarma', 'Gupta', 'Patnaik', 'Babu', 'Yadav', 'Goud'];
  const insertFarmer = db.prepare(`
    INSERT INTO farmers (farmer_code, name, mobile, village_id, fpo_id, shg_id, preferred_language, farm_size_acres, bank_account_no, ifsc_code, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertFarm = db.prepare(`
    INSERT INTO farms (farmer_id, survey_no, area_acres, soil_type, irrigation_source)
    VALUES (?, ?, ?, ?, ?)
  `);

  const crops = ['Guntur Sannam Chilli', 'Nizamabad Turmeric', 'Maize (Hybrid)', 'Black Gram (Urad)', 'Cotton (Bt-II)', 'BPT 5204 Paddy'];

  for (let i = 1; i <= 75; i++) {
    const fn = firstNames[(i - 1) % firstNames.length];
    const ln = lastNames[(i - 1) % lastNames.length];
    const fullName = `${fn} ${ln}`;
    const code = `FAR-AP-${String(i).padStart(4, '0')}`;
    const mobile = `+91 9848${String(10000 + i)}`;
    const villageId = ((i - 1) % 5) + 1;
    const shgId = ((i - 1) % 5) + 1;
    const lang = i % 3 === 0 ? 'te' : (i % 5 === 0 ? 'hi' : 'en');
    const sizeAcres = (1.5 + (i % 6) * 0.75).toFixed(1);
    const bankAc = `SBIN000${String(1000 + i)}99${String(i).padStart(3, '0')}`;
    const ifsc = 'SBIN0004128';

    insertFarmer.run(code, fullName, mobile, villageId, fpoId, shgId, lang, sizeAcres, bankAc, ifsc, 'VERIFIED');
    insertFarm.run(i, `SY-${100 + i}/${(i % 4) + 1}`, sizeAcres, i % 2 === 0 ? 'Black Cotton' : 'Red Loamy', 'Borewell & Canal');
  }

  // 6. Storage Facilities
  const insertStorage = db.prepare(`
    INSERT INTO storage_facilities (name, facility_type, location, district, state, total_capacity_mt, used_capacity_mt, rate_per_month_per_quintal, contact_phone, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertStorage.run('Sri Krishna Integrated Cold Storage', 'Cold Storage', 'NH-16 Kankipadu Bypass', 'Krishna', 'Andhra Pradesh', 2500, 850, 45.0, '+91 98480 33441', 1);
  insertStorage.run('Guntur Regional Agri Warehouse', 'Dry Warehouse', 'Mirchi Yard Road, Tenali', 'Guntur', 'Andhra Pradesh', 5000, 1920, 25.0, '+91 98480 33442', 1);
  insertStorage.run('Rythu Bandhu Assaying & Silo Hub', 'Silo', 'Gudivada Industrial Area', 'Krishna', 'Andhra Pradesh', 3000, 400, 30.0, '+91 98480 33443', 1);

  // 7. Verified Bulk Buyers
  const insertBuyer = db.prepare(`
    INSERT INTO buyers (company_name, gst_number, contact_person, phone, email, buyer_type, credit_rating, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertBuyer.run('ITC Agri Business Division', '37AAACI1681G1Z0', 'Sunil Mathur', '+91 98200 44111', 's.mathur@itcagri.in', 'Agro Processor / Spice Exporter', 'AAA', 1);
  insertBuyer.run('Patanjali Foods Agro Direct', '37AABCP8921R1Z3', 'Anand Swaroop', '+91 98200 44222', 'anand@patanjalifoods.com', 'FMCG Manufacturer', 'AA+', 1);
  insertBuyer.run('Everest Spices Procurement', '37AAACE9102L1ZQ', 'Dharmesh Shah', '+91 98200 44333', 'd.shah@everestspices.com', 'Spice Exporter', 'AAA', 1);
  insertBuyer.run('Olam Agri India Pvt Ltd', '37AABCO4410H1ZZ', 'Vikramaditya Sen', '+91 98200 44444', 'procurement@olamagri.com', 'Multinational Trader', 'AAA', 1);

  // 8. Lots Generation (55 lots)
  const insertLot = db.prepare(`
    INSERT INTO lots (lot_code, farmer_id, fpo_id, produce, variety, estimated_quantity, actual_weight, grade, moisture_percentage, harvest_date, village_id, current_status, storage_status, pickup_status, pool_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertLotWeight = db.prepare(`
    INSERT INTO lot_weights (lot_id, gross_weight, tare_weight, net_weight, weighing_scale_id, operator_id, slip_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertLotQuality = db.prepare(`
    INSERT INTO lot_qualities (lot_id, grade, moisture, foreign_matter_pct, inspection_notes, inspector_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // We will assign first 8 lots to Pool 1 (Guntur Sannam Chilli - Completed & Settled)
  // Next 6 lots to Pool 2 (Nizamabad Turmeric - Buyer Matched / Confirmed)
  // Next 5 lots to Pool 3 (Black Gram - Stored / Pickup Done)
  // Lots 20-55 are UNPOOLED (Ready for operator and pooling engine interaction!)

  // Create Pools first:
  const insertPool = db.prepare(`
    INSERT INTO pools (pool_code, produce, variety, target_quantity, total_weight, farmer_count, status, fpo_id, estimated_price_per_kg, created_at, closed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPool.run(
    'POOL-2026-AP-0001',
    'Guntur Sannam Chilli',
    'Teja S17 Grade A',
    2000.0,
    2150.0,
    8,
    'SETTLED',
    fpoId,
    220.0,
    '2026-09-15 10:00:00',
    '2026-09-28 17:00:00'
  );
  const pool1Id = 1;

  insertPool.run(
    'POOL-2026-AP-0002',
    'Nizamabad Turmeric',
    'Salem Special Double Polished',
    1500.0,
    1620.0,
    6,
    'BUYER_MATCHED',
    fpoId,
    145.0,
    '2026-10-01 09:30:00',
    null
  );
  const pool2Id = 2;

  insertPool.run(
    'POOL-2026-AP-0003',
    'Black Gram (Urad)',
    'LBG 752 Bold',
    1000.0,
    1100.0,
    5,
    'IN_STORAGE',
    fpoId,
    95.0,
    '2026-10-03 11:00:00',
    null
  );
  const pool3Id = 3;

  const insertPoolMember = db.prepare(`
    INSERT INTO pool_members (pool_id, lot_id, farmer_id, weight_kg, share_pct, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Generate 55 lots
  let pool1WeightAcc = 0;
  for (let i = 1; i <= 55; i++) {
    const lotCode = `LOT-2026-AP-${String(i).padStart(6, '0')}`;
    const farmerId = ((i - 1) % 75) + 1;
    const villageId = ((i - 1) % 5) + 1;

    let crop = 'Guntur Sannam Chilli';
    let variety = 'Teja S17';
    let estQty = 250.0 + (i * 12) % 150;
    let actualWeight = estQty + ((i % 5) - 2) * 5;
    let grade = i % 4 === 0 ? 'GRADE_B' : 'GRADE_A';
    let moisture = 10.5 + (i % 5) * 0.4;
    let harvestDate = '2026-09-20';
    let status = 'CREATED';
    let storageStatus = 'NONE';
    let pickupStatus = 'PENDING';
    let assignedPoolId = null;

    if (i <= 8) {
      // Belongs to Pool 1 (Settled)
      crop = 'Guntur Sannam Chilli';
      variety = 'Teja S17 Grade A';
      status = 'SETTLED';
      storageStatus = 'RELEASED';
      pickupStatus = 'COMPLETED';
      assignedPoolId = pool1Id;
    } else if (i <= 14) {
      // Belongs to Pool 2 (Buyer Matched)
      crop = 'Nizamabad Turmeric';
      variety = 'Salem Special Double Polished';
      status = 'BUYER_MATCHED';
      storageStatus = 'STORED';
      pickupStatus = 'COMPLETED';
      assignedPoolId = pool2Id;
    } else if (i <= 19) {
      // Belongs to Pool 3 (In Storage)
      crop = 'Black Gram (Urad)';
      variety = 'LBG 752 Bold';
      status = 'STORED';
      storageStatus = 'STORED';
      pickupStatus = 'COMPLETED';
      assignedPoolId = pool3Id;
    } else if (i <= 30) {
      // Verified lots ready to pool!
      crop = i % 2 === 0 ? 'Guntur Sannam Chilli' : 'Nizamabad Turmeric';
      variety = i % 2 === 0 ? 'Teja S17 Grade A' : 'Salem Special Double Polished';
      status = 'VERIFIED';
    } else if (i <= 42) {
      // Weighed lots
      crop = crops[(i - 1) % crops.length];
      variety = 'Standard Commercial';
      status = 'WEIGHED';
    } else {
      // Newly created lots
      crop = crops[(i - 1) % crops.length];
      variety = 'Field Grade';
      status = 'CREATED';
      actualWeight = null;
    }

    insertLot.run(
      lotCode,
      farmerId,
      fpoId,
      crop,
      variety,
      estQty,
      actualWeight,
      grade,
      moisture,
      harvestDate,
      villageId,
      status,
      storageStatus,
      pickupStatus,
      assignedPoolId,
      '2026-09-22 10:00:00'
    );

    // If weighed or verified, add lot_weight and lot_quality
    if (actualWeight) {
      insertLotWeight.run(i, actualWeight + 2.5, 2.5, actualWeight, 'SCALE-AP-DIGI-04', 4, `/slips/${lotCode}.pdf`);
      insertLotQuality.run(i, grade, moisture, 0.4, 'Standard grade verified by FPO assay team', 4);
    }

    // Add to pool members
    if (assignedPoolId === pool1Id) {
      const sharePct = ((actualWeight / 2150.0) * 100).toFixed(2);
      insertPoolMember.run(pool1Id, i, farmerId, actualWeight, sharePct, '2026-09-23 11:00:00');
    } else if (assignedPoolId === pool2Id) {
      const sharePct = ((actualWeight / 1620.0) * 100).toFixed(2);
      insertPoolMember.run(pool2Id, i, farmerId, actualWeight, sharePct, '2026-10-01 12:00:00');
    } else if (assignedPoolId === pool3Id) {
      const sharePct = ((actualWeight / 1100.0) * 100).toFixed(2);
      insertPoolMember.run(pool3Id, i, farmerId, actualWeight, sharePct, '2026-10-03 14:00:00');
    }
  }

  // 9. Pickups
  const insertPickup = db.prepare(`
    INSERT INTO pickups (pickup_code, pool_id, logistics_partner_id, vehicle_type, vehicle_number, driver_name, driver_phone, scheduled_date, status, route_villages)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPickup.run('PCK-2026-0001', pool1Id, 6, 'Tata 407 (2.5 MT)', 'AP 16 TE 4821', 'K. Venkat Rao', '+91 97000 88123', '2026-09-24', 'DELIVERED', 'Kankipadu -> Thotlavalluru -> Gudivada Cold Storage');
  insertPickup.run('PCK-2026-0002', pool2Id, 6, 'Eicher Pro 4T', 'AP 07 TX 9912', 'M. Narsimha', '+91 97000 88124', '2026-10-02', 'DELIVERED', 'Mangalagiri Rural -> Tenali North -> Guntur Warehouse');
  insertPickup.run('PCK-2026-0003', pool3Id, 6, 'Mini Truck 1T', 'AP 16 BD 3341', 'P. Rambabu', '+91 97000 88125', '2026-10-05', 'DELIVERED', 'Gudivada Rural -> Rythu Bandhu Hub');

  // 10. Storage Assignments
  const insertStorageAssign = db.prepare(`
    INSERT INTO storage_assignments (pool_id, storage_facility_id, assigned_weight_mt, bay_number, entry_date, exit_date, status, total_charges)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertStorageAssign.run(pool1Id, 1, 2.15, 'BAY-C12', '2026-09-24', '2026-09-27', 'RELEASED', 1850.0);
  insertStorageAssign.run(pool2Id, 2, 1.62, 'BAY-W04', '2026-10-02', null, 'ACTIVE', 1215.0);
  insertStorageAssign.run(pool3Id, 3, 1.10, 'BAY-S01', '2026-10-05', null, 'ACTIVE', 990.0);

  // 11. Buyer Orders & Transactions for Pool 1
  const insertBuyerOrder = db.prepare(`
    INSERT INTO buyer_orders (order_code, buyer_id, pool_id, requested_weight_kg, agreed_price_per_kg, gross_amount, status, payment_terms, delivery_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  // Pool 1: 2,150 kg * ₹220/kg = ₹473,000
  insertBuyerOrder.run('ORD-2026-0001', 1, pool1Id, 2150.0, 220.0, 473000.0, 'FULFILLED', 'ESCROW_ON_DELIVERY', '2026-09-27');
  const order1Id = 1;

  // Pool 2: 1,620 kg * ₹145/kg = ₹234,900
  insertBuyerOrder.run('ORD-2026-0002', 3, pool2Id, 1620.0, 145.0, 234900.0, 'CONFIRMED', 'ESCROW_ON_DELIVERY', '2026-10-12');

  const insertTransaction = db.prepare(`
    INSERT INTO transactions (transaction_code, order_id, pool_id, buyer_id, gross_amount, status, contract_date, completed_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertTransaction.run('TXN-2026-0001', order1Id, pool1Id, 1, 473000.0, 'COMPLETED', '2026-09-26 14:00:00', '2026-09-28 11:30:00');
  const txn1Id = 1;

  // 12. Settlement for Pool 1
  // Gross: ₹473,000
  // Logistics: ₹7,500
  // Storage: ₹1,850
  // Service / Platform Fee (1.5%): ₹7,095
  // Mandi Handling: ₹2,150
  // Total deductions: ₹18,595
  // Net settlement: ₹454,405
  const insertSettlement = db.prepare(`
    INSERT INTO settlements (settlement_code, transaction_id, pool_id, gross_sale_amount, logistics_cost, storage_cost, platform_fee, mandi_cess, net_settlement_amount, status, settlement_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertSettlement.run(
    'SETTLE-2026-0001',
    txn1Id,
    pool1Id,
    473000.0,
    7500.0,
    1850.0,
    7095.0,
    2150.0,
    454405.0,
    'SETTLED',
    '2026-09-28 15:00:00'
  );
  const settle1Id = 1;

  // 13. Farmer Payments for Pool 1 (8 farmers)
  const pool1Members = db.prepare('SELECT * FROM pool_members WHERE pool_id = ?').all(pool1Id);
  const insertPayment = db.prepare(`
    INSERT INTO payments (payment_code, settlement_id, farmer_id, gross_share, deductions, net_payable, payment_mode, reference_utr, status, paid_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  pool1Members.forEach((member, idx) => {
    const grossShare = (473000.0 * (member.weight_kg / 2150.0)).toFixed(2);
    const deductions = (18595.0 * (member.weight_kg / 2150.0)).toFixed(2);
    const netPayable = (grossShare - deductions).toFixed(2);
    const utr = `HDFC2026092800${String(1234 + idx)}`;
    insertPayment.run(
      `PAY-2026-${String(idx + 1).padStart(4, '0')}`,
      settle1Id,
      member.farmer_id,
      grossShare,
      deductions,
      netPayable,
      'NEFT_DIRECT',
      utr,
      'PAID',
      '2026-09-28 16:30:00'
    );
  });

  // 14. Financial Advances (Liquidity workflow)
  const insertAdvance = db.prepare(`
    INSERT INTO financial_advances (advance_code, pool_id, farmer_id, lender_partner, requested_amount, approved_amount, interest_rate_pct, status, disbursed_at, settled_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAdvance.run('ADV-2026-0001', pool2Id, 9, 'Samunnati Agri Financial Services', 25000.0, 25000.0, 8.5, 'DISBURSED', '2026-10-02 11:00:00', null);
  insertAdvance.run('ADV-2026-0002', pool2Id, 10, 'Nabard MFI Credit Linkage', 30000.0, 30000.0, 7.5, 'APPROVED', null, null);
  insertAdvance.run('ADV-2026-0003', pool3Id, 15, 'Samunnati Agri Financial Services', 15000.0, 15000.0, 8.5, 'UNDER_REVIEW', null, null);

  // 15. Initial Notifications
  const insertNotification = db.prepare(`
    INSERT INTO notifications (user_id, role, title, message, channel, is_read)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertNotification.run(2, 'FPO Admin', 'Settlement Completed', 'Settlement SETTLE-2026-0001 of ₹4,54,405 disbursed directly to 8 farmer accounts via NEFT.', 'IN_APP', 0);
  insertNotification.run(8, 'Buyer', 'New Pooled Lot Available', 'Verified Pool POOL-2026-AP-0002 (1,620 kg Turmeric) is available for inspection.', 'IN_APP', 0);
  insertNotification.run(5, 'Farmer', 'Payment Credited', 'Your produce share of ₹56,800 for Lot LOT-2026-AP-000001 was credited to your bank account.', 'SMS_MOCK', 0);
  insertNotification.run(6, 'Logistics Partner', 'Shared Route Pickup Confirmed', 'Route Kankipadu to Tenali dispatched with Tata 407.', 'IN_APP', 1);

  // 17. Crops
  const insertCrop = db.prepare(`
    INSERT INTO crops (farmer_id, crop_name, crop_category, quantity, expected_harvest_date, quality_grade, village, storage_status, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const cropNames = ['Guntur Sannam Chilli', 'Nizamabad Turmeric', 'Maize (Hybrid)', 'Black Gram (Urad)', 'Cotton (Bt-II)', 'BPT 5204 Paddy', 'Tomato (Hybrid)', 'Red Gram (Toor)'];
  for (let i = 1; i <= 60; i++) {
    const farmerId = ((i - 1) % 75) + 1;
    const cropName = cropNames[(i - 1) % cropNames.length];
    const qty = 200.0 + (i * 15) % 300;
    const harvestDate = `2026-10-${String((i % 25) + 1).padStart(2, '0')}`;
    const grade = i % 3 === 0 ? 'GRADE_B' : 'GRADE_A';
    const status = i <= 25 ? 'Added to Lot' : (i <= 45 ? 'Ready' : (i <= 55 ? 'Harvested' : 'Draft'));
    insertCrop.run(farmerId, cropName, 'Commercial Produce', qty, harvestDate, grade, villagesData[(i - 1) % 5].name, 'On Farm', status);
  }

  // 18. Sellers
  const insertSeller = db.prepare(`
    INSERT INTO sellers (seller_code, name, contact_person, phone, email, location, seller_type, verification_status, fpo_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertSeller.run('SEL-KVPC-01', 'Kisan Vikas Collective Selling Unit', 'Chaitanya Varma', '+91 98480 12345', 'sales@kisanvikas.org', 'Kankipadu, Krishna', 'FPO Aggregator', 'Verified', fpoId);
  insertSeller.run('SEL-SHG-02', 'Annapurna Women Agri Producers', 'Lakshmi Devi', '+91 98481 11001', 'annapurna@agripool.in', 'Thotlavalluru, Krishna', 'SHG Collective', 'Verified', fpoId);

  // 19. Listings
  const insertListing = db.prepare(`
    INSERT INTO listings (listing_code, seller_id, crop_name, available_quantity, min_order_quantity, quality_grade, harvest_date, location, expected_price, availability_period, storage_status, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertListing.run('LST-2026-0001', 1, 'Guntur Sannam Chilli', 2150.0, 500.0, 'GRADE_A', '2026-09-20', 'Kankipadu Hub', 220.0, 'Immediate', 'Cold Storage', 'Active');
  insertListing.run('LST-2026-0002', 1, 'Nizamabad Turmeric', 1620.0, 300.0, 'GRADE_A', '2026-09-25', 'Tenali Warehouse', 145.0, '15 Days', 'Warehouse Stored', 'Active');
  insertListing.run('LST-2026-0003', 2, 'Tomato (Hybrid)', 2500.0, 500.0, 'GRADE_A', '2026-10-05', 'Krishna Cluster', 35.0, 'Immediate', 'Ambient Packhouse', 'Active');
  insertListing.run('LST-2026-0004', 1, 'Black Gram (Urad)', 1100.0, 200.0, 'GRADE_A', '2026-10-01', 'Gudivada Silo', 95.0, 'Immediate', 'Warehouse Stored', 'Active');

  // 20. Offers
  const insertOffer = db.prepare(`
    INSERT INTO offers (offer_code, buyer_id, pool_id, listing_id, quantity, offer_price, total_amount, counter_price, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertOffer.run('OFF-2026-0001', 1, 1, 1, 2150.0, 220.0, 473000.0, null, 'Accepted');
  insertOffer.run('OFF-2026-0002', 3, 2, 2, 1620.0, 142.0, 230040.0, 145.0, 'Counter Offer');
  insertOffer.run('OFF-2026-0003', 2, 3, 4, 1000.0, 92.0, 92000.0, null, 'Offer Sent');

  // 21. Finance Partners
  const insertFinancePartner = db.prepare(`
    INSERT INTO finance_partners (partner_name, partner_type, contact_person, phone, email, max_facility_amount, interest_rate_range, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertFinancePartner.run('Samunnati Financial Intermediation & Services', 'Agri NBFC', 'K. S. Narayanan', '+91 98800 11223', 'partners@samunnati.com', 10000000.0, '7.5% - 8.5%', 'Active');
  insertFinancePartner.run('NABARD MFI Direct Refinance Linkage', 'Development Bank', 'Dr. P. V. Ramana', '+91 98800 11224', 'refinance@nabard.org', 25000000.0, '6.5% - 7.5%', 'Active');
  insertFinancePartner.run('Avanti Finance Rural Credit', 'Fintech NBFC', 'Sunita Reddy', '+91 98800 11225', 'agricredit@avantifinance.com', 5000000.0, '8.0% - 9.0%', 'Active');

  console.log('Seed data successfully loaded:');
  console.log(' - 75 Farmers with land & bank details');
  console.log(' - 60 Individual Farmer Crops');
  console.log(' - 55 Digital Produce Lots across 6 commodities');
  console.log(' - 3 Pools (Settled, Matched, and Stored)');
  console.log(' - 4 Verified Bulk Buyers, 2 Sellers, 4 Listings, 3 Offers');
  console.log(' - 3 Logistics routes, 3 Storage facilities, 3 Finance Partners');
  console.log(' - 1 Full completed transaction & settlement with 8 individual farmer NEFT payments');
  console.log(' - 22 Lots unpooled and ready for live workflow demonstration!');
}

if (require.main === module) {
  seedDatabase(true);
}

module.exports = { seedDatabase };
