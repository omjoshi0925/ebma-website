/**
 * Student Resources library filter (src/components/ResourceLibrary.astro).
 *
 * The library is a complete grouped list without JavaScript. This module reveals the filter bar
 * and wires it up: one type at a time ("All types" by default), one level ("All levels", middle
 * school or high school, from each card's data-levels) and an independent "Free only" toggle.
 * They combine. Buttons use aria-pressed and show how many cards each choice would leave; a
 * role="status" line shows and announces the count, naming the filters as the buttons do
 * ("Showing 1 of 40 resources: Summer programs, middle school"). Groups with nothing to show are
 * hidden. The choice is kept in the URL (?type=summer&level=middle&free=1), so a teacher can share
 * a filtered list. A link to something the filters hide (e.g. #lib-reading) clears them first, so
 * in-page links always land.
 *
 * What stays under the site header while the library scrolls past: the whole bar when it is
 * short (two rows on a wide screen: at most 150px and a fifth of the window), otherwise the count
 * line, which then offers "Change filters" to go back up to the bar; on short windows, neither.
 * `--lib-stick` on the library is the height of whichever is stuck, so links and cards (and
 * keyboard focus) scroll clear of it.
 * Choosing a filter from deep in the list jumps back to the top of the library, so the results
 * start at the first match instead of mid-list.
 */

type Level = 'all' | 'middle' | 'high';

const lib = document.querySelector<HTMLElement>('[data-lib]');

if (lib) {
  const bar = lib.querySelector<HTMLElement>('[data-lib-bar]');
  const strip = lib.querySelector<HTMLElement>('[data-lib-strip]');
  const heading = lib.querySelector<HTMLElement>('#lib-filter-h');
  const catButtons = [...lib.querySelectorAll<HTMLButtonElement>('[data-filter-cat]')];
  const levelButtons = [...lib.querySelectorAll<HTMLButtonElement>('[data-filter-level]')];
  const freeButton = lib.querySelector<HTMLButtonElement>('[data-filter-free]');
  const status = lib.querySelector<HTMLElement>('[data-lib-status]');
  const jump = lib.querySelector<HTMLButtonElement>('[data-lib-jump]');
  const empty = lib.querySelector<HTMLElement>('[data-lib-empty]');
  const reset = lib.querySelector<HTMLButtonElement>('[data-lib-reset]');
  const items = [...lib.querySelectorAll<HTMLElement>('[data-res]')];
  const groups = [...lib.querySelectorAll<HTMLElement>('[data-group]')];
  const header = document.querySelector<HTMLElement>('.site-header');

  if (bar && strip && heading && freeButton && status && jump && catButtons.length && levelButtons.length && items.length) {
    let category = 'all';
    let level: Level = 'all';
    let freeOnly = false;
    const total = items.length;

    const matches = (el: HTMLElement, cat: string, lvl: Level, free: boolean) =>
      (cat === 'all' || el.dataset.cat === cat) &&
      (lvl === 'all' || (el.dataset.levels ?? '').split(' ').includes(lvl)) &&
      (!free || el.dataset.free === '1');
    const count = (cat: string, lvl: Level, free: boolean) => items.filter((el) => matches(el, cat, lvl, free)).length;
    const isCat = (v: string | null): v is string => v !== null && catButtons.some((b) => b.dataset.filterCat === v);
    const isLevel = (v: string | null): v is Level => v !== null && levelButtons.some((b) => b.dataset.filterLevel === v);
    const labelOf = (buttons: HTMLButtonElement[], key: 'filterCat' | 'filterLevel', v: string) =>
      buttons.find((b) => b.dataset[key] === v)?.dataset.label ?? '';
    const headerBottom = () => (header ? header.getBoundingClientRect().bottom : 0);

    // ---- what sticks under the header ----
    const shortWindow = matchMedia('(max-height: 540px)');
    let past = false;
    /** Choose what sticks, and publish its height as --lib-stick. */
    const layout = () => {
      const mode = shortWindow.matches ? 'none' : bar.offsetHeight <= Math.min(innerHeight * 0.2, 150) ? 'bar' : 'strip';
      if (lib.dataset.stick !== mode) lib.dataset.stick = mode;
      const stuck = mode === 'bar' ? bar : mode === 'strip' ? strip : null;
      lib.style.setProperty('--lib-stick', `${stuck ? stuck.offsetHeight : 0}px`);
      track();
    };
    /** Once the bar has scrolled away, the stuck count line offers a way back to it. */
    const track = () => {
      const now = bar.getBoundingClientRect().bottom < headerBottom() + 1;
      if (now === past) return;
      past = now;
      // CSS shows "Change filters" in the stuck count line only while this is set.
      if (now) lib.dataset.past = '';
      else delete lib.dataset.past;
    };
    let ticking = false;
    addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          track();
        });
      },
      { passive: true },
    );
    addEventListener('resize', layout, { passive: true });
    shortWindow.addEventListener('change', layout);
    if ('ResizeObserver' in window) {
      // The border box: the strip's padding and rule change with the mode, not its content.
      const ro = new ResizeObserver(() => layout());
      ro.observe(bar, { box: 'border-box' });
      ro.observe(strip, { box: 'border-box' });
    }

    /**
     * Keyboard focus never lands under the header or what is stuck below it. scroll-margin (the
     * CSS) covers Chrome and Safari; Firefox counts a control as visible once it is below the
     * page's scroll-padding and leaves it partly covered, so nudge it clear. Keyboard focus only
     * (:focus-visible), so a click never moves the page under the pointer.
     */
    lib.addEventListener('focusin', (e) => {
      const el = e.target;
      if (!(el instanceof HTMLElement) || !el.matches(':focus-visible')) return;
      requestAnimationFrame(() => {
        let cover = headerBottom();
        const stuck = lib.dataset.stick === 'bar' ? bar : lib.dataset.stick === 'strip' ? strip : null;
        // The bar (or strip) re-sticks under the header whenever a library item is on screen, so count
        // it even mid smooth-scroll, when its current rect may still be off screen.
        if (stuck && !stuck.contains(el)) cover += stuck.offsetHeight;
        const top = el.getBoundingClientRect().top;
        if (top < cover + 4) scrollBy({ top: top - cover - 12, behavior: 'instant' });
      });
    });

    // ---- back to the top of the results ----
    /** If the reader is below the start of the library, jump back so the "Filter" label shows. */
    const backToTop = () => {
      const top = heading.getBoundingClientRect().top;
      const limit = headerBottom();
      if (top < limit) scrollTo({ top: scrollY + top - limit - 12, behavior: 'instant' });
    };
    jump.addEventListener('click', () => {
      backToTop();
      const pressed = catButtons.find((b) => b.getAttribute('aria-pressed') === 'true') ?? catButtons[0];
      pressed?.focus({ preventScroll: true });
      track();
    });

    // ---- the filters ----
    const syncUrl = () => {
      const url = new URL(location.href);
      // Always in the same order (type, level, free), after any other parameters.
      for (const k of ['type', 'level', 'free']) url.searchParams.delete(k);
      if (category !== 'all') url.searchParams.set('type', category);
      if (level !== 'all') url.searchParams.set('level', level);
      if (freeOnly) url.searchParams.set('free', '1');
      if (url.href !== location.href) history.replaceState(history.state, '', url);
    };

    /** Show what matches, update the buttons and the count, and (if asked) announce it. */
    const apply = (announce: boolean) => {
      let shown = 0;
      for (const el of items) {
        const ok = matches(el, category, level, freeOnly);
        el.hidden = !ok;
        if (ok) shown++;
      }
      for (const g of groups) g.hidden = !g.querySelector('[data-res]:not([hidden])');

      // Button states, and counts that preview what each choice would show.
      for (const b of catButtons) {
        const cat = b.dataset.filterCat ?? 'all';
        b.setAttribute('aria-pressed', String(cat === category));
        const n = b.querySelector('.lib-n');
        if (n) n.textContent = String(count(cat, level, freeOnly));
      }
      for (const b of levelButtons) {
        const lvl = (b.dataset.filterLevel ?? 'all') as Level;
        b.setAttribute('aria-pressed', String(lvl === level));
        const n = b.querySelector('.lib-n');
        if (n) n.textContent = String(count(category, lvl, freeOnly));
      }
      freeButton.setAttribute('aria-pressed', String(freeOnly));
      const freeN = freeButton.querySelector('.lib-n');
      if (freeN) freeN.textContent = String(count(category, level, true));

      if (empty) empty.hidden = shown > 0;

      const parts = [
        category === 'all' ? '' : labelOf(catButtons, 'filterCat', category),
        level === 'all' ? '' : labelOf(levelButtons, 'filterLevel', level),
        freeOnly ? 'free only' : '',
      ].filter(Boolean);
      const text =
        shown === total && !parts.length
          ? `Showing all ${total} resources`
          : `Showing ${shown} of ${total} ${total === 1 ? 'resource' : 'resources'}${parts.length ? `: ${parts.join(', ')}` : ''}`;
      // Set silently on load (the live region only speaks when the reader changes something).
      if (announce || status.textContent !== text) status.textContent = text;
      syncUrl();
    };

    const choose = () => {
      apply(true);
      backToTop();
      track();
    };

    for (const b of catButtons) {
      b.addEventListener('click', () => {
        category = b.dataset.filterCat ?? 'all';
        choose();
      });
    }
    for (const b of levelButtons) {
      b.addEventListener('click', () => {
        const v = b.dataset.filterLevel ?? 'all';
        level = isLevel(v) ? v : 'all';
        choose();
      });
    }
    freeButton.addEventListener('click', () => {
      freeOnly = !freeOnly;
      choose();
    });
    reset?.addEventListener('click', () => {
      category = 'all';
      level = 'all';
      freeOnly = false;
      choose();
      catButtons[0]?.focus();
    });

    // In-page links into the library: clear the filters if they hide the target, before the jump.
    const clearIfHidden = (hash: string) => {
      if (!hash || hash.length < 2) return false;
      let target: Element | null = null;
      try {
        target = document.getElementById(decodeURIComponent(hash.slice(1)));
      } catch {
        return false;
      }
      if (target && lib.contains(target) && target.closest('[hidden]')) {
        category = 'all';
        level = 'all';
        freeOnly = false;
        apply(true);
        return true;
      }
      return false;
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

    // Start from the URL (?type=…&level=…&free=1), if it names filters.
    const params = new URLSearchParams(location.search);
    const t = params.get('type');
    const l = params.get('level');
    if (isCat(t)) category = t;
    if (isLevel(l)) level = l;
    freeOnly = params.get('free') === '1';

    for (const el of lib.querySelectorAll<HTMLElement>('[data-lib-ui]')) el.hidden = false;
    bar.hidden = false;
    apply(false);
    layout();
    // Arriving on a link into the library (…/resources/#lib-mit-primes): the browser scrolled
    // there before --lib-stick was set, or could not, if the URL's filters hide the target. Show
    // it and land it again, clear of the bar. (Not on reload or back, which restore the position.)
    let target: HTMLElement | null = null;
    try {
      target = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    } catch {
      target = null;
    }
    if (target && lib.contains(target)) {
      const cleared = clearIfHidden(location.hash);
      const nav = performance.getEntriesByType?.('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (cleared || !nav || nav.type === 'navigate') {
        // Firefox scrolls to the fragment again until the page has loaded, so land it once more
        // then, unless the reader has started scrolling.
        let moved = false;
        const still = () => (moved = true);
        for (const ev of ['wheel', 'touchstart', 'keydown', 'mousedown']) addEventListener(ev, still, { once: true, passive: true });
        const land = () => requestAnimationFrame(() => !moved && target?.scrollIntoView({ behavior: 'instant' }));
        land();
        if (document.readyState !== 'complete') addEventListener('load', land, { once: true });
      }
    }
  }
}
