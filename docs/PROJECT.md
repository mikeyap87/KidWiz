# KidWiz

## What It Is

KidWiz is a premium family learning platform for children that blends academics, confidence, relationships, money sense, family communication, private reflection, and bounded AI guidance into one product.

The current build is a strong front-end foundation that includes a public website, a parent login entry flow, and a demo application shell that shows how the core product can work day to day.

## Who It Serves

- parents who want more than traditional school content
- children who benefit from playful, guided learning
- families who want practical life-skill conversations at home

The project assumes the owner is moderately technical but not an engineer.

## Problem It Solves

Most children's learning products focus narrowly on school subjects, while most life-skill products feel fragmented, shallow, or not designed for kids.

KidWiz aims to close that gap by giving families one place to build:

- academic skills
- confidence
- emotional awareness
- money habits
- friendship and family communication
- guided reflection

## Core Features In This Build

- immersive public website with strong KidWiz positioning
- parent email entry flow with optional Supabase magic-link auth
- demo-mode fallback when auth is not configured
- multi-child switching inside the app shell
- five always-available learning worlds:
  - Wonder Lab
  - Story Studio
  - Brave Heart
  - Money Moves
  - Home Team
- one parent-unlocked sensitive track:
  - Body and Boundaries
- daily rhythm dashboard with missions and progress signals
- guided lesson and quiz flow for each learning world
- branching story episodes with parent debrief prompts
- child journal and parent notes
- family hub with trust center, unlock controls, and rituals

## Business Value

KidWiz is positioned as a family subscription product that feels safer, more thoughtful, and more comprehensive than a typical education app.

The value is:

- stronger daily engagement than a static worksheet product
- deeper parent trust than an open-ended AI kids app
- broader usefulness than an academics-only platform
- clearer subscription value because the product serves both parent and child

## Current Stack

- React 19
- Vite
- plain CSS
- Lucide React icons
- browser `localStorage` for demo persistence
- optional Supabase auth via `@supabase/supabase-js`

## Architecture

### Frontend

- `src/App.jsx` contains the public site, login entry, and in-app experience.
- `src/data/kidwizData.js` acts as the current content source for demo profiles, worlds, stories, and rituals.
- `src/App.css` contains the full visual system and responsive layout.

### Auth

- `src/lib/supabaseClient.js` enables magic-link login when environment variables are present.
- If Supabase is not configured, the app falls back to a polished demo mode instead of breaking.

### Data Model Today

The live app shell currently uses in-browser demo state for:

- session mode
- selected child profile
- selected learning world
- selected story path
- completed daily journey items
- quiz answers
- child journal entries
- parent journal entries
- sensitive topic unlock state

This is stored in `localStorage` so a reviewer can interact with the experience without backend setup.

## Setup

1. Run `npm install`.
2. Run `npm run dev`.
3. Open `http://127.0.0.1:5290`.
4. Run `npm run lint` and `npm run build`.
5. Optionally copy `.env.example` to `.env.local` and add Supabase values for real magic-link login.

## Important Decisions

- KidWiz lives in its own isolated folder: `KidWiz`.
- The first build is intentionally web-first.
- The current product foundation is parent-led rather than child-signup-first.
- Sensitive topics stay behind a parent unlock.
- AI is positioned as bounded and supportive, not as an unrestricted social chatbot.
- The app supports demo mode by default so product design can move before backend work is finished.

## Constraints

- There is no database persistence yet beyond browser storage.
- There is no server-side AI integration yet.
- Journals and progress are demo-state only until Supabase tables are added.
- Billing, subscriptions, and role permissions are not implemented yet.
- The current build is a front-end foundation, not a production-ready child data platform.

## Next Priorities

1. Add real Supabase schema for parents, children, tracks, journals, progress, and unlock settings.
2. Split the app into route-level screens and smaller components as the product settles.
3. Add a server-side AI orchestration layer with moderation, age banding, and audit logs.
4. Introduce a real curriculum/content model instead of static demo data.
5. Add billing and subscription controls.
6. Define the first launch age band more tightly and decide whether the sensitive track belongs in V1 or V2.
