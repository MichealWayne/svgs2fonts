/**
 * @module configFile
 * @author Micheal Wayne<michealwayne@163.com>
 * @Date 2022-03-22 14:53:16
 * @LastEditTime 2024-09-29 20:24:53
 */

import { InitOptionsParams } from './types/OptionType';

const DEFAULT_OPTIONS: InitOptionsParams = {
  debug: false,
  noDemo: true,
  fontName: 'iconfont',
  unicodeStart: 10000,
  src: '',
  dist: 'dist',
  demoUnicodeHTML: 'demo_unicode.html',
  demoFontClassHTML: 'demo_fontclass.html',
};

export default DEFAULT_OPTIONS;
