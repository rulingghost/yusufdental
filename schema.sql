-- ==========================================================================
-- DENTALLAB PRO - SQL VERİ TABANI ŞEMASI (Vercel Postgres / Supabase / Neon)
-- ==========================================================================

-- 1. KLİNİKLER / FİRMALAR
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(50),
    email VARCHAR(150),
    address TEXT,
    balance NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. HEKİMLER / DOKTORLAR
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(50) PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES companies(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    specialty VARCHAR(150),
    phone VARCHAR(50),
    email VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. HASTALAR
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(50) PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES companies(id) ON DELETE SET NULL,
    doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    chart_number VARCHAR(50),
    age INT,
    gender VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. İŞ EMİRLERİ (DENTAL ORDERS)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES companies(id) ON DELETE CASCADE,
    doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
    material_id VARCHAR(50) NOT NULL, -- porcelain, zirconia, emax, implant
    teeth TEXT[], -- FDI diş numaraları dizisi örn: ['11', '21']
    shade VARCHAR(30) NOT NULL, -- VITA rengi örn: A2, BL2
    priority VARCHAR(20) DEFAULT 'normal', -- normal, urgent, vip
    status VARCHAR(30) DEFAULT 'in_progress', -- in_progress, completed, revision
    order_date DATE DEFAULT CURRENT_DATE,
    trial_date DATE,
    delivery_date DATE NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0,
    notes TEXT,
    current_step_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ÜRETİM AŞAMALARI (ORDER STEPS)
CREATE TABLE IF NOT EXISTS order_steps (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'pending', -- pending, in_progress, completed, revision
    technician VARCHAR(150),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- ==========================================================================
-- 6. ROW LEVEL SECURITY (RLS) DEVRE DIŞI BIRAKMA & İZİNLER (Supabase İçin)
-- ==========================================================================
ALTER TABLE IF EXISTS companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_steps DISABLE ROW LEVEL SECURITY;

-- Her ihtimale karşı tam açık erişim politikaları (RLS açık kalsa bile çalışır):
DROP POLICY IF EXISTS "Public access" ON companies;
CREATE POLICY "Public access" ON companies FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access" ON doctors;
CREATE POLICY "Public access" ON doctors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access" ON patients;
CREATE POLICY "Public access" ON patients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access" ON orders;
CREATE POLICY "Public access" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access" ON order_steps;
CREATE POLICY "Public access" ON order_steps FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access" ON order_files;
CREATE POLICY "Public access" ON order_files FOR ALL USING (true) WITH CHECK (true);

-- Anonim (anon) ve giriş yapmış (authenticated) kullanıcılara tam yetki:
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;


