/**
 * @module configFile
 * @author Micheal Wayne<michealwayne@163.com>
 * @Date 2022-03-22 14:53:16
 * @LastEditTime 2022-11-03 15:22:15
 */

import { IS_DEV } from './constant';
import { InitOptionsParams } from './types/OptionType';

global.__sf_debug = IS_DEV === true;

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
