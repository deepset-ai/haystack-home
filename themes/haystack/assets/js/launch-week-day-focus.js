(() => {
  const weekGrid = document.querySelector(".launch-week-week-grid");
  const detailCards = document.querySelectorAll(".launch-week-detail-card");
  if (!weekGrid || !detailCards.length) return;

  const dayButtons = weekGrid.querySelectorAll(".week-day-card");

  const setActiveDay = (dayNum) => {
    dayButtons.forEach((btn) => {
      const isActive = btn.dataset.day === String(dayNum);
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    detailCards.forEach((card) => {
      card.classList.toggle("is-focused", card.dataset.day === String(dayNum));
    });
  };

  dayButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const dayNum = btn.dataset.day;
      setActiveDay(dayNum);

      const target = document.getElementById(`launch-week-day-${dayNum}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Sync focus state on scroll (highlight the card nearest viewport center)
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          setActiveDay(entry.target.dataset.day);
        }
      });
    },
    { threshold: [0.4, 0.6], rootMargin: "-20% 0px -40% 0px" }
  );

  detailCards.forEach((card) => observer.observe(card));
})();
