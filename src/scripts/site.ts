/**
 * Site-wide behavior: header rule on scroll, the mobile menu, reveal-on-scroll for section
 * rules and ∎ tombstones, and the footer theme control.
 */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- header: hairline once the page scrolls ---------- */
const header = document.querySelector<HTMLElement>('.site-header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- mobile menu (a disclosure) ---------- */
const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const menu = document.getElementById('mobile-menu');
if (toggle && menu) {
  const label = toggle.querySelector('.menu-label');
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const behind = [document.querySelector('main'), document.querySelector('.site-footer'), document.querySelector('.skip')];
  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    if (label) label.textContent = open ? 'Close' : 'Menu';
    // The panel covers the page: make what is behind it inert and stop it scrolling.
    for (const el of behind) if (el) (el as HTMLElement).inert = open;
    document.documentElement.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => setOpen(!isOpen()));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
  menu.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) setOpen(false);
  });
  // Close when focus leaves the header entirely (e.g. tabbing past the last menu item).
  header?.addEventListener('focusout', (e) => {
    const next = e.relatedTarget as Node | null;
    if (isOpen() && next && !header.contains(next)) setOpen(false);
  });
  matchMedia('(min-width: 1181px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

/* ---------- reveal: rules draw in, tombstones fill ----------
 * The static state is always complete. An element is "armed" (reset) only while it is still
 * below the fold, then animated when it scrolls into view, so nothing is ever hidden from
 * readers without JavaScript, without motion, or who jump straight to an anchor. */
const revealTargets = document.querySelectorAll<HTMLElement>('.sec-head, .qed, [data-reveal]');
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  const fire = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        fire.unobserve(entry.target);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            entry.target.classList.add('in');
            entry.target.dispatchEvent(new Event('reveal'));
          }),
        );
      }
    },
    { threshold: 0.4 },
  );
  const arm = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        arm.unobserve(entry.target);
        // Only arm things that are not yet on screen.
        if (entry.boundingClientRect.top > innerHeight) {
          entry.target.classList.add('armed');
          entry.target.dispatchEvent(new Event('arm'));
          fire.observe(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px 320px 0px' },
  );
  revealTargets.forEach((el) => arm.observe(el));
}

/* ---------- theme control (footer) ---------- */
const THEME_KEY = 'ebma-theme';
const root = document.documentElement;
const readTheme = (): 'auto' | 'light' | 'dark' => {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'light' || t === 'dark' ? t : 'auto';
  } catch {
    return 'auto';
  }
};
const applyTheme = (theme: 'auto' | 'light' | 'dark') => {
  if (theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
  try {
    if (theme === 'auto') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage unavailable: the choice lasts for this page view */
  }
  document.dispatchEvent(new CustomEvent('themechange'));
};
const control = document.querySelector<HTMLFieldSetElement>('[data-theme-control]');
if (control) {
  const current = readTheme();
  const radio = control.querySelector<HTMLInputElement>(`input[value="${current}"]`);
  if (radio) radio.checked = true;
  control.addEventListener('change', (e) => {
    const value = (e.target as HTMLInputElement).value as 'auto' | 'light' | 'dark';
    applyTheme(value);
  });
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  document.dispatchEvent(new CustomEvent('themechange'));
});
