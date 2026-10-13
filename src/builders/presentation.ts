import { FontFormat } from '../types/OptionType';
import { SvgUnicodeMap } from './SVGBuilder';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escape selector identifiers without changing the public icon class name. */
export function escapeCss(value: string): string {
  return Array.from(value)
    .map((character, index) => {
      if (/^[a-zA-Z_-]$/.test(character) || (index > 0 && /^[0-9]$/.test(character)))
        return character;
      return `\\${character.codePointAt(0)!.toString(16)} `;
    })
    .join('');
}

export function fontFace(fontName: string, formats: readonly FontFormat[]): string {
  const labels: Partial<Record<FontFormat, string>> = {
    svg: 'svg',
    ttf: 'truetype',
    eot: 'embedded-opentype',
    woff: 'woff',
    woff2: 'woff2',
  };
  const preferred: FontFormat[] = ['woff2', 'woff', 'ttf', 'eot', 'svg'];
  const sources = preferred
    .filter(format => formats.includes(format))
    .map(format => `url('${fontName}.${format}') format('${labels[format]}')`)
    .join(',\n    ');
  return `@font-face {\n  font-family: '${fontName}';\n  src: ${sources};\n  font-weight: normal;\n  font-style: normal;\n}\n`;
}

export function iconCss(
  fontName: string,
  formats: readonly FontFormat[],
  mapping: SvgUnicodeMap
): string {
  const base = `${fontFace(fontName, formats)}\n.u-iconfont { font-family: '${fontName}'; font-style: normal; font-weight: normal; display: inline-block; }\n`;
  return (
    base +
    Object.entries(mapping)
      .map(([name, entity]) => {
        const code = Number(entity.replace(/&#|;/g, '')).toString(16);
        return `.${escapeCss(`icon-${name}`)}::before { content: "\\${code}"; }`;
      })
      .join('\n') +
    '\n'
  );
}
