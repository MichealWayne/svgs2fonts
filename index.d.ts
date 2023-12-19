/**
 * @author Wayne
 * @Date 2022-03-22 14:55:08
 * @LastEditTime 2023-12-16 09:50:31
 */

interface SvgIcons2FontOptions {
  /**
   * The font family name you want
   *
   * @default 'iconfont'
   */
  fontName?: string;
  /**
   * The font id you want (Default value: the options.fontName)
   *
   * @default the options.fontName value
   */
  fontId?: string;
  /**
   * The font style you want.
   */
  fontStyle?: string;
  /**
   * The font weight
   */
  fontWeight?: string;
  /**
   * Creates a monospace font of the width of the largest input icon.
   */
  fixedWidth?: boolean;
  /**
   * Calculate the bounds of a glyph and center it horizontally.
   */
  centerHorizontally?: boolean;
  /**
   * Centers the glyphs vertically in the generated font.
   * @default false
   */
  centerVertically?: boolean;
  /**
   * Normalize icons by scaling them to the height of the highest icon.
   */
  normalize?: boolean;
  /**
   * The outputted font height (defaults to the height of the highest input icon).
   */
  fontHeight?: number;
  /**
   * Setup SVG path rounding.
   *
   * @default 10e12
   */
  round?: number;
}

export interface InitOptionsParams extends SvgIcons2FontOptions {
  /**
   * 字体名称
   * @default iconfont
   */
  fontName: string;
  /**
   * 起始编码
   * @default 10000
   */
  unicodeStart: number;
  /**
   * debug开关
   * @default false
   */
  debug: boolean;
  /**
   * 是否输出示例
   * @default true
   */
  noDemo: boolean;
  /**
   * svg文件来源目录
   */
  src: string;
  /**
   * 字体输出目录
   * @default ./dist
   */
  dist: string;
  /**
   * unicode类型的示例html名称
   * @default demo_unicode.html
   */
  demoUnicodeHTML: string;
  /**
   * class类型的示例html名称
   * @default demo_fontclass.html
   */
  demoFontClassHTML: string;
}

declare const Svgs2fonts: {
  init(options: Partial<InitOptionsParams>): Promise<true | Error>;
};

export default Svgs2fonts;
