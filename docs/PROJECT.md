# KidWiz

## What It Is

KidWiz is a premium family learning platform for children that blends academics, confidence, relationships, money sense, family communication, private reflection, and bounded AI guidance into one product.

The current build is a much richer local product foundation that includes a public website, a parent login entry flow, a guided onboarding experience, and a deeper demo application shell that shows how the core product can work day to day.

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
- guided family onboarding for goal selection, weekly rhythm, coach style, and celebration style
- multi-child switching inside the app shell
- seven always-available course tracks:
  - Wonder Lab
  - Story Studio
  - Brave Heart
  - Money Moves
  - Home Team
  - Digital Detectives
  - Focus Forge
- one parent-unlocked sensitive track:
  - Body and Boundaries
- daily rhythm dashboard with missions, progress signals, and weekly completion
- guided lesson and quiz flow for each course track
- per-child weekly playlists with add/remove controls
- branching story episodes with richer choices and parent debrief prompts
- badge system based on local progress state
- Spark Coach tab with bounded coaching modes
- child journal and parent notes
- family hub with trust center, unlock controls, goal editing, rhythm controls, and local testing tools

## Business Value

KidWiz is positioned as a family subscription product that feels safer, more thoughtful, and more comprehensive than a typical education app.

The value is:

- stronger daily engagement than a static worksheet product
- deeper parent trust than an open-ended AI kids app
- broader usefulness than an academics-only platform
- clearer subscription value because the product serves both parent and child
- stronger product loop credibility because the app now includes onboarding, progress, badges, playlists, and parent customization

## Current Stack

- React 19
- Vite
- plain CSS
- Lucide React icons
- browser `localStorage` for demo persistence
- optional Supabase auth via `@supabase/supabase-js`

## Architecture

### Frontend

- `src/App.jsx` contains the public site, onboarding flow, login entry, and in-app experience.
- `src/data/kidwizData.js` acts as the current content source for demo profiles, course tracks, lessons, stories, playlists, badges, rituals, and setup options.
- `src/App.css` contains the full visual system and responsive layout.

### Auth

- `src/lib/supabaseClient.js` enables magic-link login when environment variables are present.
- If Supabase is not configured, the app falls back to a polished demo mode instead of breaking.

### Data Model Today

The live app shell currently uses in-browser demo state for:

- session mode
- onboarding completion and setup preferences
- selected family goals
- weekly rhythm, coach style, and celebration style
- selected child profile
- selected course track and lesson
- selected story path
- weekly playlists by child
- completed lessons by child
- completed daily journey items
- quiz answers by child and lesson
- child journal entries by child
- parent journal entries
- assigned tracks by child
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
- The local product now includes an onboarding flow instead of skipping straight into the app.
- Sensitive topics stay behind a parent unlock.
- AI is positioned as bounded and supportive, not as an unrestricted social chatbot.
- The app supports demo mode by default so product design can move before backend work is finished.

## Constraints

- There is no database persistence yet beyond browser storage.
- There is no server-side AI integration yet.
- Journals, playlists, badges, quizzes, and progress are demo-state only until Supabase tables are added.
- Billing, subscriptions, and role permissions are not implemented yet.
- The current build is a strong local product prototype, not a production-ready child data platform.

## Next Priorities

1. Add real Supabase schema for parents, children, tracks, journals, progress, and unlock settings.
2. Split the app into route-level screens and smaller components as the product settles.
3. Add a server-side AI orchestration layer with moderation, age banding, and audit logs.
4. Replace the static course content model with a more scalable curriculum structure and content authoring approach.
5. Add billing and subscription controls.
6. Define the first launch age band more tightly and decide whether the sensitive track belongs in V1 or V2.
