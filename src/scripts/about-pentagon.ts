/**
 * Plate I on the About page: step through the construction of a regular pentagon.
 * Markup: components/AboutPentagon.astro. Geometry and timing: ./about-pentagon-geometry.ts.
 *
 * The page ships the finished figure. With JavaScript this module:
 *  - arms the figure (clears it) only if it starts below the fold, then plays the whole
 *    construction once when it scrolls into view; never under prefers-reduced-motion;
 *  - pauses while the figure is off screen, and offers Pause / Play / Replay;
 *  - lets the reader step with Previous / Next or the numbered list, announcing each step
 *    (a step picked from the list first brings the figure into view if it is off screen; when
 *    that is done from the keyboard and scrolls the list away, focus moves to the plate's own
 *    Next button, or Previous at the last step, so the focused control stays on screen).
 * Colors are CSS custom properties on the SVG, so a theme change needs no redraw.
 */
import { construction, STEPS, pathAt, arcPoint, angleOf, lerp, type Item, type Pt } from './about-pentagon-geometry';

const SPEED = 1.5;
const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');

export function mountPentagon(root: HTMLElement) {
  const { items, steps, T } = construction;
  const last = steps.length - 1;
  const svg = root.querySelector<SVGSVGElement>('svg[data-pentagon-svg]');
  const foot = root.querySelector<HTMLElement>('[data-foot]');
  const readout = root.querySelector<HTMLElement>('[data-readout]');
  const prevBtn = root.querySelector<HTMLButtonElement>('[data-prev]');
  const nextBtn = root.querySelector<HTMLButtonElement>('[data-next]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-toggle]');
  const list = root.querySelector<HTMLOListElement>('[data-steps]');
  if (!svg || !foot || !readout || !prevBtn || !nextBtn || !toggle || !list) return;

  const els = items.map((_, i) => svg.querySelector<SVGElement>(`[data-i="${i}"]`));
  const plateFrame = svg.closest<HTMLElement>('.frame');
  const lastT = items.map(() => 1);

  // Drawing tools (decorative).
  const tool = svg.querySelector<SVGGElement>('[data-tool]');
  const ruler = tool?.querySelector<SVGRectElement>('[data-ruler]');
  const compass = tool?.querySelector<SVGGElement>('[data-compass]');
  const legA = compass?.querySelector<SVGPathElement>('[data-leg-a]');
  const legB = compass?.querySelector<SVGPathElement>('[data-leg-b]');
  const hinge = compass?.querySelector<SVGCircleElement>('[data-hinge]');
  const handle = compass?.querySelector<SVGPathElement>('[data-handle]');
  const tip = compass?.querySelector<SVGCircleElement>('[data-tip]');
  const d2 = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('');

  // Upgrade the written steps into buttons.
  const stepBtns = [...list.querySelectorAll<HTMLLIElement>('li[data-step]')].map((li, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'step-btn';
    while (li.firstChild) b.appendChild(li.firstChild);
    li.appendChild(b);
    b.addEventListener('click', (e) => {
      // Enter or Space (detail 0): whatever has focus must still be on screen after the scroll.
      const keyboard = e.detail === 0;
      const dy = bringFigureIntoView(keyboard);
      go(i, true);
      if (keyboard && dy) {
        const r = b.getBoundingClientRect();
        if (r.top - dy < headerCover() || r.bottom - dy > innerHeight) (i === last ? prevBtn : nextBtn).focus({ preventScroll: true });
      }
    });
    return b;
  });
  root.classList.add('is-live');
  foot.hidden = false;

  let tau = T;
  let target = T;
  let playing = false;
  let forced: number | null = null;
  let cur = last;
  let raf = 0;
  let prevNow = 0;
  let visible = false;
  let suspended = false;
  let interacted = false;
  let armed = false;

  function setItem(i: number, t: number) {
    if (t === lastT[i]) return;
    lastT[i] = t;
    const it = items[i];
    const el = els[i];
    if (!el) return;
    if (it.kind === 'point') el.setAttribute('r', (it.r * t).toFixed(2));
    else if (it.kind === 'label') el.setAttribute('opacity', t.toFixed(3));
    else el.setAttribute('d', pathAt(it, t));
  }

  function drawTool(it: Item, t: number, alpha: number) {
    if (!tool || !ruler || !compass || !legA || !legB || !hinge || !handle || !tip) return;
    tool.setAttribute('opacity', alpha.toFixed(3));
    if (it.kind === 'arc') {
      ruler.setAttribute('visibility', 'hidden');
      compass.setAttribute('visibility', 'visible');
      const p = arcPoint(it, t);
      const th = Math.atan2(p[1] - it.c[1], p[0] - it.c[0]);
      const mid = lerp(it.c, p, 0.5);
      const n: Pt = [Math.cos(th - Math.PI / 2), Math.sin(th - Math.PI / 2)];
      const h = Math.max(46, it.r * 0.5);
      const H: Pt = [mid[0] + n[0] * h, mid[1] + n[1] * h];
      legA.setAttribute('d', d2([it.c, H]));
      legB.setAttribute('d', d2([H, p]));
      hinge.setAttribute('cx', H[0].toFixed(2));
      hinge.setAttribute('cy', H[1].toFixed(2));
      handle.setAttribute('d', d2([H, [H[0] + n[0] * 18, H[1] + n[1] * 18]]));
      tip.setAttribute('cx', p[0].toFixed(2));
      tip.setAttribute('cy', p[1].toFixed(2));
    } else if (it.kind === 'line') {
      compass.setAttribute('visibility', 'hidden');
      ruler.setAttribute('visibility', 'visible');
      const len = Math.hypot(it.p1[0] - it.p0[0], it.p1[1] - it.p0[1]);
      ruler.setAttribute('width', (len + 68).toFixed(2));
      ruler.setAttribute('transform', `translate(${it.p0[0].toFixed(2)} ${it.p0[1].toFixed(2)}) rotate(${angleOf(it.p0, it.p1).toFixed(2)})`);
    }
  }

  function render(showTool: boolean) {
    let active: Item | undefined;
    let alpha = 0;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      setItem(i, ease(clamp01((tau - it.start) / it.dur)));
      // The compass or ruler fades in just before its stroke and out just after.
      if (showTool && it.tool && tau > it.start - 260 && tau < it.end + 320) {
        if (!active || it.start >= active.start) {
          active = it;
          alpha = Math.min(1, (tau - (it.start - 260)) / 260, (it.end + 320 - tau) / 320);
        }
      }
    }
    if (active) drawTool(active, ease(clamp01((tau - active.start) / active.dur)), clamp01(alpha));
    else tool?.setAttribute('opacity', '0');
    let st = 0;
    for (let i = 0; i <= last; i++) if (tau >= steps[i].start - 200) st = i;
    setStep(forced ?? st);
  }

  function setStep(i: number) {
    if (i === cur && readout!.dataset.step === String(i)) return;
    cur = i;
    readout!.dataset.step = String(i);
    readout!.innerHTML = `<span class="rn">Step ${i + 1} of ${steps.length}</span> <span class="rt">${STEPS[i]}</span>`;
    stepBtns.forEach((b, k) => {
      b.classList.toggle('done', k < i);
      if (k === i) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
    prevBtn!.setAttribute('aria-disabled', String(i === 0));
    nextBtn!.setAttribute('aria-disabled', String(i === last));
  }

  function setToggle() {
    const t = toggle!.querySelector('.t');
    let state: 'playing' | 'paused' | 'replay' | 'restart' | 'finish';
    if (reduceMQ.matches) state = cur === 0 ? 'finish' : 'restart';
    else if (playing) state = 'playing';
    else state = tau >= T ? 'replay' : 'paused';
    toggle!.dataset.state = state;
    const text = { playing: 'Pause', paused: 'Play', replay: 'Replay', restart: 'Restart', finish: 'Show all' }[state];
    if (t) t.textContent = text;
  }

  function frame(now: number) {
    const dt = Math.min(48, now - prevNow);
    prevNow = now;
    if (!visible) {
      // Off screen: hold still, and pick up again when it comes back.
      suspended = true;
      raf = 0;
      return;
    }
    tau = Math.min(target, tau + dt * SPEED);
    const done = tau >= target;
    render(!done);
    if (done) {
      playing = false;
      forced = null;
      raf = 0;
      readout!.setAttribute('aria-live', 'polite');
      setToggle();
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  function run(from: number, to: number, step: number | null) {
    cancelAnimationFrame(raf);
    tau = from;
    target = to;
    forced = step;
    playing = true;
    suspended = false;
    prevNow = performance.now();
    render(true);
    setToggle();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
    playing = false;
    suspended = false;
    forced = null;
  }

  /** The height of the sticky header, which covers the top of the viewport. */
  function headerCover() {
    return parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  }

  /**
   * In the one-column layout the list sits below the figure, so a step picked there would be
   * drawn off screen. Bring the figure up first (under the sticky header). The drawing waits
   * while the figure is out of view (see frame()), so it starts as the figure arrives.
   * `withControls` (a keyboard choice, whose focus may move to Next) keeps the readout and the
   * Previous / Next row in view too. Returns how far the page scrolls, so the caller can tell
   * where the chosen step's button ends up.
   */
  function bringFigureIntoView(withControls: boolean): number {
    const r = svg!.getBoundingClientRect();
    const covered = headerCover();
    const room = innerHeight - covered;
    const seen = Math.min(r.bottom, innerHeight) - Math.max(r.top, covered);
    if (seen >= r.height * 0.8) return 0;
    // The whole plate (header line, drawing, step readout, controls) when it fits; else the drawing,
    // down to the controls when they are needed.
    const f = plateFrame?.getBoundingClientRect();
    const box = f && f.height <= room ? f : { top: r.top, bottom: withControls ? foot!.getBoundingClientRect().bottom : r.bottom };
    // As scrollIntoView's 'nearest'; a box taller than the room shows its top, or its bottom when that holds the controls.
    let dy = 0;
    if (box.bottom - box.top > room) dy = withControls && box !== f ? box.bottom - innerHeight : box.top - covered;
    else if (box.top < covered) dy = box.top - covered;
    else if (box.bottom > innerHeight) dy = box.bottom - innerHeight;
    const max = document.documentElement.scrollHeight - innerHeight;
    dy = Math.round(Math.max(-scrollY, Math.min(max - scrollY, dy)));
    if (dy) scrollTo({ top: scrollY + dy, behavior: reduceMQ.matches ? 'auto' : 'smooth' });
    return dy;
  }

  /** Show step i: drawn in front of the reader, or at once (going back, or reduced motion). */
  function go(i: number, animate: boolean) {
    if (i < 0 || i > last) return;
    interacted = true;
    readout!.setAttribute('aria-live', 'polite');
    stop();
    if (animate && !reduceMQ.matches) {
      run(steps[i].start - 150, steps[i].end, i);
    } else {
      tau = steps[i].end;
      forced = i;
      render(false);
      forced = null;
      setToggle();
    }
  }

  prevBtn.addEventListener('click', () => go(cur - 1, false));
  nextBtn.addEventListener('click', () => go(cur + 1, true));
  toggle.addEventListener('click', () => {
    interacted = true;
    readout.setAttribute('aria-live', 'polite');
    if (reduceMQ.matches) return go(cur === 0 ? last : 0, false);
    if (playing) {
      stop();
      render(false);
      setToggle();
    } else if (tau >= T) {
      run(0, T, null);
    } else {
      run(tau, T, null);
    }
  });

  // Printing: always print the finished construction, whatever step the reader is on.
  addEventListener('beforeprint', () => {
    stop();
    armed = false;
    tau = T;
    render(false);
    setToggle();
  });

  // Start: finished figure, unless it is still below the fold and motion is welcome.
  render(false);
  setToggle();
  if (!reduceMQ.matches && 'IntersectionObserver' in window && svg.getBoundingClientRect().top > innerHeight) {
    armed = true;
    tau = 0;
    render(false);
    setToggle();
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          visible = e.isIntersecting;
          if (armed && !interacted && e.intersectionRatio >= 0.35 && !reduceMQ.matches) {
            armed = false;
            // Announcing every step of the automatic play-through would be noise; the list says it all.
            readout.setAttribute('aria-live', 'off');
            run(0, T, null);
          } else if (visible && suspended && playing) {
            suspended = false;
            prevNow = performance.now();
            raf = requestAnimationFrame(frame);
          }
        }
      },
      { threshold: [0, 0.35] },
    );
    io.observe(svg);
  } else {
    visible = true;
  }
}
