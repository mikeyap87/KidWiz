import { ArrowRight } from "lucide-react";
import { storyEpisodes } from "../data/kidwizData";
import {
  appHighlights,
  conversionProofRows,
  heroStats,
  parentOutcomeRows,
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
      >
        <div className="topbar page-width">
          <div className="brand-lockup">
            <img
              className="brand-logo-image"
              src="/brand/kidwiz-logo.svg"
              alt="KidWiz"
            />
            <div>
              <p className="brand-subtitle">
                Personalized AI learning companion for ages 5-12
              </p>
            </div>
          </div>
          <nav className="site-nav" aria-label="KidWiz preview sections">
            <a href="#outcomes">Outcomes</a>
            <a href="#learning">Learning</a>
            <a href="#trust">Trust</a>
          </nav>

          <div className="topbar-actions">
            <button className="solid-button" onClick={() => onDemoStart("instant")}>
              Open parent demo
            </button>
            <button className="ghost-button" onClick={() => onDemoStart("guided")}>
              Personalize setup
            </button>
          </div>
        </div>

        <div className="hero-content page-width">
          <div className="hero-copy-column">
            <p className="eyebrow">Igniting imagination, fostering genius</p>
            <h1>
              The AI learning companion built for whole-child growth.
            </h1>
            <p className="hero-copy">
              KidWiz blends personalized lessons, playful quizzes, parent
              progress proof, and safe tutor-style coaching so children can build
              school skills, life skills, confidence, and curiosity in one bright
              place.
            </p>

            <div className="hero-actions">
              <button className="solid-button" onClick={() => onDemoStart("instant")}>
                Open parent demo
                <ArrowRight size={16} />
              </button>
              <button className="ghost-button" onClick={() => onDemoStart("guided")}>
                Personalize setup
              </button>
            </div>

            <div className="hero-proof-card">
              <span>Designed for ages 5-12</span>
              <strong>School skills, life skills, and parent trust in one loop.</strong>
              <p>
                Children get a friendly mission. Parents get the why, the proof,
                and the next conversation to have at home.
              </p>
            </div>

            <div className="hero-stat-row">
              {heroStats.map((stat) => (
                <div key={stat.label} className="hero-stat">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="kidwiz-hero-visual" aria-label="KidWiz tutor preview">
            <div className="kidwiz-hero-orbit" />
            <div className="kidwiz-companion-card">
              <div className="spark-orbit-field" aria-hidden="true">
                <img className="spark-mark" src="/favicon.svg" alt="" />
                <img
                  className="kidwiz-hero-bot"
                  src="/brand/kidwiz-bot.png"
                  alt=""
                />
              </div>
              <span>AI learning guide</span>
              <strong>Meet Wiz Spark</strong>
              <p>
                A gentle guide that helps children ask better questions, try
                new skills, and show parents what changed.
              </p>
            </div>
            <div className="chat-bubble bot-bubble">
              <strong>Hi there, Jace!</strong>
              <span>Ready for a fun day of learning?</span>
            </div>
            <div className="chat-bubble kid-bubble">
              <strong>Yes, I'm excited!</strong>
              <span>Let's explore animals, money, and stories.</span>
            </div>
            <div className="subject-wheel-card">
              <span>Today's mix</span>
              <strong>Science · Money · Creativity</strong>
            </div>
            <div className="learning-signal-card signal-one">
              <span>Parent proof</span>
              <strong>Weekly growth card ready</strong>
            </div>
            <div className="learning-signal-card signal-two">
              <span>Safe AI help</span>
              <strong>Parent-visible summaries</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="outcome-band" id="outcomes">
        <div className="page-width outcome-layout">
          <div className="section-heading">
            <p className="eyebrow eyebrow-dark">Why parents care</p>
            <h2>KidWiz gives parents proof that learning is sticking.</h2>
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

        <form className="parent-signin-strip page-width" onSubmit={onMagicLinkSubmit}>
          <div>
            <p className="eyebrow eyebrow-dark">Parent sign-in</p>
            <h3>Send a secure link when you are ready to continue by email.</h3>
            <span>
              The parent demo is the fastest way to explore. Email sign-in is
              here for families who want a quieter return path.
            </span>
          </div>
          <div className="hero-login-row">
            <label className="sr-only" htmlFor="parent-email">
              Parent email
            </label>
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
              "No email is needed to open the parent demo."}
          </p>
        </form>
      </section>

      <section className="feature-band" id="learning">
        <div className="page-width section-heading">
          <p className="eyebrow eyebrow-dark">Learning OS</p>
          <h2>A complete product loop for both kids and parents.</h2>
          <p>
            KidWiz connects daily missions, guided lessons, stories, reflection,
            parent controls, and coach support into one family rhythm.
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
            <h2>A learning space that makes the next best step obvious.</h2>
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

      <section className="story-band">
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

      <section className="trust-band" id="trust">
        <div className="page-width trust-layout">
          <div className="section-heading on-dark">
            <p className="eyebrow">Family trust by design</p>
            <h2>Parents stay in the loop without turning learning into a chore.</h2>
            <p>
              Sensitive tracks stay parent-unlocked. AI help stays bounded.
              Journals stay private. KidWiz is built around family visibility,
              age-aware guidance, and parent-controlled next steps.
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
