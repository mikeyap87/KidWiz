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

- CRO-focused public website with parent outcome messaging, demo CTAs, trust positioning, and clearer product/prototype proof
- parent email entry flow with optional Supabase magic-link auth
- demo-mode fallback when auth is not configured
- guided family onboarding for goal selection, weekly rhythm, coach style, and celebration style
- parent dashboard with per-child weekly targets, focus tracks, progress, and recommended next lessons
- parent weekly report layer with highlights, child-specific action plans, family conversation prompts, and trend history
- parent Daily Brief with a first move, family context, and a ready-to-say parent script for tonight
- Parent Progress Narrative that translates dashboard metrics into a warm weekly story parents can read or share
- parent review queue that gathers unresolved planning nudges, recent story practice, fresh child reflections, and family follow-up into one action inbox
- Quest Hub for the child experience with a First Quest Launchpad, world map, weekly mission board, reward shelf, and guided rhythm checklist
- Kid Daily Quest Brief with one next mission, one reason it matters, one unlock, and one confidence prompt for the selected child
- Child Celebration Reel that turns lessons, stories, reflections, badges, and family practice into a visible weekly win moment
- Child Achievement Portfolio that converts lessons, journals, stories, badges, and family rituals into proof cards, keepsakes, and parent-share language
- Parent Share & Print Preview that turns the child portfolio into a privacy-aware weekly growth card for future PDF, email, or family recap use
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
- guided lesson flow for each course track with Learning Path Maps, track-specific playbooks, visual practice panels, authored scenario cards, interactive move storyboards, age-band aware prompts, coach cues, activity milestones, quiz checkpoints, and a parent follow-through loop
- lazy-loaded public, onboarding, and tab-level screen modules with polished loading states so the local product stays responsive as more curriculum ships
- a mobile-first in-app shell with learner switching and sticky section navigation, replacing the old stacked-sidebar behavior on smaller screens
- a child-specific mobile resume strip and quick-action rail so a parent can jump straight into the next lesson, story, reflection, or family prompt
- a parent-only mobile control strip that keeps protected settings and sensitive-topic status separate from the child-facing next-step flow
- sequential lesson progression within tracks
- track statuses such as ready, in progress, checkpoint ready, and complete
- per-child weekly playlists with add/remove controls
- branching story episodes with richer choices, Story Skill Debriefs, parent questions, child reflections, and lesson follow-through
- badge system based on local progress state
- Spark Coach tab with bounded coaching modes and a Tutor Safety Studio for mock AI prompts, guardrail decisions, and parent-visible summaries
- child journal and parent notes with a Journal Insight Coach for mood patterns, likely needs, parent response ideas, and next practice
- family hub with trust center, unlock controls, goal editing, rhythm controls, archived history visibility, and local testing tools for saving or resetting weekly snapshots
- Family Meeting Builder that turns child signals into a 10-minute agenda, parent script, ritual close, and completion action
- Parent Safety & Trust Review that summarizes sensitive-track status, coach boundaries, journal privacy, and parent controls
- Parent Consent & Privacy Center that previews exportable child data, sensitive-topic consent, AI tutoring consent needs, deletion scope, and retention decisions
- Curriculum Depth Console that scores track coverage across lesson depth, quiz checkpoints, story support, age bands, and parent follow-through
- Launch Readiness Console that clearly marks what is local-demo ready and what still needs production auth, database, AI safety, privacy, billing, QA, and analytics work
- Production Data Model Console that maps local product behavior to future SaaS records across accounts, children, learning progress, journals, AI safety, consent, and billing

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

- `src/App.jsx` now acts mainly as the state container and app shell, and lazy-loads the public site, onboarding flow, and tab-level screens.
- `src/App.jsx` now also renders a mobile-only learner rail and sticky section nav so app switching stays easy on phones and small tablets.
- `src/App.jsx` now also surfaces child-specific mobile resume and quick-action controls, driven by the same recommendation and weekly-progress logic as the rest of the product.
- `src/App.jsx` now also surfaces a child-specific mobile weekly-pulse view so the current lesson, story, and reflection momentum is legible before opening deeper screens.
- The always-mounted mobile learner shell now lives in its own component so the app shell stays easier to evolve and the mobile-first experience can grow without bloating `App.jsx`.
- `src/App.jsx` now also includes a parent-only mobile control strip that routes settings work into Family Hub and keeps the sensitive-track toggle in a clearly protected area.
- `src/components/` contains the public site, onboarding flow, dashboard, and tab-level UI modules.
- `src/components/MobileShell.jsx` owns the mobile learner summary, weekly pulse, quick actions, and parent control rail.
- Dashboard, quest-hub, onboarding-preview, family assignment, and course track-progress derivation now run inside their lazy screen modules instead of being precomputed by the app shell on every load.
- Selected-child workspace state and archive snapshots now derive from shared progression helpers so the shell, dashboard, and save-week flows stay aligned.
- `src/data/kidwizMarketingData.js` now owns public-site and trust-copy content so those lazy surfaces no longer share the same all-purpose data module as the main app shell.
- `src/data/kidwizDemoSeedData.js` now owns the seeded local demo state so bootstrap defaults are cleaner to evolve without bloating the shared data module.
- `src/components/CoursesTab.jsx` now owns the lesson-experience builder import so course-only lesson logic loads with the course screen instead of the entry bundle.
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
- The course experience now includes authored age-band scenario cards and track-themed visual accents so the panels feel more like curriculum and less like generic UI.
- The course experience now includes a play-the-move storyboard so the chosen practice option becomes a short visual narrative instead of a detached selection.
- The app shell now lazy-loads public, onboarding, and in-app screens so the main bundle stays below the earlier warning threshold while the curriculum continues to expand.
- The app shell now swaps the old stacked mobile sidebar for a learner switcher plus sticky section rail so the product feels intentional on phones.
- The mobile shell now shows a recommended next lesson plus quick actions for story, reflection, and family follow-through, using the same progress signals that drive the dashboard and quest systems.
- The mobile shell now separates child next steps from parent-only controls so protected settings and sensitive-topic access feel deliberately gated.
- Marketing/trust content and starter demo seed content now live in their own data modules so lazy surfaces and bootstrap data have cleaner boundaries as the product grows.
- Dashboard summaries, weekly reports, quest boards, onboarding previews, and track-progress rows now compute inside lazy-loaded screens so the entry bundle stays focused on the shell and active learner controls.
- Mobile resume progress and archive snapshot generation now share the same child-summary model, reducing repeated logic and making parent-facing progress cues more consistent.
- The mobile home layer now includes a clearer “Today’s best move” explanation plus a parent note so the first screen communicates both learner momentum and the next family adjustment.
- Child-facing course, story, and journal screens now include stronger empty or success guidance so they feel like finished learning loops instead of neutral data views.
- Recent story choices and child reflection mood now feed forward into lesson recommendations and parent-facing planning copy, so the product behaves more like one connected learning loop.
- Dashboard and Family Hub now turn those same child signals into concrete planning nudges, including focus-track shifts and target adjustments parents can apply directly.
- Planning nudges now support accept and dismiss behavior, so local product state can remember which recommendations the parent already handled.
- Dashboard now includes a parent Daily Brief that explains what happened, why it matters, what to do first, and what to say tonight.
- Dashboard now includes a Parent Progress Narrative so family metrics become a readable story about what grew, what is tender, and what to try next.
- Dashboard now includes a parent review queue so reflections, story signals, planning nudges, and family follow-up appear together instead of staying scattered across tabs.
- Quest Hub now includes a Kid Daily Quest Brief so the child gets the same signal-aware clarity as the parent, translated into playful next-step language.
- Quest Hub now includes a First Quest Launchpad so a child can understand their guide, first mission, and first win path before scanning the full dashboard.
- Quest Hub now includes a Child Celebration Reel so children can see what they built this week across lessons, stories, reflections, badges, and family practice.
- Quest Hub now includes a Child Achievement Portfolio so weekly activity becomes a durable growth record parents and children can revisit together.
- Quest Hub now includes a Parent Share & Print Preview so the achievement portfolio can become a clean weekly family recap without exposing raw private journal data.
- Courses now include a Learning Path Map so every track shows locked, unlocked, next, playlist, and completed lesson states with a parent cue beside the active lesson.
- Stories now include a Story Skill Debrief after each saved choice so a branch turns into a named skill, parent question, child reflection, and recommended next lesson.
- Journal now includes an Insight Coach so child reflections become parent-readable patterns and suggested practice instead of a static list of notes.
- Family Hub now includes a Family Meeting Builder so signals from journals, stories, and progress become a practical 10-minute home conversation.
- Family Hub now includes a Parent Safety & Trust Review so parents can quickly see sensitive access, AI boundaries, journal privacy, and available controls.
- Family Hub now includes a Parent Consent & Privacy Center so export, deletion, consent, and retention decisions are visible before backend work begins.
- Family Hub now includes a Curriculum Depth Console so curriculum expansion can be prioritized by coverage and gaps instead of adding content blindly.
- Family Hub now includes a Launch Readiness Console so prototype polish stays separate from production infrastructure decisions.
- Family Hub now includes a Production Data Model Console so local prototype behavior can become a real schema plan without starting backend work too early.
- Coach now includes a Spark Tutor Safety Studio so future AI behavior can be reviewed locally before any real model or child data is connected.
- Sensitive topics stay behind a parent unlock.
- AI is positioned as bounded and supportive, not as an unrestricted social chatbot.
- The app supports demo mode by default so product design can move before backend work is finished.
- Direct URL demo boot is supported for local QA and stakeholder review.
- Public-site messaging now emphasizes parent outcomes, decision clarity, and safe local demo access instead of only describing feature inventory.

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
4. Keep trimming the local bundle by moving the remaining shell-owned active-lesson and coach-card helpers behind lazy boundaries or focused child-shell components.
5. Split the always-mounted mobile shell into clearer components now that its progress state comes from shared progression helpers.
6. Add a server-side AI orchestration layer with moderation, age banding, and audit logs.
7. Replace the static course content model with a more scalable curriculum structure and content authoring approach.
8. Add billing and subscription controls.
9. Define the first launch age band more tightly and decide whether the sensitive track belongs in V1 or V2.
