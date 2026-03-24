(function () {
  const body = document.body;
  const page = document.querySelector(".weekly-page");
  const controls = document.querySelectorAll("[data-set-mode]");
  const panelButtons = document.querySelectorAll("[data-panel-target]");
  const stateChips = document.querySelectorAll(".state-chip");
  const panelHandlersKey = "__weeklyPanelHandlersAttached";

  function syncPanels() {
    if (!page) {
      return;
    }

    panelButtons.forEach((button) => {
      const key = button.dataset.panelTarget === "left" ? "leftOpen" : "rightOpen";
      const isOpen = page.dataset[key] !== "false";
      button.classList.toggle("active", isOpen);
      button.setAttribute("aria-pressed", String(isOpen));
    });
  }

  function setMode(mode) {
    body.dataset.mode = mode;

    stateChips.forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.modeLabel === mode);
    });

    document.querySelectorAll("[data-show]").forEach((node) => {
      const modes = node.dataset.show.split(" ");
      node.style.display = modes.includes(mode) ? "" : "none";
    });

    document.querySelectorAll("[data-state]").forEach((node) => {
      node.style.display = node.dataset.state === mode ? "" : "none";
    });
  }

  function togglePanel(panel) {
    if (!page) {
      return;
    }

    const key = panel === "left" ? "leftOpen" : "rightOpen";
    page.dataset[key] = page.dataset[key] === "false" ? "true" : "false";
    syncPanels();
  }

  controls.forEach((control) => {
    control.addEventListener("click", () => {
      setMode(control.dataset.setMode);
    });
  });

  panelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      togglePanel(button.dataset.panelTarget);
    });
  });

  window[panelHandlersKey] = true;

  setMode(body.dataset.mode || "base");
  syncPanels();
})();
