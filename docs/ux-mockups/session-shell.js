(function () {
  const body = document.body;

  if (!body) {
    return;
  }

  const path = window.location.pathname;
  const isModerator = path.includes("/moderator/");
  const isSystemAdmin = path.includes("/system-admin/");

  if (!isModerator && !isSystemAdmin) {
    return;
  }

  if (body.querySelector(".session-bar")) {
    return;
  }

  const pageTitle = (document.title || "Workflow").replace(/^SchediFlow\s*/i, "");
  const scope = (() => {
    const h1 = document.querySelector("h1");
    return h1 ? h1.textContent.trim() : pageTitle.trim();
  })();

  const config = isModerator
    ? {
        initials: "MU",
        name: "Moderator User",
        role: "Moderator",
        timeLabel: "Time",
        contextLabel: "Workflow",
        contextValue: scope,
      }
    : {
        initials: "SA",
        name: "System Admin User",
        role: "System admin",
        timeLabel: "Time",
        contextLabel: "Section",
        contextValue: scope,
      };

  const sessionBar = document.createElement("section");
  sessionBar.className = "session-bar";
  sessionBar.innerHTML = `
    <div class="session-user">
      <div class="avatar-badge">${config.initials}</div>
      <div>
        <strong>${config.name}</strong>
        <span>${config.role}</span>
      </div>
    </div>
    <div class="session-metadata">
      <div class="session-card">
        <label>${config.timeLabel}</label>
        <strong>${new Date().toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}</strong>
      </div>
      <div class="session-card">
        <label>${config.contextLabel}</label>
        <strong>${config.contextValue}</strong>
      </div>
    </div>
    <div class="session-actions">
      <button class="ghost-btn" type="button">Switch role</button>
      <button class="ghost-btn" type="button">Logout</button>
    </div>
  `;

  body.prepend(sessionBar);
})();
