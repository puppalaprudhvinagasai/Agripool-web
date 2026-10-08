-- ==============================================================================
-- AGRI POOL — SUPABASE MASTER DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- This schema establishes the complete Supabase PostgreSQL database structure,
-- UUID primary keys, foreign keys, constraints, automated triggers, and Row Level Security.
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ROLES & PERMISSIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'farmer', 'seller', 'buyer', 'fpo', 'field', 'storage', 'finance', 'admin'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ==============================================================================
-- 2. MASTER PROFILES (Linked to auth.users.id)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'farmer',
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    status VARCHAR(30) DEFAULT 'ACTIVE', -- 'PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED'
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. ROLE-SPECIFIC PROFILES
-- ==============================================================================

-- 3.1 Farmer Profiles
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    farmer_code VARCHAR(50) UNIQUE NOT NULL,
    village VARCHAR(100) NOT NULL,
    mandal VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(50) DEFAULT 'te',
    fpo_id UUID,
    shg_id UUID,
    land_size_acres NUMERIC(6,2) DEFAULT 0.0,
    survey_no VARCHAR(100),
    bank_account_no VARCHAR(50),
    ifsc_code VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Seller Profiles
CREATE TABLE IF NOT EXISTS public.seller_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_type VARCHAR(50) DEFAULT 'INDIVIDUAL', -- 'INDIVIDUAL', 'AGGREGATOR', 'TRADER', 'COOPERATIVE'
    organization_name VARCHAR(200),
    location VARCHAR(200) NOT NULL,
    fpo_shg_association VARCHAR(200),
    gstin VARCHAR(50),
    pan_number VARCHAR(20),
    verification_status VARCHAR(30) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Bulk Buyer Profiles
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20),
    commodities_interested TEXT,
    required_monthly_quantity VARCHAR(100),
    quality_requirements TEXT,
    gstin VARCHAR(50),
    fssai_licence VARCHAR(100),
    verification_documents JSONB DEFAULT '[]'::jsonb,
    verification_status VARCHAR(30) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 FPO Profiles
CREATE TABLE IF NOT EXISTS public.fpo_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    fpo_name VARCHAR(200) NOT NULL,
    admin_name VARCHAR(150) NOT NULL,
    registration_number VARCHAR(100),
    registration_date DATE,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    headquarters_address TEXT,
    bank_account_no VARCHAR(50),
    ifsc_code VARCHAR(20),
    verification_documents JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 Field Operator / SHG Profiles
CREATE TABLE IF NOT EXISTS public.field_operator_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_name VARCHAR(150) NOT NULL,
    organization_name VARCHAR(200),
    fpo_id UUID,
    assigned_villages JSONB DEFAULT '[]'::jsonb,
    weighing_scale_device_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 Storage Partner Profiles
CREATE TABLE IF NOT EXISTS public.storage_partner_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    facility_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    total_capacity_mt NUMERIC(10,2) NOT NULL DEFAULT 0.0,
    available_capacity_mt NUMERIC(10,2) NOT NULL DEFAULT 0.0,
    commodity_types JSONB DEFAULT '[]'::jsonb, -- e.g. ["Chilli", "Paddy", "Maize", "Tomato"]
    cold_chain_certified BOOLEAN DEFAULT FALSE,
    wdra_accredited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.7 Finance Partner Profiles
CREATE TABLE IF NOT EXISTS public.finance_partner_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(150) NOT NULL,
    rbi_registration_no VARCHAR(100),
    lending_partner_type VARCHAR(50) DEFAULT 'NBFC', -- 'NBFC', 'BANK', 'FINTECH'
    max_advance_pct NUMERIC(5,2) DEFAULT 70.0,
    interest_rate_apr NUMERIC(5,2) DEFAULT 11.5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. CROPS, FARMS & MARKET PRICES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE SET NULL,
    crop_name VARCHAR(100) NOT NULL,
    crop_code VARCHAR(50),
    category VARCHAR(50), -- 'SPICES', 'CEREALS', 'VEGETABLES', 'PULSES', 'COMMERCIAL'
    variety VARCHAR(100),
    sowing_date DATE,
    expected_harvest_date DATE,
    estimated_yield_kg NUMERIC(10,2) DEFAULT 0.0,
    status VARCHAR(30) DEFAULT 'GROWING', -- 'GROWING', 'HARVESTED', 'LOT_CREATED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crop_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name VARCHAR(100) NOT NULL UNIQUE,
    market VARCHAR(100) NOT NULL,
    price_per_kg NUMERIC(8,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    price_trend VARCHAR(20) DEFAULT 'STABLE', -- 'UP', 'DOWN', 'STABLE'
    change_pct NUMERIC(5,2) DEFAULT 0.0,
    source VARCHAR(100) DEFAULT 'Demo Market Feed / APMC',
    is_live_api BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crop_price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_id UUID,
    crop_name VARCHAR(100) NOT NULL,
    market VARCHAR(100) NOT NULL,
    price_per_kg NUMERIC(8,2) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
    farm_name VARCHAR(150),
    survey_no VARCHAR(100),
    acres NUMERIC(6,2),
    village VARCHAR(100),
    gps_lat NUMERIC(10,6),
    gps_lng NUMERIC(10,6),
    soil_type VARCHAR(50),
    irrigation_source VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. DIGITAL LOT PASSPORTS, WEIGHTS & QUALITY
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_code VARCHAR(60) UNIQUE NOT NULL, -- e.g. 'LOT-2026-AP-000042'
    farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE RESTRICT,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    estimated_quantity_kg NUMERIC(10,2) NOT NULL,
    actual_weight_kg NUMERIC(10,2),
    bag_count INTEGER DEFAULT 1,
    grade VARCHAR(50) DEFAULT 'UNASSAYED', -- 'GRADE_A', 'GRADE_B', 'EXPORT_GRADE', 'REJECTED'
    status VARCHAR(40) DEFAULT 'CREATED', -- 'CREATED', 'WEIGHED', 'VERIFIED', 'POOLED', 'IN_TRANSIT', 'IN_STORAGE', 'MATCHED', 'SOLD', 'SETTLED'
    pool_id UUID,
    storage_facility_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lot_weights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_id UUID UNIQUE REFERENCES public.lots(id) ON DELETE CASCADE,
    scale_operator_id UUID,
    gross_weight_kg NUMERIC(10,2) NOT NULL,
    tare_weight_kg NUMERIC(10,2) NOT NULL,
    net_weight_kg NUMERIC(10,2) NOT NULL,
    calibrated_device_id VARCHAR(100),
    weighed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.lot_quality (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_id UUID UNIQUE REFERENCES public.lots(id) ON DELETE CASCADE,
    assay_officer_id UUID,
    moisture_percentage NUMERIC(5,2),
    foreign_matter_percentage NUMERIC(5,2),
    damaged_percentage NUMERIC(5,2),
    assigned_grade VARCHAR(50) NOT NULL,
    assay_notes TEXT,
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. PRODUCE POOLING ENGINE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_code VARCHAR(60) UNIQUE NOT NULL, -- e.g. 'POOL-2026-CHILLI-01'
    produce VARCHAR(100) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    target_quantity_kg NUMERIC(10,2) NOT NULL,
    current_quantity_kg NUMERIC(10,2) DEFAULT 0.0,
    status VARCHAR(40) DEFAULT 'ACTIVE', -- 'DRAFT', 'ACTIVE', 'COMMITTED', 'DISPATCHED', 'COMPLETED', 'SETTLED'
    min_reserve_price_per_kg NUMERIC(8,2),
    fpo_id UUID,
    buyer_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pool_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id UUID REFERENCES public.pools(id) ON DELETE CASCADE,
    lot_id UUID UNIQUE REFERENCES public.lots(id) ON DELETE CASCADE,
    farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE RESTRICT,
    contributed_weight_kg NUMERIC(10,2) NOT NULL,
    pro_rata_share_pct NUMERIC(6,3),
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. MARKETPLACE: LISTINGS, OFFERS & ORDERS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
    commodity VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    quantity_kg NUMERIC(10,2) NOT NULL,
    min_order_qty_kg NUMERIC(10,2) DEFAULT 100.0,
    price_per_kg NUMERIC(8,2) NOT NULL,
    quality_grade VARCHAR(50) DEFAULT 'GRADE_A',
    hub_location VARCHAR(200) NOT NULL,
    status VARCHAR(30) DEFAULT 'OPEN', -- 'OPEN', 'OFFER_RECEIVED', 'SOLD', 'CANCELLED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES public.buyer_profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    pool_id UUID REFERENCES public.pools(id) ON DELETE SET NULL,
    offered_price_per_kg NUMERIC(8,2) NOT NULL,
    requested_quantity_kg NUMERIC(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED'
    counter_price_per_kg NUMERIC(8,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(60) UNIQUE NOT NULL,
    buyer_id UUID REFERENCES public.buyer_profiles(id) ON DELETE RESTRICT,
    pool_id UUID REFERENCES public.pools(id) ON DELETE SET NULL,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    produce VARCHAR(100) NOT NULL,
    grade VARCHAR(50),
    total_quantity_kg NUMERIC(10,2) NOT NULL,
    price_per_kg NUMERIC(8,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(40) DEFAULT 'CONFIRMED', -- 'PENDING', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'COMPLETED', 'CANCELLED'
    delivery_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. LOGISTICS, PICKUPS & STORAGE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.pickup_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_code VARCHAR(60) UNIQUE NOT NULL,
    pool_id UUID REFERENCES public.pools(id) ON DELETE SET NULL,
    route_name VARCHAR(150) NOT NULL,
    transporter_name VARCHAR(150),
    driver_phone VARCHAR(20),
    vehicle_number VARCHAR(50),
    scheduled_date DATE,
    status VARCHAR(40) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'IN_PROGRESS', 'COLLECTED', 'DELIVERED_TO_HUB', 'FAILED'
    total_weight_kg NUMERIC(10,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.storage_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES public.storage_partner_profiles(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    facility_type VARCHAR(50) DEFAULT 'DRY_WAREHOUSE', -- 'DRY_WAREHOUSE', 'COLD_STORAGE', 'SILO'
    location VARCHAR(200) NOT NULL,
    capacity_mt NUMERIC(10,2) NOT NULL,
    utilized_mt NUMERIC(10,2) DEFAULT 0.0,
    temperature_celsius NUMERIC(4,1),
    humidity_pct NUMERIC(4,1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.storage_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES public.storage_facilities(id) ON DELETE CASCADE,
    pool_id UUID REFERENCES public.pools(id) ON DELETE SET NULL,
    lot_id UUID REFERENCES public.lots(id) ON DELETE SET NULL,
    bay_number VARCHAR(50) NOT NULL,
    produce VARCHAR(100) NOT NULL,
    weight_kg NUMERIC(10,2) NOT NULL,
    entry_date DATE DEFAULT CURRENT_DATE,
    exit_date DATE,
    status VARCHAR(30) DEFAULT 'STORED', -- 'STORED', 'DISPATCHED'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. SETTLEMENTS, PAYMENTS & FINANCIAL ADVANCES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_number VARCHAR(60) UNIQUE NOT NULL,
    pool_id UUID REFERENCES public.pools(id) ON DELETE RESTRICT,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    gross_amount NUMERIC(12,2) NOT NULL,
    logistics_deduction NUMERIC(12,2) DEFAULT 0.0,
    storage_deduction NUMERIC(12,2) DEFAULT 0.0,
    fpo_commission NUMERIC(12,2) DEFAULT 0.0,
    mandi_cess NUMERIC(12,2) DEFAULT 0.0,
    net_payable NUMERIC(12,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'GENERATED', -- 'GENERATED', 'APPROVED', 'DISBURSED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    settlement_id UUID REFERENCES public.settlements(id) ON DELETE CASCADE,
    farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE RESTRICT,
    lot_id UUID REFERENCES public.lots(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    utr_number VARCHAR(100),
    payment_mode VARCHAR(50) DEFAULT 'NEFT', -- 'NEFT', 'RTGS', 'UPI', 'IMPS'
    status VARCHAR(30) DEFAULT 'COMPLETED', -- 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
    paid_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.financial_advances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_code VARCHAR(60) UNIQUE NOT NULL,
    farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE RESTRICT,
    finance_partner_id UUID REFERENCES public.finance_partner_profiles(id) ON DELETE SET NULL,
    pool_id UUID REFERENCES public.pools(id) ON DELETE SET NULL,
    requested_amount NUMERIC(12,2) NOT NULL,
    approved_amount NUMERIC(12,2),
    disbursed_amount NUMERIC(12,2) DEFAULT 0.0,
    interest_rate_pct NUMERIC(5,2) DEFAULT 11.5,
    status VARCHAR(30) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'DISBURSED', 'SETTLED', 'REJECTED'
    disbursed_at TIMESTAMPTZ,
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. NOTIFICATIONS & AUDIT LOGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_role VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO', -- 'INFO', 'SUCCESS', 'WARNING', 'ALERT'
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    ip_address VARCHAR(50),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_operator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view their own profile; Admins can view all
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin());

-- Crops & Lots: Farmers see only their own; FPOs/Admins see all assigned
CREATE POLICY "Farmers can see own crops"
    ON public.crops FOR SELECT
    USING (
        farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid())
        OR public.is_admin()
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('fpo', 'field'))
    );

CREATE POLICY "Farmers can see own lots"
    ON public.lots FOR SELECT
    USING (
        farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid())
        OR public.is_admin()
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('fpo', 'field', 'storage'))
    );

-- Market Prices: Publicly readable by all authenticated users
CREATE POLICY "Anyone can view market prices"
    ON public.crop_prices FOR SELECT
    USING (true);

-- Listings: Publicly readable; Sellers can manage their own
CREATE POLICY "Public can view listings"
    ON public.listings FOR SELECT
    USING (true);

CREATE POLICY "Sellers manage own listings"
    ON public.listings FOR ALL
    USING (
        seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
        OR public.is_admin()
    );

-- Orders: Buyers see their orders; FPOs & Admins see orders for their pools
CREATE POLICY "Buyers see own orders"
    ON public.orders FOR SELECT
    USING (
        buyer_id IN (SELECT id FROM public.buyer_profiles WHERE user_id = auth.uid())
        OR public.is_admin()
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'fpo')
    );

-- Notifications: User sees notifications sent directly or targeted to their role
CREATE POLICY "Users see own notifications"
    ON public.notifications FOR SELECT
    USING (
        user_id = auth.uid()
        OR target_role = (SELECT role FROM public.profiles WHERE id = auth.uid())
        OR public.is_admin()
    );

-- ==============================================================================
-- 12. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role VARCHAR(50);
    user_name VARCHAR(150);
    user_phone VARCHAR(20);
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'farmer');
    user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    user_phone := NEW.raw_user_meta_data->>'phone';

    -- Insert into public.profiles
    INSERT INTO public.profiles (id, email, role, name, phone, status, email_verified)
    VALUES (
        NEW.id,
        NEW.email,
        user_role,
        user_name,
        user_phone,
        'ACTIVE',
        NEW.email_confirmed_at IS NOT NULL
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();

    -- Role specific profile insertion
    IF user_role = 'farmer' THEN
        INSERT INTO public.farmer_profiles (user_id, farmer_code, village, mandal, district, state)
        VALUES (
            NEW.id,
            'FARMER-' || SUBSTRING(NEW.id::text, 1, 8),
            COALESCE(NEW.raw_user_meta_data->>'village', 'Kankipadu'),
            COALESCE(NEW.raw_user_meta_data->>'mandal', 'Kankipadu'),
            COALESCE(NEW.raw_user_meta_data->>'district', 'Krishna'),
            COALESCE(NEW.raw_user_meta_data->>'state', 'Andhra Pradesh')
        ) ON CONFLICT DO NOTHING;
    ELSIF user_role = 'seller' THEN
        INSERT INTO public.seller_profiles (user_id, organization_name, location)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'organization', user_name),
            COALESCE(NEW.raw_user_meta_data->>'location', 'Andhra Pradesh')
        ) ON CONFLICT DO NOTHING;
    ELSIF user_role = 'buyer' THEN
        INSERT INTO public.buyer_profiles (user_id, company_name, contact_person, address, city, state)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'company_name', user_name || ' Enterprises'),
            user_name,
            COALESCE(NEW.raw_user_meta_data->>'address', 'Main Road'),
            COALESCE(NEW.raw_user_meta_data->>'city', 'Vijayawada'),
            COALESCE(NEW.raw_user_meta_data->>'state', 'Andhra Pradesh')
        ) ON CONFLICT DO NOTHING;
    ELSIF user_role = 'fpo' THEN
        INSERT INTO public.fpo_profiles (user_id, fpo_name, admin_name, district, state)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'fpo_name', 'Kisan Vikas FPO'),
            user_name,
            COALESCE(NEW.raw_user_meta_data->>'district', 'Krishna'),
            COALESCE(NEW.raw_user_meta_data->>'state', 'Andhra Pradesh')
        ) ON CONFLICT DO NOTHING;
    ELSIF user_role = 'storage' THEN
        INSERT INTO public.storage_partner_profiles (user_id, facility_name, contact_person, location, total_capacity_mt)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'facility_name', user_name || ' Cold Storage'),
            user_name,
            COALESCE(NEW.raw_user_meta_data->>'location', 'Kankipadu Hub'),
            5000.0
        ) ON CONFLICT DO NOTHING;
    ELSIF user_role = 'finance' THEN
        INSERT INTO public.finance_partner_profiles (user_id, organization_name, contact_person)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'organization', 'Samunnati Agri Finance'),
            user_name
        ) ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 13. SEED INITIAL ROLES
-- ==============================================================================

INSERT INTO public.roles (name, display_name, description) VALUES
('farmer', 'Farmer', 'Produces crops, creates lots, and receives pro-rata bank payments'),
('seller', 'Seller / Aggregator', 'Lists aggregated commodities and manages trading offers'),
('buyer', 'Bulk Buyer', 'Commercial institutional food processor procuring pooled commodities'),
('fpo', 'FPO Administrator', 'Oversees farmers, quality inspection, pooling, and settlement'),
('field', 'SHG / Field Operator', 'Assists weighing, quality assaying, and logistics pickup'),
('storage', 'Storage Partner', 'Manages certified warehouse bays and storage inventory allocations'),
('finance', 'Finance Partner', 'Provides invoice advances and working capital liquidity to farmers/FPOs'),
('admin', 'Platform Super Admin', 'Full platform oversight, role management, audit, and system configuration')
ON CONFLICT (name) DO NOTHING;
