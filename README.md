# KidWiz

KidWiz is a modern children's education SaaS concept that combines traditional learning with real-life growth skills. The current local build now includes:

- a polished public-facing website
- a bright KidWiz brand skin using the owner-provided logo, atom favicon, and softened Wiz Spark learning-guide visual from the approved design archive
- a full public-site and SaaS redesign pass with customer-ready website copy, a sticky outcomes/learning/trust nav, a stronger hero proof card, a grid-based Wiz Spark visual, and a more cohesive bright learning OS app shell
- a Parent Command Center first view on the homepage and instant dashboard, showing child status, today’s best move, safety state, weekly proof, and parent attention items before deeper product depth
- a deeper section-by-section SaaS redesign so Dashboard, Quest Hub, Courses, Stories, Coach, Journal, Family Hub, Help, and guided onboarding all feel like finished KidWiz product surfaces
- generated KidWiz learning-world art for the homepage, Quest Hub, Courses, Stories, Journal, and Learning Studio so the product feels more engaging for children without losing parent trust
- a parent login entry with optional Supabase magic-link auth
- a guided family onboarding flow with a parent launch checklist, first-week brief, goals, rhythm, and coach style
- a fully navigable demo application for family learning
- a Quest Hub with world-map navigation, weekly missions, a Kid Daily Quest Brief, and visible rewards
- a parent weekly report layer with action plans, conversation prompts, and stateful trend history
- eight course tracks with multi-lesson arcs, Learning Path Maps, guided lesson flows, track-specific playbooks, visual practice panels, age-band aware lesson copy, authored scenario cards, micro-challenge checks, and interactive move storyboards
- lazy-loaded public, onboarding, and app-screen modules with in-product loading states so the local build stays fast as content grows
- a mobile weekly-pulse strip that makes lesson, story, and reflection targets readable at a glance
- a mobile-first in-app shell with learner switching and sticky section navigation instead of a collapsed desktop sidebar
- a tighter mobile resume strip with extra learner, quick-action, and parent controls behind a compact family-controls drawer
- a compact parent-facing mobile shell that gets Dashboard, Coach, Family Hub, and Help to their core content faster
- parent, child, and support visual zones so the app no longer feels like one repeated dark dashboard surface
- a DeepTutor-inspired KidWiz Learning Studio inside Coach with live-AI modes, parent-visible safety review, local tutor history, notebook cards, and a question bank
- a cross-screen app guide that explains the active section, its audience, and the best next move
- a Parent Proof entry panel that gives first-time demo parents one child, one next lesson, and one safety note before deeper dashboards
- a dashboard setup confirmation panel that shows the selected goals, rhythm, coach tone, and celebration lens are actively shaping the week
- a restartable Dashboard tour that teaches setup proof, parent proof, and Family Hub controls
- a Help tab and `/help` path for the parent workflow, section guide, Learning Studio status, and onboarding restart actions
- a production-readiness Help layer that shows what must be true before real families use KidWiz: durable family data, AI safety evidence, privacy/consent decisions, and repeatable QA
- a Parent Outcome Dashboard that translates weekly activity into learning readiness, life-skill practice, child momentum, and parent clarity
- a parent outcome risk ribbon in dashboard view, so parents can quickly spot at-risk children and jump into the right next action in one tap
- parent outcome filtering controls and one-tap child session starts so new parents can instantly focus on “All,” “Needs support,” or “Top momentum” and act, with clear guidance when a filter has no matches.
- a refreshed bright learning OS with white surfaces, lime primary actions, colorful subject accents, larger friendly controls, and calmer parent trust panels
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
- instant overview demo: `http://127.0.0.1:5290/?demo=instant&tab=overview`
- guided courses demo: `http://127.0.0.1:5290/?demo=instant&tab=courses`
- Family Hub demo: `http://127.0.0.1:5290/?demo=instant&tab=family`
- Help: `http://127.0.0.1:5290/help`
- guided onboarding demo: `http://127.0.0.1:5290/?demo=guided`
- instant demo for a specific child: `http://127.0.0.1:5290/?demo=instant&tab=quest&child=kai`

## Scripts

- `npm run dev` - local dev server on port `5290`
- `npm run ai:server` - local AI server on port `5291` for the Learning Studio
- `npm run build` - production build
- `npm run lint` - ESLint
- `npm run preview` - preview build on port `4290`

## Auth

KidWiz supports two modes today:

- `Demo mode` when Supabase env vars are not present
- `Magic-link auth` when `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are configured

If Supabase is not configured yet, the product still opens cleanly in demo mode so design, flows, and content can be reviewed.

## Learning Studio AI

The Coach tab includes a live-AI KidWiz Learning Studio inspired by DeepTutor's unified tutor workspace, memory, notebook, and question-bank ideas. It does not install or vendor DeepTutor code.

Run the app and AI server in two terminals:

```bash
npm run dev
npm run ai:server
```

The browser calls `http://127.0.0.1:5291/api/kidwiz/tutor`. The OpenAI key stays server-side in `.env.local` as `OPENAI_API_KEY`; it should never be exposed through `VITE_` variables. If `OPENAI_API_KEY` is missing, the Learning Studio stays visible but reports that live AI is not configured.

For local testing, KidWiz can temporarily use a shared OpenAI key copied from another local project into `.env.local`. Replace that shared key with a dedicated KidWiz OpenAI key before public or production use.

## Current Local Product Shape

- bright KidWiz public marketing site with the original logo direction, robot tutor visual, playful science-learning identity, sharper parent outcomes, trust positioning, and demo entry points
- homepage first viewport framed around a compact KidWiz Parent Command Center preview with one primary `Open parent demo` action
- bright app shell with white panels, lime primary controls, colorful subject accents, and calmer parent versus child visual zones
- section-level SaaS polish across Dashboard, Quest Hub, Courses, Stories, Coach, Journal, Family Hub, Help, and guided onboarding, with clearer mastheads, stronger cards, better contrast, and more consistent KidWiz learning-system styling
- generated learning-world artwork on the homepage and child-facing sections, documented in `docs/IMAGE_GENERATION.md`
- parent-demo-first public hero with optional magic-link testing moved below the first proof section
- public hero CTA order keeps `Open parent demo` as the first action before personalization
- guided onboarding flow with a parent launch brief, setup checklist, first child next move, and restart guidance
- post-launch setup confirmation in Dashboard so parents can see their setup choices are now active
- Dashboard proof order now matches the tour: setup confirmation before parent proof
- restartable Dashboard tour and Help tab so first-time parents have a short product guide after setup
- app shell polish with zone-specific accents for parent controls, child learning, and help/reflection screens
- in-app screen guidance across Dashboard, Quest Hub, Courses, Stories, Coach, Journal, and Family Hub so parents and children always know the best next move
- interactive UI polish for core flows, including clear focus-visible outlines and explicit disabled-state handling to reduce confusion during first-run and conversion moments
- parent dashboard with child-by-child weekly targets, outcome framing, weekly report summaries, archived trend comparisons, and recommendations
- parent dashboard now opens with a bounded cockpit: status strip, one recommended lesson, attention queue, child board, parent controls, and compact Proof/Signals/Plan/Reports/Readiness panels
- a Parent Outcome Dashboard that turns lessons, stories, reflections, goals, rhythm, and review-queue items into proof of what the week is building
- a parent Daily Brief that turns the week into one clear first move, family context, and a ready-to-say parent script
- a Parent Progress Narrative that turns metrics into a warm weekly story about growth, tender spots, and next steps
- child-facing Quest Hub with a First Quest Launchpad, mission board, world map, reward shelf, and rhythm checklist
- child-facing Quest Hub now switches from a first-session launchpad to a quick-resume view once the selected child has started weekly activity
- a Kid Daily Quest Brief that gives the selected child one next mission, one reason, one unlock, and one confidence prompt
- a Child Celebration Reel that turns weekly lessons, stories, reflections, badges, and family practice into visible wins
- a Child Achievement Portfolio that turns wins into a parent-shareable growth record with proof cards and keepsakes
- a Parent Share & Print Preview that turns the portfolio into a privacy-aware weekly growth card
- multi-child switching
- course library with lesson progress, Learning Path Maps, track-specific lesson playbooks, visual practice panels, authored scenario cards, interactive micro-challenge checks, age-band aware prompts, guided milestones, quiz checkpoints, and sequential progression
- weekly playlists
- branching story choices across confidence, money, relationships, and digital safety with skill debriefs after saved choices
- Spark Coach demo layer with different coaching modes and a Tutor Safety Studio for bounded AI mock prompts, safety decisions, and parent summaries
- KidWiz Learning Studio with live-AI modes for Learn with me, Quiz me, Explain another way, Show a visual idea, and Save to notebook, backed by a local Node API server, explicit live-AI setup status, and parent-visible safety summaries
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
- Parent Consent & Privacy Center that previews exportable child data, consent status, deletion needs, retention decisions, and the launch decisions parents will expect around consent records, exports, deletion, and data retention
- Curriculum Depth Console that scores track coverage across lessons, quiz checks, story support, age bands, and parent cues
- Launch Readiness Console that separates the polished local product from production needs like auth, database, AI safety, privacy, billing, QA, and analytics
- Learning Studio production guardrails that make live-AI configuration, server-side key handling, no-key fallback, and parent-review expectations visible during local review
- Production Data Model Console that maps local product features to future SaaS records for families, children, learning, journals, AI safety, consent, and billing
- local save-week, archive-week, fresh-week, and reset testing tools in the Family Hub

## Project Structure

- `public/brand/` - selected owner-provided KidWiz logo and robot tutor assets used by the bright brand prototype
- `public/assets/generated/` - generated KidWiz learning-world illustrations used in the homepage and SaaS section headers
- `src/App.jsx` - top-level state, app routing, and screen wiring with more product logic delegated to focused helpers
- `src/components/` - public site, onboarding, app navigation/loading chrome, dashboard, and tab components
- `src/components/MobileShell.jsx` - extracted mobile learner shell, section nav, quick actions, and parent control rail
- `src/data/kidwizData.js` - core curriculum, worlds, rituals, badges, and child/profile data used by the app shell
- `src/data/kidwizMarketingData.js` - public-site and trust-copy data for lazy marketing and setup surfaces
- `src/data/kidwizDemoSeedData.js` - starter demo state and seeded history used to bootstrap local testing
- `src/data/releaseReadinessData.js` - parent-launch proof steps, production readiness milestones, and privacy decisions used by Help, Coach, and Family Hub
- `src/lib/demoState.js` - local demo state bootstrap and persistence helpers
- `src/lib/progression/` - playlist, mission board, world map, badge, recommendation, reporting, readiness, and track-progression logic
- `src/lib/appWorkspaceSelectors.js` - selected child, lesson, story, progress, and workspace derivation for the app shell
- `src/lib/familyWeekActions.js` - save-week, archive-week, and fresh-week state transitions
- `src/lib/planningNudgeActions.js` - parent recommendation accept/dismiss state transitions
- `src/lib/lessonExperience.js` - course-only lesson experience builder, now loaded with the Courses screen chunk
- `src/lib/supabaseClient.js` - optional Supabase auth wiring
- `scripts/kidwiz-ai-server.mjs` - local live-AI endpoint for Learning Studio tutoring and moderation
- `docs/PROJECT.md` - living product and architecture document
- `docs/IMAGE_GENERATION.md` - prompts, art direction, and filenames for generated bitmap assets

## Next Good Moves

- connect Supabase tables for real parent accounts, child profiles, journals, progress, and weekly snapshots
- connect the Learning Studio's local tutor history, notebook, question bank, and safety events to production persistence after the Supabase schema is approved
- introduce billing and subscription controls
- keep trimming the local bundle by pushing the remaining shell-only recommendation and archive helpers behind lazy screen boundaries or async state utilities
- move more of the always-mounted mobile shell into focused components now that its state derives from shared progression helpers
- keep sharpening the mobile shell so the first screen answers both “what should my child do next?” and “what should the parent adjust?”
- continue tightening the parent command center copy and panel order after real parent review sessions
- deepen lesson authoring so each track gets richer interactive practice variations, stronger media moments, and more sharply authored age-banded lesson content
