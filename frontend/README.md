# Campus360 Frontend

## Supabase setup

Create `frontend/.env` with the Supabase project URL and public anon key:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Do not put a Supabase service-role key in frontend environment variables. The frontend uses the configured project tables directly:

- `events` and `event_registrations` for campus events, registrations, and organizer rosters
- `scholarships` and `scholarship_applications` for listings and applications
- `winners` for achievements
- `notices` for college notices and scholarship notices
- `head_credentials` for head accounts and temporary credentials
- `profiles` and `admins` for account profiles

Apply `backend/schema.sql` in the Supabase SQL Editor to create the tables. For an existing project, also run `backend/supabase_content_policies.sql` to enable the policies used by event, notice, scholarship, and achievement operations. The frontend reports Supabase query errors in the relevant page; when Supabase is configured, empty tables display as empty instead of falling back to sample records.

The app currently uses its own login and sends browser requests with the public Supabase anon key. The included policies therefore permit anon writes to these content tables and achievement photo uploads; anyone who obtains the public anon key can write to them. For production, move admin writes behind Supabase-authenticated role policies or a trusted backend before relying on these policies for access control. Achievement photos are limited to common image formats and 5 MB; the resulting public URL is saved in `winners.image_url`.

## Run locally

```sh
npm install
npm run dev
```

Run `npm run build` to type-check and create the production bundle.
