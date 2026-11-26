document.querySelectorAll('[data-catalog]').forEach((catalog) => {
  const input = catalog.querySelector('[data-search]');
  const select = catalog.querySelector('[data-filter]');
  const sort = catalog.querySelector('[data-sort]');
  const grid = catalog.querySelector('.resource-grid');
  const cards = [...catalog.querySelectorAll('[data-card]')];
  const count = catalog.querySelector('[data-count]');
  const apply = () => {
    const query = (input?.value || '').trim().toLowerCase();
    const filter = select?.value || 'all';
    let visible = 0;
    cards.forEach((card) => {
      const cats = (card.dataset.category || '').split('|');
      const match = (!query || card.textContent.toLowerCase().includes(query)) && (filter === 'all' || cats.includes(filter));
      card.hidden = !match;
      if (match) visible += 1;
    });
    if (count) count.textContent = `${visible} shown`;
  };
  const order = () => {
    const mode = sort?.value || 'default';
    const sorted = [...cards];
    if (mode === 'az') sorted.sort((a, b) => a.dataset.title.localeCompare(b.dataset.title));
    sorted.forEach((card) => grid.appendChild(card));
  };
  input?.addEventListener('input', apply);
  select?.addEventListener('change', apply);
  sort?.addEventListener('change', order);
});
