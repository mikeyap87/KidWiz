import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardList,
  Compass,
  LayoutDashboard,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import {
  parentLaunchProofSteps,
  productionReadinessMilestones,
} from "../data/releaseReadinessData";

export function HelpTab({
  aiServerStatus,
  onOpenCoach,
  onOpenDashboard,
  onOpenFamily,
  onRestartDashboardTour,
  onRestartOnboarding,
  selectedChild,
  selectedGoals,
  selectedRhythm,
}) {
  const goalLabel = selectedGoals.length
    ? selectedGoals.map((goal) => goal.title).join(", ")
    : "your family goals";
  const aiStatusLabel = aiServerStatus.configured
    ? "Live AI ready"
    : "Live AI not configured";
  const productionReadyCount = productionReadinessMilestones.filter(
    (item) => item.tone === "good",
  ).length;
  const productionReadinessLabel = `${productionReadyCount}/${productionReadinessMilestones.length} launch layers ready`;

  return (
    <section className="workspace-band help-panel">
      <div className="help-hero">
        <div>
          <p className="eyebrow eyebrow-dark">KidWiz Help</p>
          <h1>Get from setup to one useful family win.</h1>
          <p>
            KidWiz works best when parents use setup to choose the plan, Dashboard
            to pick the next move, and Family Hub to adjust trust controls over time.
          </p>
        </div>
        <article className="help-status-card">
          <span>Current family plan</span>
          <strong>{goalLabel}</strong>
          <p>{selectedRhythm.title}: {selectedRhythm.copy}</p>
        </article>
        <article className="help-status-card help-release-card">
          <span>Production readiness</span>
          <strong>{productionReadinessLabel}</strong>
          <p>Strong local demo. Real families still need durable data, privacy policy, AI audit logs, and release QA.</p>
        </article>
      </div>

      <div className="help-quick-grid">
        <button className="help-action-card" onClick={onRestartOnboarding} type="button">
          <Target size={18} />
          <span>Start over</span>
          <strong>Restart guided setup</strong>
          <p>Choose goals, rhythm, coach tone, and a first-week plan again.</p>
        </button>
        <button className="help-action-card" onClick={onRestartDashboardTour} type="button">
          <Compass size={18} />
          <span>Tour</span>
          <strong>Restart dashboard tour</strong>
          <p>Review setup proof, the parent proof card, and Family Hub controls.</p>
        </button>
        <button className="help-action-card" onClick={onOpenFamily} type="button">
          <Users size={18} />
          <span>Controls</span>
          <strong>Open Family Hub</strong>
          <p>Adjust weekly targets, sensitive unlocks, family rhythm, and history.</p>
        </button>
        <button className="help-action-card" onClick={onOpenCoach} type="button">
          <Bot size={18} />
          <span>AI safety</span>
          <strong>Review Learning Studio</strong>
          <p>Check live-AI status, no-key fallback, parent summaries, and blocked-prompt handling.</p>
        </button>
      </div>

      <div className="help-content-grid">
        <article className="surface-panel help-section-card help-release-section">
          <div className="panel-head">
            <Rocket size={18} />
            <h2>Before real families</h2>
          </div>
          <div className="release-milestone-grid">
            {productionReadinessMilestones.map((item) => (
              <div
                key={item.id}
                className={`release-milestone-card is-${item.tone}`}
              >
                <span>{item.label}</span>
                <strong>{item.status}</strong>
                <p>{item.copy}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-panel help-section-card">
          <div className="panel-head">
            <ClipboardList size={18} />
            <h2>Fastest parent path</h2>
          </div>
          <ol className="help-step-list">
            <li>
              <strong>Finish guided setup.</strong>
              <span>Pick at least two goals, a weekly rhythm, and the coaching tone.</span>
            </li>
            <li>
              <strong>Check Dashboard.</strong>
              <span>Confirm the setup is active, then open one safe next lesson for {selectedChild.name}.</span>
            </li>
            <li>
              <strong>Review Family Hub.</strong>
              <span>Use parent controls for weekly targets, sensitive topics, and week reset tools.</span>
            </li>
          </ol>
        </article>

        <article className="surface-panel help-section-card">
          <div className="panel-head">
            <LayoutDashboard size={18} />
            <h2>Main sections</h2>
          </div>
          <div className="help-feature-list">
            <div>
              <strong>Dashboard</strong>
              <span>Parent proof, weekly outcomes, setup confirmation, and review queue.</span>
            </div>
            <div>
              <strong>Quest Hub</strong>
              <span>Child-facing mission path, rewards, rhythm checklist, and quick resume.</span>
            </div>
            <div>
              <strong>Courses</strong>
              <span>Guided lessons, visual practice, micro-challenges, and checkpoints.</span>
            </div>
            <div>
              <strong>Family Hub</strong>
              <span>Parent settings, trust review, archive tools, and tour restart controls.</span>
            </div>
          </div>
        </article>

        <article className="surface-panel help-section-card">
          <div className="panel-head">
            <Bot size={18} />
            <h2>Learning Studio</h2>
          </div>
          <div className="help-ai-status">
            <span>{aiStatusLabel}</span>
            <strong>{aiServerStatus.model ?? "KidWiz tutor model"}</strong>
          </div>
          <p className="panel-copy">
            Coach contains the KidWiz Learning Studio for lesson-scoped help,
            quizzes, alternate explanations, visual ideas, notebook cards, and
            parent-visible safety summaries.
          </p>
          <button className="inline-action" onClick={onOpenCoach} type="button">
            Open Coach
            <ArrowRight size={14} />
          </button>
        </article>

        <article className="surface-panel help-section-card">
          <div className="panel-head">
            <ShieldCheck size={18} />
            <h2>Launch proof checklist</h2>
          </div>
          <ol className="help-step-list launch-proof-list">
            {parentLaunchProofSteps.map((step) => (
              <li key={step}>
                <CheckCircle2 size={16} />
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <button className="inline-action" onClick={onOpenDashboard} type="button">
            Return to Dashboard
            <RefreshCw size={14} />
          </button>
        </article>
      </div>
    </section>
  );
}
