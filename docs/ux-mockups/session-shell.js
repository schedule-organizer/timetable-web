(function () {
  const body = document.body;

  if (!body) {
    return;
  }

  const path = window.location.pathname;
  const isModerator = path.includes("/moderator/");
  const isSystemAdmin = path.includes("/system-admin/");
  const isDailyOperations = path.includes("/daily-operations/");
  const isNotifications = path.includes("/notifications/");
  const isTimetableAccess = path.includes("/timetable-access/");
  const isSharedRoot = path.endsWith("/docs/ux-mockups/index.html") || /\/(auth-login|auth-register|auth-complete-registration|profile-management)\.html$/.test(path);
  const sessionRole = (body.dataset.sessionRole || "").toLowerCase();

  if (!isModerator && !isSystemAdmin && !isDailyOperations && !isNotifications && !isTimetableAccess && !isSharedRoot && !sessionRole) {
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

  const roleKey = sessionRole || (isModerator ? "moderator" : isSystemAdmin ? "system-admin" : isTimetableAccess ? "shared" : isDailyOperations ? "shared" : isNotifications ? "shared" : isSharedRoot ? "shared" : "teacher");

  const configByRole = {
    moderator: {
      initials: "MU",
      name: "Moderator User",
      role: "Moderator",
      timeLabel: "Time",
      contextLabel: "Workflow",
      contextValue: scope,
      switchLabel: "Switch role",
      logoutLabel: "Logout",
      switchTitle: "Switch moderator role",
      logoutTitle: "Logout moderator session",
      },
    "system-admin": {
      initials: "SA",
      name: "System Admin User",
      role: "System admin",
      timeLabel: "Time",
      contextLabel: "Section",
      contextValue: scope,
      switchLabel: "Switch role",
      logoutLabel: "Logout",
      switchTitle: "Switch admin role",
      logoutTitle: "Logout admin session",
      },
    shared: {
      initials: "NU",
      name: "Signed-in user",
      role: "User",
      timeLabel: "Time",
      contextLabel: "Center",
      contextValue: scope,
      switchLabel: "Switch role",
      logoutLabel: "Logout",
      switchTitle: "Switch active role",
      logoutTitle: "Logout current session",
      },
    teacher: {
      initials: "TP",
      name: "Teacher User",
      role: "Teacher",
      timeLabel: "Time",
      contextLabel: "Request",
      contextValue: scope,
      switchLabel: "Switch role",
      logoutLabel: "Logout",
      switchTitle: "Switch teacher role",
      logoutTitle: "Logout teacher session",
      },
  };

  const config = configByRole[roleKey] || configByRole.shared || configByRole.moderator;

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
      <button class="ghost-btn" type="button" title="${config.switchTitle}" aria-label="${config.switchTitle}">${config.switchLabel}</button>
      <button class="ghost-btn" type="button" title="${config.logoutTitle}" aria-label="${config.logoutTitle}">${config.logoutLabel}</button>
    </div>
  `;

  body.prepend(sessionBar);
})();
