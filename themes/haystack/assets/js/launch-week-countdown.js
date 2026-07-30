(() => {
  const pad = (value) => String(value).padStart(2, "0");

  const fillUnits = (root, diff) => {
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const daysEl = root.querySelector('[data-unit="days"]');
    const hoursEl = root.querySelector('[data-unit="hours"]');
    const minutesEl = root.querySelector('[data-unit="minutes"]');
    const secondsEl = root.querySelector('[data-unit="seconds"]');

    if (daysEl) daysEl.textContent = pad(days);
    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minutesEl) minutesEl.textContent = pad(minutes);
    if (secondsEl) secondsEl.textContent = pad(seconds);
  };

  const initOfficeHoursCard = () => {
    const card = document.querySelector(".office-hours-card");
    if (!card) return;

    const countdown = card.querySelector(".office-hours-countdown");
    const cta = card.querySelector("a.arrow-button");
    const liveText = card.dataset.liveCtaText;
    const liveUrl = card.dataset.liveCtaUrl;

    const goLive = () => {
      if (countdown) countdown.remove();
      card.classList.add("is-live");

      const meta = card.querySelector(".office-hours-meta");
      if (meta && !meta.querySelector(".office-hours-live-badge")) {
        const label = meta.querySelector(".office-hours-label");
        const badge = document.createElement("span");
        badge.className = "office-hours-live-badge";
        badge.textContent = "Happening now";
        if (label) {
          label.insertAdjacentElement("afterend", badge);
        } else {
          meta.appendChild(badge);
        }
      }

      if (cta && liveText && liveUrl) {
        cta.href = liveUrl;
        const textWrapper = cta.querySelector(".text-wrapper");
        if (textWrapper) textWrapper.textContent = liveText;
      }
    };

    if (!countdown) {
      goLive();
      return;
    }

    const target = new Date(
      countdown.dataset.countdownTarget || card.dataset.countdownTarget
    );
    if (Number.isNaN(target.getTime())) return;

    let timer;
    const tick = () => {
      const diff = target.getTime() - Date.now();

      if (diff <= 0) {
        clearInterval(timer);
        goLive();
        return;
      }

      fillUnits(countdown, diff);
    };

    tick();
    timer = setInterval(tick, 1000);
  };

  const initAnnouncementBar = () => {
    const bar = document.querySelector(".announcement-bar[data-countdown-target]");
    if (!bar || bar.classList.contains("is-live")) return;

    const countdown = bar.querySelector(".announcement-countdown");
    const preCopy = bar.querySelector(".announcement-copy-pre");
    const liveCopy = bar.querySelector(".announcement-copy-live");
    const liveText = bar.dataset.liveCtaText;
    const liveUrl = bar.dataset.liveCtaUrl;
    const target = new Date(bar.dataset.countdownTarget);
    if (Number.isNaN(target.getTime())) return;

    const goLive = () => {
      bar.classList.add("is-live");
      if (liveUrl) {
        bar.href = liveUrl;
        bar.target = "_blank";
        bar.rel = "noopener noreferrer";
      }
      if (preCopy) preCopy.hidden = true;
      if (liveCopy) liveCopy.hidden = false;
    };

    if (!countdown) {
      goLive();
      return;
    }

    let timer;
    const tick = () => {
      const diff = target.getTime() - Date.now();

      if (diff <= 0) {
        clearInterval(timer);
        goLive();
        return;
      }

      fillUnits(countdown, diff);
    };

    tick();
    timer = setInterval(tick, 1000);
  };

  initOfficeHoursCard();
  initAnnouncementBar();
})();
