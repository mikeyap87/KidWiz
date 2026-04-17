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
- parent dashboard with per-child weekly targets, focus tracks, progress, and recommended next lessons
- parent weekly report layer with highlights, child-specific action plans, family conversation prompts, and trend history
- Quest Hub for the child experience with a world map, weekly mission board, reward shelf, and guided rhythm checklist
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
- expanded high-value core tracks:
  - Brave Heart now includes deeper confidence progression beyond calm resets and self-talk
  - Money Moves now includes needs-versus-wants and tradeoff practice
  - Home Team now includes deeper listening and boundary language lessons
- world-themed progression model that reframes course tracks as explorable regions
- weekly mission system for lessons, stories, reflections, and family rituals
- expanded branching story library across confidence, money, and family repair scenarios
- trend tracking that compares the current week against archived local snapshots for each child and the family overall
- daily rhythm checklist with visible completion inside the Quest Hub
- guided lesson flow for each course track with track-specific playbooks, visual practice panels, age-band aware prompts, coach cues, activity milestones, quiz checkpoints, and a parent follow-through loop
- sequential lesson progression within tracks
- track statuses such as ready, in progress, checkpoint ready, and complete
- per-child weekly playlists with add/remove controls
- branching story episodes with richer choices and parent debrief prompts
- badge system based on local progress state
- Spark Coach tab with bounded coaching modes
- child journal and parent notes
- family hub with trust center, unlock controls, goal editing, rhythm controls, archived history visibility, and local testing tools for saving or resetting weekly snapshots

## Business Value

KidWiz is positioned as a family subscription product that feels safer, more thoughtful, and more comprehensive than a typical education app.

The value is:

- stronger daily engagement than a static worksheet product
- deeper parent trust than an open-ended AI kids app
- broader usefulness than an academics-only platform
- clearer subscription value because the product serves both parent and child
- stronger product loop credibility because the app now includes onboarding, quests, missions, weekly reporting, progress, badges, playlists, and parent customization

## Current Stack

- React 19
- Vite
- plain CSS
- Lucide React icons
- browser `localStorage` for demo persistence
- optional Supabase auth via `@supabase/supabase-js`

## Architecture

### Frontend

- `src/App.jsx` now acts mainly as the state container and app shell.
- `src/components/` contains the public site, onboarding flow, dashboard, and tab-level UI modules.
- `src/data/kidwizData.js` acts as the current content source for demo profiles, course tracks, lessons, quest worlds, stories, playlists, badges, rituals, and setup options.
- `src/App.css` contains the full visual system and responsive layout.

### Auth

- `src/lib/supabaseClient.js` enables magic-link login when environment variables are present.
- If Supabase is not configured, the app falls back to a polished demo mode instead of breaking.

### Local Product Logic

- `src/lib/demoState.js` owns the local demo bootstrap state and browser persistence behavior.
- `src/lib/progression.js` owns playlist generation, quest world derivation, mission board logic, weekly report derivation, trend comparison logic, lesson progression, track status, badge logic, and recommended-next-step behavior.

### Data Model Today

The live app shell currently uses in-browser demo state for:

- session mode
- onboarding completion and setup preferences
- selected family goals
- weekly rhythm, coach style, and celebration style
- weekly targets by child
- selected child profile
- selected course track and lesson
- selected story path
- weekly playlists by child
- completed lessons by child
- completed daily journey items
- guided lesson milestone state by child and lesson
- saved lesson practice choices by child and lesson
- quiz answers by child and lesson
- child journal entries by child
- parent journal entries
- assigned tracks by child
- sensitive topic unlock state
- weekly history snapshots by child, including archived totals used for trend comparisons

This is stored in `localStorage` so a reviewer can interact with the experience without backend setup.

For faster local QA, the app also supports direct demo boot URLs such as:

- `/?demo=instant&tab=quest`
- `/?demo=instant&tab=dashboard`
- `/?demo=instant&tab=courses`
- `/?demo=instant&tab=family`
- `/?demo=guided`
- `/?demo=instant&tab=quest&child=kai`

The Family Hub now includes local controls to:

- save the current week into trend history without resetting progress
- archive the current week and start a fresh week with rotated focus tracks and fresh playlists
- reset saved history back to the seeded demo baseline
- restart onboarding or fully reset the local demo state

## Setup

1. Run `npm install`.
2. Run `npm run dev`.
3. Open `http://127.0.0.1:5290`.
4. For direct local review, optionally use `http://127.0.0.1:5290/?demo=instant&tab=quest`.
5. Run `npm run lint` and `npm run build`.
6. Optionally copy `.env.example` to `.env.local` and add Supabase values for real magic-link login.

## Important Decisions

- KidWiz lives in its own isolated folder: `KidWiz`.
- The first build is intentionally web-first.
- The current product foundation is parent-led rather than child-signup-first.
- The local product now includes an onboarding flow instead of skipping straight into the app.
- The local product now includes a quest-style child home experience instead of a plain dashboard-style landing screen.
- The parent dashboard now includes a weekly report plus historical trend comparison rather than only raw metrics and controls.
- Historical trend comparison is now driven by archived local snapshots instead of a fixed read-only seed.
- The lesson experience now includes guided micro-steps and a parent follow-through loop instead of stopping at a single quiz interaction.
- The course experience now uses track-specific lesson playbooks so confidence, money, family, digital safety, and academic tracks no longer share the same teaching frame.
- The course experience now includes visual practice panels with saved lesson choices so each track feels interactive in its own way.
- The course experience now changes its lesson copy by child age band so younger and older learners do not get the exact same framing.
- Sensitive topics stay behind a parent unlock.
- AI is positioned as bounded and supportive, not as an unrestricted social chatbot.
- The app supports demo mode by default so product design can move before backend work is finished.
- Direct URL demo boot is supported for local QA and stakeholder review.

## Constraints

- There is no database persistence yet beyond browser storage.
- There is no server-side AI integration yet.
- Journals, playlists, badges, quizzes, and progress are demo-state only until Supabase tables are added.
- Billing, subscriptions, and role permissions are not implemented yet.
- The current build is a strong local product prototype, not a production-ready child data platform.

## Next Priorities

1. Add real Supabase schema for parents, children, tracks, journals, progress, and unlock settings.
2. Persist weekly snapshots, parent reports, and simulation history outside the browser so trends survive across devices.
3. Replace the shared track playbooks with richer authored lesson variants, stronger age-banding, and deeper media or interaction types that fit each track.
4. Split the app into route-level screens and smaller components as the product settles.
5. Add route-level code splitting and bundle trimming so the app loads faster as content keeps expanding.
6. Add a server-side AI orchestration layer with moderation, age banding, and audit logs.
7. Replace the static course content model with a more scalable curriculum structure and content authoring approach.
8. Add billing and subscription controls.
9. Define the first launch age band more tightly and decide whether the sensitive track belongs in V1 or V2.
