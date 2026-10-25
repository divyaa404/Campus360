# Campus360 Frontend

For the full product overview, feature status, architecture, local setup, Supabase
instructions, routes, and production limitations, see the [project README](../README.md).

## Frontend-specific Supabase configuration

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

For a fresh development project, run `backend/supabase_login_schema.sql` in the
Supabase SQL Editor, then run `backend/supabase_content_policies.sql` for content
policies and the achievement photo bucket. `backend/schema.sql` is an earlier
schema variant; see the [project README](../README.md#supabase-setup) before
choosing scripts for an existing database.

The frontend reports Supabase query errors in the relevant page. When Supabase
is configured, empty tables display as empty instead of falling back to sample
records.

The current starter policies allow broad anon access for prototype flows and are not production access control. Anyone with the public anon key can access operations permitted by those policies. Replace them with restrictive Supabase-authenticated role policies or move privileged writes behind a trusted backend before production use. Achievement photos are limited to supported image formats and 5 MB; the resulting public URL is saved in `winners.image_url`.

## Run locally

```sh
cd frontend
npm install
npm run dev
```

Run `npm run build` to type-check and create the production bundle.
