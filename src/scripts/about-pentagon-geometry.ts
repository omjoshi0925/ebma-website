/**
 * Plate I on the About page: the compass-and-straightedge construction of a regular pentagon,
 * as data. Pure (no DOM), so the page renders the finished figure at build time from it and the
 * browser (scripts/about-pentagon.ts) replays it step by step from the same numbers.
 *
 * Coordinates are SVG user units, y pointing down. The circle has center O and radius R.
 *   M is the midpoint of OA; the arc about M through P meets the diameter at Q, with
 *   OQ = R/φ; PQ is then exactly the side of the inscribed regular pentagon, 2R·sin 36°.
 */

export type Pt = [number, number];

export const R = 180;
export const O: Pt = [300, 300];
const rad = (deg: number) => (deg * Math.PI) / 180;
/** Point on the circle at `deg` degrees (0° = east, clockwise because y points down). */
export const onCircle = (deg: number): Pt => [O[0] + R * Math.cos(rad(deg)), O[1] + R * Math.sin(rad(deg))];
export const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const angleOf = (c: Pt, p: Pt) => (Math.atan2(p[1] - c[1], p[0] - c[0]) * 180) / Math.PI;
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Intersections of two circles (c0, r0) and (c1, r1). */
export function circleCircle(c0: Pt, r0: number, c1: Pt, r1: number): Pt[] {
  const d = dist(c0, c1);
  if (d > r0 + r1 || d < Math.abs(r0 - r1) || d === 0) return [];
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r0 * r0 - a * a));
  const m = lerp(c0, c1, a / d);
  const ux = (c1[0] - c0[0]) / d;
  const uy = (c1[1] - c0[1]) / d;
  return [
    [m[0] - h * uy, m[1] + h * ux],
    [m[0] + h * uy, m[1] - h * ux],
  ];
}

// ---- the construction, point by point (each point is found, not assumed) ----
export const A: Pt = [O[0] - R, O[1]]; // left end of the horizontal diameter
export const B: Pt = [O[0] + R, O[1]]; // right end
export const P: Pt = [O[0], O[1] - R]; // top of the vertical diameter
export const Pb: Pt = [O[0], O[1] + R]; // bottom
/** The arc about A through O meets the circle at X1 (upper) and X2 (lower). */
const [xa, xb] = circleCircle(A, R, O, R);
export const X1: Pt = xa[1] < xb[1] ? xa : xb;
export const X2: Pt = xa[1] < xb[1] ? xb : xa;
/** X1X2 is the perpendicular bisector of OA; it crosses OA at M (x of X1, y of O). */
export const M: Pt = [X1[0], O[1]];
const rMP = dist(M, P);
/** The arc about M through P meets the diameter AB (to the right of O) at Q. */
export const Q: Pt = [M[0] + rMP, O[1]];
/** The pentagon's side, PQ. */
export const s = dist(P, Q);
/** Stepping s around the circle from P: two arcs about P, then one about each new point. */
const pick = (pts: Pt[], sign: 1 | -1) => (sign * pts[0][0] > sign * pts[1][0] ? pts[0] : pts[1]);
export const V1: Pt = pick(circleCircle(P, s, O, R), 1); // upper right
export const V4: Pt = pick(circleCircle(P, s, O, R), -1); // upper left
const far = (pts: Pt[], from: Pt) => (dist(pts[0], from) > dist(pts[1], from) ? pts[0] : pts[1]);
export const V2: Pt = far(circleCircle(V1, s, O, R), P); // lower right
export const V3: Pt = far(circleCircle(V4, s, O, R), P); // lower left
export const V: Pt[] = [P, V1, V2, V3, V4];

// ---- steps: what the reader sees under the figure and in the list beside it ----
const m = (x: string) => `<span class="m">${x}</span>`;
export const STEPS: string[] = [
  `Draw a circle with center ${m('O')}.`,
  `Draw two diameters at right angles. Label the ends ${m('A')} and ${m('B')}, and the top point ${m('P')}.`,
  `With the compass at ${m('A')}, swing an arc through ${m('O')}. It crosses the circle twice; the line through those two points cuts ${m('OA')} in half at ${m('M')}.`,
  `With the compass at ${m('M')}, swing an arc through ${m('P')}. It meets ${m('AB')} at ${m('Q')}.`,
  `Join ${m('P')} to ${m('Q')}. That length is exactly the side of the pentagon.`,
  `Keep the compass at that width and step it around the circle, marking five points.`,
  `Join the five points. The regular pentagon is done.`,
];

// ---- timeline ----
export type Layer = 'faint' | 'ink' | 'accent' | 'pts' | 'lbl';
interface Base {
  step: number;
  layer: Layer;
  cls: string;
  dur: number;
  start: number;
  end: number;
  tool: 'compass' | 'ruler' | null;
}
export interface ArcItem extends Base {
  kind: 'arc';
  c: Pt;
  r: number;
  a0: number;
  a1: number;
}
export interface LineItem extends Base {
  kind: 'line';
  p0: Pt;
  p1: Pt;
}
export interface PolyItem extends Base {
  kind: 'poly';
  pts: Pt[];
}
export interface PointItem extends Base {
  kind: 'point';
  at: Pt;
  r: number;
}
export interface LabelItem extends Base {
  kind: 'label';
  /** Plain text; $…$ marks the parts set in the math italic. */
  text: string;
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
}
export type Item = ArcItem | LineItem | PolyItem | PointItem | LabelItem;

interface Timing {
  dur?: number;
  /** Delay after the previous action ends (or starts, with `with`). */
  gap?: number;
  /** Start together with the previous action instead of after it. */
  with?: boolean;
}
/** Omit that keeps a union a union. */
type DistOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type Draft = DistOmit<Item, 'start' | 'end'> & { gap: number; with: boolean };

function construct() {
  const drafts: Draft[] = [];
  let step = 0;
  const push = (d: DistOmit<Draft, 'step'>) => drafts.push({ ...d, step } as Draft);

  const arc = (c: Pt, r: number, a0: number, a1: number, o: Timing & { layer?: Layer; cls?: string } = {}) =>
    push({ kind: 'arc', c, r, a0, a1, layer: o.layer ?? 'ink', cls: o.cls ?? 'c', dur: o.dur ?? 1100, gap: o.gap ?? 150, with: o.with ?? false, tool: 'compass' });
  const line = (p0: Pt, p1: Pt, o: Timing & { layer?: Layer; cls?: string; noTool?: boolean } = {}) =>
    push({ kind: 'line', p0, p1, layer: o.layer ?? 'ink', cls: o.cls ?? 'c', dur: o.dur ?? 800, gap: o.gap ?? 150, with: o.with ?? false, tool: o.noTool ? null : 'ruler' });
  const poly = (pts: Pt[], o: Timing & { layer?: Layer; cls?: string } = {}) =>
    push({ kind: 'poly', pts, layer: o.layer ?? 'accent', cls: o.cls ?? 'a', dur: o.dur ?? 1500, gap: o.gap ?? 150, with: o.with ?? false, tool: null });
  const point = (at: Pt, o: Timing & { accent?: boolean } = {}) =>
    push({ kind: 'point', at, r: o.accent ? 4.6 : 3.8, layer: 'pts', cls: o.accent ? 'pt-a' : 'pt', dur: 300, gap: o.gap ?? 0, with: o.with ?? false, tool: null });
  const label = (text: string, x: number, y: number, o: Timing & { anchor?: 'start' | 'middle' | 'end'; cls?: string } = {}) =>
    push({ kind: 'label', text, x, y, anchor: o.anchor ?? 'middle', layer: 'lbl', cls: o.cls ?? 'lbl', dur: 380, gap: o.gap ?? 80, with: o.with ?? true, tool: null });

  // 1. The circle.
  step = 0;
  point(O);
  label('$O$', O[0] - 12, O[1] + 26, { anchor: 'end' });
  arc(O, R, -90, 270, { dur: 1900, gap: 200 });
  // 2. Two perpendicular diameters.
  step = 1;
  line(A, B, { gap: 350 });
  point(A);
  point(B, { with: true, gap: 60 });
  label('$A$', A[0] - 14, A[1] + 8, { anchor: 'end' });
  label('$B$', B[0] + 14, B[1] + 8, { anchor: 'start' });
  line(P, Pb, { gap: 250 });
  point(P);
  label('$P$', P[0] + 14, P[1] - 12, { anchor: 'start' });
  // 3. Bisect OA: arc about A through O, then the line through the two crossings.
  step = 2;
  arc(A, R, -76, 76, { dur: 1400, gap: 400, layer: 'faint', cls: 'arc' });
  point(X1);
  point(X2, { with: true, gap: 60 });
  line(X1, X2, { layer: 'faint', cls: 'f', gap: 200 });
  point(M, { accent: true });
  label('$M$', M[0] - 12, M[1] + 26, { anchor: 'end' });
  // 4. Arc about M through P lands on the diameter at Q.
  step = 3;
  const aP = angleOf(M, P);
  arc(M, rMP, aP - 5, 5, { dur: 1300, gap: 450, layer: 'faint', cls: 'arc' });
  point(Q, { accent: true });
  label('$Q$', Q[0] + 10, Q[1] + 26, { anchor: 'start' });
  line(O, Q, { layer: 'accent', cls: 'a-thin', dur: 600, gap: 200, noTool: true });
  label('$OQ$ = $r$/$φ$', (O[0] + Q[0]) / 2, O[1] + 34, { cls: 'note', with: false, gap: 100 });
  // 5. PQ is the side.
  step = 4;
  line(P, Q, { layer: 'accent', cls: 'a', dur: 900, gap: 500 });
  label('$s$', (P[0] + Q[0]) / 2 + 14, (P[1] + Q[1]) / 2 - 6, { cls: 'note', anchor: 'start' });
  // 6. Step the side around the circle.
  step = 5;
  const around = (c: Pt, target: Pt, gap = 180) => {
    const a = angleOf(c, target);
    arc(c, s, a - 9, a + 9, { dur: 650, gap });
  };
  around(P, V1, 500);
  point(V1, { accent: true });
  around(P, V4);
  point(V4, { accent: true });
  around(V1, V2);
  point(V2, { accent: true });
  around(V4, V3);
  point(V3, { accent: true });
  // 7. Join them; the diagonals make the star.
  step = 6;
  poly([V[0], V[1], V[2], V[3], V[4], V[0]], { dur: 1700, gap: 500 });
  poly([V[0], V[2], V[4], V[1], V[3], V[0]], { layer: 'faint', cls: 'g', dur: 1500 });
  label('diagonal : side = $φ$', O[0], Pb[1] + 46, { cls: 'note', with: false, gap: 150 });

  // Lay the actions out on one clock.
  let T = 0;
  let prevStart = 0;
  const items: Item[] = drafts.map(({ gap, with: w, ...d }) => {
    const start = w ? prevStart + gap : T + gap;
    const end = start + d.dur;
    prevStart = start;
    T = Math.max(T, end);
    return { ...d, start, end } as Item;
  });
  const steps = STEPS.map((_, i) => {
    const own = items.filter((it) => it.step === i);
    return { start: Math.min(...own.map((it) => it.start)), end: Math.max(...own.map((it) => it.end)) };
  });
  return { items, steps, T };
}

export const construction = construct();

// ---- drawing ----
const f = (n: number) => n.toFixed(2);
const toD = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`).join('');

function arcPoints(c: Pt, r: number, a0: number, a1: number): Pt[] {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 1.5));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = rad(a0 + ((a1 - a0) * i) / n);
    return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)] as Pt;
  });
}

/** The path data for a stroke item drawn to fraction t (0..1). */
export function pathAt(item: ArcItem | LineItem | PolyItem, t: number): string {
  if (t <= 0) return '';
  if (item.kind === 'arc') return toD(arcPoints(item.c, item.r, item.a0, item.a0 + (item.a1 - item.a0) * t));
  if (item.kind === 'line') return toD([item.p0, lerp(item.p0, item.p1, t)]);
  const pts = item.pts;
  const lens = pts.slice(1).map((p, i) => dist(pts[i], p));
  let rem = t * lens.reduce((a, b) => a + b, 0);
  const out: Pt[] = [pts[0]];
  for (let i = 0; i < lens.length; i++) {
    if (rem >= lens[i]) {
      out.push(pts[i + 1]);
      rem -= lens[i];
    } else {
      out.push(lerp(pts[i], pts[i + 1], rem / lens[i]));
      break;
    }
  }
  return toD(out);
}

/** Where the compass pencil is, `t` of the way along an arc. */
export function arcPoint(item: ArcItem, t: number): Pt {
  const a = rad(item.a0 + (item.a1 - item.a0) * t);
  return [item.c[0] + item.r * Math.cos(a), item.c[1] + item.r * Math.sin(a)];
}
export { angleOf, lerp };

/** The SVG viewBox: the circle plus room for the labels. */
export const VIEWBOX = '84 84 432 460';
