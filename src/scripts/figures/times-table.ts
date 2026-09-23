/**
 * "Times tables on a circle": join each of n points k to the point m·k (mod n). Only straight
 * chords are drawn, yet their envelope is an epicycloid with m − 1 cusps, traced in the accent:
 *   z(θ) = (m·e^{iθ} + e^{imθ}) / (m + 1)
 *
 * Markup (see components/TimesTableFigure.astro):
 *   <canvas data-times-table data-n="240" data-m="2" data-ticks data-variant="plate|band">
 * Optional controls, looked up by the ids in data-controls="play,slider,output".
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

/** Hero plate: plotter-style intro, then m drifts through whole numbers with a pause at each. */
export function mountHeroFigure(canvas: HTMLCanvasElement) {
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = reduceQuery.matches;
  const fig = createTimesTable(canvas, 'plate', Number(canvas.dataset.n ?? 240), true);
  const [playId, sliderId, outputId] = (canvas.dataset.controls ?? '').split(',');
  const play = document.getElementById(playId) as HTMLButtonElement | null;
  const slider = document.getElementById(sliderId) as HTMLInputElement | null;
  const output = document.getElementById(outputId) as HTMLOutputElement | null;
  const MIN = Number(slider?.min ?? 2);
  const MAX = Number(slider?.max ?? 9);

  /** Update the readout every frame, but the slider's spoken value only when m settles. */
  const show = (m: number, announce: boolean) => {
    const name = curveName(m);
    if (output) output.innerHTML = `${m.toFixed(2)} <span>${name || '&nbsp;'}</span>`;
    if (slider) {
      slider.value = String(m);
      if (announce) slider.setAttribute('aria-valuetext', `m = ${m.toFixed(2)}${name ? `, ${name}` : ''}`);
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
    }
  };
  const setM = (m: number) => {
    intro.done = true;
    Object.assign(fig.state, { circle: 1, chords: 1, envelope: 1, m: Math.min(MAX, Math.max(MIN, m)) });
    show(fig.state.m, true);
    fig.draw();
  };
  play?.addEventListener('click', () => setPlaying(!playing));
  slider?.addEventListener('input', () => {
    if (playing) setPlaying(false);
    setM(Number(slider.value));
  });

  // Direct manipulation: drag sideways across the figure to scrub m. Vertical drags still scroll.
  let drag: { x: number; y: number; m: number; active: boolean } | null = null;
  canvas.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, m: fig.state.m, active: false };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
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
  const endDrag = () => {
    drag = null;
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  reduceQuery.addEventListener('change', (e) => {
    if (e.matches) {
      if (playing) setPlaying(false);
      setM(Math.round(fig.state.m));
    }
  });

  if (!reduce) Object.assign(fig.state, { circle: 0, chords: 0, envelope: 0 });
  setPlaying(playing);
  show(2, true);

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
          from = fig.state.m;
          to = Math.round(from) + dir;
          if (to > MAX) {
            dir = -1;
            to = Math.round(from) - 1;
          }
          if (to < MIN) {
            dir = 1;
            to = Math.round(from) + 1;
          }
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
      }
      show(fig.state.m, phase === 'hold');
      fig.draw();
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
