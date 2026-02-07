(() => {
  const toggleButton = document.querySelector(".preview-toggle");
  if (!toggleButton) return;

  const updateState = (enabled) => {
    document.body.classList.toggle("is-mobile-preview", enabled);
    toggleButton.setAttribute("aria-pressed", String(enabled));
    toggleButton.textContent = enabled ? "Vista desktop" : "Vista telefono";
  };

  const stored = localStorage.getItem("mobilePreview") === "true";
  updateState(stored);

  toggleButton.addEventListener("click", () => {
    const next = !document.body.classList.contains("is-mobile-preview");
    localStorage.setItem("mobilePreview", String(next));
    updateState(next);
  });
})();
