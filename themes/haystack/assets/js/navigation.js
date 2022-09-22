//  Open & close mobile nav
export const navigation = () => {
  const navOpenButton = document.querySelector("button.nav-toggle-open");
  const navCloseButton = document.querySelector("button.nav-toggle-close");
  const nav = document.querySelector("nav.mobile-nav");

  navOpenButton.addEventListener("click", () => {
    nav.classList.add("open");
  });

  navCloseButton.addEventListener("click", (e) => {
    nav.classList.remove("open");
  });
};
