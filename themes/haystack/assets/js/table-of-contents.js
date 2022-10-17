// Add active class to table of contents links on scroll
window.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");
      if (entry.intersectionRatio > 0) {
        document
          .querySelector(`#TableOfContents > ul > li > a[href*="${id}"]`)
          .classList.add("active");
      } else {
        document
          .querySelector(`#TableOfContents > ul > li > a[href*="${id}"]`)
          .classList.remove("active");
      }
    });
  });

  // Track every h2 that has an id
  document.querySelectorAll("h2[id]").forEach((h) => {
    observer.observe(h);
  });
});
