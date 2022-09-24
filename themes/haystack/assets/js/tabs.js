// Handle tabbed content
document.addEventListener("DOMContentLoaded", () => {
  const tabbedContent = document.querySelectorAll(".tabbed-content-js");

  tabbedContent.forEach((tc) => {
    const tabLinks = tc.querySelectorAll("[data-tab-value]");
    const tabContent = tc.querySelectorAll("[data-tab-info]");

    tabLinks.forEach((tabLink) => {
      tabLink.addEventListener("click", () => {
        const target = tc.querySelector(tabLink.dataset.tabValue);

        tabLinks.forEach((tablink) => {
          tablink.classList.remove("active");
        });

        tabContent.forEach((tab) => {
          tab.classList.remove("active");
        });

        tabLink.classList.add("active");
        target.classList.add("active");
      });
    });
  });
});
