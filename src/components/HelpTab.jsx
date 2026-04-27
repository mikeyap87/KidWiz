import {
  ArrowRight,
  Bot,
  ClipboardList,
  Compass,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

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
      </div>

      <div className="help-content-grid">
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
              <span>Use parent controls for weekly targets, sensitive topics, and local testing resets.</span>
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
            <h2>Common fixes</h2>
          </div>
          <div className="help-feature-list">
            <div>
              <strong>Too much at once?</strong>
              <span>Restart the dashboard tour and follow the three highlighted areas.</span>
            </div>
            <div>
              <strong>Wrong family plan?</strong>
              <span>Restart guided setup or change rhythm and goals in Family Hub.</span>
            </div>
            <div>
              <strong>Need a clean review?</strong>
              <span>Use Family Hub to reset the family workspace or generate a fresh week.</span>
            </div>
          </div>
          <button className="inline-action" onClick={onOpenDashboard} type="button">
            Return to Dashboard
            <RefreshCw size={14} />
          </button>
        </article>
      </div>
    </section>
  );
}
