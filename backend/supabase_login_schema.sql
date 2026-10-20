-- ============================================================
-- CAMPUS360: SUPABASE LOGIN & AUTH REALTIME SCHEMA
-- Run this in Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- 1. Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. User Profiles Table (Stores Student, Head, Admin details in real time)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'STUDENT',
    phone TEXT,
    department TEXT DEFAULT 'Computer Science & Engineering',
    year INTEGER DEFAULT 3,
    semester INTEGER DEFAULT 6,
    roll_number TEXT DEFAULT '2023CSE042',
    cgpa DECIMAL(3, 2) DEFAULT 8.5,
    organization TEXT,
    head_title TEXT,
    must_change_password BOOLEAN DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Head Credentials Table (Created by Super Admin, Verified during Head Login)
CREATE TABLE IF NOT EXISTS public.head_credentials (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    organization TEXT NOT NULL,
    head_title TEXT,
    temp_password TEXT,
    status TEXT DEFAULT 'Pending First-Time Password Set',
    must_change_password BOOLEAN DEFAULT true,
    events_count INTEGER DEFAULT 0,
    total_registrations INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.head_credentials ENABLE ROW LEVEL SECURITY;

-- 5. Permissive Policies for Web Client (Anon key & Authenticated users)
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_all" ON public.profiles;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_all" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_all" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "profiles_delete_all" ON public.profiles FOR DELETE USING (true);

DROP POLICY IF EXISTS "head_credentials_select_all" ON public.head_credentials;
DROP POLICY IF EXISTS "head_credentials_insert_all" ON public.head_credentials;
DROP POLICY IF EXISTS "head_credentials_update_all" ON public.head_credentials;
DROP POLICY IF EXISTS "head_credentials_delete_all" ON public.head_credentials;

CREATE POLICY "head_credentials_select_all" ON public.head_credentials FOR SELECT USING (true);
CREATE POLICY "head_credentials_insert_all" ON public.head_credentials FOR INSERT WITH CHECK (true);
CREATE POLICY "head_credentials_update_all" ON public.head_credentials FOR UPDATE USING (true);
CREATE POLICY "head_credentials_delete_all" ON public.head_credentials FOR DELETE USING (true);

-- 6. Enable Realtime Sync
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.head_credentials;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 7. Insert default Super Admin Profile
INSERT INTO public.profiles (id, email, name, role, organization, head_title, must_change_password)
VALUES (
    'admin-1',
    'admin@campus360.edu',
    'Dr. Sarah Jenkins',
    'SUPER_ADMIN',
    'Central Administration',
    'Super Administrator',
    false
)
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    organization = EXCLUDED.organization,
    head_title = EXCLUDED.head_title;
