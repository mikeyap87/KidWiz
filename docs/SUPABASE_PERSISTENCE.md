# KidWiz Supabase Persistence

KidWiz still works as a local demo without Supabase. This production slice adds an opt-in cloud persistence path for signed-in parent accounts.

## What This Stores

- one family workspace per Supabase parent account
- the current KidWiz app state as JSON, including selected goals, child progress, journals, weekly history, playlists, course answers, and Learning Studio memory
- AI safety events in a separate parent-owned table for future audit/review

## What It Does Not Do Yet

- no billing
- no analytics
- no public child accounts
- no live migration is applied automatically
- no final privacy/retention policy is enforced yet beyond owner-only row-level security and parent-facing export/delete controls

## Setup

1. Create or choose the KidWiz Supabase project.
2. Review `supabase/migrations/202604290001_kidwiz_persistence_foundation.sql`.
3. Apply the migration in Supabase SQL editor or through the Supabase CLI.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the frontend environment.
5. Restart the app.
6. Use the magic-link parent sign-in flow.

When the tables are present, signed-in parent sessions show cloud sync status. When the tables are missing, KidWiz stays usable and shows that cloud setup is needed.

## Parent Privacy Controls

- `Export data` in the Parent room downloads the current family workspace as readable JSON.
- The export excludes browser session credentials and Supabase user ids.
- `Delete cloud` deletes the signed-in Supabase family workspace and AI safety event rows.
- Cloud deletion does not erase the local browser preview; parents can still use the separate demo reset control if they want to clear local data.

## Safety Notes

- Keep OpenAI keys server-side only.
- Do not store old archive `.env` files in the repo.
- Treat AI safety event retention as a product/legal decision before public child use.
- This JSON workspace model is the fastest safe bridge from prototype to real accounts. Later, it can be split into normalized tables for richer reporting and exports.
