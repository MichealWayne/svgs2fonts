"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iconCss = exports.fontFace = exports.escapeCss = exports.escapeHtml = void 0;
function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
exports.escapeHtml = escapeHtml;
/** Escape selector identifiers without changing the public icon class name. */
function escapeCss(value) {
    return Array.from(value)
        .map((character, index) => {
        if (/^[a-zA-Z_-]$/.test(character) || (index > 0 && /^[0-9]$/.test(character)))
            return character;
        return `\\${character.codePointAt(0).toString(16)} `;
    })
        .join('');
}
exports.escapeCss = escapeCss;
function fontFace(fontName, formats) {
    const labels = {
        svg: 'svg',
        ttf: 'truetype',
        eot: 'embedded-opentype',
        woff: 'woff',
        woff2: 'woff2',
    };
    const preferred = ['woff2', 'woff', 'ttf', 'eot', 'svg'];
    const sources = preferred
        .filter(format => formats.includes(format))
        .map(format => `url('${fontName}.${format}') format('${labels[format]}')`)
        .join(',\n    ');
    return `@font-face {\n  font-family: '${fontName}';\n  src: ${sources};\n  font-weight: normal;\n  font-style: normal;\n}\n`;
}
exports.fontFace = fontFace;
function iconCss(fontName, formats, mapping) {
    const base = `${fontFace(fontName, formats)}\n.u-iconfont { font-family: '${fontName}'; font-style: normal; font-weight: normal; display: inline-block; }\n`;
    return (base +
        Object.entries(mapping)
            .map(([name, entity]) => {
            const code = Number(entity.replace(/&#|;/g, '')).toString(16);
            return `.${escapeCss(`icon-${name}`)}::before { content: "\\${code}"; }`;
        })
            .join('\n') +
        '\n');
}
exports.iconCss = iconCss;
//# sourceMappingURL=presentation.js.map