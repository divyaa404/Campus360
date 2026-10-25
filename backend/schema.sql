-- ============================================================
-- CAMPUS360: SUPABASE PRODUCTION DATABASE SCHEMA
-- Matches User Schema: profiles, head_credentials, events,
-- event_registrations, scholarships, scholarship_applications,
-- notices, and winners with RLS and Realtime Sync.
-- ============================================================

-- 1. Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. User Roles Enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('STUDENT', 'SUPER_ADMIN', 'HEAD');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'STUDENT',
  phone text,
  department text DEFAULT 'Computer Science & Engineering',
  year integer DEFAULT 3,
  semester integer DEFAULT 6,
  roll_number text DEFAULT '2023CSE042',
  cgpa numeric DEFAULT 8.5,
  organization text,
  head_title text,
  must_change_password boolean DEFAULT false,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Allow profiles to be created and updated seamlessly
DO $$ BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 4. Head Credentials Table
CREATE TABLE IF NOT EXISTS public.head_credentials (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  organization text NOT NULL,
  head_title text,
  temp_password text,
  status text DEFAULT 'Pending First-Time Password Set',
  must_change_password boolean DEFAULT true,
  events_count integer DEFAULT 0,
  total_registrations integer DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  organizer text NOT NULL,
  organizer_role text,
  created_by_head_id uuid REFERENCES public.head_credentials(id) ON DELETE SET NULL,
  event_date date NOT NULL,
  event_time text,
  venue text,
  description text NOT NULL DEFAULT '',
  image_url text,
  deadline date,
  max_capacity integer DEFAULT 100,
  eligibility text,
  registered_count integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Event Registrations Table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id uuid,
  student_name text NOT NULL,
  student_email text NOT NULL,
  roll_number text,
  department text,
  year integer,
  phone text,
  registered_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'Registered' CHECK (status = ANY (ARRAY['Registered', 'Shortlisted', 'Selected', 'Attended', 'Waitlisted'])),
  UNIQUE(event_id, student_email)
);

-- 7. Scholarships Table
CREATE TABLE IF NOT EXISTS public.scholarships (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  category text NOT NULL,
  benefits text,
  amount text,
  eligibility text,
  deadline date,
  documents text,
  total_quota integer DEFAULT 50,
  applicants_count integer DEFAULT 0,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- 8. Scholarship Applications Table
CREATE TABLE IF NOT EXISTS public.scholarship_applications (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id uuid NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  scholarship_name text,
  student_id uuid,
  student_name text NOT NULL,
  student_email text NOT NULL,
  roll_number text,
  department text,
  year integer,
  cgpa numeric,
  family_income text,
  category text,
  applied_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'Under Review' CHECK (status = ANY (ARRAY['Approved', 'Under Review', 'Shortlisted', 'Documents Verified', 'Rejected'])),
  missing_documents text[]
);

-- 9. Notices Table
CREATE TABLE IF NOT EXISTS public.notices (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  source text,
  is_important boolean DEFAULT false,
  attachment_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- 10. Winners Table
CREATE TABLE IF NOT EXISTS public.winners (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  roll_number text,
  dept text,
  year text,
  title text NOT NULL,
  competition text NOT NULL,
  organizer text,
  category text,
  position text,
  prize text,
  achievement_date date DEFAULT CURRENT_DATE,
  description text,
  image_url text,
  team_members text[],
  certificate_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Achievement photos are stored in Supabase Storage; winners.image_url stores their public URL.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'achievement-photos',
  'achievement-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "achievement_photos_upload" ON storage.objects;
CREATE POLICY "achievement_photos_upload"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'achievement-photos');

DROP POLICY IF EXISTS "achievement_photos_read" ON storage.objects;
CREATE POLICY "achievement_photos_read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'achievement-photos');

-- 11. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.head_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- 12. Permissive Policies for Web App Operations (Anon & Authenticated)
DO $$ BEGIN
  DROP POLICY IF EXISTS "profiles_all" ON public.profiles;
  CREATE POLICY "profiles_all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "head_credentials_all" ON public.head_credentials;
  CREATE POLICY "head_credentials_all" ON public.head_credentials FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "events_all" ON public.events;
  CREATE POLICY "events_all" ON public.events FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "event_registrations_all" ON public.event_registrations;
  CREATE POLICY "event_registrations_all" ON public.event_registrations FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "scholarships_all" ON public.scholarships;
  CREATE POLICY "scholarships_all" ON public.scholarships FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "scholarship_applications_all" ON public.scholarship_applications;
  CREATE POLICY "scholarship_applications_all" ON public.scholarship_applications FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "notices_all" ON public.notices;
  CREATE POLICY "notices_all" ON public.notices FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "winners_all" ON public.winners;
  CREATE POLICY "winners_all" ON public.winners FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 13. Enable Realtime Sync on All Tables
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.head_credentials;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.event_registrations;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.scholarships;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.scholarship_applications;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.winners;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 14. Trigger: Auto-create profile when user signs in via Supabase Auth / Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, phone, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STUDENT'::user_role),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (email) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, profiles.name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
