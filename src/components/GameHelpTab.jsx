import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  Map,
  MessagesSquare,
  NotebookPen,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import {
  launchGateChecks,
  parentLaunchProofSteps,
  parentPrivacyPromise,
  productionReadinessMilestones,
  retentionPolicyDraft,
} from "../data/releaseReadinessData";

const gameNavItems = [
  { id: "dashboard", label: "Today", icon: Target },
  { id: "overview", label: "Map", icon: Map },
  { id: "courses", label: "Learn", icon: Brain },
  { id: "coach", label: "Tutor", icon: Bot },
  { id: "stories", label: "Story", icon: MessagesSquare },
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "family", label: "Parent", icon: Users },
];

function compactCopy(text, maxLength = 84) {
  if (!text || text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trim()}...`;
}

export function HelpTab({
  aiServerStatus,
  cloudSyncStatus,
  onExitDemo,
  onOpenCoach,
  onOpenDashboard,
  onOpenFamily,
  onRestartDashboardTour,
  onRestartOnboarding,
  onSelectTab,
  selectedChild,
  selectedGoals,
  selectedRhythm,
}) {
  const aiStatusLabel = aiServerStatus.configured
    ? "Live AI ready"
    : "Live AI off";
  const productionReadyCount = productionReadinessMilestones.filter(
    (item) => item.tone === "good",
  ).length;
  const launchGateActionMap = {
    coach: onOpenCoach,
    dashboard: onOpenDashboard,
    family: onOpenFamily,
  };
  const goalLabel = selectedGoals.length
    ? selectedGoals.map((goal) => goal.title).join(", ")
    : "Family goals";

  return (
    <section className="kidwiz-game-shell game-help-room" aria-label="KidWiz help room">
      <header className="game-hud">
        <div className="game-brand">
          <img alt="KidWiz" src="/brand/kidwiz-logo.svg" />
          <div>
            <p>Launch support room</p>
            <h1>Help and readiness</h1>
          </div>
        </div>

        <div className="game-hud-stats" aria-label="Help status">
          <span className="game-stat">
            <strong>{aiStatusLabel}</strong>
            tutor
          </span>
          <span className="game-stat">
            <strong>{productionReadyCount}/{productionReadinessMilestones.length}</strong>
            launch
          </span>
          <span className="game-stat">
            <strong>{cloudSyncStatus?.label ?? "Local demo"}</strong>
            sync
          </span>
          <span className="game-stat">
            <strong>{selectedRhythm.title}</strong>
            rhythm
          </span>
        </div>
      </header>

      <div className="game-board game-help-board">
        <nav className="game-rail" aria-label="KidWiz game areas">
          {gameNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <main className="game-help-stage" aria-label="Help stage">
          <section className="game-family-mission game-help-mission">
            <div>
              <p>Fastest useful path</p>
              <h2>Get one safe win for {selectedChild.name}.</h2>
              <span>
                Setup should choose the plan, Today should pick the next move,
                and Parent should adjust trust controls.
              </span>
            </div>
            <div className="game-family-mission-actions">
              <button className="solid-button game-save-button" onClick={onOpenDashboard} type="button">
                Open Today
              </button>
              {onExitDemo ? (
                <button
                  className="ghost-button ghost-button-dark"
                  onClick={onExitDemo}
                  type="button"
                >
                  Public site
                </button>
              ) : null}
            </div>
          </section>

          <section className="game-help-grid" aria-label="Help actions">
            <button className="game-help-card" onClick={onRestartOnboarding} type="button">
              <Target size={18} />
              <p>Start over</p>
              <strong>Restart guided setup</strong>
              <span>{goalLabel}</span>
            </button>
            <button className="game-help-card" onClick={onRestartDashboardTour} type="button">
              <Map size={18} />
              <p>Tour</p>
              <strong>Replay the parent cockpit</strong>
              <span>Review the first demo path without changing data.</span>
            </button>
            <button className="game-help-card" onClick={onOpenFamily} type="button">
              <Users size={18} />
              <p>Controls</p>
              <strong>Open Parent room</strong>
              <span>Rhythm, goals, safety, and reset tools live there.</span>
            </button>
            <button className="game-help-card" onClick={onOpenCoach} type="button">
              <Bot size={18} />
              <p>AI safety</p>
              <strong>Review Tutor room</strong>
              <span>{aiServerStatus.model ?? "KidWiz tutor model"}</span>
            </button>
          </section>

          <section className="game-launch-gate" aria-label="KidWiz launch gate">
            {launchGateChecks.map((item) => {
              const action = launchGateActionMap[item.action] ?? onOpenDashboard;

              return (
                <article key={item.id} className={`game-launch-card is-${item.tone}`}>
                  <Rocket size={18} />
                  <div>
                    <p>{item.label}</p>
                    <strong>{item.status}</strong>
                    <span>{compactCopy(item.copy, 92)}</span>
                  </div>
                  <button onClick={action} type="button">
                    {item.actionLabel}
                  </button>
                </article>
              );
            })}
          </section>

          <p className="game-launch-note">
            Local demo is ready for review. Public child launch still needs durable accounts,
            privacy rules, and repeated AI-safety evidence.
          </p>
        </main>

        <aside className="game-console" aria-label="Help checklist console">
          <div className="game-console-tabs" role="tablist">
            <button className="is-active" type="button">Proof</button>
            <button onClick={onOpenCoach} type="button">AI</button>
            <button onClick={onOpenFamily} type="button">Parent</button>
          </div>

          <div className="game-console-panel">
            <div className="game-console-hero">
              <ShieldCheck size={22} />
              <div>
                <p>Launch proof</p>
                <h2>{productionReadyCount}/{productionReadinessMilestones.length} layers ready</h2>
              </div>
            </div>
            <article className="game-signal-card">
              <p>AI status</p>
              <strong>{aiStatusLabel}</strong>
              <span>{aiServerStatus.statusText}</span>
            </article>
            <article className="game-signal-card">
              <p>Family data</p>
              <strong>{cloudSyncStatus?.label ?? "Local demo"}</strong>
              <span>{cloudSyncStatus?.detail ?? "Saved in this browser."}</span>
            </article>
            <div className="game-help-checklist">
              {parentLaunchProofSteps.slice(0, 5).map((step) => (
                <span key={step}>
                  <CheckCircle2 size={15} />
                  {step}
                </span>
              ))}
            </div>
            <div className="game-privacy-mini" aria-label="Parent privacy launch decisions">
              {parentPrivacyPromise.slice(0, 4).map((item) => (
                <span key={item.label}>
                  <ShieldCheck size={14} />
                  <strong>{item.label}</strong>
                </span>
              ))}
            </div>
            <div className="game-retention-mini" aria-label="KidWiz data retention draft">
              {retentionPolicyDraft.slice(0, 2).map((item) => (
                <span key={item.label}>
                  <strong>{item.label}</strong>
                  {item.window}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <footer className="game-action-bar" aria-label="Help actions">
        {onExitDemo ? (
          <button onClick={onExitDemo} type="button">
            <ArrowRight size={16} />
            Public site
          </button>
        ) : null}
        <button onClick={onOpenDashboard} type="button">
          <LayoutDashboard size={16} />
          Today
        </button>
        <button onClick={onOpenCoach} type="button">
          <Bot size={16} />
          Tutor
        </button>
        <button onClick={onOpenFamily} type="button">
          <Users size={16} />
          Parent
        </button>
        <button onClick={onRestartDashboardTour} type="button">
          <RefreshCw size={16} />
          Tour
        </button>
        <button onClick={onRestartOnboarding} type="button">
          <ClipboardList size={16} />
          Setup
        </button>
        <button onClick={onOpenDashboard} type="button">
          <ArrowRight size={16} />
          Go
        </button>
      </footer>
    </section>
  );
}
