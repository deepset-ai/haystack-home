document.querySelectorAll('.nav-dropdown > button').forEach((button) => {
  const dropdown = button.closest('.nav-dropdown');
  const close = () => button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => button.setAttribute('aria-expanded', String(button.getAttribute('aria-expanded') !== 'true')));
  dropdown.addEventListener('focusout', (event) => { if (!dropdown.contains(event.relatedTarget)) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { close(); button.focus(); } });
});
