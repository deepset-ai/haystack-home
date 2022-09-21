// Handles filtering of tutorials by category on /tutorials page
document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".tutorial-card");

  filterButtons.forEach((filterBtn) => {
    // Get category from btn text
    const category = filterBtn.textContent.toLowerCase().trim();

    // Listen for clicks
    filterBtn.addEventListener("click", () => {
      // Check if any filter is disabled
      const filterDisabled = Array.from(filterButtons).find((btn) =>
        btn.classList.contains("disabled")
      );

      // If all filters are enabled, disable all except clicked
      if (!filterDisabled) {
        filterButtons.forEach((btn) => {
          if (!btn.classList.contains(`category-${category}`)) {
            btn.classList.remove("enabled");
            btn.classList.add("disabled");
          }
        });

        cards.forEach((card) => {
          if (!card.classList.contains(`category-${category}`)) {
            card.style.display = "none";
          }
        });

        // if the last filter gets disabled, re-enable all
      } else if (
        Array.from(filterButtons).filter((btn) =>
          btn.classList.contains("enabled")
        ).length === 1 &&
        filterBtn.classList.contains("enabled")
      ) {
        filterButtons.forEach((btn) => {
          btn.classList.remove("disabled");
          btn.classList.add("enabled");
        });

        cards.forEach((card) => {
          card.style.display = "flex";
        });
      } else if (filterBtn.classList.contains("enabled")) {
        // Else if category is enabled, disable it and hide related tutorials
        cards.forEach((card) => {
          if (card.classList.contains(`category-${category}`)) {
            card.style.display = "none";
          }
        });

        filterBtn.classList.remove("enabled");
        filterBtn.classList.add("disabled");

        // If category is disabled, enable it and show related tutorials
      } else if (filterBtn.classList.contains("disabled")) {
        cards.forEach((card) => {
          if (card.classList.contains(`category-${category}`)) {
            card.style.display = "flex";
          }
        });

        filterBtn.classList.remove("disabled");
        filterBtn.classList.add("enabled");
      }
    });
  });
});
