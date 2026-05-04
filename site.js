// Inject shared nav + footer into pages. Mark active nav link via data-page on <body>.
// Rewrites partial-relative hrefs/srcs so the SAME partial works from both:
//   - the project root (index.html, 404.html), and
//   - inside /pages/* (programs.html, donate.html, etc.)
//
// Each page declares its location with <html data-root="./"> (root) or
// <html data-root="../"> (inside /pages). Partials are AUTHORED as if they live
// inside /pages — same-folder filenames like "programs.html" and "../assets/x.png".
// At root, we strip leading "../" and add "pages/" to bare same-folder links.
(async () => {
  const root = document.documentElement.dataset.root || "../";
  const atRoot = root === "./" || root === "" || root === "/";

  async function inject(slot, file) {
    const el = document.querySelector(slot);
    if (!el) return;
    const res = await fetch(file);
    el.innerHTML = await res.text();
    fixupPaths(el);
  }

  // Rewrite hrefs/srcs inside an injected partial so they resolve from the
  // current page's location.
  function fixupPaths(scope) {
    if (!atRoot) return; // partials are already authored for /pages — nothing to do
    scope.querySelectorAll("[href], [src]").forEach(el => {
      ["href", "src"].forEach(attr => {
        if (!el.hasAttribute(attr)) return;
        const v = el.getAttribute(attr);
        // Skip absolute URLs, anchors, mailto, tel, and root-absolute paths
        if (/^(https?:|mailto:|tel:|#|\/)/i.test(v)) return;
        if (v.startsWith("../")) {
          // "../assets/x.png" -> "assets/x.png" when we're at root
          el.setAttribute(attr, v.slice(3));
        } else {
          // "programs.html" (a sibling page from /pages's POV) -> "pages/programs.html" at root
          el.setAttribute(attr, "pages/" + v);
        }
      });
    });
  }

  await Promise.all([
    inject("#site-nav", (atRoot ? "" : "../") + "partials/_nav.html"),
    inject("#site-footer", (atRoot ? "" : "../") + "partials/_footer.html"),
  ]);

  const active = document.body.dataset.page;
  if (active) {
    const link = document.querySelector(`.nav-links a[data-page="${active}"]`);
    if (link) link.classList.add("active");
  }
  if (window.lucide) window.lucide.createIcons();
})();
