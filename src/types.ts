/**
 * @module types
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2022.03.20
 * @lastModified 2022.03.20
 */

export interface InitOptionsParams {
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
