# 🌾 AgriPool — Agriculture Produce Aggregation & Settlement Platform

> **A software-first, asset-light agriculture aggregation platform** designed for smallholder farmers, Farmer Producer Organizations (FPOs), Self-Help Groups (SHGs), logistics transporters, storage providers, and verified institutional bulk buyers.

---

## 1. Product Vision & Core Architecture

AgriPool replaces fragmented, opaque village-level distress sales with a transparent, digital aggregation pipeline:

```
FARMER ➔ DIGITAL LOT ➔ POOLING ➔ LOGISTICS/STORAGE ➔ BULK BUYER ➔ SETTLEMENT
```

### Core Problems Solved
* **Fragmented Small Lots:** Smallholders producing 150–350 kg can pool compatible produce to fulfill bulk institutional contracts.
* **Lack of Affordable Storage:** Pooled lots unlock certified warehouse bays with warehouse receipt financing.
* **High Transportation Costs:** Consolidated shared-route pickup dispatches reduce individual freight expenses by **38–40%**.
* **Poor Price Transparency:** Benchmark reserve pricing provides **+22.4%** average price realization over local intermediaries.
* **Manual / Fragmented Records:** End-to-end 9-stage digital traceability with calibrated weighing slips and assay certificates.
* **Explainable Settlements:** Waterfall deduction calculations show exactly how logistics, storage, and platform fees are deducted before direct pro-rata bank disbursement.
* **Low Digital Literacy:** Multilingual interfaces (English, Telugu, Hindi), large touch cards, and built-in text-to-speech audio narration.

---

## 2. Implemented Modules

### 🚀 Phase 1: Foundation, Local Trust & Pilot Execution (Months 0–3)
1. **Farmer Onboarding:** Complete profiles with mobile, land holding, village/mandal/district, bank account, and IFSC code.
2. **Digital Lot ID Passport:** Unique identifiers (e.g. `LOT-2026-AP-000042`) with QR preview, calibrated electronic scale records, moisture assay results, and full 9-stage lifecycle progress tracking:
   `CREATED` ➔ `WEIGHED` ➔ `VERIFIED` ➔ `POOLED` ➔ `PICKUP_SCHEDULED` ➔ `STORED` ➔ `BUYER_MATCHED` ➔ `SOLD` ➔ `SETTLED`.
3. **Pooling Engine:** Dynamic multi-lot selection with automatic compatibility validation (blocks mismatched commodities), vehicle requirement recommendation, storage requirement matching, and pro-rata share calculation.
4. **Transparent Settlement Ledger:** Waterfall deduction breakdown (Gross Sale − Logistics − Storage − Service Fee − Mandi Cess = Net Settlement) with farmer-by-farmer pro-rata bank credit scheduling and audited UTR references.
5. **Assisted FPO / SHG Operations Console:** Purpose-built for field operators with digital weighing station, quality assay inspection station, and quick farmer onboarding.
6. **Phase 1 Pilot Dashboard:** Real-time KPI cards, pilot target progression bar (75/100 farmers, 1 FPO, 1st live transaction), and recent aggregation feeds.

### 🏢 Phase 2: Commercial Integration & Regional Scale (Months 3–12+)
7. **Logistics Partner Module:** Shared-route pickup requests with vehicle assignment, driver details, and status pipeline (`REQUESTED`, `ASSIGNED`, `SCHEDULED`, `PICKED_UP`, `DELIVERED`, `CANCELLED`).
8. **Storage Partner Module:** Cold storage and dry warehouse profiles with real-time MT capacity utilization gauges, bay reservations, and storage fee calculations.
9. **Verified Bulk Buyer Marketplace:** Corporate procurement catalogue (ITC Agri, Patanjali, Everest Spices, Olam) with Purchase Order (PO) creation, escrow terms, and deal contract execution.
10. **Financial / Working Capital Workflow:** Asset-light partner liquidity tracking with authorized NBFC/MFI partners (Samunnati, NABARD Linkage) for warehouse receipt advances.
11. **Farmer Self-Service Experience:** High-contrast, large-icon interface designed for low digital literacy with Telugu (తెలుగు) and Hindi (हिंदी) translations and voice narration.
12. **Multi-Cluster Scaling Architecture:** Hierarchical entity scale: `Village ➔ FPO/SHG ➔ Cluster Hub ➔ District ➔ State Corridor ➔ Institutional Buyers`.
13. **Platform Analytics:** Interactive charts for crop aggregation volumes, price realization comparison vs. local traders, and cluster efficiency.
14. **Immutable Audit Trail:** Cryptographic logging of every event with operator identity, entity ID, previous/new values, and timestamps.
15. **1-Click Master Acceptance Scenario Runner (Section 33):** Automated end-to-end execution of the 14-step transaction workflow.

---

## 3. Relational Database Schema (22 Core Entities)

The database runs natively on zero-dependency SQLite with foreign keys and WAL mode:

| Entity | Table Name | Purpose |
|---|---|---|
| 1 | `fpos` | Farmer Producer Organizations (Kisan Vikas FPO) |
| 2 | `villages` | Revenue villages and mandals in pilot district |
| 3 | `shgs` | Self Help Groups and village producer clusters |
| 4 | `users` | Role-Based Access Control accounts (9 distinct roles) |
| 5 | `farmers` | Farmer master profiles with bank account and IFSC |
| 6 | `farms` | Land parcel details, survey numbers, and soil types |
| 7 | `pools` | Pooled produce lots with target weight and status |
| 8 | `lots` | Individual produce lots with Digital Lot ID passports |
| 9 | `lot_weights` | Scale calibration records (gross, tare, net weight) |
| 10 | `lot_qualities` | Assaying certificates (grade, moisture %, foreign matter) |
| 11 | `pool_members` | Mapping lots to pools with exact contribution share % |
| 12 | `pickups` | Shared-route logistics dispatches and vehicle routes |
| 13 | `storage_facilities` | Cold storage, silos, and warehouse facilities |
| 14 | `storage_assignments` | Reserved warehouse bays and storage receipt linkages |
| 15 | `buyers` | Verified bulk buyer corporate profiles & credit ratings |
| 16 | `buyer_orders` | Purchase orders (PO) placed by institutional buyers |
| 17 | `transactions` | Legally binding sale contracts and escrow agreements |
| 18 | `settlements` | Audited waterfall deduction settlements |
| 19 | `payments` | Individual farmer bank credits with UTR references |
| 20 | `financial_advances` | Partner-driven working capital advances (NBFC/MFI) |
| 21 | `notifications` | Role-based in-app alerts and simulated SMS dispatch |
| 22 | `audit_logs` | Immutable audit trail with user identity and diffs |

---

## 4. REST API Reference

### Pilot & Overview
* `GET /api/stats` — Real-time pilot KPIs, target trackers, and aggregation volume.
* `GET /api/villages` — List of pilot revenue villages for dropdown selectors.

### Farmers & Digital Lots
* `GET /api/farmers` — Filtered list of registered farmers.
* `POST /api/farmers` — Onboard a new farmer profile.
* `GET /api/farmers/:id` — Farmer profile with land holding, lots, and bank payments.
* `GET /api/lots` — List of digital lots (filterable by status, commodity, unpooled).
* `POST /api/lots` — Issue a new digital lot passport.
* `GET /api/lots/:id` — Lot passport with full 9-stage lifecycle journey.
* `POST /api/lots/:id/weigh` — Record digital scale gross/tare weight.
* `POST /api/lots/:id/verify` — Certify produce grade and moisture assay.

### Pooling & Commercial Workflow
* `GET /api/pools` — List of aggregated produce pools.
* `POST /api/pools` — Create a new pool with compatibility validation.
* `GET /api/pools/:id` — Pool details with contributing member breakdown.
* `GET /api/pickups` — Logistics shared-route pickup requests.
* `POST /api/pickups` — Schedule a new consolidated pickup request.
* `POST /api/pickups/:id/status` — Update dispatch status and driver details.
* `GET /api/storage/facilities` — Warehouse facilities and MT capacity gauges.
* `POST /api/storage/assign` — Assign pooled inventory to a warehouse bay.
* `GET /api/buyers` — Verified corporate bulk buyer profiles.
* `POST /api/orders` — Place an institutional Purchase Order (PO).
* `POST /api/orders/:id/confirm` — Confirm sale contract and create transaction.

### Settlement & Governance
* `GET /api/settlements` — Settlement cycles with waterfall figures.
* `GET /api/settlements/:id` — Full audited deduction waterfall and farmer credits.
* `POST /api/settlements/generate` — Calculate waterfall and create pro-rata shares.
* `POST /api/payments/:id/record` — Disburse farmer payment with UTR reference.
* `GET /api/finance/advances` — Partner working capital liquidity advances.
* `POST /api/finance/advances/:id/status` — Update liquidity approval status.
* `GET /api/audit-logs` — Immutable audit trail of platform events.
* `POST /api/acceptance-test` — Programmatic runner for Section 33 Acceptance Test.
* `POST /api/reset-seed` — Reset database to clean 75-farmer pilot seed state.

---

## 5. Role-Based Access Control (RBAC) Matrix

Use the role switcher in the top navigation bar to test any persona:

1. **Super Admin:** Full platform visibility, system settings, and audit logs.
2. **FPO Admin:** Kisan Vikas FPO console, pool approval, order confirmation, and settlement ledger.
3. **SHG Operator:** Village-level assisted onboarding and local produce aggregation.
4. **Field Operator:** Electronic scale weighing station and assay quality inspector.
5. **Farmer:** Self-service portal with large touch buttons, Telugu/Hindi translations, and voice narration.
6. **Logistics Partner:** Shared-route pickup dashboard, vehicle assignment, and delivery tracking.
7. **Storage Partner:** Cold storage and warehouse bay capacity management.
8. **Buyer:** Bulk buyer marketplace, certified commodity inspection, and PO placement.
9. **Finance Partner:** Working capital and warehouse receipt advance workflow.

---

## 6. How to Run the Application

The application requires **zero external npm installs** because it uses the native Node.js runtime and built-in `node:sqlite`:

```powershell
# 1. Start the server (runs on port 3000)
.\node.cmd server.js

# 2. Open the application in your browser
http://localhost:3000
```

To re-seed or reset the database at any time:
```powershell
.\node.cmd db\seed.js
```

---

## 7. Master Acceptance Scenario (Section 33)

To run the automated validation test required by the specification:
1. Open the application at `http://localhost:3000`.
2. Click **⚡ Acceptance Demo** in the top header (or use the button on the landing page).
3. Click **🚀 Run Complete Scenario Now**.
4. The system will execute all 14 lifecycle steps and display the audited summary table!

---

## 8. Seed & Demo Data Included
* **75 Farmers** across 5 revenue villages in Krishna & Guntur districts, AP.
* **1 Primary FPO:** *Kisan Vikas Farmers Producer Co. Ltd.* (FPO-KVPC-01).
* **55 Digital Lots** covering Guntur Sannam Chilli, Turmeric, Maize, Black Gram, Cotton, and Paddy.
* **3 Pools:** Pool 1 (Settled with 8 farmer NEFT credits), Pool 2 (Buyer Matched), Pool 3 (In Storage).
* **22 Unpooled Lots** ready for immediate live pooling in the interface.
* **3 Storage Facilities** (Sri Krishna Cold Storage, Guntur Warehouse, Rythu Bandhu Hub).
* **4 Verified Corporate Buyers** (ITC Agri Business, Patanjali Foods, Everest Spices, Olam Agri).
