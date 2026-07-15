(() => {
  const countdown = document.querySelector(".launch-week-countdown");
  if (!countdown) return;

  const target = new Date(countdown.dataset.countdownTarget);
  if (Number.isNaN(target.getTime())) return;

  const units = {
    days: countdown.querySelector('[data-unit="days"]'),
    hours: countdown.querySelector('[data-unit="hours"]'),
    minutes: countdown.querySelector('[data-unit="minutes"]'),
    seconds: countdown.querySelector('[data-unit="seconds"]'),
  };

  const pad = (value) => String(value).padStart(2, "0");

  const tick = () => {
    const diff = target.getTime() - Date.now();

    if (diff <= 0) {
      window.location.reload();
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    units.days.textContent = days;
    units.hours.textContent = pad(hours);
    units.minutes.textContent = pad(minutes);
    units.seconds.textContent = pad(seconds);
  };

  tick();
  setInterval(tick, 1000);
})();
