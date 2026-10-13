import { FontFormat } from '../types/OptionType';
import { SvgUnicodeMap } from './SVGBuilder';
export declare function escapeHtml(value: string): string;
/** Escape selector identifiers without changing the public icon class name. */
export declare function escapeCss(value: string): string;
export declare function fontFace(fontName: string, formats: readonly FontFormat[]): string;
export declare function iconCss(fontName: string, formats: readonly FontFormat[], mapping: SvgUnicodeMap): string;
//# sourceMappingURL=presentation.d.ts.map