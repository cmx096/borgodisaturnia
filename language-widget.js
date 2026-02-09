(() => {
  const widget = document.querySelector(".language-widget");
  if (!widget) return;

  const buttons = Array.from(widget.querySelectorAll("[data-lang]"));
  const defaultLang = "it";
  const storedLang =
    window.localStorage?.getItem("preferredLanguage") || defaultLang;

  const setActive = (lang) => {
    buttons.forEach((button) => {
      const isActive = button.dataset.lang === lang;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const setTranslateCookie = (lang) => {
    const value = `/it/${lang}`;
    document.cookie = `googtrans=${value}; path=/`;
    document.cookie = `googtrans=${value}; path=/; SameSite=Lax`;
  };

  const applyLangToSelect = (lang) => {
    const select = document.querySelector("#google_translate_element select");
    if (!select) return false;
    select.value = lang;
    select.dispatchEvent(new Event("change"));
    return true;
  };

  const applyLanguage = (lang) => {
    if (!lang) return;
    setActive(lang);
    if (window.localStorage) {
      window.localStorage.setItem("preferredLanguage", lang);
    }
    setTranslateCookie(lang);
    if (applyLangToSelect(lang)) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (applyLangToSelect(lang) || tries > 20) {
        window.clearInterval(timer);
      }
    }, 250);
  };

  const closeWidget = () => {
    widget.classList.remove("is-open");
    widget.setAttribute("aria-expanded", "false");
  };

  const openWidget = () => {
    widget.classList.add("is-open");
    widget.setAttribute("aria-expanded", "true");
  };

  const toggleWidget = () => {
    if (widget.classList.contains("is-open")) {
      closeWidget();
    } else {
      openWidget();
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const isActive = button.classList.contains("is-active");
      if (isActive) {
        if (window.matchMedia("(min-width: 900px)").matches) {
          return;
        }
        toggleWidget();
        return;
      }
      applyLanguage(button.dataset.lang);
      if (!window.matchMedia("(min-width: 900px)").matches) {
        closeWidget();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!widget.contains(event.target)) {
      closeWidget();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeWidget();
    }
  });

  widget.setAttribute("aria-expanded", "false");
  setActive(storedLang);
  if (storedLang && storedLang !== defaultLang) {
    applyLanguage(storedLang);
  }
})();

window.googleTranslateElementInit = () => {
  if (!window.google || !window.google.translate) return;
  new window.google.translate.TranslateElement(
    {
      pageLanguage: "it",
      includedLanguages: "it,en,fr,de,es",
      autoDisplay: false,
    },
    "google_translate_element"
  );
};
