import { Bot } from "lucide-react";
import { tabItems } from "../lib/uiConfig";

export function AppTopbar({
  appZoneLabel,
  cloudSyncStatus,
  currentTab,
  familyName,
  sessionEmail,
  onLogout,
}) {
  const Icon = currentTab.icon;

  return (
    <header className="app-topbar">
      <div className="page-width app-topbar-inner">
        <div className="brand-lockup brand-lockup-dark">
          <img
            className="brand-logo-image"
            src="/brand/kidwiz-logo.svg"
            alt="KidWiz"
          />
          <div>
            <p className="brand-subtitle">
              {familyName} · {sessionEmail} · Family workspace
            </p>
          </div>
        </div>

        <div className="app-topbar-actions">
          <div className="mode-pill">
            <Icon size={16} />
            <span>{currentTab.label}</span>
          </div>
          <div className="zone-pill">{appZoneLabel}</div>
          {cloudSyncStatus ? (
            <div
              className={`cloud-sync-pill is-${cloudSyncStatus.tone}`}
              title={cloudSyncStatus.detail}
            >
              <span>{cloudSyncStatus.label}</span>
            </div>
          ) : null}
          <button className="ghost-button ghost-button-dark" onClick={onLogout}>
            Back to site
          </button>
        </div>
      </div>
    </header>
  );
}

export function AppSidebar({
  activeTab,
  childProfiles,
  onSelectChild,
  onSelectTab,
  selectedChild,
  selectedCoachStyle,
}) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-block">
        <p className="eyebrow eyebrow-dark">Active learner</p>
        <div className="profile-grid">
          {childProfiles.map((child) => (
            <button
              key={child.id}
              className={`profile-chip ${
                child.id === selectedChild.id ? "is-selected" : ""
              }`}
              onClick={() => onSelectChild(child.id)}
              type="button"
            >
              <div>
                <strong>{child.name}</strong>
                <span>
                  Age {child.age} · Grade {child.grade}
                </span>
              </div>
              <em>{child.levelTitle}</em>
            </button>
          ))}
        </div>
      </div>

      <nav className="sidebar-block tab-list" aria-label="KidWiz sections">
        {tabItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={`tab-button ${activeTab === item.id ? "is-active" : ""}`}
              onClick={() => onSelectTab(item.id)}
              type="button"
            >
              <span>
                <Icon size={16} />
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-block coach-block">
        <div className="coach-heading">
          <Bot size={18} />
          <h2>Spark Coach</h2>
        </div>
        <p>
          {selectedChild.name} does best with {selectedChild.coachLens}. The
          current family setting is {selectedCoachStyle.title.toLowerCase()}.
        </p>
      </div>
    </aside>
  );
}
