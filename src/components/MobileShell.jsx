import { ArrowRight, Bot } from "lucide-react";
import { tabItems } from "../lib/uiConfig";

export function MobileShell({
  activeTab,
  mobileParentSnapshots,
  mobileQuickActions,
  onOpenFamily,
  onOpenLesson,
  onSelectChild,
  onSelectTab,
  onToggleBodyBoundaries,
  recommendedLesson,
  selectedChild,
  selectedChildOverallTargetProgress,
  selectedChildWorkspace,
  selectedCoachStyle,
  selectedWeeklyTarget,
  bodyBoundariesUnlocked,
  childProfiles,
}) {
  return (
    <>
      <section className="page-width app-mobile-learner-shell">
        <div className="mobile-learner-summary">
          <div className="mobile-learner-copy">
            <p className="eyebrow eyebrow-dark">Active learner</p>
            <h2>{selectedChild.name}</h2>
            <p>
              Age {selectedChild.age} · Grade {selectedChild.grade} ·{" "}
              {selectedChild.levelTitle}
            </p>
          </div>

          <div className="mobile-coach-pill">
            <Bot size={16} />
            <span>{selectedChild.coachLens}</span>
          </div>
        </div>

        <div className="mobile-profile-row" aria-label="Learner switcher">
          {childProfiles.map((child) => (
            <button
              key={child.id}
              className={`mobile-profile-chip ${
                child.id === selectedChild.id ? "is-selected" : ""
              }`}
              onClick={() => onSelectChild(child.id)}
              type="button"
            >
              <strong>{child.name}</strong>
              <span>
                Age {child.age} · {child.levelTitle}
              </span>
            </button>
          ))}
        </div>

        <div className="mobile-resume-strip">
          <div className="mobile-resume-head">
            <div>
              <p className="eyebrow eyebrow-dark">Resume for {selectedChild.name}</p>
              <h3>{recommendedLesson?.lesson.title ?? "Choose the next lesson"}</h3>
            </div>
            <div className="mobile-progress-pill">
              <span>
                {selectedChildWorkspace.weeklyLessonCount}/{selectedWeeklyTarget.lessons} lessons
              </span>
            </div>
          </div>

          <div className="mobile-best-move">
            <p>Today&apos;s best move</p>
            <strong>
              {recommendedLesson
                ? `${recommendedLesson.reason} in ${recommendedLesson.track.title}`
                : "Open the course library and pick the next lesson"}
            </strong>
            <span>
              {recommendedLesson
                ? recommendedLesson.lesson.summary
                : selectedChild.supportSpot}
            </span>
          </div>

          <p className="mobile-resume-copy">
            {selectedChildWorkspace.supportMessage} The family coaching style is{" "}
            {selectedCoachStyle.title.toLowerCase()} this week.
          </p>

          <div className="summary-chip-row mobile-resume-meta">
            <span className="summary-chip">{selectedChildWorkspace.focusTrackTitle}</span>
            <span className="summary-chip">
              {selectedChildOverallTargetProgress}% week plan
            </span>
            <span className="summary-chip">{selectedChild.todayTheme}</span>
          </div>

          <div className="mobile-pulse-grid">
            {selectedChildWorkspace.pulseRows.map((item) => (
              <article key={item.id} className="mobile-pulse-card">
                <div className="mobile-pulse-head">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className="mobile-pulse-bar" aria-hidden="true">
                  <span style={{ width: `${item.progress}%` }} />
                </div>
                <em>{item.progress}% to target</em>
              </article>
            ))}
          </div>

          <div className="mobile-resume-actions">
            <button
              className="solid-button mobile-shell-button"
              onClick={() =>
                recommendedLesson
                  ? onOpenLesson(recommendedLesson.lesson.id)
                  : onSelectTab("courses")
              }
              type="button"
            >
              {recommendedLesson ? "Resume lesson" : "Open courses"}
              <ArrowRight size={16} />
            </button>
            <button
              className="ghost-button ghost-button-dark mobile-shell-button"
              onClick={() => onSelectTab("dashboard")}
              type="button"
            >
              See weekly plan
            </button>
          </div>
        </div>
      </section>

      <div className="app-mobile-nav-shell">
        <div className="page-width">
          <nav className="mobile-tab-row" aria-label="KidWiz sections">
            {tabItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  className={`mobile-tab-chip ${
                    activeTab === item.id ? "is-active" : ""
                  }`}
                  onClick={() => onSelectTab(item.id)}
                  type="button"
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <section className="page-width app-mobile-action-shell">
        <p className="eyebrow eyebrow-dark mobile-quick-action-eyebrow">
          Quick actions for {selectedChild.name}
        </p>
        <div className="mobile-quick-action-grid">
          {mobileQuickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.id}
                className="mobile-quick-action"
                onClick={action.onClick}
                type="button"
              >
                <div className="mobile-quick-action-top">
                  <Icon size={16} />
                  <span>{action.label}</span>
                </div>
                <strong>{action.title}</strong>
                <p>{action.copy}</p>
                <em>{action.meta}</em>
              </button>
            );
          })}
        </div>

        <div className="mobile-parent-shell">
          <div className="mobile-parent-head">
            <div>
              <p className="eyebrow eyebrow-dark">Parent controls</p>
              <h3>Protected family settings stay here.</h3>
            </div>
            <span className="mobile-parent-lock">
              {bodyBoundariesUnlocked
                ? "Sensitive track unlocked"
                : "Sensitive track locked"}
            </span>
          </div>

          <p className="mobile-parent-copy">
            Kid-facing next steps stay above. Use these controls for family setup,
            rhythm changes, and protected content decisions.
          </p>

          <div className="summary-chip-row mobile-parent-meta">
            {mobileParentSnapshots.map((item) => (
              <span key={item} className="summary-chip">
                {item}
              </span>
            ))}
          </div>

          <div className="mobile-parent-note">
            <strong>Parent note</strong>
            <span>
              {selectedChild.name} is pacing at {selectedChildOverallTargetProgress}% of
              this week&apos;s plan. Open Family Hub if you want to rebalance the
              targets or rotate the focus track.
            </span>
          </div>

          <div className="mobile-parent-actions">
            <button
              className="ghost-button ghost-button-dark mobile-shell-button"
              onClick={onOpenFamily}
              type="button"
            >
              Open Family Hub
            </button>
            <button
              className={`mobile-parent-toggle ${
                bodyBoundariesUnlocked ? "is-unlocked" : ""
              }`}
              onClick={onToggleBodyBoundaries}
              type="button"
            >
              <span>Sensitive track</span>
              <strong>{bodyBoundariesUnlocked ? "Unlocked" : "Locked"}</strong>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
