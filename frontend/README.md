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

Apply the SQL schema in the Supabase SQL Editor and configure Row Level Security policies that allow the intended student, head, and administrator operations. The frontend reports Supabase query errors in the relevant page; when Supabase is configured, empty tables display as empty instead of falling back to sample records.

## Run locally

```sh
npm install
npm run dev
```

Run `npm run build` to type-check and create the production bundle.
