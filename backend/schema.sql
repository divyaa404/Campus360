-- ============================================================
-- Campus360 Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. EXTENSIONS ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 2. USER ROLES ENUM ───────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('STUDENT', 'SUPER_ADMIN', 'HEAD');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 3. PROFILES TABLE (linked to Supabase auth.users) ────────
-- Stores extra metadata for every signed-in user
CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL DEFAULT '',
    role        user_role NOT NULL DEFAULT 'STUDENT',
    phone       TEXT,
    department  TEXT,
    year        INTEGER,
    semester    INTEGER,
    roll_number TEXT,
    cgpa        DECIMAL(3, 2),
    organization TEXT,    -- for HEAD role (e.g. "IEEE Student Branch")
    head_title  TEXT,     -- for HEAD role (e.g. "IEEE Branch Chair")
    must_change_password BOOLEAN DEFAULT false,
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. HEAD CREDENTIALS TABLE ────────────────────────────────
-- Super Admin creates head accounts here; password stored via auth
CREATE TABLE IF NOT EXISTS head_credentials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    organization    TEXT NOT NULL,
    head_title      TEXT,
    temp_password   TEXT,   -- cleared after first login
    status          TEXT DEFAULT 'Pending First-Time Password Set',
    must_change_password BOOLEAN DEFAULT true,
    events_count    INTEGER DEFAULT 0,
    total_registrations INTEGER DEFAULT 0,
    created_by      UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. EVENTS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT NOT NULL,
    category            TEXT NOT NULL DEFAULT 'General',
    organizer           TEXT NOT NULL,
    organizer_role      TEXT,
    created_by_head_id  UUID REFERENCES head_credentials(id),
    event_date          DATE NOT NULL,
    event_time          TEXT,
    venue               TEXT,
    description         TEXT NOT NULL DEFAULT '',
    image_url           TEXT,
    deadline            DATE,
    max_capacity        INTEGER DEFAULT 100,
    eligibility         TEXT,
    registered_count    INTEGER DEFAULT 0,
    is_published        BOOLEAN DEFAULT true,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. EVENT REGISTRATIONS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_registrations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_id      UUID REFERENCES auth.users(id),
    student_name    TEXT NOT NULL,
    student_email   TEXT NOT NULL,
    roll_number     TEXT,
    department      TEXT,
    year            INTEGER,
    phone           TEXT,
    registered_at   TIMESTAMPTZ DEFAULT NOW(),
    status          TEXT DEFAULT 'Registered'
        CHECK (status IN ('Registered','Shortlisted','Selected','Attended','Waitlisted')),
    UNIQUE(event_id, student_email)
);

-- ── 7. SCHOLARSHIPS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scholarships (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    provider        TEXT NOT NULL,
    category        TEXT NOT NULL,
    benefits        TEXT,
    amount          TEXT,
    eligibility     TEXT,
    deadline        DATE,
    documents       TEXT,
    total_quota     INTEGER DEFAULT 50,
    applicants_count INTEGER DEFAULT 0,
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. SCHOLARSHIP APPLICATIONS ───────────────────────────────
CREATE TABLE IF NOT EXISTS scholarship_applications (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scholarship_id    UUID NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    scholarship_name  TEXT,
    student_id        UUID REFERENCES auth.users(id),
    student_name      TEXT NOT NULL,
    student_email     TEXT NOT NULL,
    roll_number       TEXT,
    department        TEXT,
    year              INTEGER,
    cgpa              DECIMAL(3,2),
    family_income     TEXT,
    category          TEXT,
    applied_date      DATE DEFAULT CURRENT_DATE,
    status            TEXT DEFAULT 'Under Review'
        CHECK (status IN ('Approved','Under Review','Shortlisted','Documents Verified','Rejected')),
    missing_documents TEXT[]
);

-- ── 9. NOTICES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    category        TEXT NOT NULL,
    description     TEXT NOT NULL,
    source          TEXT,
    is_important    BOOLEAN DEFAULT false,
    attachment_url  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. ACHIEVEMENTS / WINNERS ────────────────────────────────
CREATE TABLE IF NOT EXISTS winners (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name    TEXT NOT NULL,
    roll_number     TEXT,
    dept            TEXT,
    year            TEXT,
    title           TEXT NOT NULL,
    competition     TEXT NOT NULL,
    organizer       TEXT,
    category        TEXT,
    position        TEXT,
    prize           TEXT,
    achievement_date DATE DEFAULT CURRENT_DATE,
    description     TEXT,
    image_url       TEXT,
    team_members    TEXT[],
    certificate_url TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 11. ROW LEVEL SECURITY (RLS) ──────────────────────────────
ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE head_credentials        ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships            ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners                 ENABLE ROW LEVEL SECURITY;

-- profiles: users can read their own; super_admin can read all
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- head_credentials: only super_admin (role check via profiles)
CREATE POLICY "head_creds_admin_all" ON head_credentials FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'SUPER_ADMIN'
        )
    );

-- Anyone logged in can read head credentials (for login lookup)
CREATE POLICY "head_creds_read_auth" ON head_credentials FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- events: publicly readable; heads can insert/update their own
CREATE POLICY "events_public_read" ON events FOR SELECT USING (true);
CREATE POLICY "events_head_insert" ON events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('HEAD', 'SUPER_ADMIN')
        )
    );

-- event_registrations: students can register; heads see their event regs
CREATE POLICY "regs_insert_student" ON event_registrations FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "regs_read_all_auth" ON event_registrations FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- scholarships: public read
CREATE POLICY "scholarships_public_read" ON scholarships FOR SELECT USING (true);

-- scholarship_applications: students manage their own
CREATE POLICY "schapp_insert_auth" ON scholarship_applications FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "schapp_read_auth" ON scholarship_applications FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- notices: public read
CREATE POLICY "notices_public_read" ON notices FOR SELECT USING (true);

-- winners: public read
CREATE POLICY "winners_public_read" ON winners FOR SELECT USING (true);

-- ── 12. TRIGGER: auto-create profile on signup ────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STUDENT')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
