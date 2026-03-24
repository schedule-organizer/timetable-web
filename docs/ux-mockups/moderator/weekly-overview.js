(function () {
  const root = document.querySelector(".weekly-page");

  if (!root) {
    return;
  }

  const panelButtons = document.querySelectorAll("[data-panel-target]");
  const codesToggle = document.querySelector("[data-codes-toggle]");
  const codesToggleText = codesToggle ? codesToggle.querySelector(".icon-toggle-text") : null;
  const panelHandlersKey = "__weeklyPanelHandlersAttached";

  function togglePanel(panel) {
    const key = panel === "left" ? "leftOpen" : "rightOpen";
    root.dataset[key] = root.dataset[key] === "true" ? "false" : "true";

    panelButtons.forEach((button) => {
      if (button.dataset.panelTarget === panel) {
        const isOpen = root.dataset[key] === "true";
        button.classList.toggle("active", isOpen);
        button.setAttribute("aria-pressed", String(isOpen));
      }
    });
  }

  if (!window[panelHandlersKey]) {
    panelButtons.forEach((button) => {
      button.addEventListener("click", () => {
        togglePanel(button.dataset.panelTarget);
      });
    });
    window[panelHandlersKey] = true;
  }

  if (codesToggle) {
    codesToggle.addEventListener("click", () => {
      const next = root.dataset.teacherCodes === "true" ? "false" : "true";
      root.dataset.teacherCodes = next;
      const enabled = next === "true";
      codesToggle.classList.toggle("active", enabled);
      if (codesToggleText) {
        codesToggleText.textContent = enabled ? "On" : "Off";
      }
    });
  }
})();
