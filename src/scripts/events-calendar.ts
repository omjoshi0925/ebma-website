/**
 * The competition calendar on /events/ (Fig. 1 and Table 2) is built at deploy time. Between
 * deploys the date moves on, so in the browser we
 *   1. fade contests whose last day has passed and label them "Passed" in the table, and
 *   2. draw a dashed "today" line on the time axis while today is inside the season.
 * Without JavaScript the page still shows every upcoming date as of the last build.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

const now = new Date();
const pad = (n: number) => String(n).padStart(2, '0');
const todayIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const todayNum = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000;

/* 1. Passed contests. */
document.querySelectorAll<HTMLElement | SVGElement>('[data-calendar-root] [data-end], svg[data-calendar] [data-end]').forEach((el) => {
  const end = el.getAttribute('data-end');
  if (!end || end >= todayIso) return;
  el.classList.add('is-past');
  if (el instanceof HTMLTableRowElement) {
    const cell = el.querySelector('.ct-date');
    if (cell && !cell.querySelector('.ct-passed')) {
      const tag = document.createElement('span');
      tag.className = 'ct-passed';
      tag.textContent = 'Passed';
      cell.append(tag);
    }
  }
});

/* 2. Today on the time axis. */
document.querySelectorAll<SVGSVGElement>('svg[data-calendar]').forEach((svg) => {
  const n = (k: string) => Number(svg.dataset[k]);
  const [d0, d1, x0, x1, top, bottom] = [n('d0'), n('d1'), n('x0'), n('x1'), n('top'), n('bottom')];
  if (![d0, d1, x0, x1, top, bottom].every(Number.isFinite) || todayNum < d0 || todayNum >= d1) return;
  const x = x0 + ((todayNum + 0.5 - d0) / (d1 - d0)) * (x1 - x0);
  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('class', 'cal-today');
  g.setAttribute('aria-hidden', 'true');
  const line = document.createElementNS(SVG_NS, 'line');
  line.setAttribute('x1', x.toFixed(1));
  line.setAttribute('x2', x.toFixed(1));
  line.setAttribute('y1', String(top));
  line.setAttribute('y2', String(bottom));
  line.setAttribute('class', 'cal-today-line');
  const label = document.createElementNS(SVG_NS, 'text');
  label.setAttribute('x', (x - 4).toFixed(1));
  label.setAttribute('y', String(top - 10));
  label.setAttribute('class', 'cal-today-label');
  label.textContent = 'Today';
  const rightEdge = x1 - 60;
  if (x > rightEdge) {
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('x', (x + 4).toFixed(1));
  }
  g.append(line, label);
  // Under the rows, so the labels (with their paper halo) stay on top of the line.
  svg.insertBefore(g, svg.querySelector('.cal-rows'));
  svg.closest('figure')?.querySelector<HTMLElement>('.cal-key-today')?.removeAttribute('hidden');
});
