(() => {
  const weekGrid = document.querySelector(".launch-week-week-grid");
  const detailCards = [...document.querySelectorAll(".launch-week-detail-card")];
  const detailSection = document.querySelector(".launch-week-detail-cards");
  if (!weekGrid || !detailCards.length) return;

  const dayButtons = weekGrid.querySelectorAll(".week-day-card");
  const defaultDay =
    weekGrid.querySelector(".week-day-card.is-active")?.dataset.day ||
    detailCards[0].dataset.day;

  // Only sync the week-grid highlight from scroll once the detail cards
  // are the main thing in view. Otherwise Day 1 (top of the list) steals
  // focus from the latest live day while the user is still in the hero/grid.
  let syncFromScroll = false;
  const ratios = new Map();

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

  const updateFromIntersections = () => {
    if (!syncFromScroll) {
      setActiveDay(defaultDay);
      return;
    }

    let bestDay = null;
    let bestRatio = -1;
    ratios.forEach((ratio, day) => {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestDay = day;
      }
    });
    if (bestDay != null) setActiveDay(bestDay);
  };

  dayButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const dayNum = btn.dataset.day;
      syncFromScroll = true;
      setActiveDay(dayNum);

      const target = document.getElementById(`launch-week-day-${dayNum}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const day = entry.target.dataset.day;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          ratios.set(day, entry.intersectionRatio);
        } else {
          ratios.delete(day);
        }
      });
      updateFromIntersections();
    },
    { threshold: [0.4, 0.6], rootMargin: "-20% 0px -40% 0px" }
  );

  detailCards.forEach((card) => cardObserver.observe(card));

  if (detailSection) {
    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        // Detail section has moved into the upper half of the viewport —
        // the user is browsing cards, so track whichever is centered.
        syncFromScroll = entry.boundingClientRect.top < window.innerHeight * 0.45;
        updateFromIntersections();
      },
      { threshold: [0, 0.05, 0.1, 0.25, 0.5, 0.75, 1] }
    );
    sectionObserver.observe(detailSection);
  }

  setActiveDay(defaultDay);
})();
