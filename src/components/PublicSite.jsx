import { ArrowRight } from "lucide-react";
import { appHighlights, heroStats, siteImages, storyEpisodes, trustSignals } from "../data/kidwizData";
import { TrackGlyph } from "../lib/uiConfig";

export function PublicSite({
  authBusy,
  authEmail,
  authMessage,
  onAuthEmailChange,
  onDemoStart,
  onMagicLinkSubmit,
  visibleTracks,
}) {
  return (
    <div className="site-shell">
      <section
        className="hero-band"
        style={{
          backgroundImage: `linear-gradient(125deg, rgba(9, 11, 17, 0.86), rgba(9, 11, 17, 0.34)), url(${siteImages.hero})`,
        }}
      >
        <div className="topbar page-width">
          <div className="brand-lockup">
            <div className="brand-badge">KW</div>
            <div>
              <p className="brand-name">KidWiz</p>
              <p className="brand-subtitle">
                Learning, confidence, money sense, and family wisdom
              </p>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button" onClick={() => onDemoStart("guided")}>
              Plan the family setup
            </button>
            <button className="solid-button" onClick={() => onDemoStart("instant")}>
              Open full demo week
            </button>
          </div>
        </div>

        <div className="hero-content page-width">
          <p className="eyebrow">A children's learning universe for real life</p>
          <h1>
            School skills, life skills, and family wisdom in one beautiful
            product.
          </h1>
          <p className="hero-copy">
            KidWiz now includes guided family onboarding, deeper course arcs,
            weekly playlists, badges, journals, parent controls, branching
            stories, and a bounded AI-style coach experience for local review.
          </p>

          <div className="hero-actions">
            <button className="solid-button" onClick={() => onDemoStart("instant")}>
              Enter KidWiz
              <ArrowRight size={16} />
            </button>
            <button className="ghost-button" onClick={() => onDemoStart("guided")}>
              Start with onboarding
            </button>
          </div>

          <form className="hero-login" onSubmit={onMagicLinkSubmit}>
            <label htmlFor="parent-email">Parent email</label>
            <div className="hero-login-row">
              <input
                id="parent-email"
                type="email"
                placeholder="parent@kidwiz.com"
                value={authEmail}
                onChange={(event) => onAuthEmailChange(event.target.value)}
              />
              <button className="solid-button" type="submit" disabled={authBusy}>
                {authBusy ? "Sending..." : "Send magic link"}
              </button>
            </div>
            <p className="login-note">
              {authMessage ||
                "Supabase is optional right now. Local demo mode keeps everything testable while we shape the product."}
            </p>
          </form>

          <div className="hero-stat-row">
            {heroStats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="feature-band">
        <div className="page-width section-heading">
          <p className="eyebrow eyebrow-dark">What makes this stronger now</p>
          <h2>KidWiz is moving from pretty concept to real local product.</h2>
          <p>
            The demo is now built around repeat-use family loops: onboarding,
            tracks, playlists, stories, badges, journaling, and parent control
            over the learning rhythm.
          </p>
        </div>

        <div className="page-width feature-grid">
          {appHighlights.map((highlight) => (
            <article key={highlight.title} className="feature-tile">
              <h3>{highlight.title}</h3>
              <p>{highlight.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="course-band">
        <div className="page-width section-heading">
          <p className="eyebrow eyebrow-dark">Course library</p>
          <h2>Eight tracks built for modern family growth.</h2>
          <p>
            Traditional education still matters, but KidWiz pairs it with money
            habits, digital safety, focus, confidence, and stronger relationships.
          </p>
        </div>

        <div className="page-width course-showcase">
          {visibleTracks.map((track) => (
            <article key={track.id} className="course-showcase-item">
              <div className="course-showcase-icon">
                <TrackGlyph category={track.category} />
              </div>
              <h3>{track.title}</h3>
              <p>{track.summary}</p>
              <span>{track.lessons.length} lessons</span>
            </article>
          ))}
        </div>
      </section>

      <section
        className="story-band"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(12, 16, 24, 0.84), rgba(12, 16, 24, 0.3)), url(${siteImages.story})`,
        }}
      >
        <div className="page-width story-band-content">
          <div className="section-heading on-dark">
            <p className="eyebrow">Branching stories</p>
            <h2>Lessons become choices, not lectures.</h2>
            <p>
              Story choices now cover friendship repair, money decisions,
              confidence, and digital safety so children can rehearse before real
              life gets messy.
            </p>
          </div>

          <div className="story-strip">
            {storyEpisodes.map((story) => (
              <article key={story.id} className="story-card">
                <p>{story.focus}</p>
                <h3>{story.title}</h3>
                <span>{story.ageBand}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="trust-band"
        style={{
          backgroundImage: `linear-gradient(140deg, rgba(10, 13, 18, 0.9), rgba(10, 13, 18, 0.46)), url(${siteImages.family})`,
        }}
      >
        <div className="page-width trust-layout">
          <div className="section-heading on-dark">
            <p className="eyebrow">Family trust by design</p>
            <h2>Parents stay in the loop without turning learning into a chore.</h2>
            <p>
              Sensitive tracks stay parent-unlocked. AI help stays bounded.
              Journals stay private. The product can now be tested locally as a
              fuller family SaaS before any production setup.
            </p>
          </div>

          <div className="trust-grid">
            {trustSignals.map((signal) => (
              <article key={signal.title} className="trust-card">
                <h3>{signal.title}</h3>
                <p>{signal.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
