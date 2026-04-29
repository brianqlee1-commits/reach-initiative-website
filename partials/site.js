// Inject shared nav + footer into pages. Mark active nav link via data-page on <body>.
(async () => {
  const root = document.documentElement.dataset.root || "../";
  async function inject(slot, file) {
    const el = document.querySelector(slot);
    if (!el) return;
    const res = await fetch(file);
    el.innerHTML = await res.text();
  }
  await Promise.all([
    inject("#site-nav", "../partials/_nav.html"),
    inject("#site-footer", "../partials/_footer.html"),
  ]);
  const active = document.body.dataset.page;
  if (active) {
    const link = document.querySelector(`.nav-links a[data-page="${active}"]`);
    if (link) link.classList.add("active");
  }
  if (window.lucide) window.lucide.createIcons();
})();
