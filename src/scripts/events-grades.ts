/**
 * The grade finder on /events/ (§3, "Which contests can I enter?").
 *
 * Without JavaScript the finder is hidden (html:not(.js)) and the page simply lists every
 * contest. Here its buttons (aria-pressed) choose one grade, or all grades. For a grade:
 *   - Table 2 and the §4 directory hide the contests whose organizer's stated grades leave it out
 *     (and any table section or group left empty). A remaining contest gets a note where it helps:
 *     which parts are open ("For grade 11: AMC 12.") or, when the organizer gives no grade
 *     numbers, to see the official site;
 *   - Fig. 1 fades the rows of the contests left out;
 *   - the phone index of each §4 group names only the contests shown;
 *   - the calendar download becomes that grade's .ics file;
 *   - a role="status" line says what is shown, and a line in §4 repeats it with "Show all grades".
 * The eligibility is src/data/competitions.ts (gradeFit), computed at build time into the JSON in
 * [data-gf-data]. A link to something the filter hides clears the filter first, so it lands.
 * (The trailing `export {}` makes this file a module, so its names don't clash with other scripts.)
 */

/** Per grade: 0 = not open to it, 1 = open, 2 = no grade numbers given; then the note to show. */
type Fit = [0 | 1 | 2, string];
interface Finder {
  grades: number[];
  fit: Record<string, Fit[]>;
  ics: Record<string, [string, number]>;
}

const root = document.querySelector<HTMLElement>('[data-gf]');
const raw = root?.querySelector('[data-gf-data]')?.textContent;

if (root && raw) {
  const data = JSON.parse(raw) as Finder;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-gf-grade]')];
  const status = root.querySelector<HTMLElement>('[data-gf-status]');
  const echo = document.querySelector<HTMLElement>('[data-gf-echo]');
  const echoText = echo?.querySelector<HTMLElement>('[data-gf-echo-text]');
  const reset = document.querySelector<HTMLButtonElement>('[data-gf-reset]');
  const ics = document.querySelector<HTMLAnchorElement>('[data-gf-ics]');
  const icsLabel = ics?.querySelector<HTMLElement>('[data-gf-ics-label]');
  const icsCount = document.querySelector<HTMLElement>('[data-gf-ics-count]');
  const table = document.querySelector<HTMLTableElement>('[data-gf-table]');
  const rows = [...(table?.querySelectorAll<HTMLTableRowElement>('tr[data-cid]') ?? [])];
  const figRows = [...document.querySelectorAll<SVGGElement>('svg[data-calendar] [data-cid]')];
  const groups = [...document.querySelectorAll<HTMLElement>('.cgroup')];
  const entries = [...document.querySelectorAll<HTMLElement>('.cgroup article[data-cid]')];
  const total = Object.keys(data.fit).length;

  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const fitOf = (cid: string | undefined, grade: number | null): Fit =>
    grade === null || !cid ? [1, ''] : (data.fit[cid]?.[data.grades.indexOf(grade)] ?? [2, '']);

  /** Fill (or clear) the note spans inside one row or entry. */
  const setNote = (scope: Element, note: string) => {
    for (const el of scope.querySelectorAll<HTMLElement>('[data-fit]')) {
      el.textContent = note;
      el.hidden = !note;
    }
  };

  let current: number | null = null;

  function apply(grade: number | null, announce: boolean) {
    current = grade;
    const key = grade === null ? '' : String(grade);
    for (const b of buttons) b.setAttribute('aria-pressed', String((b.dataset.gfGrade ?? '') === key));

    // Table 2: rows, then any section left empty, then the last rule.
    for (const tr of rows) {
      const [fit, note] = fitOf(tr.dataset.cid, grade);
      tr.hidden = fit === 0;
      setNote(tr, note);
    }
    if (table) {
      for (const body of table.tBodies) body.hidden = !body.querySelector('tr[data-cid]:not([hidden])');
      const shownRows = rows.filter((tr) => !tr.closest('[hidden]'));
      for (const tr of rows) tr.classList.toggle('ct-end', tr === shownRows.at(-1));
    }

    // Fig. 1: fade, never hide, so the rows keep their places on the time axis.
    for (const g of figRows) g.classList.toggle('is-out', fitOf(g.dataset.cid, grade)[0] === 0);

    // §4: entries, then each group's count and phone index.
    let yes = 0;
    let check = 0;
    for (const el of entries) {
      const [fit, note] = fitOf(el.dataset.cid, grade);
      el.hidden = fit === 0;
      setNote(el, note);
      if (fit === 1) yes++;
      if (fit === 2) check++;
    }
    for (const group of groups) {
      const shown = group.querySelectorAll('article[data-cid]:not([hidden])').length;
      group.hidden = shown === 0;
      const count = group.querySelector<HTMLElement>('[data-gf-count]');
      if (count) count.textContent = plural(shown, 'contest', 'contests');
      let first = true;
      for (const nm of group.querySelectorAll<HTMLElement>('.cg-nm[data-cid]')) {
        nm.hidden = fitOf(nm.dataset.cid, grade)[0] === 0;
        const sep = nm.querySelector<HTMLElement>('[data-gf-sep]');
        if (sep) sep.hidden = first;
        if (!nm.hidden) first = false;
      }
    }

    // The calendar download.
    const [href, n] = data.ics[key] ?? data.ics[''];
    if (ics && href) ics.href = href;
    if (icsLabel) icsLabel.textContent = grade === null ? 'Add these dates to your calendar' : `Add the grade ${grade} dates to your calendar`;
    if (icsCount) icsCount.textContent = `${plural(n, 'date', 'dates')} posted so far${grade === null ? '' : ` for the grade ${grade} list`}`;

    // What is shown, said once (status) and repeated in §4 (echo).
    const shown = yes + check;
    const text =
      grade === null
        ? `Showing all ${total} contests.`
        : check
          ? `Showing ${shown} of ${total} contests for grade ${grade}: ${yes} open to grade ${grade}, and ${check} that give no grade numbers (see their official sites).`
          : `Showing ${shown} of ${total} contests: those open to grade ${grade}.`;
    if (status && (announce || grade !== null)) status.textContent = text;
    if (echo && echoText) {
      echo.hidden = grade === null;
      echoText.textContent = grade === null ? '' : `Grade ${grade}: showing ${shown} of ${total} contests.`;
    }
  }

  for (const b of buttons) {
    b.addEventListener('click', () => {
      const g = b.dataset.gfGrade;
      apply(g ? Number(g) : null, true);
    });
  }
  // "Show all grades" in §4 hides itself, so focus goes to the first group heading just below it
  // (not back up to §3, which would move the reader's place on the page).
  reset?.addEventListener('click', () => {
    apply(null, true);
    const next = groups[0]?.querySelector<HTMLElement>('h3');
    if (next) {
      next.tabIndex = -1;
      next.focus({ preventScroll: true });
    }
  });

  // In-page links to something the filter hides (a contest in §4, a group): show all grades first.
  const clearIfHidden = (hash: string) => {
    if (current === null || hash.length < 2) return false;
    let target: HTMLElement | null = null;
    try {
      target = document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return false;
    }
    if (!target?.closest('[hidden]') || target.closest('[data-gf]')) return false;
    apply(null, true);
    return true;
  };
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href*="#"]');
    if (a instanceof HTMLAnchorElement && a.pathname === location.pathname && a.origin === location.origin) clearIfHidden(a.hash);
  });
  addEventListener('hashchange', () => {
    if (clearIfHidden(location.hash)) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  });

  apply(null, false);
}

export {};
