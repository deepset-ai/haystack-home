document.querySelectorAll('.nav-dropdown > button').forEach((button) => {
  const dropdown = button.closest('.nav-dropdown');
  const close = () => button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => button.setAttribute('aria-expanded', String(button.getAttribute('aria-expanded') !== 'true')));
  dropdown.addEventListener('focusout', (event) => { if (!dropdown.contains(event.relatedTarget)) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { close(); button.focus(); } });
});

document.querySelectorAll('.nav-toggle-btn').forEach((toggle) => {
  const menu = document.getElementById(toggle.getAttribute('aria-controls'));
  const set = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !menu.hidden) { set(false); toggle.focus(); } });
  menu.addEventListener('click', (event) => { if (event.target.closest('a')) set(false); });
  window.matchMedia('(min-width:901px)').addEventListener('change', (e) => { if (e.matches) set(false); });
});
