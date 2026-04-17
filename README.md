# KidWiz

KidWiz is a modern children's education SaaS concept that combines traditional learning with real-life growth skills. The current build includes:

- a polished public-facing website
- a parent login entry with optional Supabase magic-link auth
- a fully navigable demo application for family learning
- learning worlds for academics, confidence, money, relationships, and family growth
- branching story practice, private journals, and a parent family hub

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the app:

   ```bash
   npm run dev
   ```

3. Open `http://127.0.0.1:5290`.

## Scripts

- `npm run dev` - local dev server on port `5290`
- `npm run build` - production build
- `npm run lint` - ESLint
- `npm run preview` - preview build on port `4290`

## Auth

KidWiz supports two modes today:

- `Demo mode` when Supabase env vars are not present
- `Magic-link auth` when `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are configured

If Supabase is not configured yet, the product still opens cleanly in demo mode so design, flows, and content can be reviewed.

## Project Structure

- `src/App.jsx` - main public site and application shell
- `src/data/kidwizData.js` - content model for worlds, stories, family rituals, and demo profiles
- `src/lib/supabaseClient.js` - optional Supabase auth wiring
- `docs/PROJECT.md` - living product and architecture document

## Next Good Moves

- connect Supabase tables for real parent accounts, child profiles, journals, and progress
- add a server-side AI layer for bounded tutoring and summaries
- introduce billing and subscription controls
- break the app shell into smaller route-level screens once the product shape stabilizes
