/**
 * Student Resources library filter (src/components/ResourceLibrary.astro).
 *
 * The library is a complete grouped list without JavaScript. This module reveals the filter bar
 * and wires it up: one category at a time ("All" by default) plus an independent "Free only"
 * toggle. Buttons use aria-pressed; a role="status" line announces "N resources shown". Groups
 * with nothing to show are hidden. A link to something the filter is hiding (e.g. #lib-reading)
 * clears the filter first, so in-page links always land.
 */

const lib = document.querySelector<HTMLElement>('[data-lib]');

if (lib) {
  const bar = lib.querySelector<HTMLElement>('[data-lib-bar]');
  const catButtons = [...lib.querySelectorAll<HTMLButtonElement>('[data-filter-cat]')];
  const freeButton = lib.querySelector<HTMLButtonElement>('[data-filter-free]');
  const status = lib.querySelector<HTMLElement>('[data-lib-status]');
  const empty = lib.querySelector<HTMLElement>('[data-lib-empty]');
  const reset = lib.querySelector<HTMLButtonElement>('[data-lib-reset]');
  const items = [...lib.querySelectorAll<HTMLElement>('[data-res]')];
  const groups = [...lib.querySelectorAll<HTMLElement>('[data-group]')];

  if (bar && freeButton && status && catButtons.length && items.length) {
    let category = 'all';
    let freeOnly = false;

    const matches = (el: HTMLElement, cat: string, free: boolean) =>
      (cat === 'all' || el.dataset.cat === cat) && (!free || el.dataset.free === '1');
    const count = (cat: string, free: boolean) => items.filter((el) => matches(el, cat, free)).length;
    const labelOf = (cat: string) => catButtons.find((b) => b.dataset.filterCat === cat)?.dataset.label ?? '';

    const apply = (announce: boolean) => {
      let shown = 0;
      for (const el of items) {
        const ok = matches(el, category, freeOnly);
        el.hidden = !ok;
        if (ok) shown++;
      }
      for (const g of groups) g.hidden = !g.querySelector('[data-res]:not([hidden])');

      // Button states, and counts that preview what each choice would show.
      for (const b of catButtons) {
        const cat = b.dataset.filterCat ?? 'all';
        b.setAttribute('aria-pressed', String(cat === category));
        const n = b.querySelector('.lib-n');
        if (n) n.textContent = String(count(cat, freeOnly));
      }
      freeButton.setAttribute('aria-pressed', String(freeOnly));
      const freeN = freeButton.querySelector('.lib-n');
      if (freeN) freeN.textContent = String(count(category, true));

      if (empty) empty.hidden = shown > 0;

      if (announce) {
        const parts = [category === 'all' ? '' : labelOf(category), freeOnly ? 'free only' : ''].filter(Boolean);
        status.textContent = `${shown} ${shown === 1 ? 'resource' : 'resources'} shown${parts.length ? `: ${parts.join(', ')}` : ''}`;
      }
    };

    for (const b of catButtons) {
      b.addEventListener('click', () => {
        category = b.dataset.filterCat ?? 'all';
        apply(true);
      });
    }
    freeButton.addEventListener('click', () => {
      freeOnly = !freeOnly;
      apply(true);
    });
    reset?.addEventListener('click', () => {
      category = 'all';
      freeOnly = false;
      apply(true);
      catButtons[0]?.focus();
    });

    // In-page links into the library: clear the filter if it hides the target, before the jump.
    const clearIfHidden = (hash: string) => {
      if (!hash || hash.length < 2) return;
      let target: Element | null = null;
      try {
        target = document.getElementById(decodeURIComponent(hash.slice(1)));
      } catch {
        return;
      }
      if (target && lib.contains(target) && target.closest('[hidden]')) {
        category = 'all';
        freeOnly = false;
        apply(true);
      }
    };
    document.addEventListener('click', (e) => {
      const a = (e.target as Element | null)?.closest?.('a[href*="#"]');
      if (!(a instanceof HTMLAnchorElement)) return;
      if (a.pathname === location.pathname && a.origin === location.origin) clearIfHidden(a.hash);
    });
    addEventListener('hashchange', () => {
      const before = document.getElementById(location.hash.slice(1));
      const wasHidden = Boolean(before?.closest('[hidden]'));
      clearIfHidden(location.hash);
      if (wasHidden) before?.scrollIntoView();
    });

    bar.hidden = false;
    apply(false);
  }
}
