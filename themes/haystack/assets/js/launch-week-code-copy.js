(() => {
  const copyButtons = document.querySelectorAll(".launch-week-detail-card .code-copy-button");
  if (!copyButtons.length) return;

  copyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const code = button.closest(".code-window")?.querySelector(".code-content pre code");
      if (!code) return;

      navigator.clipboard.writeText(code.textContent.trim()).then(
        () => {
          button.classList.add("is-copied");
          button.setAttribute("aria-label", "Copied!");

          setTimeout(() => {
            button.classList.remove("is-copied");
            button.setAttribute("aria-label", "Copy code");
          }, 2000);
        },
        (error) => {
          console.error(error);
        }
      );
    });
  });
})();
