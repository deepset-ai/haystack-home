// Handles filtering of tutorials by category on /tutorials page
document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".tutorial-card");

  filterButtons.forEach((filterBtn) => {
    // Get category from btn text
    const category = filterBtn.textContent.toLowerCase().trim();

    // Listen for clicks
    filterBtn.addEventListener("click", () => {
      // If category is enabled, disable it and hide related tutorials
      if (filterBtn.classList.contains("enabled")) {
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
