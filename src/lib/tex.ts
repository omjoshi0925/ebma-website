import katex from 'katex';

const escapeHTML = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * A backslash lost to a plain JS string leaves a control character behind: '\frac' is a form
 * feed plus "rac", '\text' a tab plus "ext", '\binom' a backspace plus "inom". Catch those at
 * build time. (A lost backslash before punctuation, as in '\;' → ';', leaves no trace, which is
 * why TeX sources are written as String.raw`…`; see src/data/problems.ts.)
 */
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

const options = { throwOnError: true, strict: 'error', output: 'htmlAndMathml' } as const;

/**
 * Render text with TeX math to HTML at build time: $…$ is inline math, $$…$$ is display math.
 * Everything outside the delimiters is escaped, except *emphasis*, which becomes <em>.
 * Blank lines separate paragraphs.
 */
export function renderTeX(source: string): string {
  const bad = CONTROL.exec(source);
  if (bad) {
    const at = source.slice(Math.max(0, bad.index - 20), bad.index + 20).replace(CONTROL, '⟨?⟩');
    throw new Error(
      `renderTeX: control character U+${bad[0].charCodeAt(0).toString(16).padStart(4, '0').toUpperCase()} near “${at}”. ` +
        'A TeX backslash was probably eaten by a plain string; write the text as String.raw`…`.',
    );
  }
  return source
    .trim()
    .split(/\n\s*\n/)
    .map((para) => {
      const html = para
        .split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/)
        .map((part) => {
          if (part.startsWith('$$')) return katex.renderToString(part.slice(2, -2), { ...options, displayMode: true });
          if (part.startsWith('$') && part.length > 1) return katex.renderToString(part.slice(1, -1), options);
          return escapeHTML(part).replace(/\*([^*]+)\*/g, '<em>$1</em>');
        })
        .join('');
      return /^<span class="katex-display">/.test(html) ? html : `<p>${html}</p>`;
    })
    .join('');
}
