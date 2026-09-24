/**
 * "Competitions to know" on /events/ (§4) on a phone: each group of contests folds into a
 * <details> whose summary lists the contests inside, so the section is a short index rather than
 * fifteen full entries (Table 2 in §3 already gives every contest's date and who can enter).
 *
 * The groups are open in the HTML, so without JavaScript every entry shows, as on a wide screen.
 * Here we close them on narrow screens, keep them open on wide ones (where the summary is hidden
 * by CSS), and open the right group when a link points at an entry inside it.
 */

const phone = matchMedia('(max-width: 620px)');
const folds = [...document.querySelectorAll<HTMLDetailsElement>('details[data-fold]')];

function sync() {
  for (const d of folds) d.open = !phone.matches;
}

/** If the URL points at something inside a closed group, open that group and bring it into view. */
function revealTarget() {
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  const fold = target?.closest<HTMLDetailsElement>('details[data-fold]');
  if (!target || !fold || fold.open) return;
  fold.open = true;
  target.scrollIntoView({ block: 'start' });
}

if (folds.length) {
  sync();
  revealTarget();
  phone.addEventListener('change', sync);
  addEventListener('hashchange', revealTarget);
}
