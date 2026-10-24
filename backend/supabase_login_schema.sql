-- ============================================================
-- CAMPUS360: COMPLETE SUPABASE PRODUCTION DATABASE SCHEMA v2
-- Tables: profiles (students only), admins (super admin),
--         heads (head credentials - no Google login),
--         head_credentials (legacy), events, notices, etc.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('STUDENT', 'SUPER_ADMIN', 'HEAD');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- STUDENTS ONLY - Google OAuth linked
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'STUDENT',
  phone text,
  department text,
  year integer,
  semester integer,
  roll_number text,
  cgpa numeric DEFAULT 8.5,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- SUPER ADMIN - separate table, no academic fields
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  phone text,
  organization text DEFAULT 'Central Administration',
  head_title text DEFAULT 'Super Administrator',
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- HEADS - email/password login only, no Google
CREATE TABLE IF NOT EXISTS public.heads (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  organization text NOT NULL,
  head_title text,
  phone text,
  temp_password text,
  status text DEFAULT 'Pending First-Time Password Set',
  must_change_password boolean DEFAULT true,
  events_count integer DEFAULT 0,
  total_registrations integer DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- LEGACY - backward compatibility alias
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
  status text DEFAULT 'Registered' CHECK (status = ANY (ARRAY['Registered','Shortlisted','Selected','Attended','Waitlisted'])),
  UNIQUE(event_id, student_email)
);

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
  status text DEFAULT 'Under Review' CHECK (status = ANY (ARRAY['Approved','Under Review','Shortlisted','Documents Verified','Rejected'])),
  missing_documents text[]
);

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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.head_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "profiles_all" ON public.profiles;
  CREATE POLICY "profiles_all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "admins_all" ON public.admins;
  CREATE POLICY "admins_all" ON public.admins FOR ALL USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "heads_all" ON public.heads;
  CREATE POLICY "heads_all" ON public.heads FOR ALL USING (true) WITH CHECK (true);
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

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.admins; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.heads; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.head_credentials; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.events; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.event_registrations; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.scholarships; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.scholarship_applications; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notices; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.winners; EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.raw_user_meta_data->>'role' IS DISTINCT FROM 'SUPER_ADMIN') THEN
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
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (email, name, role, phone, department, year, semester, roll_number, cgpa)
VALUES ('student@campus360.edu','Aarav Sharma','STUDENT','+91 98765 43210','Computer Science & Engineering',3,6,'2023CSE042',8.75)
ON CONFLICT (email) DO UPDATE SET role = 'STUDENT';

INSERT INTO public.admins (email, name, phone, organization, head_title)
VALUES ('admin@campus360.edu','Dr. Sarah Jenkins','+91 98765 00001','Central Administration','Super Administrator')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.heads (name, email, organization, head_title, temp_password, status, must_change_password) VALUES
  ('Prof. Rajesh Varma','ieee.head@campus360.edu','IEEE Student Branch','IEEE Student Branch Chair','head123','Active (Password Configured)',false),
  ('Dr. Ananya Sen','tnp.head@campus360.edu','Training & Placement Cell (TnP)','Chief Placement Officer','head123','Active (Password Configured)',false),
  ('Aryan Saxena','cultural.head@campus360.edu','Cultural Society','Cultural Secretary','head123','Active (Password Configured)',false),
  ('Meera Nair','acm.head@campus360.edu','ACM Student Chapter','ACM Lead Secretary','head123','Active (Password Configured)',false)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.head_credentials (name, email, organization, head_title, temp_password, status, must_change_password) VALUES
  ('Prof. Rajesh Varma','ieee.head@campus360.edu','IEEE Student Branch','IEEE Student Branch Chair','head123','Active (Password Configured)',false),
  ('Dr. Ananya Sen','tnp.head@campus360.edu','Training & Placement Cell (TnP)','Chief Placement Officer','head123','Active (Password Configured)',false),
  ('Aryan Saxena','cultural.head@campus360.edu','Cultural Society','Cultural Secretary','head123','Active (Password Configured)',false),
  ('Meera Nair','acm.head@campus360.edu','ACM Student Chapter','ACM Lead Secretary','head123','Active (Password Configured)',false)
ON CONFLICT (email) DO NOTHING;
