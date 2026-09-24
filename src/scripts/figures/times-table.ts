/**
 * "Times tables on a circle": join each of n points k to the point m·k (mod n). Only straight
 * chords are drawn, yet their envelope is an epicycloid with m − 1 cusps, traced in the accent:
 *   z(θ) = (m·e^{iθ} + e^{imθ}) / (m + 1)
 *
 * Hero markup (components/TimesTableFigure.astro):
 *   <canvas data-hero-figure data-n="240" data-controls="play,slider,readout">
 * with the controls looked up by those ids. Band markup (components/Band.astro):
 *   <canvas data-band-figure data-m="3">
 * The canvas gets data-drawn when it first draws, so a static fallback under it can hide.
 */

type Variant = 'plate' | 'band';
interface State {
  m: number;
  circle: number; // 0..1 drawn fraction of the circle
  chords: number; // 0..1 drawn fraction of the chords
  envelope: number; // 0..1 drawn fraction of the envelope
}

const NAMES: Record<number, string> = { 2: 'cardioid', 3: 'nephroid' };
export const curveName = (m: number) => {
  const r = Math.round(m);
  return Math.abs(m - r) < 0.005 ? (NAMES[r] ?? `${r - 1} cusps`) : '';
};
const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function createTimesTable(canvas: HTMLCanvasElement, variant: Variant, n: number, ticks: boolean) {
  const ctx = canvas.getContext('2d');
  const state: State = { m: 2, circle: 1, chords: 1, envelope: 1 };
  let width = 0;
  let dpr = 1;
  let colors = readColors();

  function readColors() {
    const css = getComputedStyle(canvas);
    const v = (name: string) => css.getPropertyValue(name).trim();
    return variant === 'band'
      ? { ink: 'rgb(244 239 228 / 0.22)', ink3: 'rgb(244 239 228 / 0.4)', chord: 'rgb(244 239 228 / 0.13)', accent: v('--band-accent') }
      : { ink: v('--fig-ink'), ink3: v('--fig-ink-3'), chord: v('--fig-chord'), accent: v('--fig-accent') };
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    width = rect.width;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(width * dpr);
    draw();
  }

  function draw() {
    if (!ctx || !width) return;
    if (!('drawn' in canvas.dataset)) canvas.dataset.drawn = '';
    const { m, circle, chords, envelope } = state;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, width);
    const c = width / 2;
    const R = width * (ticks ? 0.405 : 0.46);
    // Complex number (re, im) → screen, with k = 0 at the bottom so the cardioid stands upright.
    const X = (_re: number, im: number) => c + R * im;
    const Y = (re: number) => c + R * re;
    const at = (t: number): [number, number] => [X(Math.cos(t), Math.sin(t)), Y(Math.cos(t))];

    // the circle
    ctx.lineWidth = variant === 'band' ? 1 : 1.1;
    ctx.strokeStyle = colors.ink;
    ctx.beginPath();
    for (let i = 0; i <= 240 * circle; i++) {
      const [x, y] = at((i / 240) * 2 * Math.PI);
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.stroke();

    // tick marks and labels every 20 points
    if (ticks && circle > 0.98) {
      ctx.fillStyle = colors.ink3;
      ctx.font = `500 ${width < 420 ? 9 : 10}px "IBM Plex Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 0.8;
      for (let k = 0; k < n; k += 2) {
        const t = (2 * Math.PI * k) / n;
        const big = k % 20 === 0;
        const len = big ? 7 : k % 10 === 0 ? 4.5 : 2.5;
        const co = Math.cos(t);
        const si = Math.sin(t);
        const q = 1 + len / R;
        ctx.beginPath();
        ctx.moveTo(X(co, si), Y(co));
        ctx.lineTo(X(co * q, si * q), Y(co * q));
        ctx.stroke();
        if (big) {
          const p = 1 + 19 / R;
          ctx.fillText(String(k), X(co * p, si * p), Y(co * p));
        }
      }
    }

    // the chords k → m·k (mod n)
    const count = Math.floor(n * chords);
    ctx.lineWidth = variant === 'band' ? 0.6 : 0.7;
    ctx.strokeStyle = colors.chord;
    ctx.beginPath();
    for (let k = 0; k < count; k++) {
      const [x1, y1] = at((2 * Math.PI * k) / n);
      const [x2, y2] = at((2 * Math.PI * ((m * k) % n)) / n);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();

    // the "pen" while chords are still being drawn
    if (chords < 1 && count > 0) {
      const [x1, y1] = at((2 * Math.PI * count) / n);
      const [x2, y2] = at((2 * Math.PI * ((m * count) % n)) / n);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x1, y1, 3, 0, 7);
      ctx.fillStyle = colors.accent;
      ctx.fill();
    }

    // the envelope
    if (envelope > 0) {
      const steps = 720;
      const last = Math.floor(steps * envelope);
      ctx.beginPath();
      for (let i = 0; i <= last; i++) {
        const t = (2 * Math.PI * i) / steps;
        const re = (m * Math.cos(t) + Math.cos(m * t)) / (m + 1);
        const im = (m * Math.sin(t) + Math.sin(m * t)) / (m + 1);
        if (i) ctx.lineTo(X(re, im), Y(re));
        else ctx.moveTo(X(re, im), Y(re));
      }
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = variant === 'band' ? 1.2 : 1.6;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  }

  new ResizeObserver(resize).observe(canvas);
  document.addEventListener('themechange', () => {
    // Custom properties resolve after the attribute change; wait a frame.
    requestAnimationFrame(() => {
      colors = readColors();
      draw();
    });
  });
  return { state, draw };
}

/**
 * Hero plate: plotter-style intro, then m drifts through whole numbers with a pause at each.
 *
 * Accessibility: the readout next to the slider is visual only (aria-hidden); the slider's
 * aria-valuetext carries the value and is always written together with slider.value. Nothing is
 * a live region, and focusing the slider pauses the animation, so a screen reader never hears a
 * stream of values. The readout is only rewritten when its text changes.
 */
export function mountHeroFigure(canvas: HTMLCanvasElement) {
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = reduceQuery.matches;
  const fig = createTimesTable(canvas, 'plate', Number(canvas.dataset.n ?? 240), true);
  const [playId, sliderId, outputId] = (canvas.dataset.controls ?? '').split(',');
  const play = document.getElementById(playId) as HTMLButtonElement | null;
  const slider = document.getElementById(sliderId) as HTMLInputElement | null;
  const readout = document.getElementById(outputId);
  const readM = readout?.querySelector('.fig-out-m');
  const readName = readout?.querySelector('.fig-out-name');
  const MIN = Number(slider?.min || 2);
  const MAX = Number(slider?.max || 9);
  const STEP = Number(slider?.step) || 0.05;
  /** The nearest value the slider can hold, so the readout, the slider and its valuetext agree. */
  const snap = (m: number) => Math.min(MAX, Math.max(MIN, Number((Math.round(m / STEP) * STEP).toFixed(4))));

  let shown = '';
  const show = (m: number) => {
    const num = m.toFixed(2);
    const name = curveName(m);
    if (`${num} ${name}` === shown) return;
    shown = `${num} ${name}`;
    if (readM) readM.textContent = num;
    if (readName) readName.textContent = name || ' ';
    if (slider) {
      slider.value = String(m);
      slider.setAttribute('aria-valuetext', `m = ${num}${name ? `, ${name}` : ''}`);
    }
  };

  let playing = !reduce;
  let visible = true;
  let dir = 1;
  let phase: 'hold' | 'move' = 'hold';
  let t0 = performance.now();
  let from = 2;
  let to = 2;
  const HOLD = 2200;
  const MOVE = 3600;
  const intro = { start: performance.now(), done: reduce };
  let raf = 0;

  const setPlaying = (p: boolean) => {
    playing = p;
    if (play) {
      play.dataset.state = p ? 'playing' : 'paused';
      const t = play.querySelector('.t');
      if (t) t.textContent = p ? 'Pause' : 'Play';
    }
    if (p) {
      phase = 'hold';
      t0 = performance.now() - HOLD; // start moving right away
      kick();
    } else if (intro.done) {
      // Stop on a value the slider can hold, and say it.
      fig.state.m = snap(fig.state.m);
      show(fig.state.m);
      fig.draw();
    }
  };
  const setM = (m: number) => {
    intro.done = true;
    Object.assign(fig.state, { circle: 1, chords: 1, envelope: 1, m: snap(m) });
    show(fig.state.m);
    fig.draw();
  };
  play?.addEventListener('click', () => setPlaying(!playing));
  slider?.addEventListener('input', () => {
    const m = Number(slider.value); // read first: pausing writes the figure's own m back
    if (playing) setPlaying(false);
    setM(m);
  });
  // Reaching the slider stops the motion, so its value holds still while it has focus.
  slider?.addEventListener('focus', () => {
    if (playing) setPlaying(false);
  });

  // Direct manipulation: drag sideways across the figure to scrub m. Vertical drags still scroll.
  let drag: { id: number; x: number; y: number; m: number; active: boolean } | null = null;
  const endDrag = () => {
    drag = null;
  };
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, m: fig.state.m, active: false };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    // A press that was released outside the canvas never sent us its pointerup.
    if (e.buttons === 0) return endDrag();
    const dx = e.clientX - drag.x;
    if (!drag.active) {
      if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - drag.y)) return;
      drag.active = true;
      canvas.setPointerCapture(e.pointerId);
      if (playing) setPlaying(false);
    }
    const perPixel = (MAX - MIN) / canvas.getBoundingClientRect().width;
    setM(drag.m + dx * perPixel);
  });
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('lostpointercapture', endDrag);
  // Also end a press that leaves the canvas before it became a drag (no capture yet).
  canvas.addEventListener('pointerleave', () => {
    if (drag && !drag.active) endDrag();
  });

  reduceQuery.addEventListener('change', (e) => {
    if (e.matches) {
      if (playing) setPlaying(false);
      setM(Math.round(fig.state.m));
    }
  });

  if (!reduce) Object.assign(fig.state, { circle: 0, chords: 0, envelope: 0 });
  setPlaying(playing);
  show(fig.state.m);

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) kick();
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) kick();
  });

  function kick() {
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick(now: number) {
    raf = 0;
    let more = false;
    if (!intro.done) {
      // A quick plotter pass (about 1.4 s) so the fold settles fast.
      const e = now - intro.start;
      const seg = (a: number, b: number) => clamp01((e - a) / b);
      fig.state.circle = ease(seg(0, 350));
      fig.state.chords = 1 - Math.pow(1 - seg(150, 800), 2);
      fig.state.envelope = ease(seg(750, 600));
      if (e > 1400) {
        intro.done = true;
        t0 = now;
        phase = 'hold';
      }
      fig.draw();
      more = true;
    } else if (playing && visible && !document.hidden) {
      if (phase === 'hold') {
        if (now - t0 > HOLD) {
          // Head for the next whole number in the current direction, bouncing at the ends.
          from = fig.state.m;
          if (dir > 0 && Math.floor(from) + 1 > MAX) dir = -1;
          if (dir < 0 && Math.ceil(from) - 1 < MIN) dir = 1;
          to = dir > 0 ? Math.floor(from) + 1 : Math.ceil(from) - 1;
          phase = 'move';
          t0 = now;
        }
      } else {
        const u = Math.min(1, (now - t0) / MOVE);
        fig.state.m = from + (to - from) * ease(u);
        if (u >= 1) {
          fig.state.m = to;
          phase = 'hold';
          t0 = now;
        }
        show(fig.state.m);
        fig.draw();
      }
      more = true;
    }
    if (more) kick();
  }
  kick();
}

/** Decorative band figure (m = 3): draws itself once when scrolled into view. */
export function mountBandFigure(canvas: HTMLCanvasElement) {
  const fig = createTimesTable(canvas, 'band', 240, false);
  fig.state.m = Number(canvas.dataset.m ?? 3);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  let start = 0;
  canvas.addEventListener('arm', () => {
    Object.assign(fig.state, { chords: 0, envelope: 0 });
    fig.draw();
  });
  canvas.addEventListener('reveal', () => {
    start = performance.now();
    requestAnimationFrame(step);
  });
  function step(now: number) {
    const e = now - start;
    fig.state.chords = Math.min(1, e / 3200);
    fig.state.envelope = ease(clamp01((e - 2400) / 1800));
    fig.draw();
    if (fig.state.envelope < 1) requestAnimationFrame(step);
  }
}
