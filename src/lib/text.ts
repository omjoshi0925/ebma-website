/** Escape text for HTML, then turn *word* into <em>word</em>. Used for headings with one italic word. */
export function emph(text: string): string {
  const escaped = text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
  return escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/** Roman numerals for plates and front matter (1 → I). */
export function roman(n: number): string {
  const table: [number, string][] = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [v, s] of table) while (n >= v) { out += s; n -= v; }
  return out;
}

const NBSP = ' ';
/** A space the line may break at (a no-break space already joins its words). */
const BREAKABLE = /[ \t\n\r\f]/;

/**
 * No one-word last line: join the last two words with a no-break space.
 *
 * `text-wrap: pretty` (ledes) and `balance` (headings) already avoid a lone last word in Chrome
 * and Safari; Firefox has no `pretty` yet, so ledes, deks and the band's text pass through this
 * too. It takes plain text or HTML and never touches a space inside a tag. It leaves the text
 * alone when it has fewer than three words (a two-word title split one and one is balanced, not
 * a widow), or when the two joined words are longer than `max` characters, which at display
 * sizes could be wider than a phone. Headings pass a smaller `max` than running text.
 *
 *   noWidow('Write to us if you’d rather.')  →  'Write to us if you’d rather.'
 */
export function noWidow(input: string, max = 24): string {
  // Tags and text alternate: even indices are text, odd indices are tags.
  const parts = input.split(/(<[^>]*>)/);
  // The visible characters, one entry per character or entity, with where each came from.
  const chars: { ch: string; part: number; from: number; to: number }[] = [];
  parts.forEach((part, p) => {
    if (p % 2 === 1) return;
    for (const m of part.matchAll(/&(?:#\d+|#x[\da-f]+|\w+);|[\s\S]/gi)) {
      const token = m[0];
      const ch = token.length === 1 ? token : /^&nbsp;$|^&#160;$|^&#xa0;$/i.test(token) ? NBSP : 'x';
      chars.push({ ch, part: p, from: m.index!, to: m.index! + token.length });
    }
  });
  let end = chars.length;
  while (end > 0 && BREAKABLE.test(chars[end - 1].ch)) end--;
  // The last breakable space before the last word, and the one before the word ahead of it.
  let gap = end - 1;
  while (gap >= 0 && !BREAKABLE.test(chars[gap].ch)) gap--;
  if (gap < 0) return input;
  let gapStart = gap;
  while (gapStart > 0 && BREAKABLE.test(chars[gapStart - 1].ch)) gapStart--;
  let prev = gapStart - 1;
  while (prev >= 0 && !BREAKABLE.test(chars[prev].ch)) prev--;
  if (prev < 0) return input; // fewer than three words
  const joined = end - (prev + 1) - (gap - gapStart);
  if (joined > max) return input;
  // Replace the space run with one no-break space (runs are rewritten from the end backwards, so
  // earlier offsets stay valid).
  const out = [...parts];
  for (let i = gap; i >= gapStart; i--) {
    const c = chars[i];
    out[c.part] = out[c.part].slice(0, c.from) + (i === gapStart ? NBSP : '') + out[c.part].slice(c.to);
  }
  return out.join('');
}

/**
 * Split link text (HTML) into a head and a tail for the external-link treatment: the tail (the
 * last word) is kept on one line with the ↗ that follows it. Text with no space that is long (a
 * web address shown as the link text) keeps only its last few characters with the arrow, and never
 * splits an entity such as &amp;. Returns null for text that carries markup: leave that as written.
 */
export function splitTail(html: string): { head: string; tail: string } | null {
  if (/[<>]/.test(html)) return null;
  const space = html.lastIndexOf(' ');
  let cut = space > 0 ? space + 1 : html.length > 16 ? html.length - 6 : 0;
  const amp = html.lastIndexOf('&', cut - 1);
  if (amp >= 0 && html.indexOf(';', amp) >= cut) cut = amp;
  return { head: html.slice(0, cut), tail: html.slice(cut) };
}
