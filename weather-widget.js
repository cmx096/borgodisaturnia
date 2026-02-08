(() => {
  const widget = document.querySelector(".global-weather");
  const visitorWidget = document.getElementById("visitor-widget");
  const visitorWidgetState = "visitor-widget-collapsed";
  if (!widget) return;

  const weatherValue = widget.querySelector(".global-weather-value");
  const thermalValue = widget.querySelector(".global-weather-thermal");
  const weeklyPanel = widget.querySelector(".global-weather-weekly");
  const weeklyList = widget.querySelector(".global-weather-weekly-list");
  const weeklyStatus = widget.querySelector(".global-weather-weekly-status");
  const closeButton = widget.querySelector(".global-weather-close");
  const toggleButton = widget.querySelector(".global-weather-toggle");
  const thermalTemp = Number.parseFloat(widget.dataset.thermal) || 37.5;
  const degreeSymbol = "\u00b0";
  const bulletSymbol = "\u2022";
  const weatherStorageKey = "weather-widget-hidden";
  let minimizedButton = null;
  let latestCode = null;
  let latestTemp = null;

  const weatherLabels = {
    0: "Sereno",
    1: "Prevalentemente sereno",
    2: "Parzialmente nuvoloso",
    3: "Coperto",
    45: "Nebbia",
    48: "Nebbia con brina",
    51: "Pioviggine leggera",
    53: "Pioviggine moderata",
    55: "Pioviggine intensa",
    61: "Pioggia debole",
    63: "Pioggia moderata",
    65: "Pioggia forte",
    71: "Neve debole",
    73: "Neve moderata",
    75: "Neve intensa",
    80: "Rovesci leggeri",
    81: "Rovesci moderati",
    82: "Rovesci intensi",
    95: "Temporale",
    96: "Temporale con grandine",
    99: "Temporale con grandine",
  };

  const updateThermal = () => {
    if (!thermalValue) return;
    thermalValue.textContent = `Termale: ${thermalTemp.toFixed(1)}${degreeSymbol}C`;
  };

  const getIconKey = (code) => {
    if (code === 0) return "sun";
    if (code === 1 || code === 2) return "partly";
    if (code === 3) return "cloud";
    if (code === 45 || code === 48) return "fog";
    if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) return "rain";
    if (code >= 71 && code <= 75) return "snow";
    if (code >= 95) return "thunder";
    return "cloud";
  };

  const createIcon = (key, className) => {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.classList.add(className);

    const addPath = (d) => {
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    };

    const addCircle = (cx, cy, r) => {
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", r);
      svg.appendChild(circle);
    };

    const addLine = (x1, y1, x2, y2) => {
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      svg.appendChild(line);
    };

    switch (key) {
      case "sun":
        addCircle(12, 12, 4);
        addLine(12, 2, 12, 5);
        addLine(12, 19, 12, 22);
        addLine(2, 12, 5, 12);
        addLine(19, 12, 22, 12);
        addLine(4.2, 4.2, 6.3, 6.3);
        addLine(17.7, 17.7, 19.8, 19.8);
        addLine(4.2, 19.8, 6.3, 17.7);
        addLine(17.7, 6.3, 19.8, 4.2);
        break;
      case "partly":
        addCircle(8, 8, 3);
        addLine(8, 2.5, 8, 4.5);
        addLine(8, 11.5, 8, 13.5);
        addLine(2.5, 8, 4.5, 8);
        addLine(11.5, 8, 13.5, 8);
        addPath(
          "M18 15a4 4 0 0 0-4-4h-1.3a4.5 4.5 0 0 0-8.2 1.5A3.5 3.5 0 0 0 5 15h13z"
        );
        break;
      case "fog":
        addPath(
          "M18 12a4 4 0 0 0-8 0H6a4 4 0 1 0 0 8h12a4 4 0 0 0 0-8z"
        );
        addLine(3, 18, 13, 18);
        addLine(5, 21, 15, 21);
        break;
      case "rain":
        addPath(
          "M18 12a4 4 0 0 0-8 0H6a4 4 0 1 0 0 8h12a4 4 0 0 0 0-8z"
        );
        addLine(8, 18, 8, 22);
        addLine(12, 18, 12, 22);
        addLine(16, 18, 16, 22);
        break;
      case "snow":
        addPath(
          "M18 12a4 4 0 0 0-8 0H6a4 4 0 1 0 0 8h12a4 4 0 0 0 0-8z"
        );
        addLine(9, 18, 9, 21);
        addLine(12, 19, 12, 22);
        addLine(15, 18, 15, 21);
        break;
      case "thunder":
        addPath("M18 12a4 4 0 0 0-8 0H6a4 4 0 1 0 0 8h8");
        addPath("M12 16l-3 5 4-2-2 5");
        break;
      default:
        addPath(
          "M18 12a4 4 0 0 0-8 0H6a4 4 0 1 0 0 8h12a4 4 0 0 0 0-8z"
        );
        break;
    }

    return svg;
  };

  const buildMinimizedButton = () => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "global-weather-min";
    button.setAttribute("aria-label", "Apri meteo");
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      setWidgetHidden(false);
      if (window.localStorage) {
        window.localStorage.setItem(weatherStorageKey, "0");
      }
    });
    return button;
  };

  const updateMinimized = () => {
    if (!minimizedButton) return;
    minimizedButton.innerHTML = "";
    const icon = createIcon(
      getIconKey(latestCode ?? 3),
      "global-weather-min-icon"
    );
    minimizedButton.appendChild(icon);
    if (Number.isFinite(latestTemp)) {
      const temp = document.createElement("span");
      temp.className = "global-weather-min-temp";
      temp.textContent = `${latestTemp}${degreeSymbol}`;
      minimizedButton.appendChild(temp);
    }
  };

  const showMinimized = () => {
    if (!minimizedButton) {
      minimizedButton = buildMinimizedButton();
    }
    updateMinimized();
    if (!document.body.contains(minimizedButton)) {
      document.body.appendChild(minimizedButton);
    }
  };

  const hideMinimized = () => {
    if (!minimizedButton) return;
    minimizedButton.remove();
  };

  const formatDay = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("it-IT", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    }).format(date);
  };

  const renderWeekly = (daily) => {
    if (!weeklyList) return;
    weeklyList.innerHTML = "";
    if (!daily || !daily.time) {
      if (weeklyStatus) {
        weeklyStatus.textContent = "Previsioni non disponibili.";
      }
      return;
    }
    const count = Math.min(7, daily.time.length);
    for (let i = 0; i < count; i += 1) {
      const day = formatDay(daily.time[i]);
      const max = Math.round(daily.temperature_2m_max?.[i] ?? 0);
      const min = Math.round(daily.temperature_2m_min?.[i] ?? 0);
      const code = daily.weather_code?.[i];
      const label = weatherLabels[code] || "Variabile";

      const item = document.createElement("li");
      item.className = "global-weather-weekly-item";

      const dayLabel = document.createElement("span");
      dayLabel.className = "global-weather-weekly-day";
      dayLabel.textContent = day;

      const icon = createIcon(getIconKey(code), "global-weather-weekly-icon");

      const temps = document.createElement("span");
      temps.className = "global-weather-weekly-temps";
      temps.textContent = `${min}${degreeSymbol}/${max}${degreeSymbol}`;

      const desc = document.createElement("span");
      desc.className = "global-weather-weekly-label";
      desc.textContent = label;

      item.append(dayLabel, icon, temps, desc);
      weeklyList.appendChild(item);
    }
    if (weeklyStatus) {
      weeklyStatus.textContent = "";
    }
  };

  const fetchWeather = async () => {
    if (!weatherValue) return;
    try {
      const url =
        "https://api.open-meteo.com/v1/forecast?latitude=42.655&longitude=11.507&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Europe%2FRome";
      const response = await fetch(url);
      if (!response.ok) throw new Error("weather_error");
      const data = await response.json();
      const current = data.current;
      if (!current) throw new Error("weather_missing");
      const temp = Math.round(current.temperature_2m);
      const label = weatherLabels[current.weather_code] || "Variabile";
      latestTemp = temp;
      latestCode = current.weather_code;
      const icon = createIcon(
        getIconKey(current.weather_code),
        "global-weather-icon"
      );
      const text = document.createElement("span");
      text.className = "global-weather-text";
      text.textContent = `Meteo: ${temp}${degreeSymbol}C ${bulletSymbol} ${label}`;
      weatherValue.textContent = "";
      weatherValue.append(icon, text);
      updateMinimized();
      renderWeekly(data.daily);
    } catch (error) {
      weatherValue.textContent = "Meteo non disponibile";
      if (weeklyStatus) {
        weeklyStatus.textContent = "Previsioni non disponibili.";
      }
    }
  };

  const setWidgetHidden = (hidden) => {
    widget.classList.toggle("is-hidden", hidden);
    widget.setAttribute("aria-hidden", String(hidden));
    if (hidden) {
      showMinimized();
    } else {
      hideMinimized();
    }
  };

  const setWeeklyOpen = (open) => {
    if (!weeklyPanel) return;
    weeklyPanel.hidden = !open;
    widget.classList.toggle("is-open", open);
    if (toggleButton) {
      toggleButton.setAttribute("aria-expanded", String(open));
    }
  };

  const closeVisitorWidget = () => {
    if (!visitorWidget) return;
    if (visitorWidget.classList.contains("is-collapsed")) return;
    visitorWidget.classList.add("is-collapsed");
    if (window.localStorage) {
      window.localStorage.setItem(visitorWidgetState, "1");
    }
  };

  let scrollTicking = false;
  const handleScrollClose = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      scrollTicking = false;
      if (widget && widget.classList.contains("is-open")) {
        setWeeklyOpen(false);
      }
      closeVisitorWidget();
    });
  };

  const toggleWeekly = () => {
    const isOpen = widget.classList.contains("is-open");
    setWeeklyOpen(!isOpen);
  };

  if (toggleButton) {
    if (weeklyPanel && weeklyPanel.id) {
      toggleButton.setAttribute("aria-controls", weeklyPanel.id);
    }
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      event.preventDefault();
      toggleWeekly();
    });

    toggleButton.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleWeekly();
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      setWeeklyOpen(false);
      setWidgetHidden(true);
      if (window.localStorage) {
        window.localStorage.setItem(weatherStorageKey, "1");
      }
    });
  }

  document.addEventListener("click", (event) => {
    if (widget.contains(event.target)) return;
    setWeeklyOpen(false);
  });

  window.addEventListener("scroll", handleScrollClose, { passive: true });

  updateThermal();
  fetchWeather();
  setInterval(fetchWeather, 20 * 60 * 1000);

  if (window.localStorage) {
    const isHidden = window.localStorage.getItem(weatherStorageKey) === "1";
    if (isHidden) {
      setWidgetHidden(true);
    }
  }
})();
