import { Bot } from "lucide-react";
import { tabItems } from "../lib/uiConfig";

export function SiteLoading() {
  return (
    <div className="site-shell">
      <div className="page-width site-loading-shell">
        <div className="site-loading-card">
          <div className="brand-lockup">
            <img
              className="brand-logo-image"
              src="/brand/kidwiz-logo.svg"
              alt="KidWiz"
            />
            <div>
              <p className="site-loading-copy">
                Loading the family learning studio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkspaceLoading({ activeTab, title, copy }) {
  const activeLabel =
    tabItems.find((item) => item.id === activeTab)?.label ?? "KidWiz";
  const resolvedTitle = title ?? `Loading ${activeLabel}`;
  const resolvedCopy = copy ?? "Getting this KidWiz space ready.";

  return (
    <section className="workspace-band workspace-loading-band">
      <div className="panel-head">
        <Bot size={18} />
        <h2>{resolvedTitle}</h2>
      </div>
      <p className="panel-copy">{resolvedCopy}</p>
    </section>
  );
}

export function OnboardingLoading() {
  return (
    <div className="onboarding-shell">
      <div className="page-width">
        <WorkspaceLoading
          title="Loading family setup"
          copy="Getting your KidWiz rhythm, goals, and first week ready."
        />
      </div>
    </div>
  );
}
