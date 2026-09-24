/**
 * Student Resources library filter (src/components/ResourceLibrary.astro).
 *
 * The library is a complete grouped list without JavaScript. This module reveals the filter bar
 * and wires it up: one category at a time ("All" by default) plus an independent "Free only"
 * toggle. Buttons use aria-pressed; a role="status" line shows and announces the count, naming
 * the filters as the buttons do ("Showing 2 of 40 resources: Summer programs, free only").
 * Groups with nothing to show are hidden. A link to something the filter is hiding (e.g.
 * #lib-reading) clears the filter first, so in-page links always land.
 *
 * The bar sticks under the site header. Choosing a filter from deep in the list jumps back to
 * the top of the library, so the results start at the first match instead of mid-list. The row
 * scrolls sideways on narrow screens; a fade marks the side with more buttons, and the pressed
 * button is scrolled into view.
 */

const lib = document.querySelector<HTMLElement>('[data-lib]');

if (lib) {
  const bar = lib.querySelector<HTMLElement>('[data-lib-bar]');
  const scroller = lib.querySelector<HTMLElement>('[data-lib-scroll]');
  const heading = lib.querySelector<HTMLElement>('#lib-filter-h');
  const catButtons = [...lib.querySelectorAll<HTMLButtonElement>('[data-filter-cat]')];
  const freeButton = lib.querySelector<HTMLButtonElement>('[data-filter-free]');
  const status = lib.querySelector<HTMLElement>('[data-lib-status]');
  const empty = lib.querySelector<HTMLElement>('[data-lib-empty]');
  const reset = lib.querySelector<HTMLButtonElement>('[data-lib-reset]');
  const items = [...lib.querySelectorAll<HTMLElement>('[data-res]')];
  const groups = [...lib.querySelectorAll<HTMLElement>('[data-group]')];
  const header = document.querySelector<HTMLElement>('.site-header');

  if (bar && scroller && heading && freeButton && status && catButtons.length && items.length) {
    let category = 'all';
    let freeOnly = false;
    const total = items.length;

    const matches = (el: HTMLElement, cat: string, free: boolean) =>
      (cat === 'all' || el.dataset.cat === cat) && (!free || el.dataset.free === '1');
    const count = (cat: string, free: boolean) => items.filter((el) => matches(el, cat, free)).length;
    const labelOf = (cat: string) => catButtons.find((b) => b.dataset.filterCat === cat)?.dataset.label ?? '';

    // ---- the sideways-scrolling row ----
    const markOverflow = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      const left = scroller.scrollLeft > 2;
      const right = max - scroller.scrollLeft > 2;
      if (left && right) bar.dataset.more = 'both';
      else if (left) bar.dataset.more = 'left';
      else if (right) bar.dataset.more = 'right';
      else delete bar.dataset.more;
    };
    /** Scroll the row (never the page) so a button is fully in view. */
    const revealInRow = (el: HTMLElement) => {
      const pad = 48; // clear of the fade
      const box = scroller.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      if (r.left < box.left + pad) scroller.scrollLeft -= box.left + pad - r.left;
      else if (r.right > box.right - pad) scroller.scrollLeft += r.right - (box.right - pad);
    };
    scroller.addEventListener('scroll', markOverflow, { passive: true });
    addEventListener('resize', markOverflow, { passive: true });

    // ---- sticky bar: back to the top of the results ----
    /** If the reader is below the start of the library, jump back so the heading shows. */
    const backToTop = () => {
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      const top = heading.getBoundingClientRect().top;
      if (top < headerBottom) {
        scrollTo({ top: scrollY + top - headerBottom - 12, behavior: 'instant' });
      }
    };

    /** Show what matches. `origin` is the button that was just used, kept in view in the row. */
    const apply = (announce: boolean, origin?: HTMLElement) => {
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

      // Keep the button just used (or else the pressed category) in view in the row.
      const inView = origin ?? catButtons.find((b) => b.dataset.filterCat === category);
      if (inView) revealInRow(inView);
      markOverflow();

      if (announce) {
        const parts = [category === 'all' ? '' : labelOf(category), freeOnly ? 'free only' : ''].filter(Boolean);
        status.textContent =
          shown === total && !parts.length
            ? `Showing all ${total} resources`
            : `Showing ${shown} of ${total} ${total === 1 ? 'resource' : 'resources'}${parts.length ? `: ${parts.join(', ')}` : ''}`;
      }
    };

    const choose = (origin?: HTMLElement) => {
      apply(true, origin);
      backToTop();
    };

    for (const b of catButtons) {
      b.addEventListener('click', () => {
        category = b.dataset.filterCat ?? 'all';
        choose(b);
      });
    }
    freeButton.addEventListener('click', () => {
      freeOnly = !freeOnly;
      choose(freeButton);
    });
    reset?.addEventListener('click', () => {
      category = 'all';
      freeOnly = false;
      choose();
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

    for (const el of lib.querySelectorAll<HTMLElement>('[data-lib-ui]')) el.hidden = false;
    bar.hidden = false;
    apply(false);
  }
}
