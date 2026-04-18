# KidWiz

KidWiz is a modern children's education SaaS concept that combines traditional learning with real-life growth skills. The current local build now includes:

- a polished public-facing website
- a parent login entry with optional Supabase magic-link auth
- a guided family onboarding flow for goals, rhythm, and coach style
- a fully navigable demo application for family learning
- a Quest Hub with world-map navigation, weekly missions, a Kid Daily Quest Brief, and visible rewards
- a parent weekly report layer with action plans, conversation prompts, and stateful trend history
- eight course tracks with multi-lesson arcs, Learning Path Maps, guided lesson flows, track-specific playbooks, visual practice panels, age-band aware lesson copy, authored scenario cards, and interactive move storyboards
- lazy-loaded public, onboarding, and app-screen modules with in-product loading states so the local build stays fast as content grows
- a mobile weekly-pulse strip that makes lesson, story, and reflection targets readable at a glance
- a mobile-first in-app shell with learner switching and sticky section navigation instead of a collapsed desktop sidebar
- a child-specific mobile resume strip and quick-action rail for opening the next lesson, story, reflection, or family prompt in one tap
- a parent-only mobile control strip for protected settings, Family Hub access, and sensitive-track status
- expanded Brave Heart, Money Moves, and Home Team content depth
- weekly playlists, badges, progress bars, coach prompts, parent controls, and Family Hub archive tools
- branching story practice with Story Skill Debriefs, private journals with a Journal Insight Coach, and a parent family hub

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

Useful local review shortcuts:

- public site: `http://127.0.0.1:5290/`
- instant Quest Hub demo: `http://127.0.0.1:5290/?demo=instant&tab=quest`
- instant dashboard demo: `http://127.0.0.1:5290/?demo=instant&tab=dashboard`
- guided courses demo: `http://127.0.0.1:5290/?demo=instant&tab=courses`
- Family Hub demo: `http://127.0.0.1:5290/?demo=instant&tab=family`
- guided onboarding demo: `http://127.0.0.1:5290/?demo=guided`
- instant demo for a specific child: `http://127.0.0.1:5290/?demo=instant&tab=quest&child=kai`

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

## Current Local Product Shape

- public marketing site
- guided onboarding flow
- parent dashboard with child-by-child weekly targets, weekly report summaries, archived trend comparisons, and recommendations
- a parent Daily Brief that turns the week into one clear first move, family context, and a ready-to-say parent script
- a Parent Progress Narrative that turns metrics into a warm weekly story about growth, tender spots, and next steps
- child-facing Quest Hub with mission board, world map, reward shelf, and rhythm checklist
- a Kid Daily Quest Brief that gives the selected child one next mission, one reason, one unlock, and one confidence prompt
- a Child Celebration Reel that turns weekly lessons, stories, reflections, badges, and family practice into visible wins
- a Child Achievement Portfolio that turns wins into a parent-shareable growth record with proof cards and keepsakes
- a Parent Share & Print Preview that turns the portfolio into a privacy-aware weekly growth card
- multi-child switching
- course library with lesson progress, Learning Path Maps, track-specific lesson playbooks, visual practice panels, authored scenario cards, interactive move storyboards, age-band aware prompts, guided milestones, quiz checkpoints, and sequential progression
- weekly playlists
- branching story choices across confidence, money, relationships, and digital safety with skill debriefs after saved choices
- Spark Coach demo layer with different coaching modes and a Tutor Safety Studio for bounded AI mock prompts, safety decisions, and parent summaries
- child journal and parent notes
- Journal Insight Coach that turns saved child reflections into mood patterns, likely needs, parent response ideas, and next practice
- guided empty and success states in courses, stories, and journals so child-facing flows feel more complete
- signal-driven lesson recommendations that react to recent story choices and child reflection mood
- Daily Brief guidance that explains what happened, why it matters, and what to say tonight
- Kid Daily Quest Brief guidance that translates the same signals into child-friendly motivation
- parent planning nudges in Dashboard and Family Hub that can adjust weekly targets or switch focus tracks from those child signals
- accept/dismiss controls for planning nudges so parents can treat recommendations like actionable inbox items instead of repeated alerts
- a parent review queue that gathers unresolved nudges, story signals, fresh reflections, and family follow-up into one calm dashboard inbox
- parent controls for goals, rhythm, celebration style, track assignment, and sensitive-topic unlocks
- Family Meeting Builder that turns child signals into a 10-minute guided conversation and ready-to-say script
- Parent Safety & Trust Review that summarizes sensitive access, coach boundaries, journal privacy, and parent controls
- Parent Consent & Privacy Center that previews exportable child data, consent status, deletion needs, and retention decisions
- Launch Readiness Console that separates the polished local product from production needs like auth, database, AI safety, privacy, billing, QA, and analytics
- Production Data Model Console that maps local product features to future SaaS records for families, children, learning, journals, AI safety, consent, and billing
- local save-week, archive-week, fresh-week, and reset testing tools in the Family Hub

## Project Structure

- `src/App.jsx` - top-level state, mobile shell, and app routing with lighter first-load derivation
- `src/components/` - public site, onboarding, dashboard, and tab components
- `src/components/MobileShell.jsx` - extracted mobile learner shell, section nav, quick actions, and parent control rail
- `src/data/kidwizData.js` - core curriculum, worlds, rituals, badges, and child/profile data used by the app shell
- `src/data/kidwizMarketingData.js` - public-site and trust-copy data for lazy marketing and setup surfaces
- `src/data/kidwizDemoSeedData.js` - starter demo state and seeded history used to bootstrap local testing
- `src/lib/demoState.js` - local demo state bootstrap and persistence helpers
- `src/lib/progression.js` - playlist, mission board, world map, badge, recommendation, and track-progression logic
- `src/lib/progression.js` - playlist, mission board, world map, badge, recommendation, child summary, and archive snapshot logic
- `src/lib/lessonExperience.js` - course-only lesson experience builder, now loaded with the Courses screen chunk
- `src/lib/supabaseClient.js` - optional Supabase auth wiring
- `docs/PROJECT.md` - living product and architecture document

## Next Good Moves

- connect Supabase tables for real parent accounts, child profiles, journals, progress, and weekly snapshots
- add a server-side AI layer for bounded tutoring and summaries
- introduce billing and subscription controls
- keep trimming the local bundle by pushing the remaining shell-only recommendation and archive helpers behind lazy screen boundaries or async state utilities
- move more of the always-mounted mobile shell into focused components now that its state derives from shared progression helpers
- keep sharpening the mobile shell so the first screen answers both “what should my child do next?” and “what should the parent adjust?”
- deepen lesson authoring so each track gets richer interactive practice variations, stronger media moments, and more sharply authored age-banded lesson content
