import { ArrowRight } from "lucide-react";
import { storyEpisodes } from "../data/kidwizData";
import {
  appHighlights,
  conversionProofRows,
  heroStats,
  parentOutcomeRows,
  siteImages,
  trustSignals,
} from "../data/kidwizMarketingData";
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
              Personalize setup
            </button>
            <button className="solid-button" onClick={() => onDemoStart("instant")}>
              Open parent demo
            </button>
          </div>
        </div>

        <div className="hero-content page-width">
          <p className="eyebrow">Modern learning for capable, confident kids</p>
          <h1>
            The education app parents wish existed after school.
          </h1>
          <p className="hero-copy">
            KidWiz helps children practice confidence, money sense, focus,
            friendship repair, digital safety, storytelling, and school skills
            with parent-visible progress and safety controls.
          </p>

          <div className="hero-actions">
            <button className="solid-button" onClick={() => onDemoStart("instant")}>
              Try the full family demo
              <ArrowRight size={16} />
            </button>
            <button className="ghost-button" onClick={() => onDemoStart("guided")}>
              Build my family setup
            </button>
          </div>

          <form className="hero-login" onSubmit={onMagicLinkSubmit}>
            <label htmlFor="parent-email">Get a parent sign-in link</label>
            <div className="hero-login-row">
              <input
                id="parent-email"
                type="email"
                placeholder="parent@example.com"
                value={authEmail}
                onChange={(event) => onAuthEmailChange(event.target.value)}
              />
              <button className="solid-button" type="submit" disabled={authBusy}>
                {authBusy ? "Sending..." : "Send magic link"}
              </button>
            </div>
            <p className="login-note">
              {authMessage ||
                "No setup required for the local demo. Supabase magic links are optional while we shape the product."}
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

      <section className="outcome-band">
        <div className="page-width outcome-layout">
          <div className="section-heading">
            <p className="eyebrow eyebrow-dark">Why parents care</p>
            <h2>KidWiz sells outcomes, not screen time.</h2>
            <p>
              The product turns practice into visible growth: what the child
              tried, what changed, what parents can say tonight, and what should
              happen next.
            </p>
          </div>

          <div className="outcome-grid">
            {parentOutcomeRows.map((row) => (
              <article key={row.title} className="outcome-card">
                <h3>{row.title}</h3>
                <p>{row.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="feature-band">
        <div className="page-width section-heading">
          <p className="eyebrow eyebrow-dark">What is inside the demo</p>
          <h2>A fuller product loop for both kids and parents.</h2>
          <p>
            The local build now has enough connected surfaces to evaluate the
            product experience, not just the landing page.
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

      <section className="conversion-proof-band">
        <div className="page-width conversion-proof-layout">
          <div>
            <p className="eyebrow eyebrow-dark">Decision clarity</p>
            <h2>Know exactly what is real, what is demo, and what comes next.</h2>
          </div>
          <div className="conversion-proof-grid">
            {conversionProofRows.map((row) => (
              <article key={row.label} className="conversion-proof-card">
                <p>{row.label}</p>
                <strong>{row.value}</strong>
              </article>
            ))}
          </div>
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
