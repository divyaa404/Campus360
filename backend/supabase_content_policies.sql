-- Run in the Supabase SQL Editor for an existing Campus360 project.
-- The current app uses its own login rather than Supabase Auth, so browser
-- requests run as `anon`. These policies preserve the app's current behavior.
-- Anyone with the public anon key can perform these operations until the app
-- moves admin writes behind authenticated Supabase roles or a trusted backend.

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_all" ON public.events;
CREATE POLICY "events_all"
  ON public.events FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "event_registrations_all" ON public.event_registrations;
CREATE POLICY "event_registrations_all"
  ON public.event_registrations FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "scholarships_all" ON public.scholarships;
CREATE POLICY "scholarships_all"
  ON public.scholarships FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

ALTER TABLE public.scholarship_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "scholarship_applications_all" ON public.scholarship_applications;
CREATE POLICY "scholarship_applications_all"
  ON public.scholarship_applications FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notices_all" ON public.notices;
CREATE POLICY "notices_all"
  ON public.notices FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "winners_all" ON public.winners;
CREATE POLICY "winners_all"
  ON public.winners FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

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
