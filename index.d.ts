/*
 * @author: Wayne
 * @Date: 2022-03-22 14:55:08
 * @LastEditTime: 2022-03-22 16:43:18
 */
interface InitOptions {
  fontName?: string; // 字体名称
  unicodeStart?: number; // 起始编码
  debug?: boolean; // debug开关
  noDemo?: boolean; // 是否输出示例
  src?: string; // svg文件来源目录
  dist?: string; // 字体输出目录
  demoUnicodeHTML?: string; // unicode类型的示例html名称
  demoFontClassHTML?: string; // class类型的示例html名称
}

declare const Svgs2fonts: {
  init(options: InitOptions): Promise<boolean>;
};

export default Svgs2fonts;
