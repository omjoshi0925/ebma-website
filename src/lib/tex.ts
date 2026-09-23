import katex from 'katex';

const escapeHTML = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * Render text with TeX math to HTML at build time: $…$ is inline math, $$…$$ is display math.
 * Everything outside the delimiters is escaped, except *emphasis*, which becomes <em>.
 * Blank lines separate paragraphs.
 */
export function renderTeX(source: string): string {
  return source
    .trim()
    .split(/\n\s*\n/)
    .map((para) => {
      const html = para
        .split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/)
        .map((part) => {
          if (part.startsWith('$$')) return katex.renderToString(part.slice(2, -2), { displayMode: true, throwOnError: true, output: 'htmlAndMathml' });
          if (part.startsWith('$') && part.length > 1) return katex.renderToString(part.slice(1, -1), { throwOnError: true, output: 'htmlAndMathml' });
          return escapeHTML(part).replace(/\*([^*]+)\*/g, '<em>$1</em>');
        })
        .join('');
      return /^<span class="katex-display">/.test(html) ? html : `<p>${html}</p>`;
    })
    .join('');
}
