/**
 * @module types
 * @author Wayne<michealwayne@163.com>
 * @Date 2022-03-22 14:53:04
 * @LastEditTime 2022-11-02 10:12:18
 */

import SVGIcons2SVGFontStream from 'svgicons2svgfont';

export interface InitOptionsParams extends SVGIcons2SVGFontStream.SvgIcons2FontOptions {
  // 字体名称
  fontName: string;

  // 起始编码
  unicodeStart: number;

  // debug开关
  debug: boolean;

  // 是否输出示例
  noDemo: boolean;

  // svg文件来源目录
  src: string;

  // 字体输出目录
  dist: string;

  // unicode类型的示例html名称
  demoUnicodeHTML: string;

  // class类型的示例html名称
  demoFontClassHTML: string;
}
